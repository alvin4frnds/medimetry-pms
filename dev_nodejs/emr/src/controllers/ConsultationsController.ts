"use strict";
const Router = require('./Router');
const PHPUnserialize = require('php-unserialize');
import { db } from '../config/DatabaseConfiguration';
import { HttpRequest } from '../helpers/HttpRequest';
import { config } from '../config/Config';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import { Soap } from '../database/models/Soap';
import { getConnection, In } from 'typeorm';
import { ConsultationStatus } from '../database/models/ConsultationStatus';
import { StaticHelpers } from '../helpers/Statics';
import { SoapController } from './SoapController';
import { ShadowSave } from './middlewares/ShadowSave';
import { AuditLog } from '../database/models/AuditLog';
import { SOAPRepository } from '../database/repository/SOAPRepository';

export class ConsultationsController extends Router {
    private _dbConn;
    private _db;
    private _request;
    private _config;

    /**
     * Initializes, private variables: DB Connection, Config, HTTP Request
     *
     * @param routePath The base url for this controller
     * @param app       The expressJs app, to work on
     */
    constructor(routePath,app) {
        super(routePath, app);

        this._dbConn = db.connection();
        this._db = db;
        this._config = config;
        this._request = new HttpRequest();
    }

    /**
     * We will be using `Token` based authentication, all over the controller
     *
     * @returns {[(req:Request, res:Response, next:NextFunction)=>Promise<Response>]}
     */
    private preMiddlewares() { return [ AuthMiddleware ]; }
    private postMiddlewares() { return [ ShadowSave ]; }

    get services() {
        return {
            '/get/:page?/:date?': 'getConsultations',
            '/closed-consultations/:page?': 'listClosedConsultations',
            '/open-consultations/:page?': 'listOpenConsultations',
            '/done-consultations/:page?': 'listDoneConsultations',
            '/patient-consultations/:patient': 'listPatientConsultations',
            '/consultation-listing-by/:code': 'getConsultationsByCode',
            '/mark-done/:code': 'markConsultationDone',
            '/mark-undone/:code': 'markConsultationUnDone',
            '/view/:doctor/:id': 'viewConsultation',
            'POST /create-patient': 'createPatient',
            'POST /create-consultation': 'createConsultation',
            '/search-patients/:query/:page?': 'searchPatient',
            '/get-binded-doctors': 'getBindedDoctors',
            'POST /put-binded-doctors': 'putBindedDoctors',
            'POST /close': 'closeConsultation',
            '/get-doctor-availablity': 'getDoctorAvailablity',
            'POST /set-doctor-availablity': 'setDoctorAvailablity',
            'POST /assign-doctor': 'assignDoctor',
            'POST /assign-broadcast-consultation': 'assignBroadcastConsultation',
            '/channels-i-am-associated-with': 'getChannelsIAmAssociatedWith',
            'POST /expire-consultation': "expireConsultation",
            'POST /admin-close-consultation': "adminCloseConsultation",
            'POST /refund-consultation': "refundConsultation",
            'PATCH /patient/:id': "updatePatient",
            'DELETE /patient/:id': "deletePatient",
            '/patient/:id/:code?': 'getPatientDetail',
            'POST /update-patients-uid': 'updatePatientLogin',
            'POST /add-video-call-logs': "addVideoCallLogs",
            'POST /send-sms': "sendSmsToDoctor",
            '/generate-patient-history/:id': "generatePatientHistory",
            '/av-row/:code': 'getVideocallRecordRow',
            'POST /submit-partnerapp-feedback/:code': "submitPartnerAppFeedback",
            "/get-unfollow-uped-soaps/:page?": 'getUnfollowupedSoaps',
            "POST /followups-listing": 'followupsListing',
            "POST /create-from-csv": "createConsultationsJobFromCSV",
            "POST /initiate-phone-call": "initiateDocMedimetryAudioCall",
            "POST /request-payment/:code": "requestPayment",
            'POST /appointment/get-dates': 'getAppointmentDates',
            'POST /appointment/get-consultations': 'getAppointmentconsultations',
            'POST /appointment/update-status': 'updateAppointmentStatus',
        };
    }

