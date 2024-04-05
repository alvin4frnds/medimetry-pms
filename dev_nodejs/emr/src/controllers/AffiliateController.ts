"use strict";

import { config, Config } from '../config/Config';
import { S3Uploader, uploader } from '../config/S3';
import { debug } from '../helpers/Debug';
import { ExportDb } from '../commands/ExportDb';
import { SoapController } from './SoapController';
import { ConsultationsController } from './ConsultationsController';
import { db, DatabaseConfiguration } from '../config/DatabaseConfiguration';
import { HttpRequest } from '../helpers/HttpRequest';
import { User } from '../database/models/User';
import { Meal } from '../database/models/Meals';
import { Vitals } from '../database/models/Vital';
import { TestResult } from '../database/models/TestResult';
import { PersonalHistory } from '../database/models/PersonalHistory';
import { Soap } from '../database/models/Soap';
import { Attachment } from '../database/models/Attachment';
import { Feedback } from '../database/models/Feedback';
import { getConnection, In } from 'typeorm';
import { AuditLog } from '../database/models/AuditLog';
import { ConsultationStatus } from '../database/models/ConsultationStatus';
import { SOAPRepository } from '../database/repository/SOAPRepository';
const Router = require('./Router');
const fs = require('fs');
const AWS = require('aws-sdk');

export class AffiliateController extends Router {
    private _config: Config;
    private _s3: S3Uploader;
    private _request;
    private _db: DatabaseConfiguration;

    constructor(routePath, app) {
        super(routePath, app);

        this._config = config;
        this._s3 = uploader;
        this._db = db;
        this._request = new HttpRequest();
    }

    get services() {
        return {
            '/create-soap/:code': 'createSoap',
            'POST /attach-image': 'attachImage',
            "POST /save-vitals/:soap": 'saveVitals',
            "/test-results/:code": 'getTestReportsBeCode',
            "POST /save-feedback/:code": "saveFeedback",
            "GET /consultations": "getConsultations",
            "POST /soap/:soap": "updateSoap",
            "POST /updateSoap/:code": "updateSoapViaCode",
            '/:soap(\\d+)/vitals/get-previous': 'getPreviousSoapVitals',
            '/view/:code': 'getSoapByCode',
            'POST /diet-chart/:code': 'putDietChart',
            'POST /personal-history/:code': 'putPersonalHistory',
            '/mark-consultations/done': 'markConsultationsDone',
            'POST /logged-in-sessions/disable/:uid': 'disableLoggedInSessions',
            '/count/sugar-strips/:patient': 'getSugarStripCount',
        };
    }

    async getSugarStripCount(req, res) {
        if (this._config.getOAuthClientKey() != req.query.token.replace("?", "")) // for some reason, there is an extra '?'
            return res.send(this.build("Not allowed to access", 1, { confir: this._config.getOAuthClientKey(), query: req.query.token}));

        const sugarStripsCount = await this.getSugarStripsUsedThisMonthCount(req.params.patient);
        return res.send(this.build("here you go!", 1, {sugarStripsCount}));
    }

    async getPreviousSoapVitals(req, res) {
        if (this._config.getOAuthClientKey() != req.headers.token)
            return res.send(this.build("Not allowed to access"));

        return await (new SoapController("", this.app))
            .getPreviousSoapVitals(req, res);
    }

