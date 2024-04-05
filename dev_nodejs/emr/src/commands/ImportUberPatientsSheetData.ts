#!/usr/bin/env node
import { DatabaseConfiguration, db } from '../config/DatabaseConfiguration';
import { Config, config } from '../config/Config';
import { StaticHelpers } from '../helpers/Statics';
import { uploader } from '../config/S3';
import { HttpRequest } from '../helpers/HttpRequest';
import * as util from 'util';
import { Soap } from '../database/models/Soap';

export class ImportUberPatientsSheetData {
    private _db: DatabaseConfiguration;
    private _config: Config;
    private _sh;
    private _s3Uploader;
    private _fs;
    private _http;

    private DATE_STAMP = StaticHelpers.dateStamp();

    private readonly places = ['gurgaon', 'mumbai'];
    private readonly centerCodes = ['medimetry-camps-EFO9lucHxfAI1EGnAvnEgqAlT9ktMTkh', 'medimetry-camps-0sqdtbB09yLdAKslslP6GxJ81Uf0xkKk'];
    private _consultationCreationResp = {};
    private _soap: Soap;
    private readonly wordmap = {
        "never": 1,
        "naver": 1,
        "niver": 1,
        "occasionally": 2,
        "addicted": 5,
        "reglur": 5,
        "regular": 5,
        "exercise":4,
    };
    private readonly allergyMaterials = ['dust', 'unripe mango', 'honey', 'dye', 'sun exposure',
        'spicey food', 'changing wheather', 'onion', 'garlic', 'eggs', 'perfume',
        'winters', 'climate change', 'sunlight', 'reflection of light', 'co-cola',
        'warm food', 'drink', 'summer', 'dast', 'heavy medicine', 'chauli', 'fungal treatment',
        'mutton', 'dahi', 'ghee', 'butter',
    ];
    private readonly bloodRelations = [
        "father", "mother", "brother", "wife", "grandfather", "sister", "grandmother",
    ];

    constructor() {
        this._db = db;
        this._config = config;
        this._sh = require('shelljs');
        this._fs = require('fs');
        this._s3Uploader = uploader;
        this._http = new HttpRequest;

        if (process.argv[2]) this.DATE_STAMP = process.argv[2];
    }

    public async handle() {

        const readFile = util.promisify(this._fs.readFile);

        const filePath = __dirname.replace("src/commands", "uber-patients-data-:place.csv");
        for ( let i = 0; i < this.places.length; i ++) {
            const fileName = filePath.replace(":place", this.places[i]);

            console.log("File path: ", fileName);

            const data = await readFile(fileName);
            const rows = this.CSVToArray(data.toString());

            for (let j = 0; j < rows.length; j++) {
                await this.createPatientAndWork(rows[j], this.centerCodes[i], this.places[i]);

            }
        }

    }

