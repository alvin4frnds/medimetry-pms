#!/usr/bin/env node
import { DatabaseConfiguration, db } from '../config/DatabaseConfiguration';
import { Config, config } from '../config/Config';
import { StaticHelpers } from '../helpers/Statics';
import { uploader } from '../config/S3';
import { HttpRequest } from '../helpers/HttpRequest';
import { User } from '../database/models/User';

export class ImportShadowZip {
    private _db: DatabaseConfiguration;
    private _config: Config;
    private _sh;
    private _s3Uploader;
    private _fs;
    private _http;
    private filesMap;

    private _consultationCreationResp;
    private _soap;

    private DATE_STAMP = StaticHelpers.dateStamp();

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
        const todaysFolder = __dirname + "/temp/" + this.DATE_STAMP;

        this._sh.rm("-rf", todaysFolder);
        this._sh.mkdir("-p", todaysFolder);

        const pwd = this._sh.exec(`pwd`).stdout.replace("\n", "");
        const zipLocation = `${pwd}/${this.DATE_STAMP}.zip`;
        if (! this._sh.test('-f', zipLocation)) return console.error(`Zip not found at: ${zipLocation}`);

        console.log(`Unzipping ... `);
        this._sh.exec(`unzip -o ${this.DATE_STAMP}.zip`, {silent: true});

        const shadowSaveDir = __dirname + "/temp/" + this.DATE_STAMP;
        const shadowSaveJsonFile = shadowSaveDir + "/dump.json";

        console.log(`Loading dump file ...`);
        const files = this._sh.exec(`ls ${shadowSaveDir}/files`, {silent: true})
            .stdout.split("\n")
            .filter( path => !!path );
        this.filesMap = {};

        for (let i = 0; i < files.length; i ++)
            this.filesMap[files[i]] = await this._s3Uploader
                .upload(`${shadowSaveDir}/files/${files[i]}`);

        const doctor = await User.getRepo().createQueryBuilder("user")
            .where("user.refresh_token = :token")
            .setParameters({token: this._config.get("defaultToken")})
            .orderBy("user.id", "DESC")
            .getOne();

