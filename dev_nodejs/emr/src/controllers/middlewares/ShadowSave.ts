///<reference path="../../helpers/Statics.ts"/>
import { NextFunction, Request, Response } from 'express';
import { config } from '../../config/Config';
import { Soap } from '../../database/models/Soap';
import { db } from '../../config/DatabaseConfiguration';
import { Term } from '../../database/models/Term';
import { SoapController } from '../SoapController';
import { StaticHelpers } from '../../helpers/Statics';

let urlWordsTokens = [];

export const ShadowSave = async function(req: Request, res: Response, next: NextFunction) {
    // if shadowSave bit is false || undefined,  move on
    if (! config.get('shadowSave', false)) return next();
    if (req.method === "GET") return next();

    let funcName = req.method.toLowerCase() + req.url.split("-").map( (word) => {
            word = word.replace(/[^a-zA-Z]/g, "");
            if(urlWordsTokens.indexOf(word) > -1)
                word = "entity";
            else if(Object.keys(SoapController.URL_CLASS_MAPPING)
                    .indexOf(word.substring(0, word.length - 3)) > -1)
                word = "entityAll";
            return word.charAt(0).toUpperCase() + word.substring(1);
        }).join("");

    ["ChiefComplains", "ClinicalNotes", "TestResults"]
        .forEach(replacer => funcName = funcName.replace(replacer, "Entity"));
    const funcNameFallback = req.baseUrl.split("/").reverse()[0]
        + funcName.charAt(0).toUpperCase()
        + funcName.substring(1);

    const functionBindings = {
        "postCreatePatient": "postCreatePatient",
        "postCreateConsultation": "postCreateConsultation",
        "patchPatient": "patchPatient",
        "postCreate": "createSoap",
        "soapPatch": "updateSoap",
        "postTermscreate": "createTerm",
        "postAttachment": "uploadAttachment",
        "postCreateAttachment": "uploadAttachment",
        "patchRemarkFollowUp": "updateRemarkFollowUp",
        "postEntity": "createEntity",
        "patchEntity": "updateEntity",
        "deleteEntity": "removeEntity",
        "deleteEntityall": "removeEntity",
        "deleteEntityAll": "removeEntity",
        "postPastIllness": "createPastIllness",
        "deletePastIllness": "deletePastIllness",
        "postPastMedication": "createPastMedication",
        "deletePastMedication": "deletePastMedication",
        "postCreateHistory": "createHistory",
        "postCreateBulkHistory": "createBulkHistory",
        "historyPostDelete": "deleteHistory",
    };

    // console.log("Shadow save: function calling: ", funcName, funcNameFallback);
    try {
        if (functionBindings[funcName]) {
            workerThread.setReq(req);
            await workerThread[functionBindings[funcName]]();
        } else if(functionBindings[funcNameFallback]) {

            workerThread.setReq(req);
            await workerThread[functionBindings[funcNameFallback]]();
        } else {

            console.error("Url not found: ", funcName, funcNameFallback, req.url, req.baseUrl, req.originalUrl, req.method);
        }
    } finally {
        workerThread.save();
    }

    return next();
};

export class ShadowSaveWorker {
    private _sh;
    private _fs;
    private _db;
    private _req;
    private _config;
    private _reqId;
    private DATE_STAMP;

    private _folderPath;
    private _filePath;

    private _store = {};

    constructor() {
        this._sh = require('shelljs');
        this._config = config;
        this._db = db;
        this._fs = require('fs');

        const d = new Date;
        this.DATE_STAMP = d.getFullYear() + "-"
            + this.twoDigits(d.getMonth() + 1) + "-"
            + this.twoDigits(d.getDate());

        this.createDirectoryStructure();
        this.inStore();

        urlWordsTokens = ["examinations", "vitals", "diagnosis", "medications", "investigations", "referrals", "procedures", "test-results", "chief-complains", "attachments", "clinical-notes"];
        urlWordsTokens.push("chiefComplains", "clinicalNotes", "ChiefComplains", "ClinicalNotes");

        return this;
    }