    async getConsultations(req, res) {

        let params = {
            doctor: req.user.user_id,
            page: req.params.page || 1,
            key: this._config.get('oauthClientKey'),
            isAssistant: req.user.user_type == "assistant",
            date: req.params.date || null
        };

        if (params.isAssistant) {
            params.doctor = req.user.getDoctorIds();
        }

        const httpResp = await this._request.seRequest("internal-api/emr/doctors-consultation-listing", params);

        let uniqueConsultationCodes = [];
        for (let i = 0; i < httpResp.length; i ++)
            uniqueConsultationCodes.push(httpResp[i]["consultation_code"]);

        const soaps = await Soap.getRepo().find({
            consultation_code: In(uniqueConsultationCodes),
        });

        for (let i = 0; i < httpResp.length; i ++) {
            let soap = soaps.filter(function (soap) {
                return httpResp[i]["consultation_code"] == soap.consultation_code;
            })[0] || false;

            httpResp[i]["soap_id"] = ( soap === false ) ? 0 : soap.id;
        }

        return res.send(this.build("Here you go!", 1, {
            consultations: httpResp
        }, req));
    }
    async createPatient(req, res) {
        await AuditLog.create(req, AuditLog.TYPES.ConsultationController.CreatePatient);

        const httpResp = await this._request.coreRequest("create-patient", {
            name: req.body.name,
            email: req.body.email,
            dontSendNotification: this._config.get('shadowSave', false) ? 1 : 0,
            dob: req.body.dob,
            mobile: req.body.mobile,
        });

        return res.send(this.build("Here we go", 1, httpResp, req));
    }
    async createConsultation(req, res) {
        const deviceId = this._config.get("defaultDeviceId");
        const dontSendNotif = this._config.get('shadowSave', false) ? 1 : 0;

        await AuditLog.create(req, AuditLog.TYPES.ConsultationController.CreateConsultation);

        // client is sending me 'address' instead of 'user_address', so adding a patch for that
        if (! req.body.user_address && req.body.address) req.body.user_address = req.body.address;

        if (req.body.user_address && !req.body.user_mobile) {
            const prefix = (req.body.user_address.substr(0, 3) || "mmy").toUpperCase();
            let today  = new Date;

            if (["0.0.0.0", "127.0.0.1", "localhost", null].indexOf(this._config.get('host', null)) < 0)
                today.setTime( today.getTime() + ( 5.5 * 60 * 60 * 1000 ) ); // only in case of cloudServers

            const yearTime = today.getFullYear() % 100 + ""
                + StaticHelpers.twoDigits(today.getMonth() + 1)
                + StaticHelpers.twoDigits(today.getDate())
                + StaticHelpers.twoDigits(today.getHours())
                + StaticHelpers.twoDigits(today.getMinutes())
                + StaticHelpers.twoDigits(today.getSeconds());

            req.body.user_mobile = prefix + yearTime;
        }

        if (!req.body.user_email) req.body.user_email = req.body.user_mobile + "@medimetry.com";
        if ( ( req.user.user_type === 'contributor') && ! req.body.doctor)
            req.body.doctor = req.user.user_id;
        else if ( ( req.user.user_type === 'assistant' ) && ! req.body.doctor && req.user.meta.doctors.length)
            req.body.doctor = req.user.meta.doctors[req.user.meta.doctors.length - 1]['doctor_id'];

        const consultation = await this._request.seRequest("internal-api/consultation/create-consultation", {
            name: req.body.user_name,
            email: req.body.user_email,
            dob: req.body.user_dob,
            mobile: req.body.user_mobile,
            address: req.body.user_address || "",
            dontSendNotification: dontSendNotif,
            key: this._config.getOAuthClientKey(),
            deviceId: deviceId,
            names: req.body.patient_name,
            patient_relation: req.body.patient_relation || req.body.patient_name,
            age: req.body.patient_age,
            gender: req.body.patient_gender,
            title: req.body.chief_complaints,
            centerCode: req.body.center_code,
            channelName: req.body.channel_name,
            country: req.body.country,
            soapDate: req.body.soap_date || null,
            type: req.body.consult_type || 'AUDIO',
            specialty: req.body.specialty || 'Family Physician',
            doctorId: req.body.doctor || null,
            patient_mobile: req.body.patient_mobile || null
        });

        if ( ! consultation.success)
            return res.send(consultation);

        let metaValues = {};
        let soap = {};

        try {
            if (consultation.success) {
                soap = await (new SoapController("/temp", this.app))
                    .createSoapByPostId(req, res, consultation.postId);

                metaValues = {
                    "postId": consultation.postId,
                    "code": consultation.code,
                    "txnid": consultation.txnid,
                    "patientId": consultation.viewQuestionReply.patient.id,
                    "soap" : soap,
                };

                if (soap && soap['id'] && req.body.soap_date) {

                    soap['created_at'] = new Date(req.body.soap_date);
                    await Soap.repo().save(soap);
                }
            }

            await this.syncConsultationStatus();
        } catch (error) {
            console.error("Found error: ", error);
        }

        return res.send(this.build(consultation.message, consultation.success, metaValues, req));
    }
    async searchPatient(req, res) {
        const doctorIds = req.query.assigned && (req.query.assigned === "1")
            ? ConsultationsController.getDoctorsArrayFromAuthToken(req)
            : "";

        const resp = await this._request.seRequest("internal-api/emr/search-patients", {
            query: req.params.query.trim(),
            center: req.query.center || "",
            tags: (req.query.tags || "").split(","),
            page: req.params.page || 1,
            doctors: doctorIds,
        });

        res.send(this.build(resp.message, resp.success, {
            patients: resp.patients,
            patient: resp.patient
        }, req));
    }
    async viewConsultation(req, res) {
        // checking if, 'doctorId' came in request is legit.
        if (req.user.user_type === 'assistant' && req.params.doctor) { // in assistant, doctor should be one of the assigned ones
            if (!req.user.meta.doctors.filter(doctor => doctor.doctor_id == req.params.doctor).length)
                return res.send(this.build("Doctor ID not found in assistant's assigned doctors."));
        } else if (req.user.user_type === 'contributor') { // in doctor, it should always be same
            if (req.user.user_id != req.params.doctor)
                return res.send(this.build("Can't open in another doctor's context"));
        } else return res.send("More roles handling is not built yet.");

        let consultation = await this._request.seRequest("internal-api/emr/view-consultation", {
            key: this._config.get('oauthClientKey'),
            doctor: req.params.doctor || req.user.user_id,
            id: req.params.id
        });

        res.send(this.build("Here you go", 1, consultation, req));
    }
    async getBindedDoctors(req, res) {
        if (req.user.user_type !== 'assistant') return res.send(this.build("Not a doctor's assistant"));

        const response = await this._request.seRequest("internal-api/emr/get-doctors-bindings", {
            key: this._config.get("oauthClientKey"),
            assistant: req.user.meta["id"],
        });

        res.send(this.build(response.message, response.success, response, req))
    }
    async putBindedDoctors(req, res) {
        await AuditLog.create(req, AuditLog.TYPES.ConsultationController.SaveDoctorBindings);

        if (req.user.user_type !== 'assistant') return res.send(this.build("Not a doctor's assistant"));

        const response = await this._request.seRequest("internal-api/emr/put-doctors-bindings", {
            key: this._config.getOAuthClientKey(),
            assistant: req.user.meta["id"],
            doctors: req.body.doctors,
        });

        res.send(this.build(response.message, response.success, response, req))
    }
    async closeConsultation(req, res) {
        if (!req.body.postId || !req.body.doctorId)
            return res.send(this.build("Missing required fieldds"));

        const pobjectRow = await this._db.wpdb(`select * from medi_pobject where post_id = '${parseInt(req.body.postId)}' order by id desc`);
        if (pobjectRow && pobjectRow[0] && pobjectRow[0]['code']) {
            await AuditLog.create(req, AuditLog.TYPES.ConsultationController.CloseConsultation, {
                code: pobjectRow[0]['code'],
            });
        }

        const response = await this._request.seRequest("api/doc", {
            job: "closeConsultation",
            postId: req.body.postId,
            doctorId: req.body.doctorId,
        });

        res.send(this.build(response.message, response.success, {}, req));
    }
    async getDoctorAvailablity(req, res) {
        if (req.user.user_type !== "contributor")
            return res.send(this.build("Not a doctor"));

        const response = await this._request.seRequest("internal-api/emr/get-doctor-availablity", {
            key: this._config.getOAuthClientKey(),
            doctor: req.user.user_id,
        });

        res.send(this.build(response.message, response.success, {
            available: response.available
        }, req));
    }
    async setDoctorAvailablity(req, res) {
        if (req.user.user_type !== "contributor")
            return res.send(this.build("Not a doctor"));

        const response = await this._request.seRequest("internal-api/emr/set-doctor-availablity", {
            key: this._config.getOAuthClientKey(),
            doctor: req.user.user_id,
            available: req.body.available,
        });

        res.send(this.build(response.message, response.success, {
            available: response.available
        }, req));
    }
    async assignDoctor(req, res) {
        if (req.user.user_type !== "assistant")
            return res.send(this.build("Not a doctor's assistant"));

        if (! req.body.doctorId || ! req.body.postId)
            return res.send(this.build("Missing required feilds"));

        const response = await this._request.seRequest("api/doc", {
            doctorId: req.body.doctorId,
            job: "assistantToDoctorAssign",
            postId: req.body.postId,
            assistantId: req.user.meta["id"],
        });

        res.send(this.build(response.message, response.success, response, req));
    }
    async getChannelsIAmAssociatedWith(req, res) {
        let params = {};

        if (req.user.user_type == "assistant") {
            params["isAssistant"] = true;
            params["id"] = req.user.meta["id"];
        }

        if (req.user.user_type == "contributor") {
            params["isAssistant"] = false;
            params["id"] = req.user.user_id;
        }

        params["job"] = "getChannelsIamAssociatedWith";
        console.debug("params: ", params);
        const response = await this._request.seRequest("api/doc", params);

        return res.send(this.build(response.message, response.success, response, req));
    }
    async assignBroadcastConsultation(req, res) {
        if (! req.body.postId) return res.send(this.build("Missing required feidl"));
        if (req.user.user_type !== "contributor") return res.send(this.build("This API is for doctor's only"));

        const response = await this._request.seRequest("internal-api/emr/assign-broadcast-consultation", {
            key: this._config.getOAuthClientKey(),
            doctor: req.user.user_id,
            post: req.body.postId,
        });

        return res.send(this.build(response.message, response.success, response, req));
    }
    async listClosedConsultations(req, res) {
        const TAKE = 20;
        const SKIP = ((req.params.page || 1) - 1 ) * TAKE;

        const doctorIdString = ConsultationsController.getDoctorsArrayFromAuthToken(req);

        const closedConsultationsCodes = await this._db.wpdbGetColumn(`select p.code as code from medi_pobject as p join medi_consultation as c on (p.code = c.code) where p.status = 'closed' and c.user_id in (${doctorIdString}) order by end_date desc limit ${SKIP}, ${TAKE}`, "code");

        return res.send(this.build("Here you go!", 1, {
            rows: await this.getConsultationListByCodes(closedConsultationsCodes)
        }, req));
    }
    private static getDoctorsArrayFromAuthToken(req) {
        let doctorIdsArray = [];
        if (req.user.user_type === "contributor") doctorIdsArray = [req.user.user_id];
        else if (req.user.user_type === "assistant")
            doctorIdsArray = req.user.meta.doctors.map(doctor => {
                return doctor.doctor_id;
            });

        return doctorIdsArray.map(doctor => {
            return "'" + doctor + "'";
        }).join(", ");
    }
    async listDoneConsultations(req, res) {
        const doctorIdString = ConsultationsController.getDoctorsArrayFromAuthToken(req);
        const doctorIdsArray = doctorIdString.split(", ").map( doctor => doctor.substring(1, doctor.length-1));

        if (!doctorIdsArray.length) return res.send(this.build("Doctor's not found"));

        const channels = (req.user && req.user.meta 
            && req.user.meta.user 
            && req.user.meta.user.channels
            && req.user.meta.user.channels.length
        ) ? req.user.meta.user.channels : [];

        const toSendConsultationCodes = await this.consultationsListQuery(
            doctorIdsArray, 
            (req.params.page || 1),
            (req.query.center || ""),
            true,
            (req.query.tags.length ? req.query.tags.split(",") : []),
            channels
        );

        let rowsToSend = await this.getConsultationListByCodes(toSendConsultationCodes);
        rowsToSend.map( row => {
            return row.done = true;
            return row;
        });

        return res.send(this.build("Here you go!", 1, {
            rows: rowsToSend
        }, req));
    }
    async getConsultationsByCode(req, res) {
        let rowsToSend = await this.getConsultationListByCodes([req.params.code], {ignoreFutureSoapDates: true});
        
        return res.send(this.build("Here you go!", 1, {
            rows: rowsToSend
        }, req));
    }
    async listOpenConsultations(req, res) {
        const TAKE = 20;
        const SKIP = ((req.params.page || 1) - 1 ) * TAKE;

        const doctorIdString = ConsultationsController.getDoctorsArrayFromAuthToken(req);
        const doctorIdsArray = doctorIdString.split(", ")
            .map( doctor => doctor.substring(1, doctor.length-1));

        if (!doctorIdsArray) return res.send(this.build("Doctor's not found"));

        await this.syncConsultationStatus();

        const channels = (req.user && req.user.meta 
            && req.user.meta.user 
            && req.user.meta.user.channels
            && req.user.meta.user.channels.length
        ) ? req.user.meta.user.channels : [];

        const toSendConsultationCodes = await this.consultationsListQuery(
            doctorIdsArray, 
            (req.params.page || 1),
            (req.query.center || ""),
            false,
            (req.query.tags.length ? req.query.tags.split(",") : []),
            channels
        );

        console.log("toSendConsultationCodes: ", toSendConsultationCodes);

        let rowsToSend = await this.getConsultationListByCodes(toSendConsultationCodes);
        rowsToSend = rowsToSend.map( row => {
            row.done = false;
            return row;
        });
        rowsToSend = rowsToSend.sort( (a, b) => {
            if (a["consultation_id"] < b["consultation_id"]) return -1;
            if (a["consultation_id"] > b["consultation_id"]) return 1;
            return 0;
        });

        return res.send(this.build("Here you go!", 1, {
            rows: rowsToSend
        }, req));
    }
    private async consultationsListQuery(doctorIds, page, centerCode, isDone, tags, channels) {
        const TAKE = 20;
        const SKIP = ((page || 1) - 1 ) * TAKE;

        if ( tags.length || (centerCode && centerCode.length)) {} // is patients listing
        else return StaticHelpers.getColumnFromJsonObj(
                await ConsultationStatus.repo()
                    .createQueryBuilder()
                    .where(`active = true and doctor_id in ( ${doctorIds.join(",")} ) and done = ${isDone ? 'true' : 'false'} and created_at < NOW() `)
                    .skip(SKIP).take(TAKE)
                    .orderBy("consultation_id", isDone ? "DESC" : "ASC")
                    .getMany(), "consultation_code"
            ) || [];


        // for patients listing
        let consultationCodes = [];
        const patientsWhereClauses = [];
        const consultationRowsPatientId = [];

        if ( centerCode && centerCode.length ) patientsWhereClauses.push(`center_code = '${centerCode}' `);
        if ( tags && tags.length )
            patientsWhereClauses.push(`( ` + tags.map(tag => `meta LIKE '%${tag}%'`).join(" AND ") +` ) `);
        const patientQuery = `SELECT id FROM medi_patients WHERE ` + patientsWhereClauses.join(" AND ") + ` ORDER BY updated_at DESC  `;

        const patientsTake = TAKE * 5;
        let patientsSkip = Math.floor(page / 5);

        while ( consultationCodes.length < 20 ) {
            const patientIds = await this._db.wpdb(patientQuery + ` LIMIT ${patientsSkip}, ${patientsTake}`);

            if ( ! patientIds.length) break; // no point in going forward, no patients found.

            const patientIdStr = patientIds.map(row => row.id).join(",");

            consultationCodes = consultationCodes.concat(StaticHelpers.getColumnFromJsonObj(
                    (await ConsultationStatus.repo()
                .createQueryBuilder()
                .where(`active = true and doctor_id in ( ${doctorIds.join(",")} ) and done = ${isDone ? 'true' : 'false'} and patient_id in ( ${patientIdStr} ) `)
                .skip(SKIP).take(TAKE)
                .orderBy("consultation_id", isDone ? "DESC" : "ASC")
                .getMany()).filter(row => {
                        if ( consultationRowsPatientId.indexOf(row['patient_id']) > -1 ) return;

                        consultationRowsPatientId.push(row['patient_id']);
                        return true;
                    }), "consultation_code"
                ) || []);

            page += 5;
            patientsSkip = Math.floor(page / 5);
        }

        return consultationCodes;
    }
    public async syncConsultationStatus() {
        // get last modified date from DB

        let maxConsultationId = await ConsultationStatus.repo().query("select MAX(consultation_id) from consultations_status");
        maxConsultationId = maxConsultationId[0]["max"];
        const consultationsAfterLastModified = await this._db.wpdb(`select * from medi_consultation where id > ${maxConsultationId}`);

        const patientIds = StaticHelpers.getColumnFromJsonObj(consultationsAfterLastModified, "patient_id");

        if (! patientIds.length) return false;

        const patients = await this._db.wpdb(`select * from medi_patients where id in ( ${patientIds.join(", ")} )`);
        let patientIdVsPatient = {};
        patients.forEach( patient => {
            patientIdVsPatient[patient['id']] = patient;
        });

        let insertingRows = [];
        for (let i = 0; i < consultationsAfterLastModified.length; i++) {
            const consultation = consultationsAfterLastModified[i];

            insertingRows.push({
                "consultation_id": consultation["id"],
                "doctor_id": consultation['user_id'],
                "consultation_code": consultation["code"],
                "consultation_modified": consultation["modified"],
                "consultation_status": consultation["status"],
                "patient_id": consultation['patient_id'],
                "center_code": patientIdVsPatient[consultation['patient_id']]['center_code'],
                "done": false,
                "meta": {},
            });
        }

        if (insertingRows.length) {
            await this._dbConn.createQueryBuilder()
                .insert()
                .into(ConsultationStatus)
                .values(insertingRows)
                .onConflict(`("consultation_code") DO NOTHING`)
                .execute();

            return true;
        }

        return false;
    }
    async markConsultationDone (req, res) {
        await AuditLog.create(req, AuditLog.TYPES.ConsultationController.MarkDone, {
            code: req.params.code
        });

        this._dbConn.createQueryBuilder()
            .update(ConsultationStatus)
            .set({done: true, consultation_modified: new Date})
            .where("consultation_code = :code", {
                code: req.params.code
            })
            .execute();

        await this._db.wpdb(`update medi_consultation set done = 1 where code = '${req.params.code}'`);

        return res.send(this.build("Done", 1, {}, req));
    }
    async markConsultationUnDone (req, res) {
        await AuditLog.create(req, AuditLog.TYPES.ConsultationController.MarkUndone, {
            code: req.params.code
        });

        this._dbConn.createQueryBuilder()
            .update(ConsultationStatus)
            .set({done: false, consultation_modified: new Date})
            .where("consultation_code = :code", {
                code: req.params.code
            })
            .execute();

        await this._db.wpdb(`update medi_consultation set done = 0 where code = '${req.params.code}'`);

        return res.send(this.build("Done", 1, {}, req));
    }
    public async getConsultationListByCodes(codes: any[], options = {}) {
        if (! codes.length) return [];
        options = options || {};

        const codesJoinedString = codes.map(code => { return "'" + code + "'"; }).join(", ");
        const pobjects = await this._db.wpdb(`select * from medi_pobject where code in (${codesJoinedString})`);
        const consultations = await this._db.wpdb(`select * from medi_consultation where code in (${codesJoinedString})`);

        if (!pobjects.length) return [];

        const postIds = [];
        pobjects.forEach(pobject => { postIds.push(pobject["post_id"]); });
        const postIdString = StaticHelpers.arrayToCommaSeperatedString(postIds);
        const paymentsActivity = await this._db.wpdb(`select * from medi_payments_activity where post_id in (${pobjects.map(r => r.post_id)})`);

        const mappedPaymentsActivity = {};
        paymentsActivity.forEach( row => {
            if (((["PGateway_Payu", "paytm"].indexOf(row.gateway)) > -1) && (row.status === "success"))
                mappedPaymentsActivity[row.post_id] = row.gateway;
        });

        // old query
        const posts = await this._db.wpdb(`select * from medi_posts where ID in (${postIdString})`);
        const keyName='channel_settings';
        let getPostMeta = await this._db.wpdb(`select post_id,meta_value from medi_postmeta where meta_key='${keyName}' and post_id in (${postIdString})`);

        const postAuthors = StaticHelpers.arrayToCommaSeperatedString(StaticHelpers.getColumnFromJsonObj(posts, "post_author"));

        const patientIds = StaticHelpers.arrayToCommaSeperatedString(StaticHelpers.getColumnFromJsonObj(consultations, "patient_id"));
        const doctorIds = StaticHelpers.arrayToCommaSeperatedString(StaticHelpers.getColumnFromJsonObj(consultations, "user_id"));

        const users = await this._db.wpdb(`select * from medi_users where ID in (${postAuthors}) or ID in (${doctorIds})`);
        const patients = await this._db.wpdb(`select * from medi_patients where id in (${patientIds})`);
        const soaps = await Soap.getRepo().find({
            where: { consultation_code: In(codes) },
        });

        const allAffiliates = await this._db.mailServiceDb(`select * from mail_log.channel_staff where type = 'operator'`);
        const allCenters = await this._db.mailServiceDb("select * from mail_log.channel_centers");

        for ( let i = 0; i < allCenters.length; i ++)
            allCenters[i]["affiliates"] = allAffiliates.filter( affiliate => {
                return (affiliate["center_id"] == allCenters[i]["id"])
                    && (affiliate["channel_id"] == allCenters[i]["channel_id"]);
            })

        let finalData = [];

        const meetMedimetryUrl = this._config.get("meetMedimetryUrl", "https://meet.medimetry.com/");
        const docMedimetryUrl = this._config.get("docMedimetryUrl", "https://doc.medimetry.com/") + "?token=:token&code=";

        const currentDate = new Date();
        currentDate.setMinutes(currentDate.getMinutes() + 15);
        const currentTime = currentDate.getTime();

        for ( let i = 0; i < codes.length; i ++) {
            const code = codes[i];

            const pobject = pobjects.filter(pobject => pobject["code"] == code)[0] || {};

            if (! pobject) continue;

            const consultation = consultations.filter(consultation => consultation["code"] == code)[0] || {};
            const post = posts.filter(post => post["ID"] == pobject["post_id"])[0] || {};
            let post_meta = getPostMeta.filter(post => post["post_id"] == pobject["post_id"])[0] || {};
            if ( post_meta.meta_value ) {
                post_meta = PHPUnserialize.unserialize(post_meta['meta_value']);
            }
            const user = users.filter(user => user["ID"] == post["post_author"])[0] || {};
            const patient = patients.filter(patient => patient["id"] == consultation["patient_id"])[0] || {};
            const doctor = users.filter(doctor => doctor["ID"] == consultation["user_id"])[0] || {};
            let soap = soaps.filter(soap => soap["consultation_code"] == code)[0] || {};
            const center = allCenters.filter(center => patient["center_code"] == center["code"])[0] || {};

            if (soap['id'] && (!soap['active'] || ( !options["ignoreFutureSoapDates"] && (new Date(soap["created_at"]).getTime() > currentTime)))) continue;
            else if (! soap["id"] && consultation["user_id"]) {
                const theValues = {
                    "soap_code": StaticHelpers.strRandom(32),
                    "consultation_code": pobject['code'],
                    "patient_id": patient['id'],
                    "meta": {},
                    "created_by": consultation['user_id'],
                    "center_code": patient['center_code'],
                    "uuid": patient['id'] + "/" + post['post_author'] + "/" + consultation['channel_id'],
                    "created_at": consultation["created"],
                    "updated_at": new Date,
                };

                soap = await (new SOAPRepository()).save(theValues);
            }

            if (patient && patient['meta'])
                patient['meta'] = StaticHelpers.unserialize(patient['meta']);

            let moreVideoUrls = [];

            // these post types are not allowed in listing
            if (["publish"].indexOf(post["post_type"]) > -1) continue;

            // console.debug(code, pobject, consultation, post, user, patient, doctor, soap);
            if (! pobject.id) continue;

            let getUserIdForVideoCall = post_meta['affiliate_code']
                ? post_meta['affiliate_code'].split('+')[1]
                : post['post_author'];
            let getLastVideoCallRequestTime = post_meta['lastVideoCallRequestedAt'] || false;

            if ((getUserIdForVideoCall === post['post_author'])
                && center && center.id
                && center["affiliates"] && center["affiliates"].length
            ) {
                moreVideoUrls.push({
                    "name": patient["name"],
                    "type": "patient",
                    "link": this.getVideoCallUrl(consultation["user_id"], post['post_author']),
                });

                for ( let i = 0; i < center["affiliates"].length; i ++) {
                    moreVideoUrls.push({
                        "name": center["affiliates"][i]["name"],
                        "type": "partner",
                        "link": this.getVideoCallUrl(consultation["user_id"], center["affiliates"][i]["wp_userid"]),
                    });
                }
            }

            const soapDate = StaticHelpers.toLocalTime(new Date(soap['created_at']));

            finalData.push({
                "payment_received": post["ID"] in mappedPaymentsActivity,
                "consultation_code": consultation["code"],
                "consultation_status": consultation["status"],
                "content": post["post_content"],
                "chatInterfaceUrl": docMedimetryUrl + consultation["code"],
                // 'videoCallUrl': this.getVideoCallUrl(consultation["user_id"], getUserIdForVideoCall),
                "videoCallUrl": meetMedimetryUrl + consultation["code"],
                // 'moreVideoUrls': moreVideoUrls || [],
                'moreVideoUrls': [],
                "showVideoCallIndicator":StaticHelpers.showVideoCallIndicator(getLastVideoCallRequestTime),
                "last_videocall_request_time":getLastVideoCallRequestTime,
                "current_doctor_all_comment_count": consultation["doctor_comments"],
                "date": post["post_date"].toLocaleString('en-IN'),
                "date_gmt": post["post_date_gmt"],
                "id": post["ID"],
                "modified_date": consultations["modified"],
                "name": user["display_name"],
                "post_status": post["post_status"],
                "status": pobject["status"],
                "tUserId": consultation["user_id"],
                "title": post["post_title"],
                "patient": patient,
                "doctor": doctor,
                "consultation_id": consultation["id"],
                "soap_id": soap["id"] || 0,
                "user_login": user["user_login"],
                "soapDateGmt": soap['created_at'],
                "soapDate": soapDate,
                "soapDateHuman": (new Date(soapDate)).toLocaleDateString('en-IN'),
                "centerCode": center['code'],
                "centerName": center['name'],
                "consultationSchedule": consultation["schedule"],
                "consultationStatus": this.getConsultationStatus(consultation),
            });
        }

        return finalData;
    }

