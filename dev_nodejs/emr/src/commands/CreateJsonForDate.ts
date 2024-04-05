#!/usr/bin/env node
import { DatabaseConfiguration, db } from '../config/DatabaseConfiguration';
import { Config, config } from '../config/Config';
import { StaticHelpers } from '../helpers/Statics';
import { Soap } from '../database/models/Soap';
import { Allergy } from '../database/models/Allergy';
import { FamilyHistory } from '../database/models/FamilyHistory';
import { Habit } from '../database/models/Habit';
import { PastIllness } from '../database/models/PastIllness';
import { PastMedication } from '../database/models/PastMedication';
import { Between, In, Raw } from 'typeorm';
import { ShadowSaveWorker } from '../controllers/middlewares/ShadowSave';
import { Procedure } from '../database/models/Procedure';
import { ExportShadowZip } from './ExportShadowZip';
const uuidv1 = require('uuid/v1');

export class CreateJsonForDate {
    private _db: DatabaseConfiguration;
    private _config: Config;
    private _sh;
    private _fs;
    private DATE_STAMP = StaticHelpers.dateStamp();

    constructor() {
        this._db = db;
        this._config = config;
        this._sh = require('shelljs');
        this._fs = require('fs');

        if (process.argv[2]) this.DATE_STAMP = process.argv[2];
    }