    private createDirectoryStructure() {
        this._folderPath = __dirname.replace("/src/controllers/middlewares", "/shadowSaveDumps");
        if (! this._sh.test('-d', this._folderPath)) this._sh.mkdir('-p', this._folderPath);

        this._filePath   = this._folderPath + "/" + this.DATE_STAMP + ".json";
        if (! this._sh.test('-f', this._filePath)) this._sh.exec(`echo '\{}' > ${this._filePath}`);
    }
    public twoDigits(d) {
        if(0 <= d && d < 10) return "0" + d.toString();
        if(-10 < d && d < 0) return "-0" + (-1*d).toString();
        return d.toString();
    }
    public setDateStamp(stamp) {
        this.DATE_STAMP = stamp;
        this.createDirectoryStructure();

        return this;
    }
    public getFilePath() {
        return this._filePath;
    }
    private inStore() {
        try {
            this._store = JSON.parse(this._sh.cat(this._filePath).stdout.replace(/\\n/g, '')) || {};
        } catch (e) {
            console.error("Found error: while reading shadowDump file", e)
        }
    }
    private outStore() {
        this._fs.writeFile(this._filePath, StaticHelpers.stringify(this._store), function (err) {
            if (err) console.error(err);
            else console.log('Saved!');
        });

        // const storeString = StaticHelpers.stringify(this._store);
        // this._sh.exec(`echo '${storeString}' > ${this._filePath}`);
    }
    private searchConsultation(query, type = 'code') {
        const intQuery = parseInt(query);

        switch (type) {
            case 'code': return this._store[query] || {};
            case 'patient':
                for ( let key in this._store )
                    if ( this._store[key]["createConsultationResp"]
                        && this._store[key]["createConsultationResp"]["patientId"]
                        && parseInt(query) === parseInt(this._store[key]["createConsultationResp"]["patientId"])
                    ) return this._store[key];
                break;
            case 'post':
                for ( let key in this._store )
                    if ( this._store[key]["createConsultationResp"]
                        && this._store[key]["createConsultationResp"]["postId"]
                        && parseInt(query) === parseInt(this._store[key]["createConsultationResp"]["postId"])
                    ) return this._store[key];
                break;
            case 'soap':
                for ( let key in this._store ) {
                    if (! this._store[key]["soap"]) {
                        const soap = Soap.repo().findOne({where: { "consultation_code":  this._store[key]["code"]}})
                            .then( soap => this._store[key]["soap"] = soap );

                        this._store[key]["soap"] = 0;
                    }

                    if ( parseInt(this._store[key]["soap"]["id"]) == intQuery)
                        return this._store[key];
                }
                break;
        }

        return {};
    }
    private lastResponse(key = null) {
        const resp = this._config.lastResponse(this._reqId);

        if (key) return resp[key] || {};
        return resp;
    }
    private urlComponent(index) {
        return this._req.url.split("/")[index];
    }
    private createPastEntity(key) {
        const patientId = this._req.body.patientId || 0;
        const entry = this.searchConsultation(patientId, 'patient');
        const response = this.lastResponse();
        const entity = response["row"] || {};

        const pastEntities = entry[key] || [];
        pastEntities.push(entity);

        entry[key] = pastEntities;
        this._store[entry["code"]] = entry;
    }
    private deletePastEntity(key) {
        const entityId = parseInt(this.urlComponent(2));
        const entity = this.lastResponse()["row"] || {};
        const patientId = entity.patient_id || 0;

        const entry = this.searchConsultation(patientId, 'patient');

        const pastEntities = entry[key] || [];
        const index = pastEntities.findIndex(row => row.id == entityId);
        if (index > -1) pastEntities.splice(index, 1);

        entry[key] = pastEntities;
        this._store[entry["code"]] = entry;
    }
    private async getTermBodyById(id) {
        const term = await Term.repo().findOne({where: {id: id}});
        return term ? term.term_body : "";
    }

    public setReq(req) {
        this._req = req;
        this._reqId = req.headers["id"];
        return this;
    }
    public save() { this.outStore(); }