        const store = JSON.parse(this._sh.cat(shadowSaveJsonFile).stdout.replace(/\\n/g, '')) || {};
        const soapRelationsMapping = {
            "examinations": "examinations",
            "vitals": "vitals",
            "diagnosis": "diagnosis",
            "medications": "medications",
            "investigations": "investigations",
            "referrals": "referrals",
            "procedures": "procedures",
            "test_results": "test-results",
            "chief_complaints": "chief-complains",
            "attachments": "attachments",
            "clinical_notes": "clinical-notes",
        };
        for ( let consultationCode in store ) {
            if (consultationCode == "undefined") continue;

            let consultation = {};
            if (store.hasOwnProperty(consultationCode)) consultation = store[consultationCode];
            else continue; // although this could never happen.

            // override: doctor id will be loaded from token only
            consultation["request"]["doctor"] = doctor.user_id;

            const responses = [];
            this._consultationCreationResp = await this._http.self("api/v1/consultations/create-consultation", consultation["request"]);
            responses.push(this._consultationCreationResp); // 0

            responses.push(await this._http.self("api/v1/soap/create", {id: responses[0]["postId"]})); // 1
            this._soap = responses[1]["soap"];

            if (consultation["soap"] && ( consultation["soap"]["remark"] || consultation["soap"]["follow_up"] ))
                responses.push(await this._http.self(`api/v1/soap/${this._soap["id"]}/remark-follow-up`, {
                    remark: consultation["soap"]["remark"],
                    follow_up: consultation["soap"]["follow_up"],
                }, {method: "PATCH"})); //2

            if (consultation["terms"] && consultation["terms"].length)
                for ( let i = 0; i < consultation["terms"].length; i ++) {
                    const obj = this.updateKeys('terms', consultation["terms"][i]);

                    responses.push(await this._http.self('api/v1/soap/terms/create', {
                        type: obj["type"],
                        name: obj["name"],
                    }));
                }

            if (consultation["pastMedications"] && consultation["pastMedications"].length)
                for ( let i = 0; i < consultation["pastMedications"].length; i ++) {
                    const obj = this.updateKeys('pastMedications', consultation["pastMedications"][i]);

                    responses.push(await this._http.self('api/v1/soap/past-medication', {
                        "patientId": obj["patient_id"],
                        "remark": obj["remark"],
                    }));
                }

            if (consultation["pastIllnesses"] && consultation["pastIllnesses"].length)
                for ( let i = 0; i < consultation["pastIllnesses"].length; i ++) {
                    const obj = this.updateKeys('pastIllnesses', consultation["pastIllnesses"][i]);

                    responses.push(await this._http.self('api/v1/soap/past-illness', {
                        "patientId": obj["patient_id"],
                        "remark": obj["remark"],
                    }));
                }

            if (consultation["history"] && consultation["history"].length)
                for ( let i = 0; i < consultation["history"].length; i ++) {
                    const obj = this.updateKeys('history', consultation["history"][i]);

                    responses.push(await this._http.self('api/v1/history/createHistory', {
                        data: obj,
                        type: obj["type"],
                    }));
                }

            const soapRelations = Object.keys(soapRelationsMapping);
            for ( let i = 0; i < soapRelations.length; i ++)
                if (consultation["soap"]
                    && consultation["soap"][soapRelations[i]]
                    && consultation["soap"][soapRelations[i]].length )
                    for ( let j = 0; j < consultation["soap"][soapRelations[i]].length; j ++ ) {
                        const obj = this.updateKeys('entity', consultation["soap"][soapRelations[i]][j]);

                        responses.push(await
                            this._http.self(`api/v1/soap/${this._soap.id}/${soapRelationsMapping[soapRelations[i]]}`,
                                obj)
                        )
                    }

            if ( responses.filter( response => !response["success"]).length )
                return console.error("Some API failed: ", responses);
        }

        return true;
    }

    private updateKeys(type, object) {
        for (let key in object) {
            if (typeof object[key] == "string") {
                const value = object[key].substring(object[key].lastIndexOf('/')+1);

                if (this.filesMap[value]) object[key] = this.filesMap[value];
            }
        }

        switch (type) {
            case 'pastIllnesses':
            case 'pastMedications':
                ["created_at", "updated_at", "id"]
                    .forEach( key => delete object[key] );
                object["patient_id"] = this._soap["patient_id"];
                break;
            case 'history':
                object["patient_id"] = this._soap["patient_id"];
                object["doctor_id"] = this._soap["created_by"];
                object["uuid"] = this._soap["uuid"];

                if (object["terms"] && object["terms"]["term_body"])
                    object["term_text"] = object["terms"]["term_body"];
                if (object["term"] && object["term"]["term_body"])
                    object["term_text"] = object["term"]["term_body"];
                if (object["substance"] && object["substance"]["term_body"])
                    object["substance_name"] = object["substance"]["term_body"];

                ["id", "terms", "substance", "created_at", "updated_at", "term_id", "term"]
                    .forEach( key => delete object[key] );
                break;
            case 'entity':

                object["patient_id"] = this._soap["patient_id"];
                object["doctor_id"] = this._soap["created_by"];
                object["uuid"] = this._soap["uuid"];

                ["id" , "term_id", "procedure_term_id", "created_at", "updated_at", "term"]
                    .forEach( elKey => delete object[elKey] );
                break;

            default: break;
        }

        return object;
    }
}

console.log('Starting ...');
setTimeout( () => { // slow servers need a second, to import ZIP
    (new ImportShadowZip()).handle().then(() => {
        console.log('!! End !!');
        process.exit(0);
    });
}, 2000);