    async saveVitals(req, res) {
        if (config.get("oauthClientKey") != req.body.oauth_token)
            return res.send(this.build("Invalid or missing token"));

        const getAccessToken = config.get("defaultToken");
        const user = await User.getRepo().createQueryBuilder("user")
            .where("user.refresh_token = :token")
            .setParameters({token: getAccessToken})
            .orderBy("user.id", "DESC")
            .getOne();

        req.user = user;
        req.headers.token = user.access_token;
        req.params.type = "vitals";

        await Vitals.repo().createQueryBuilder()
            .delete()
            .where('soap_id = :soapId', {
                soapId: req.params.soap
            }).execute();

        try {
            const vitals = await (new SoapController("", this.app))
                .createEntity(req, res);

            const soap = await Soap.repo().createQueryBuilder()
                .where("id = :soap", {
                    soap: req.params.soap,
                })
                .getOne();

            if ( req.body['vital_information'] &&
                 req.body['vital_information']['Random Sugar'] &&
                 (parseInt(req.body['vital_information']['Random Sugar']) > 150))
                 await this._request.seRequest("internal-api/emr/add-patient-tag", {
                    key: this._config.getOAuthClientKey(),
                    patient: soap.patient_id,
                    tag: "Sugar,Chronic",
                });

            if ( req.body['vital_information'] &&
                 req.body['vital_information']['BP(S)'] &&
                 (parseInt(req.body['vital_information']['BP(S)']) > 150))
                 await this._request.seRequest("internal-api/emr/add-patient-tag", {
                    key: this._config.getOAuthClientKey(),
                    patient: soap.patient_id,
                    tag: "B.P.,Chronic",
                });

            console.log("Request: ", req.body);
            console.log("and patientId: ", soap.patient_id);

        } catch ( e ) {} // For: UnhandledPromiseRejectionWarning: Error [ERR_HTTP_HEADERS_SENT]:
                         // Cannot set headers after they are sent to the client

        return res.send(this.build("Successfully Updated", 1));
    }

    async createSoap(req, res) {
        // excluded from shadowSave onPurpose
        if (!req.params.code) return res.send(this.build("Missing required fields"));

        // if soap exists, of this code, then return that instead
        const previousSoap = await Soap.repo()
            .createQueryBuilder()
            .where("consultation_code = :code", {
                code: req.params.code
            })
            .getOne();
        if (previousSoap) return res.send(this.build("Found existing", 1, {soap: previousSoap}));

        let pobject = await this._db.wpdb(`select * from medi_pobject where code = '${req.params.code}'`);
        if (!pobject.length) return res.send(this.build("pobject not found;"));

        pobject = pobject[0];
        const user = await User.getRepo().createQueryBuilder("user")
            .where("user.refresh_token = :token")
            .setParameters({token: this._config.get('defaultToken')})
            .orderBy("user.id", "DESC")
            .getOne();

        const soap = await (new SoapController("", this.app))
            .createSoapByPostId({user}, res, pobject["post_id"]);

        await (new ConsultationsController("", this.app))
            .syncConsultationStatus();

        const sugarStripsCount = await this.getSugarStripsUsedThisMonthCount(soap.patient_id);

        return res.send(this.build("here you go!", 1, {soap, sugarStripsCount}));
    }

    async attachImage(req, res) {
        if (!req.body.code) return res.send(this.build("Missing required fields"));

        /* await AuditLog.create(req, AuditLog.TYPES.AffiliateController.AttachImage, {
         code: req.body.code
         }); */

        let soap = await Soap.repo().createQueryBuilder()
            .where('consultation_code = :code', {
                code: req.body.code
            }).getOne();

        if ( ! soap ) {
            const pobjectRow = (await db.wpdb(`select * from medi_pobject where code = '${req.body.code}' and active = 1 order by id desc`))[0];
            if ( ! pobjectRow ) return res.send(this.build("Invalid consultation code"));

            soap = await (new SOAPRepository()).createSoapByPostId(pobjectRow['post_id']);
        }

        // already exists a row with same attachment url in same soap_id, just return.
        if (!! await Attachment.repo()
            .createQueryBuilder()
            .where('soap_id = :soap and url = :url', {
                "soap": soap.id,
                "url" : req.body.image,
            })
            .getOne())
            return res.send(this.build("Attachment already exists, but thanks", 1));

        const attachment = new Attachment();

        attachment.patient_id = soap["patient_id"];
        attachment.doctor_id = soap["created_by"];
        attachment["soap_id"] = soap["id"];
        attachment.soap = soap;
        attachment.uuid = soap["uuid"];
        attachment.attachment_type = req.body.type;
        attachment.soap_section_type = req.body.soap_section_type || "general";
        attachment.url = req.body.image;

        if (req.body.meta)
            attachment.meta = req.body.meta;

        await Attachment.repo().save(attachment);

        return res.send(this.build("uploaded successfully", 1));
    }