    public postCreatePatient() {
        // TODO: Later, create key in .json to hold all create-patient requests.
        //       Not doing, becuase currently no patients are created using this API
        //       only create-consultation API is used.
        // console.log("File path: ", sh.cat(filePath).stdout);
    }
    public postCreateConsultation() {
        let resp = this.lastResponse();
        const soap = resp.soap;

        delete(resp.soap);

        const entry = {
            request: this._req.body,
            createConsultationResp: resp,
            code: resp.code,
            soap: soap,
        };

        this._store[entry.code] = entry;
    }
    public patchPatient() { // TODO: 'updatePatient': elements to update, for patient after consultationCreation.
        const entry = this.searchConsultation(this._req.url.split("/")[2], 'patient');

        entry["updatePatient"] = this._req.body;
        this._store[entry["code"]] = entry;
    }
    public createSoap() {
        const entry = this.searchConsultation(this._req.body.id, 'post');
        const resp = this.lastResponse();

        entry["soap"] = resp["soap"];
        entry["request"]["soapId"] = resp["soap"]['id'];

        this._store[entry["code"]] = entry;
    }
    public async updateSoap() {
        const soap = this.lastResponse("soap");
        const soapId = this._req.url.split("/")[1];
        const entry = this.searchConsultation(soapId, 'soap');

        const components = ["investigations", "procedures", "referrals"];
        for ( let i = 0; i < components.length; i ++)
            for ( let j = 0; j < soap[components[i]].length; j ++)
                soap[components[i]][j]["term_text"] =
                    await this.getTermBodyById(soap[components[i]][j]["term_id"] || soap[components[i]][j]["terms"]);

        // console.log("Soap: ", soap);

        entry["soap"] = soap;
        this._store[entry["code"]] = entry;
    }
    public createTerm() { // TODO: 'terms': terms to create if not already available.
        const entry = this._store[Object.keys(this._store)[0]];
        const resp  = this.lastResponse();

        const terms = entry["terms"] || [];
        if (! terms.filter( term => term.id ==  resp["term"]["id"]).length)
            terms.push(resp["term"]);

        entry["terms"] = terms;
        this._store[entry["code"]] = entry;
    }
    public uploadAttachment() {
        const resp = this.lastResponse();
        console.log("last response: ", resp);

        const soapId = this.urlComponent(1) || resp.row.soap.id;

        const entry = this.searchConsultation(soapId, 'soap');
        const entity = resp["row"]; delete entity["soap"];

        if (! entry) return;

        const attachments = entry["soap"]["attachments"] || [];
        attachments.push(entity);

        entry["soap"]["attachments"] = attachments;
        this._store[entry["code"]] = entry;
    }
    public updateRemarkFollowUp() { // TODO: 'remark' / 'follow-up' if exists in soap, update.
        const soapId = this._req.url.split("/")[1];
        const entry = this.searchConsultation(soapId, 'soap');

        entry["soap"]["remark"] = this._req.body.remark || "";
        entry["soap"]["follow_up"] = this._req.body.follow_up || "";
        this._store[entry["code"]] = entry;
    }
    public createEntity() {
        const soapId = this.urlComponent(1);
        const entityType = this.urlComponent(2);

        const soapRelation = Soap.urlTypeParamToRelationNames(entityType);
        const response = this.lastResponse();

        const entry = this.searchConsultation(soapId, 'soap');
        if (! entry.code) return;

        const entity = response["row"];
        delete entity["soap"];

        const rows = entry["soap"][soapRelation] || [];
        rows.push(entity);

        entry["soap"][soapRelation] = rows;
        this._store[entry["code"]] = entry;
    }
    public updateEntity() {
        const soapId = this.urlComponent(1);
        const soapRelation = Soap.urlTypeParamToRelationNames(this.urlComponent(2));

        const entity = this.lastResponse()["row"];
        delete entity["soap"];

        const entry = this.searchConsultation(soapId, 'soap');

        if (! entry.code) return;
        const rows = entry["soap"][soapRelation] || [];

        const index = rows.findIndex( row => row.id === entity.id );
        (index > -1) ? rows[index] = entity : rows.push(entity);

        entry["soap"][soapRelation] = rows;
        this._store[entry["code"]] = entry;
    }
    public removeEntity() {
        const soapId = this.urlComponent(1);
        const soapRelation = Soap.urlTypeParamToRelationNames(this.urlComponent(2));
        let entityId = this.urlComponent(3);

        const entry = this.searchConsultation(soapId, 'soap');
        if (! entry.code) return;
        let rows = entry["soap"][soapRelation] || [];

        if (entityId === "all") {
            rows = [];
        } else if (entityId) {
            entityId = parseInt(entityId);

            const index = rows.findIndex( row => row.id === entityId );
            if (index > -1) rows.splice(index, 1);
        }

        entry["soap"][soapRelation] = rows;
        this._store[entry["code"]] = entry;
    }
    public createPastIllness() { // TODO: 'pastIllnesses': illness to create if not already available
        this.createPastEntity("pastIllnesses");
    }
    public createPastMedication() { // TODO: 'pastMedications': illness to create if not already available
        this.createPastEntity("pastMedications");
    }
    public deletePastIllness() { this.deletePastEntity("pastIllnesses"); }
    public deletePastMedication() { this.deletePastEntity("pastMedications"); }
    public createHistory() { // TODO: 'history' element, if exist, create histories.
                             //     keep in mind, the 'type' key in each history object.
        const type = this._req.body.type;
        const patientId = this._req.body.data.patient_id;
        const entity = this.lastResponse("data");
        entity["type"] = type;

        const entry = this.searchConsultation(patientId, 'patient');
        const histories = entry["history"] || [];

        histories.push(entity);
        entry["history"] = histories;
        this._store[entry["code"]] = entry;
    }
    public createBulkHistory() {
        const types = {
            "allergy": "allergy",
            "family_history": "family_history",
            "habits": "habit",
            "past_illness": "diagnosis",
            "past_treatment": "procedure",
        };

        let patientId = 0; let rows = [];

        const data = this._req.body.data;
        for (let key in data) {
            const type = types[key] || "exception";

            data[key].forEach( row => {
                if (row["id"]) return;

                if (! patientId) patientId = row["patient_id"];
                row["type"] = type;

                rows.push(row);
            });
        }

        const entry = this.searchConsultation(patientId, "patient");
        let history = entry["history"] || [];

        history = history.concat(rows);
        entry["history"] = history;

        this._store[entry["code"]] = entry;
    }
    public deleteHistory() {
        const type = this._req.body.type;
        const historyId = this._req.body.id;
        const entity = this.lastResponse('deleteResponse');

        const entry = this.searchConsultation(entity["patient_id"], 'patient');
        const histories = entry["history"] || [];
        const index = histories.findIndex( history => (history["type"] == type) && (history["id"] == historyId));

        if (index > -1) histories.splice(index, 1);
        entry["history"] = histories;

        this._store[entry["code"]] = entry;
    }
}

const workerThread = new ShadowSaveWorker();