    private getConsultationStatus(consultation) {
        let status = "confirmed";
        if ( consultation["done"] == "1") status = "done";
        if ( consultation["status"].toLowerCase() == "firstassigned")
            status = "queued";
        if ( consultation["status"].toLowerCase() == "refund")
            status = "regreted";

        return status;
    }

    /**
     * Calls existing core.medimetry admin dashboard expireConsultation API
     * Via bridge created by se.medimetry using key, provided to emr.medimetry
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    async expireConsultation(req, res) {
        if (!req.body.code) return res.send(this.build("Missing required fields."));

        let pobjects = await this._db.wpdb(`select * from medi_pobject where code like '${req.body.code}'`);
        if (!pobjects.length) return res.send(this.build("Invalid consultation code"));

        const pobject = pobjects[0];
        if (pobject["status"] != "open") return res.send(this.build("Object not in 'open' state"));

        return await this.adminExpireClose(req, res, "expire");
    }
    /**
     * Calls existing core.medimetry admin dashboard adminClose Consultation API
     * Via bridge created by se.medimetry using key, provided to emr.medimetry
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    async adminCloseConsultation(req, res) {
        if (!req.body.code) return res.send(this.build("Missing required fields."));

        let pobjects = await this._db.wpdb(`select * from medi_pobject where code like '${req.body.code}'`);
        if (!pobjects.length) return res.send(this.build("Invalid consultation code"));

        const pobject = pobjects[0];
        if (pobject["status"] != "open") return res.send(this.build("Object not in 'open' state"));

        return await this.adminExpireClose(req, res, "close");
    }
    /**
     * Calls existing core.medimetry admin dashboard refundConsultation API
     * - This API requires Consultation to be closed, if not closed it will return
     * - In this scenario only doctor, attaing the consultation
     *
     * Via bridge created by se.medimetry using key, provided to emr.medimetry
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    async refundConsultation(req, res) {
        if (!req.body.code) return res.send(this.build("Missing required fields."));

        let payments = await this._db.wpdb(`select * from medi_payments where code like '${req.body.code}'`);
        if (!payments.length) return res.send(this.build("Invalid consultation code"));

        const payment = payments[0];
        if (payment["refund"] != "0") return res.send(this.build("Already refunded"));

        return await this.adminExpireClose(req, res, "refund");
    }
    /**
     * Wrapper for the common se.med API, just to reuse the code.
     * for API's: expireConsultation, adminCloseConsultation, refundConsultation
     * @param req
     * @param res
     * @param type
     * @returns {Promise<void|boolean|Response>}
     */
    private async adminExpireClose(req, res, type) {

        const seResponse = await this._request.seRequest("internal-api/emr/admin-expire-close", {
            "key": this._config.getOAuthClientKey(),
            "type": type,
            "code": req.body.code,
        });

        return res.send(seResponse);
    }
    async updatePatient(req, res) {
        await AuditLog.create(req, AuditLog.TYPES.ConsultationController.UpdatePatient, {
            patient: req.params.id,
        });

        // get patient's previous center code
        let patient = await this._db.wpdb(`select * from medi_patients where id = ${req.params.id}`);

        if (! patient.length) return res.send(this.build("Patient not found"));
        else patient = patient[0];

        if (req.body.center && (patient.center_code != req.body.center))
            await ConsultationStatus.repo()
                .createQueryBuilder()
                .update(ConsultationStatus)
                .set({
                    center_code: req.body.center
                })
                .where("patient_id = :id", {
                    id: req.params.id
                })
                .execute();

        let mobile = req.body.mobile || req.body.mobile_number || null;
        if (mobile && (mobile.length > 10))
            mobile = mobile.substr(mobile.length - 10);

        const resp = await this._request.seRequest("internal-api/patient/update", {
            "patientId": req.params.id,
            "key": this._config.getOAuthClientKey(),
            "patientDOB": req.body.dob || null,
            "patientAge": req.body.age || null,
            "patientName": req.body.name || null,
            "patientGender": req.body.gender || null,
            "patientCenter": req.body.center || null,
            "patientMobile": mobile,
            "meta": JSON.stringify(req.body.meta || {}),
        });

        return res.send(resp);
    }