    public CSVToArray( strData, strDelimiter = ',' ){
    // Create a regular expression to parse the CSV values.
    let objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    let arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    let arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){
        // Get the delimiter that was found.
        let strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
        ){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );

        }

        let strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
            );

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}

    private async createPatientAndWork(row, centerCode, place) {
        if (row.length == 20) {
            row.unshift('');
        }

        if (row.length != 21) {
            console.error("Row length is not 21: ", row);
            return;

        }

        const object = {
            UID: row[0].trim().toUpperCase().replace("91-", "").replace(/-/g, ""),
            name: StaticHelpers.ucfirst(row[1].trim()).toLowerCase(),
            age: row[2].trim().toLowerCase(),
            gender: row[3].trim().toLowerCase(),
            mobile: row[4].trim().toLowerCase(),
            BPS: parseInt(row[5].trim().toLowerCase()),
            BPD: parseInt(row[6].trim().toLowerCase()),
            pulse: parseInt(row[7].trim().toLowerCase()),
            RBS: parseInt(row[8].trim().toLowerCase()),
            weight: parseInt(row[9].trim().toLowerCase()),
            height: parseInt(row[10].trim().toLowerCase()),
            lifestyle: row[11].trim().toLowerCase(),
            alcohol: row[12].trim().toLowerCase(),
            smoking: row[13].trim().toLowerCase(),
            exercise: row[14].trim().toLowerCase(),
            occupation: row[15].trim().toLowerCase(),
            pastIllness: row[16].trim().toLowerCase(),
            pastMedication: row[17].trim().toLowerCase(),
            allergy: row[18].trim().toLowerCase(),
            familyHistory: row[19].trim().toLowerCase(),
            pastProcedure: row[20].trim().toLowerCase(),
        };

        if (object.mobile.length < 10)
            object.mobile = "0".repeat(10 - object.mobile.length) + object.mobile;

        const patient = await this._db.wpdb(`select * from medi_patients where mobile_number = '91${object.mobile}'`);

        if (patient.length) return;

        console.log("Entering: ", object);

        await this.sleep(2000);
        let today  = new Date;

        if (["0.0.0.0", "127.0.0.1", "localhost", null].indexOf(this._config.get('host', null)) < 0)
            today.setTime( today.getTime() + ( 5.5 * 60 * 60 * 1000 ) ); // only in case of cloudServers

        const yearTime = today.getFullYear() % 100 + ""
            + StaticHelpers.twoDigits(today.getMonth() + 1)
            + StaticHelpers.twoDigits(today.getDate())
            + StaticHelpers.twoDigits(today.getHours())
            + StaticHelpers.twoDigits(today.getMinutes())
            + StaticHelpers.twoDigits(today.getSeconds());

        const UID = object.UID.length ? object.UID : "UBE" + yearTime;
        this._consultationCreationResp = await this._http.self("api/v1/consultations/create-consultation", {
            "user_name": object.name,
            "user_mobile": UID,
            "user_email": UID + "@camps.medimetry.com",
            "user_dob": "",
            "patient_age": object.age,
            "patient_name": object.name,
            "patient_gender": object.gender,
            "patient_mobile": object.mobile,
            "patient_relation": "self",
            "chief_complaints": "Clinical Visit at " + today,
            "center_code": centerCode,
            "channel_name": "MediMetry Camps",
            "consult_type": "AUDIO",
            "speciality": "Family Physician",
            "doctor": 87648,
            "address": "Uber " + StaticHelpers.ucfirst(place),
            "user_address": StaticHelpers.ucfirst(place),
        });

        let response = await this._http.self("api/v1/soap/create", {id: this._consultationCreationResp["postId"]});
        this._soap = response['soap'];

        const heightFt = object.height ? Math.floor(object.height / 30.48) : "";
        const heightIn = object.height ? Math.floor((object.height % 30.48) / 2.54) : "";

        // filling vitals:
        await this._http.self("api/v1/soap/" + this._soap.id + "/vitals", {
            id: 0,
            vital_collected_at: "Uber Superday " + place,
            vital_information: {
                "BP(D)": isNaN(object.BPD) ? "" : (object.BPD + ""),
                "BP(S)": isNaN(object.BPS) ? "" : ( object.BPS + ""),
                "Height(ft)": heightFt,
                "Height(in)": heightIn,
                "Pulse": isNaN(object.pulse) ? "" : ( object.pulse + ""),
                "Random Sugar": isNaN(object.RBS) ? "" : ( object.RBS + ""),
                "Temp (F)": "",
                "Weight (kg)": isNaN(object.weight) ? "" : ( object.weight + ""),
            },
        });

        // filling personal history:
        await this._http.self('api/v1/soap/' + this._soap.id + '/personal-history', {
            id: 0,
            info: {
                dietaryCompliance: 0,
                drugCompliance: 0,
                drinkingHabit: "" + this.wordmap[object.alcohol] || "",
                exercise: "" + this.wordmap[object.exercise] || "",
                lifeStyle: object.lifestyle,
                occupation: 0,
                occupationText: object.occupation,
                smokingHabit: "" + this.wordmap[object.smoking] || "",
            }
        });

        if (object.pastIllness.length) {
            const pastIllnesses = object.pastIllness.split(",").map(str => {
                return str.trim().toLowerCase();
            });
            for (let k = 0; k < pastIllnesses.length; k ++) {
                await this._http.self('api/v1/soap/past-illness', {
                    id: 0,
                    patientId: this._soap.patient_id,
                    processed: false,
                    remark: pastIllnesses[k],
                });
            }
        }


        if (object.pastMedication.length) {
            const pastMedications = object.pastMedication.split(",").map(str => {
                return str.trim().toLowerCase();
            });
            for (let k = 0; k < pastMedications.length; k ++) {
                await this._http.self('api/v1/soap/past-medication', {
                    id: 0,
                    patientId: this._soap.patient_id,
                    processed: false,
                    remark: pastMedications[k],
                });
            }
        }


        if (object.allergy.length) {
            let substances = [];
            this.allergyMaterials.forEach(material => {
                if (object.allergy.indexOf(material) > -1)
                    substances.push(material);
            });
            if (!substances.length) substances = ['unspecified'];

            await this._http.self('api/v1/history/createHistory', {
                "type": "allergy",
                "data": {
                    "created_at": today,
                    "started_at": today,
                    "updated_at": today,
                    "doctor_id": 0,
                    "substance": 0,
                    "terms": 0,
                    "patient_id": this._soap.patient_id,
                    "processed": true,
                    "term_name": "",
                    "reactions": object.allergy,
                    "substances": substances.join(",")
                }
            });
        }


        if (object.familyHistory.length) {
            let relatives = [];
            this.bloodRelations.forEach(relation => {
                if (object.familyHistory.indexOf(relation) > -1)
                    relatives.push(relation);
            });
            if (! relatives.length) relatives = ['unspecified'];

            for ( let k = 0; k < relatives.length; k ++) {
                const relative = relatives[k];

                await this._http.self('api/v1/history/createHistory', {
                    "type": "family_history",
                    "data": {
                        "created_at": today,
                        "diagnosed_at": today,
                        "updated_at": today,
                        "name": "",
                        "diagnosis": "",
                        "processed": true,
                        "patient_id": this._soap.patient_id,
                        "relation": StaticHelpers.ucfirst(relative),
                        "remark": object.familyHistory.replace(relative, ""),
                    }
                });
            }
        }


        if (object.pastProcedure.length) {
            const pastProcedures = object.pastProcedure.split(",").map(str => {
                return str.trim().toLowerCase();
            });
            for (let k = 0; k < pastProcedures.length; k ++) {
                await this._http.self('api/v1/history/createHistory', {
                    "type": "procedure",
                    "data": {
                        "created_at": today,
                        "doctor_id": 0,
                        "meta": [],
                        "processed": true,
                        "patient_id": this._soap.patient_id,
                        "remarks": "",
                        "soap": 1,
                        "speciality": "",
                        "status": "",
                        "term": 0,
                        "term_text": pastProcedures[k],
                        "uuid": "0",
                    }
                });
            }

        }

        // process.exit(0);
    }

    private sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

console.log('Starting ...');
setTimeout( () => { // slow servers need a second, to import ZIP
    (new ImportUberPatientsSheetData()).handle().then(() => {
        console.log('!! End !!');

        process.exit(0);
    });
}, 2000);