    async getTestReportsBeCode(req, res) {
        if (!req.params.code) return res.send(this.build("Missing required fields"));

        const soap = await Soap.repo().createQueryBuilder()
            .where('consultation_code = :code', {
                code: req.params.code
            }).getOne();
        if (!soap) return res.send(this.build("Invalid consultation code"));

        const testResults = (await TestResult.repo().createQueryBuilder()
            .where("soap_id = :soap and type in ('image', 'download')", {
                soap: soap.id
            }).getMany()).map(result => {
            return result.test_result;
        });

        const prescription = (await Attachment.repo().createQueryBuilder()
            .where("soap_id = :soap and soap_section_type in ('prescription')", {
                soap: soap.id
            }).getMany())
            .map(row => row.url) || [];
        console.log("prescription: ", prescription);

        return res.send(this.build("here you go", 1, {
            rows: testResults,
            prescription: prescription.length ? prescription[0] : "",
        }));
    }

    async saveFeedback(req, res) {

        /* await AuditLog.create(req, AuditLog.TYPES.AffiliateController.SaveFeedback, {
         code: req.params.code
         }); */

        const soap = await Soap.repo().findOne({
            where: {consultation_code: req.params.code}
        });
        if (!soap)
            return res.send(this.build("Soap not tracked in EMR"));

        let feedback = new Feedback();
        feedback.consultation_code = soap.consultation_code;
        feedback.soap = soap;
        feedback.body = req.body.body;
        feedback.value = req.body.value;
        feedback.from = soap.patient_id;
        feedback.to = soap.created_by;

        feedback = await Feedback.repo().save(feedback);

        return res.send(this.build("Saved Successfully", 1, {feedback}));
    }

    async getConsultations(req, res) {
        if (this._config.getOAuthClientKey() != req.query.token)
            return res.send(this.build("Not allowed to access"));

        if (!req.query.codes)
            return res.send(this.build("Missing required fields"));

        const consultationCodes = req.query.codes.split(",");
        if (!consultationCodes.length)
            return res.send("Here you go", 1, {soaps: []});

        const soaps = await Soap.repo().find({
            where: {
                consultation_code: In(consultationCodes)
            },
            relations: [
                "vitals", "attachments"
            ],
        });

        return res.send(this.build("Here you go", 1, {soaps}));
    }

    async updateSoapViaCode(req, res) {
        if (this._config.getOAuthClientKey() != req.query.token)
            return res.send(this.build("Not allowed to access"));

        if ( ! req.params.code)
            return res.send(this.build("Missing required fields"));

        // consultatin should exist in consultation status, 
        for ( const key in req.body) {
            switch (key) {
                case "created_at":
                    await Soap.repo()
                        .createQueryBuilder()
                        .update(Soap)
                        .set({created_at: req.body.created_at})
                        .where("consultation_code = :code", {
                            code: req.params.code
                        })
                        .execute();
                    break;
            }
        }

        return res.send(this.build("Updated successfully", 1));
    }

    async updateSoap(req, res) {

        /* await AuditLog.create(req, AuditLog.TYPES.AffiliateController.UpdateSoap, {
         soap: req.params.soap
         }); */

        if (this._config.getOAuthClientKey() != req.query.token)
            return res.send(this.build("Not allowed to access"));

        if (!req.params.soap)
            return res.send(this.build("Missing required fields"));

        for (const key in req.body) {
            switch (key) {
                case "created_at":
                    await Soap.repo()
                        .createQueryBuilder()
                        .update(Soap)
                        .set({created_at: req.body.created_at})
                        .where("id = :id", {
                            id: req.params.soap
                        })
                        .execute();
                    break;
            }
        }

        return res.send(this.build("Updated successfully", 1));
    }

    async getSoapByCode(req, res) {

        if (this._config.getOAuthClientKey() != req.query.token)
            return res.send(this.build("Not allowed to access"));

        let soap = await Soap.repo().findOne({
            where: {consultation_code: req.params.code}
        });

        if (!soap) return res.send(this.build("Invalid consultation code"));

        const sugarStripsCount = await this.getSugarStripsUsedThisMonthCount(soap.patient_id);

        soap = await Soap.getFullById(soap.id);

        return res.send(this.build("Here you go", 1, {
            soap,
            sugarStripsCount,
        }));
    }