    /**
     * Soft deleting the patient, once remove, patient should not be shown in any kind of listing.
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async deletePatient(req, res) {
        const resp = await this._request.seRequest("internal-api/patient/delete", {
            "patientId": req.params.id,
            "key": this._config.getOAuthClientKey(),
        });

        this._dbConn.createQueryBuilder()
            .update(ConsultationStatus)
            .set({consultation_modified: new Date, active: false})
            .where("patient_id = :patient", {
                patient: req.params.id
            })
            .execute();

        return res.send(this.build(resp.message, resp.success, resp, req));
    }
    async listPatientConsultations(req, res) {
        const consultationsRelated = await this._db.wpdb(`select * from medi_consultation where patient_id = ${req.params.patient} order by id desc`) || [];
        const consultationCodes = consultationsRelated.map(consultation => consultation["code"]);

        const consltationStatus = await ConsultationStatus.repo()
            .createQueryBuilder('cs')
            .select("consultation_code, done")
            .where("active = true and consultation_code in ( :codes )", {
                "codes": consultationCodes.map( code => "'" + code + "'").join(",")
            })
            .orderBy("consultation_id", "DESC")
            .getMany();

        let consultationVsDone = {};
        consltationStatus.forEach( consultation => {
            consultationVsDone["" + consultation["consultation_code"]] = !!consultation["done"];
            return consultationVsDone;
        });

        let rowsToSend = await this.getConsultationListByCodes(consultationCodes, {ignoreFutureSoapDates: true});
        rowsToSend = rowsToSend.map( row => {
            row["done"] = !!(consultationVsDone[row["consultation_code"]] && consultationVsDone[row["consultation_code"]]["done"]);
            return row;
        });

        rowsToSend = rowsToSend.sort((a, b) => a["soapDate"] - b["soapDate"]);

        return res.send(this.build("Here you go!", 1, {
            rows: rowsToSend
        }));
    }
    async getPatientDetail(req, res) {
        let consultationCode = req.params.code || "";
        if (! consultationCode) {
            const lastConsultation = await this._db.wpdb(`select * from medi_consultation where patient_id = ${req.params.id} order by id desc`);
            if (lastConsultation && lastConsultation[0] && lastConsultation[0]['code'])
                consultationCode = lastConsultation[0]['code'];
        }

        const detail = await this._request.seRequest(`api/v1/partner-app/patient/${req.params.id}/${consultationCode}`, {}, {
            token: req.user.access_token
        });
        
        return res.send(this.build("Here you go!", 1, detail));
    }
    async updatePatientLogin(req, res) {
        await AuditLog.create(req, AuditLog.TYPES.ConsultationController.UpdatePatientUID, {
            patient: req.body.patientId,
        });

        const resp = await this._request.seRequest(`api/v1/partner-app/update-user-login`, {
            patientId: req.body.patientId,
            newLogin: req.body.newLogin,
            onConflict: req.body.onConflict,
        }, {
            token: req.user.access_token
        });

        if (resp.newUserId) {
            // get all soaps of current patient, calculate new soap uid, and replace in all tables.

            const soap = await Soap.repo().findOne({
                where: {
                    patient_id: req.body.patientId
                }
            });

            if (! soap) return res.send(this.build(resp.message, resp.success, resp));

            const newUUID = soap.uuid.split("/").map((value, index) => {
                // on 1st index, it will old userId

                if (index === 1) return resp.newUserId;
                return value;
            }).join("/");

            const tables = [
                'soaps', 'attachments', 'chief_complaints', 'clinical_notes',
                'diagnosis', 'examinations', 'investigation', 'medications',
                'referral', 'test_result', 'vitals',
            ];
            for (let i = 0; i < tables.length; i ++)
                await getConnection()
                    .query(`update ${tables[i]} set "uuid" = '${newUUID}' where "uuid" = '${soap.uuid}'`);
        }

        return res.send(this.build(resp.message, resp.success, resp));
    }
    async addVideoCallLogs(req,res){
        await AuditLog.create(req, AuditLog.TYPES.ConsultationController.AddVideoCallLogs);

        await this._request.seRequest("/api/v1/partner-app/add-video-call-logs", {
            "consultation_id": req.body.consultation_id,
            "start_time": req.body.start_time,
            "end_time": req.body.end_time,
            "doctor_id": req.body.doctor_id,
            "user_id": req.body.user_id,
        },{
            token: req.headers.token
        }).then(result=>{
            return res.send(this.build("Updated successfully", 1,{}));
        }).catch(err=>{
            return res.send(this.build("Something went wrong", 0,{}));

        });
    }
    async sendSmsToDoctor(req,res){
        await AuditLog.create(req, AuditLog.TYPES.ConsultationController.SendSMS);

        await this._request.seRequest("/sendSms", {
            "mobile":req.body.mobile,
            "smstext":req.body.smstext
        });

        return res.send(this.build("send successfully", 1, {}, req));
    }

    async getVideocallRecordRow(req, res) {
        return res.send(
            await this._request.coreRequest(
                "video-call/started?code=" + req.params.code, {})
        );
    }
    async submitPartnerAppFeedback(req, res) {
        await AuditLog.create(req, AuditLog.TYPES.ConsultationController.SubmitPartnerAppFeedback, {
            code: req.params.code,
        });

        const resp = await this._request.seRequest("/api/v1/partner-app/submit-consultation-feedback/" + req.params.code, {
            feedback: req.body.feedback,
            rating: req.body.rating,
        }, {
            token: req.headers.token,
        });

        return res.send(resp);
    }

    async getUnfollowupedSoaps(req, res) {
        const page = req.params.page || 1;
        const TAKE = 20;
        const SKIP = (page - 1) * TAKE;

        let thirtyDaysBefore = new Date();
        thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);
        
        let consultationCodes = await Soap.repo()
            .createQueryBuilder()
            .where(`follow_up IS NULL AND active = true AND created_at > :date`, {
                date: thirtyDaysBefore
            })
            .skip(SKIP).take(TAKE)
            .getMany();

        if (!consultationCodes.length) return res.send(this.build("no rows", 1));
        consultationCodes = StaticHelpers.getColumnFromJsonObj(consultationCodes, "consultation_code");

        const rowsToSend = await this.getConsultationListByCodes(consultationCodes);
        return res.send(this.build("Here you go!", 1, {
            rows: rowsToSend,
        }));
    }

    async followupsListing(req, res) {
        const page = req.body.page || 1;
        const TAKE = 20;
        const SKIP = (page - 1) * TAKE;
        const doctorIds = req.wpUserIds.join(", ");

        let consultationCodes = [];

        const centerCodeQuery = req.body.centers && req.body.centers.length 
            ? ` and center_code in ( ${req.body.centers.map(center => "'" + center + "'").join(', ')} )` 
            : "";
        const priorityQuery = req.body.priority && req.body.priority.length
            ? ` and meta like '%:"${req.body.priority}";%'`
            : "";

        let patientIds = await this._db.wpdb(`select id from medi_patients where 1 ${centerCodeQuery} ${priorityQuery}`);
        patientIds = patientIds.map( row => row.id);

        if ( ! patientIds.length) return res.send(this.build("No patients found for criteria."));

        let rowsToSend = [];

        if (req.body.followup === 'without') {
            let thirtyDaysBefore = new Date(req.body.time);
            thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);
            
            consultationCodes = await Soap.repo()
                .createQueryBuilder()
                .where(`follow_up IS NULL AND active = true AND created_at > :date AND patient_id in ( ${patientIds.join(', ')} )`, {
                    date: thirtyDaysBefore
                })
                .skip(SKIP).take(TAKE)
                .getMany();

            consultationCodes = StaticHelpers.getColumnFromJsonObj(consultationCodes, "consultation_code");
            rowsToSend = await this.getConsultationListByCodes(consultationCodes);
        }

        if ( req.body.followup === 'today') {
            let today = new Date(req.body.time);

            // No need of center sanchalaks now.
            /* let centerIds = await this._db.mailServiceDb(`select id from mail_log.channel_centers 
                where true ${centerCodeQuery.replace('center_code', 'code')}`);
            let wpUserIdsOfSanchalaks = await this._db.mailServiceDb(`select wp_userid from mail_log.channel_staff 
                where center_id in ( ${centerIds.map( row => row.id )} )`);
            wpUserIdsOfSanchalaks.forEach( row => patientIds.push(row.wp_userid));  */