    public async handle() {
        const today = this.DATE_STAMP + "T00:00:00.000Z"; const todate = new Date(today);
        const tomorrow = new Date((todate).getTime() + 24 * 60 * 60 * 1000).toISOString();
        const year = todate.getFullYear(); const month = todate.getMonth();
        const requestIdPrefix = uuidv1() + "-";
        let count = 0;

        const soaps = await Soap.repo().query(`select * from soaps where created_at >= '${today}' ` +
            `and created_at < '${tomorrow}'`);
        if (! soaps) {
            console.error("no soaps found: ", soaps);
            return [];
        }

        let allChannels = await this._db.wpdb("select * from channels");
        allChannels = StaticHelpers.arrayToMappedObject(allChannels, "id");
        let allCenters = await this._db.wpdb("select * from channel_centers");
        allCenters = StaticHelpers.arrayToMappedObject(allCenters, "code");

        const consultationCodes = soaps.map(soap => "'" + soap.consultation_code + "'").join(",");
        if (! consultationCodes) return console.error("No consultation found for soaps: ", consultationCodes);
        let mediConsultations = await this._db.wpdb(`select * from medi_consultation where code in (${consultationCodes})`);
        let mediPObjects = await this._db.wpdb(`select * from medi_pobject where code in (${consultationCodes})`);
        const postIds = mediPObjects.map(c => "'" + c.post_id + "'").join(",");
        let mediPosts = await this._db.wpdb(`select * from medi_posts where ID in (${postIds})`);
        const patientIds = mediConsultations.map(c => "'" + c.patient_id + "'").join(",");
        let mediPatients = await this._db.wpdb(`select * from medi_patients where id in (${patientIds})`);
        const userIds = mediPatients.map(x => "'" + x.user_id + "'").join(",");
        let mediUsers = await this._db.wpdb(`select * from medi_users where ID in (${userIds})`);
        const mediUserAddress = await this._db.wpdb(`select * from medi_usermeta where user_id in (${userIds}) and meta_key = 'address'`);
        let mediUserIdVsAddress = {};
        mediUserAddress.forEach( (usermeta) => {
            mediUserIdVsAddress[usermeta["user_id"]] = usermeta["meta_value"];
        });

        const colPatientId = StaticHelpers.getColumnFromJsonObj(mediConsultations, 'patient_id');
        mediConsultations = StaticHelpers.arrayToMappedObject(mediConsultations, 'code');
        mediPObjects = StaticHelpers.arrayToMappedObject(mediPObjects, 'code');
        mediPosts = StaticHelpers.arrayToMappedObject(mediPosts, 'ID');
        mediPatients = StaticHelpers.arrayToMappedObject(mediPatients, 'id');
        mediUsers = StaticHelpers.arrayToMappedObject(mediUsers, 'ID');
        const fullSoaps = [];

        for (let i = 0; i < soaps.length; i ++) fullSoaps.push(await Soap.getFullById(soaps[i]["id"]));

        let allergies = await Allergy.repo().find({where: {patient_id: In(colPatientId), created_at: Between(`${this.DATE_STAMP} 00:00:00`, `${this.DATE_STAMP} 23:59:59`)}});
        allergies = allergies.map(allergy => {
            let substances = [];
            let reactions = [];

            const terms = allergy.meta["terms"] || [];
            for ( let i = 0; i < terms.length; i ++) {
                if (terms[i].term_type == "allergy_reaction") {
                    reactions.push(terms[i].term_body);
                }

                if (terms[i].term_type == "allergy_substance") {
                    substances.push(terms[i].term_body);
                }
            }

            allergy["substances"] = substances.join(",");
            allergy["reactions"] = reactions.join(",");
            return allergy;
        });
        const familyHistories = await FamilyHistory.repo().find({where: {patient_id: In(colPatientId), created_at: Between(`${this.DATE_STAMP} 00:00:00`, `${this.DATE_STAMP} 23:59:59`) }});
        let habits = await Habit.repo().find({where: {patient_id: In(colPatientId), created_at: Between(`${this.DATE_STAMP} 00:00:00`, `${this.DATE_STAMP} 23:59:59`), relations: ["terms"] }});
        habits = habits.map( habit => {
            habit["term_text"] = (habit["terms"] || {})["term_body"] || "";
            return habit;
        });
        let procedures = await Procedure.repo().find({where: {patient_id: In(colPatientId), created_at: Between(`${this.DATE_STAMP} 00:00:00`, `${this.DATE_STAMP} 23:59:59`), soap_id: 1}, relations: ["term"]});
        procedures = procedures.map(procedure => {
            procedure["term_text"] = (procedure["term"] || {})["term_body"] || "";
            return procedure;
        });
        const pastIllnesses = await PastIllness.repo().find({where: { patient_id: In(colPatientId), created_at: Between(`${this.DATE_STAMP} 00:00:00`, `${this.DATE_STAMP} 23:59:59`) }});
        const pastMedications = await PastMedication.repo().find({where: { patient_id: In(colPatientId), created_at: Between(`${this.DATE_STAMP} 00:00:00`, `${this.DATE_STAMP} 23:59:59`)}});

        const json = {};
        for ( let i = 0; i < fullSoaps.length; i ++) {
            count ++;

            const soap = fullSoaps[i];
            const consultation = mediConsultations[soap["consultation_code"]];
            const pobject = mediPObjects[soap["consultation_code"]];
            const patient = mediPatients[consultation["patient_id"]];
            const user = mediUsers[patient["user_id"]];
            const post = mediPosts[pobject["post_id"]];

            // why i am not using today.getTime() - DOB.getTime() & convert to month year,
            //      is because, all months will average out to 30 days, and we cant have that.
            const DOB = new Date(patient["date_of_birth"]);
            const inMon = ((month-DOB.getMonth()) + 12) % 12;
            const ageInYears = year - (((month - DOB.getMonth()) > 0) ? (DOB.getFullYear() + 1) : (DOB.getFullYear()));
            const finalAge = ageInYears + (inMon ? "." + inMon : "");

            let histories = [];
            histories = histories.concat(allergies.filter(allery => allery["patient_id"] == patient["id"]).map( allery => {
                allery["type"] = "allergy";
                return allery;
            }));
            histories = histories.concat(familyHistories.filter(entity => entity["patient_id"] == patient["id"]).map( entity => {
                entity["type"] = "family_history";
                return entity;
            }));
            histories = histories.concat(habits.filter(entity => entity["patient_id"] == patient["id"]).map( entity => {
                entity["type"] = "habit";
                return entity;
            }));
            histories = histories.concat(procedures.filter(entity => entity["patient_id"] == patient["id"]).map( entity => {
                entity["type"] = "procedure";
                return entity;
            }));

            json[consultation["code"]] = {
                "request": {
                    "user_name": user["display_name"],
                    "user_mobile": user["user_login"].substring(2),
                    "user_email": user["user_email"],
                    "user_dob": "",
                    "patient_name": patient["name"],
                    "patient_age": finalAge,
                    "patient_gender": patient["gender"],
                    "patient_relation": (patient["name"] == patient["relation"]) ? "self" : patient["relation"],
                    "chief_complaints": post["post_content"],
                    "center_code": patient["center_code"],
                    "channel_name": allChannels[patient["channel_id"]]["name"],
                    "consult_type": pobject["object_type"].toUpperCase(),
                    "speciality": "Family Physician",
                    "doctor": consultation["user_id"],
                    "address": mediUserIdVsAddress[user["ID"]] || allCenters[patient["center_code"]]["address"],
                    "user_address": mediUserIdVsAddress[user["ID"]] || allCenters[patient["center_code"]]["address"],
                },
                "createConsultationResp": {
                    "message": "Consultation Created Successfully",
                    "success": 1,
                    "postId": post["ID"],
                    "code": consultation["code"],
                    "txnid": "",
                    "patientId": patient["id"],
                    "$$reqId": requestIdPrefix + count,
                },
                "code": consultation["code"],
                "soap": soap,
                "pastIllnesses": pastIllnesses.filter( entity => entity["patient_id"] == patient["id"] ),
                "pastMedications": pastMedications.filter( entity => entity["patient_id"] == patient["id"] ),
                "history": histories,
            };
        }

        const workerThread = new ShadowSaveWorker();
        workerThread.setDateStamp(this.DATE_STAMP);

        const pwd = this._sh.exec(`pwd`).stdout.replace("\n", "");
        const filePath = pwd + "/shadowSaveDumps/" + this.DATE_STAMP + ".json";

        // console.log(StaticHelpers.stringify(json), filePath);

        await this._fs.writeFile(filePath, StaticHelpers.stringify(json), async function (err) {
            if (err) console.error(err);
            else console.log('Saved!');

            await (new ExportShadowZip()).handle();

            process.exit(0);
            return true;
        });
    }

}

console.log('Starting ...');
setTimeout(() => {
    (new CreateJsonForDate()).handle().then( () => {

        console.log('!! End !!');
        // process.exit(0);
    } );
}, 2000);