    async putDietChart(req, res) {
        if (this._config.getOAuthClientKey() != req.query.token)
            return res.send(this.build("Not allowed to access"));

        let soap = await Soap.repo().findOne({
            where: {consultation_code: req.params.code}
        });

        if (!req.body.dietChart || !req.body.dietChart.length)
            return res.send(this.build("Diet chart row required."));

        await Meal.repo().createQueryBuilder()
            .delete()
            .where("soap_id = :soap", {soap: soap.id})
            .execute();

        let meals = [];
        const now = new Date;
        for (let i = 0; i < req.body.dietChart.length; i++) {
            let row = req.body.dietChart[i];

            if (!row['name']) continue;

            let meal = new Meal();

            meal.meal_time = row['meal_time'] || 0;
            meal.name = row['name']
            meal.quantity = row['quantity'].split(" ")[0] || 1;
            meal.quantity_unit = row['quantity_unit'] || "";
            meal.weekend = req.body.weekend || false;
            meal.patient_id = soap.patient_id;
            meal.doctor_id = soap.created_by;
            meal.soap = soap;
            meal.unique_meal_id = row['unique_meal_id'];
            meal.created_at = now;
            meal.updated_at = now;

            await Meal.repo().save(meal);
        }

        return res.send(this.build("Saved Successfully", 1));
    }

    public async putPersonalHistory(req, res) {
        if (this._config.getOAuthClientKey() != req.query.token)
            return res.send(this.build("Not allowed to access"));

        let soap = await Soap.repo().findOne({
            where: {consultation_code: req.params.code}
        });

        if (!req.body.personalHistory)
            return res.send(this.build("Missing required fields"));

        let personalHistory = await PersonalHistory.repo().findOne({
            where: {
                soap: soap,
            },
        });

        if (!personalHistory) {
            personalHistory = new PersonalHistory();
            personalHistory.patient_id = soap.patient_id + "";
            personalHistory.doctor_id = soap.created_by;
            personalHistory.uuid = soap.uuid;
            personalHistory.soap = soap;
        }

        personalHistory.info = req.body.personalHistory;
        await PersonalHistory.repo().save(personalHistory);

        return res.send(this.build("Saved Successfully", 1));
    }

    public async markConsultationsDone(req, res) {
        if (this._config.getOAuthClientKey() != req.query.token)
            return res.send(this.build("Not allowed to access"));

        const codes = req.query.codes.split(",");

        for (let i = 0; i < codes.length; i++) {
            await AuditLog.create(req, AuditLog.TYPES.AffiliateController.MarkConsultationDone, {
             code: codes[i],
            });

            await ConsultationStatus.repo().createQueryBuilder()
                .update(ConsultationStatus)
                .set({done: true, consultation_modified: new Date})
                .where("consultation_code = :code", {
                    code: codes[i]
                }).execute();
        }

        return res.send(this.build("Marked Done successfully", 1));
    }

    public async disableLoggedInSessions(req, res) {
        if (this._config.getOAuthClientKey() != req.body.token) 
            return res.send(this.build("Not allowed to access"));

        const wpuserid = parseInt(req.params.uid);
        const defaultToken = this._config.get("defaultToken", "");
        const queryStatement = `UPDATE users SET access_token = CONCAT('dump', access_token) WHERE user_id = '${wpuserid}' AND refresh_token != '${defaultToken}'`;

        const queryResp = await User.repo().query(queryStatement);

        return res.send("All tokens updated.");
    }

    private async getSugarStripsUsedThisMonthCount(patientId) {
        const today = new Date();
        // get vitals where sugar is filled of this month
        const query = `select count(*) as counts from vitals where patient_id = ${patientId} and date(created_at) > '${today.getFullYear()}-${today.getMonth() + 1}-01' and ( vital_information::jsonb->>'Random Sugar' != '' or vital_information::jsonb->>'Fasting Sugar' != '' or vital_information::jsonb->>'Post Prandial Sugar' != '' );`;
        const sugarCounts = await this._db.connection().query(query);

        return parseInt((sugarCounts[0] || {})['counts'] || 0);
    }
}