            consultationCodes = await Soap.repo()
                .createQueryBuilder()
                .where(`active = true AND created_at < NOW() AND patient_id in ( ${patientIds.join(", ")} )`)
                .getMany();
            if ( ! consultationCodes.length) return res.send(this.build("No consultations found."));

            consultationCodes = consultationCodes.map(row => "'" + row.consultation_code + "'");

            let notifications = await this._db.mailServiceDb(`
                select *,
                    case when due_at is null then created_at
                         else due_at
                    end as "date"
                from mail_log.notifications where "done" = false 
                    and "from" in ( ${doctorIds} )
                    and "type" in ( 'partnerapp-feedback', 'partnerapp-followup' )
                    and ( "due_at" is null or "due_at" < NOW() )
                    and "consultation_code" in ( ${consultationCodes.join(", ")} )
                order by "date" desc
                limit ${TAKE} offset ${SKIP}
            `);

            consultationCodes = StaticHelpers
                .getColumnFromJsonObj(notifications, "consultation_code")
                .filter( (value, index, self) => {
                    return self.indexOf(value) === index;
                });

            let consultationCodesVsNotification = {};
            notifications.forEach(notif => {
                if ( consultationCodesVsNotification[notif['consultation_code']]) return;
                else consultationCodesVsNotification[notif['consultation_code']] = notif;
            });

            rowsToSend = await this.getConsultationListByCodes(consultationCodes);
            rowsToSend = rowsToSend.map(row => {
                if (consultationCodesVsNotification[row['consultation_code']])
                    row['notification'] = consultationCodesVsNotification[row['consultation_code']];

                return row;
            });
        }

        if ( req.body.followup === 'done') {
            let today = new Date(req.body.time);

            consultationCodes = await Soap.repo()
                .createQueryBuilder()
                .where(`active = true AND created_at < NOW() AND patient_id in ( ${patientIds.join(", ")} )`)
                .getMany();
            if ( ! consultationCodes.length) return res.send(this.build("No consultations found."));

            consultationCodes = consultationCodes.map(row => "'" + row.consultation_code + "'");

            let notifications = await this._db.mailServiceDb(`
                select *,
                    updated_at as "date"
                from mail_log.notifications where "done" = true 
                    and "from" in ( ${doctorIds} )
                    and "type" in ( 'partnerapp-feedback', 'partnerapp-followup' )
                    and ( "due_at" is null or "due_at" < NOW() )
                    and "consultation_code" in ( ${consultationCodes.join(", ")} )
                order by "date" desc
                limit ${TAKE} offset ${SKIP}
            `);

            consultationCodes = StaticHelpers
                .getColumnFromJsonObj(notifications, "consultation_code")
                .filter( (value, index, self) => {
                    return self.indexOf(value) === index;
                });

            let consultationCodesVsNotification = {};
            notifications.forEach(notif => {
                if ( consultationCodesVsNotification[notif['consultation_code']]) return;
                else consultationCodesVsNotification[notif['consultation_code']] = notif;
            });

            rowsToSend = await this.getConsultationListByCodes(consultationCodes);
            rowsToSend = rowsToSend.map(row => {
                if (consultationCodesVsNotification[row['consultation_code']])
                    row['notification'] = consultationCodesVsNotification[row['consultation_code']];

                return row;
            });
        }

        if (! consultationCodes.length) return res.send(this.build("no rows", 1));

        return res.send(this.build("Here you go!", 1, {
            rows: rowsToSend,
        }));
    }

    async getAppointmentDates(req, res) {
        const httpResp = await this._request.seRequest("internal-api/appointment/get-dates", {
            startTime: req.body.startTime || null,
            endTime: req.body.endTime || null,
            user: req.body.user || null,
            patient: req.body.patient || null,
        }, {
            token: req.headers.token,
        });

        return res.send(httpResp);
    }

    async getAppointmentconsultations(req, res) {
        const httpResp = await this._request.seRequest("internal-api/appointment/get-consultations", {
            startTime: req.body.startTime || null,
            endTime: req.body.endTime || null,
            user: req.body.user || null,
            patient: req.body.patient || null,
            codeOnly: 1,
        }, {
            token: req.headers.token,
        });

        if ( ! httpResp.success) return res.send(httpResp);

        const rowsToSend = await this.getConsultationListByCodes(httpResp.codes, {ignoreFutureSoapDates: true});
        console.log("getAppointmentconsultations: ", httpResp.codes.length, rowsToSend.length);

        return res.send(this.build("Here you go", 1, {
            "rows": rowsToSend,
            "totalWaiting": httpResp.totalWaiting,
        }));
    }

    async updateAppointmentStatus(req, res) {
        let channel = await this._db.wpdb(`select * from channels where id = ( select channel_id from medi_consultation where code = "${req.body.code}" )`);

        if ( ! channel) return res.send(this.build("Invalid consultation code"));
        channel = channel[0];

        const httpResp = await this._request.seRequest("api/v1/integrations/UpdateStatus", {
            channel: channel.key,
            code: req.body.code,
            comment: req.body.comment || "",
            to: req.body.to || null,
            time: req.body.time
        }, {
            token: req.headers.token,
        });

        return res.send(httpResp);
    }

    public async createConsultationsJobFromCSV(req, res) {

        const channels = req.user.meta.user.channels;
        const channel  = channels.length > 1 ? channels.filter((name) => name != "MediMetry" )[0] : channels[0]
        const centers  = req.user.meta.user.centers[channel]
        let center     = centers[0].code

        if ( req.body.center_code && (centers.filter((row) => row.code == req.body.center_code).length))
            center = req.body.center_code;

        // limitations, should have atleast 2 rows
        const csv = req.body.csv;
        if (csv.split("\n").length < 2)
            return res.send(this.build("Should have atleast 2 rows"))

        const secondRow = csv.split("\n")[1];
        if ( secondRow.split(",").length != 5)
            return res.send(this.build("rows should have exactly 5 columns, leave empty for default values"))

        const postData = {
            "csv": req.body.csv,
            "dontSendNotification": 1,
            "key": this._config.getOAuthClientKey(),
            "deviceId": this._config.get("defaultDeviceId"),
            "title": "Initial consultation by doctor",
            "centerCode": center, 
            "channelName": channel,
            "type": 'AUDIO',
            "specialty": req.user.meta.user.specialties[0],
            "doctorId": req.user.meta.user.id,
        }

        const seResponse = await this._request.seRequest("internal-api/consultations/save-csv", postData);

        return res.send(seResponse)
    }

    public async initiateDocMedimetryAudioCall(req, res) {
       const seResponse = await this._request.seRequest("internal-api/consultations/intiate-doctor-call", {
           code: req.body.code,
           key: this._config.getOAuthClientKey(),
       })

       return res.send(seResponse)
    }

    public async requestPayment(req, res) {
        const seResponse = await this._request.seRequest("internal-api/consultations/request-payment", {
            code: req.params.code,
            key: this._config.getOAuthClientKey(),
        })

        return res.send(seResponse) 
    }

    private getVideoCallUrl(callerId, receiverId) {
      return this._config.get('videoCallBaseUrl', 
          this._config.get("seMedimetryUrl", "https://se.medimetry.com/")
      ) + 'video-call/' + callerId + '/'+ receiverId;
    }
    private async getMaxDoneConsultationId(doctorIdStr) {
        const lastDoneConsultationId = await ConsultationStatus.repo()
                .createQueryBuilder()
                .select(`MAX(consultation_id) as max`)
                .where(`doctor_id in ( ${doctorIdStr} ) and done = true and active = true`)
                .getRawOne();

        return lastDoneConsultationId.max || 0;
    }
}
