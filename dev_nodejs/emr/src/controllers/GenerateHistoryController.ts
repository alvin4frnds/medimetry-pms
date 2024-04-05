"use strict";

import { config, Config } from '../config/Config';
import { S3Uploader, uploader } from '../config/S3';
import { db, DatabaseConfiguration } from '../config/DatabaseConfiguration';
import { HttpRequest } from '../helpers/HttpRequest';
const Router = require('./Router');
import { Soap } from '../database/models/Soap';
import { ChiefComplaint } from '../database/models/ChiefComplaint';
import { Vitals } from '../database/models/Vital';
import { Medication } from '../database/models/Medication';
import { User } from '../database/models/User';
import { TestResult } from '../database/models/TestResult';
import { PersonalHistory } from '../database/models/PersonalHistory';
import { Attachment } from '../database/models/Attachment';
import { StaticHelpers } from '../helpers/Statics';
import { GeneratedHistory } from '../database/models/GeneratedHistory';
import { TreatmentPlanLogs } from '../database/models/TreatmentPlanLogs';
import { ConsultationsController } from './ConsultationsController';
import { SoapController } from './SoapController';
import { AllergyRepository } from '../database/repository/AllergiesRepository';
import { FamilyHistory } from '../database/models/FamilyHistory';
import { DiagnosisRepository } from '../database/repository/DiagnosisRepository';
import { ProcedureRepository } from '../database/repository/ProcedureRepository';
import { PastIllness } from '../database/models/PastIllness';
import { Habit } from '../database/models/Habit';
import { PastMedication } from '../database/models/PastMedication';
import { Feedback } from '../database/models/Feedback';
import { In, Raw } from 'typeorm';
import { Examination } from '../database/models/Examination';
import { ClinicalNote } from '../database/models/ClinicalNotes';
import {Meal} from "../database/models/Meals";
import { AuditLog } from '../database/models/AuditLog';

export class GenerateHistoryController extends Router {
    private _config: Config;
    private _s3: S3Uploader;
    private _request;
    private _db: DatabaseConfiguration;

    constructor(routePath,app) {
        super(routePath, app);

        this._config = config;
        this._s3 = uploader;
        this._db = db;
        this._request = new HttpRequest();
    }

    get services() {
        return {
            '/generate/:id': "generatePatientHistory",
            "POST /link": "generateLink",
            "/view/:uniqueid": "getViaUniqueId",
            "POST /treatment-plan": "saveTreatmentPlan",
        };
    }

    async generatePatientHistory(req, res) {
        if (!req.params.id) return res.send(this.build("Missing required params"));

        await AuditLog.create(req, AuditLog.TYPES.GenerateHistoryController.GenerateLink, {
            patient: req.params.id,
        });

        const patientId = parseInt(req.params.id);
        let dataToSend = {"chiefComplains": [], "examinations": [], "vitals": [], "testResults": [], "lastPersonalHistory": {}, "appendix": {
            "testResults": [], "prescriptions": [], "others": [],
        }, "patient": {}, "patientHistory": {}, "medicationsAndFeedbacks": [], "meals": [], "personalHistories": [{}]};
        let temp = {};
        const recentHistoryMonthCount = parseInt(req.query.months) || 3;
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - recentHistoryMonthCount);
        const mysqlDateThreeMonthsAgo = StaticHelpers.toMysql(threeMonthsAgo);

        dataToSend.patient = await this._db.wpdb('select * from medi_patients where id = ' + patientId);
        dataToSend.patient = dataToSend.patient[0];

        const recentSoaps = await Soap.repo()
            .createQueryBuilder()
            .where("patient_id = :patient and created_at >= :date", {
                patient: patientId,
                date: mysqlDateThreeMonthsAgo
            })
            .orderBy('id', 'DESC')
            .getMany();

        if ( ! recentSoaps.length) 
            return res.send(this.build("No Recent Soaps found in given duration."));

        const recentSoapIdStr = StaticHelpers.getColumnFromJsonObj(recentSoaps, 'id').join(", ");
        let recentSoapIdVsDate = {};
        recentSoaps.forEach(soap => {
            recentSoapIdVsDate[soap.id] = soap.created_at.toDateString();
        });

        const cheifComplains = await ChiefComplaint.repo()
            .find({
                "where": {
                    "patient_id": req.params.id,
                    "created_at": Raw(alias =>`${alias} > '${mysqlDateThreeMonthsAgo}'`)
                },
                "order": {
                    "id": "DESC"
                },
                "relations": ["soap"]
            });
        temp = {};


        cheifComplains.forEach(complain => {
            if (temp[complain.soap.id])
                temp[complain.soap.id].push(complain.complaint);
            else temp[complain.soap.id] = [complain.complaint];
        });
        for (const soapId in temp)
            if (recentSoapIdVsDate[soapId])
                dataToSend.chiefComplains.push({
                    date: recentSoapIdVsDate[soapId],
                    complains: temp[soapId].filter((value, index, array) => array.indexOf(value) === index),
                });

        const examinations = await Examination.repo()
            .createQueryBuilder()
            .where(`soap_id in (${recentSoapIdStr})`)
            .orderBy('id', "DESC")
            .getMany();
        temp = {};
        examinations.forEach(examination => {
            if (temp[examination.created_at.toDateString()])
                temp[examination.created_at.toDateString()].push(examination.remarks);
            else temp[examination.created_at.toDateString()] = [examination.remarks];
        });
        for (const date in temp)
            dataToSend.examinations.push({
                date: date,
                complains: temp[date],
            });

        const weekdayMeal = await Meal.repo()
            .createQueryBuilder()
            .where("patient_id = :patient and weekend = false", {patient: req.params.id})
            .orderBy("updated_at", "DESC")
            .getRawOne();
        const weekendMeal = await Meal.repo()
            .createQueryBuilder()
            .where("patient_id = :patient and weekend = true", {patient: req.params.id})
            .orderBy("updated_at", "DESC")
            .getRawOne();

        if (weekdayMeal && weekdayMeal.Meal_soap_id)
            dataToSend.meals = (dataToSend.meals || []).concat(await Meal.repo()
                .createQueryBuilder()
                .where("soap_id = :weekdaySoapId ", {
                    weekdaySoapId: weekdayMeal.Meal_soap_id,
                }).getMany());

        if (weekendMeal && weekendMeal.Meal_soap_id)
            dataToSend.meals = (dataToSend.meals || []).concat(await Meal.repo()
                .createQueryBuilder()
                .where("soap_id = :weekendSoapId ", {
                    weekendSoapId: weekendMeal.Meal_soap_id,
                }).getMany());

        const vitals = await Vitals.repo()
            .createQueryBuilder()
            .where("patient_id = :patient and created_at > :date", {
                patient: patientId,
                date: StaticHelpers.toMysql(threeMonthsAgo),
            })
            .orderBy('id', "ASC")
            .getMany();
        temp = {};
        vitals.forEach(vital => {
            if (vital.vital_information['Height(ft)']) {
                vital.vital_information["Height"] = ( vital.vital_information['Height(ft)'] * 12 ) +
                    ( parseFloat(vital.vital_information['Height(in)']) || 0 )
            }

            for (const key in vital.vital_information)
                if (temp[key] && vital.vital_information[key]) temp[key].push({
                    datetime: vital.created_at.toISOString(),
                    value: vital.vital_information[key],
                });
                else if (vital.vital_information[key]) temp[key] = [{
                    datetime: vital.created_at.toISOString(),
                    value: vital.vital_information[key],
                }];
        });
        dataToSend.vitals.push({
            "type": "BP",
            "values": {
                'Diastolic': temp['BP(D)'],
                'Systolic': temp['BP(S)'],
            }
        }, {
            "type": "Pulse / Temp",
            "values": {
                'Pulse': temp['Pulse'],
                'Temp (F)': temp['Temp (F)'],
            }
        }, {
            "type": "Height / Weight",
            "values": {
                'Height (in)': temp['Height'],
                'Weight (kg)': temp['Weight (kg)'],
            }
        }, {
            "type": "Sugar",
            "values": {
                "Random Sugar": temp["Random Sugar"],
                "Post Prandial Sugar": temp["Post Prandial Sugar"],
                "Fasting Sugar": temp["Fasting Sugar"],
            }
        });

        temp = {};
        let testResultTypes = await TestResult.repo()
            .createQueryBuilder()
            .where("type = 'json' and patient_id = :patient", {
                patient: patientId,
            })
            .getMany();
        testResultTypes = StaticHelpers.arrayUnique(
            StaticHelpers.getColumnFromJsonObj(testResultTypes, 'remarks')
        );
        for (let i = 0; i < testResultTypes.length; i++) {
            const type = testResultTypes[i];
            let referenceValues = {};

            const resultsOfType = await TestResult.repo().createQueryBuilder()
                .where("type = 'json' and patient_id = :patient and remarks = :type and created_at >= :date", {
                    patient: patientId,
                    type: type,
                    date: mysqlDateThreeMonthsAgo,
                })
                .orderBy('id', 'DESC')
                .getMany();

            const resultRow = {};
            resultsOfType.reverse().forEach(result => {
                if (result && result.json && result.json['fields'] && result.json['fields'].length) {}
                else return;

                result.json['fields'].forEach(field => {
                    if (!referenceValues[field.name]) referenceValues[field.name] = field.reference;

                    field.date = result.created_at.toISOString();
                    delete field.loincs;
                    delete field.reference;

                    if (resultRow[field.name]) resultRow[field.name].push(field);
                    else resultRow[field.name] = [field];
                });
            });

            let rows = [];
            for (const fieldType in resultRow) {
                rows.push({
                    type: fieldType,
                    values: resultRow[fieldType],
                    reference: referenceValues[fieldType],
                });
            }

            temp[type + ""] = rows;
        }
        for (const key in temp)
            dataToSend.testResults.push({
                "type": key,
                "results": temp[key],
            });

        const personalHistories = await PersonalHistory.repo()
            .createQueryBuilder()
            .where('patient_id = :patient', { patient: patientId})
            .orderBy('id', 'DESC')
            .getMany();

        if ( personalHistories && personalHistories.length) {
            if ( personalHistories[0] && personalHistories[0].info) dataToSend.lastPersonalHistory = personalHistories[0].info;

            dataToSend.personalHistories = personalHistories.map(row => {
                const info = row.info;
                info['date'] = row.created_at.toISOString();

                return info;
            });
        }

        const pastImages = await Attachment.repo()
            .createQueryBuilder()
            .where(`patient_id = :patient and soap_id in (${recentSoapIdStr})`, {
                patient: patientId,
            })
            .orderBy('id', 'DESC')
            .getMany();

        let testsBydate = {}, prescriptionsByDate = {}, othersByDate = {};
        temp = {};
        pastImages.forEach(attachment => {
            const date = attachment.created_at;

            switch (attachment.soap_section_type) {
                case 'test-results':
                    if (testsBydate[date.toDateString()]) testsBydate[date.toDateString()].push(attachment.url);
                    else testsBydate[date.toDateString()] = [ attachment.url ];
                    break;
                case 'prescription':
                    if (prescriptionsByDate[date.toDateString()]) prescriptionsByDate[date.toDateString()].push(attachment.url);
                    else prescriptionsByDate[date.toDateString()] = [ attachment.url ];
                    break;
                default:
                    if (othersByDate[date.toDateString()]) othersByDate[date.toDateString()].push(attachment.url);
                    else othersByDate[date.toDateString()] = [ attachment.url ];
                    break;
            }

        });
        for ( const day in testsBydate )
            dataToSend.appendix.testResults.push({
                date: day,
                images: testsBydate[day],
            });
        for ( const day in prescriptionsByDate )
            dataToSend.appendix.prescriptions.push({
                date: day,
                images: prescriptionsByDate[day],
            });
        for ( const day in othersByDate )
            dataToSend.appendix.others.push({
                date: day,
                images: othersByDate[day],
            });

        dataToSend.patientHistory['allergies'] = await (new AllergyRepository()).getAllergiesByPatientId(patientId);
        dataToSend.patientHistory['familyHistories'] = await FamilyHistory.repo().find({where: {patient_id: patientId }});
        dataToSend.patientHistory['diagnosis'] = await (new DiagnosisRepository()).getPastDiagnosisByPatientId(patientId);
        dataToSend.patientHistory['procedures'] = await (new ProcedureRepository()).getProceduresById(patientId);
        dataToSend.patientHistory['habits'] = await Habit.repo().find({where: {patient_id: patientId }});
        dataToSend.patientHistory['pastIllnesses'] = await PastIllness.repo().find({where: { patient_id: patientId }});
        dataToSend.patientHistory['pastMedications'] = await PastMedication.repo().find({where: { patient_id: patientId }});

        let last3SoapsMedications = await Medication.repo()
            .createQueryBuilder("row")
            .where(`row.soap_id in (${recentSoapIdStr})`)
            .orderBy('id', 'DESC')
            .getRawMany();

        last3SoapsMedications = await Soap.appendMedicationSalts(
            StaticHelpers.removePrefixFromTypeormRawResults(last3SoapsMedications));

        const last3SoapsMedicationFeedback = await Feedback.repo()
            .createQueryBuilder()
            .where(`soap_id in (${recentSoapIdStr})`)
            .orderBy('id', 'DESC')
            .getMany();
        recentSoaps.forEach(soap => {
            dataToSend.medicationsAndFeedbacks.push({
                "date": soap.created_at,
                "medications": last3SoapsMedications
                    .filter(med => (med['soap_id'] === soap.id))
                    .map( med => {
                        delete med.soap;
                        return med;
                    }),
                "feedbacks": last3SoapsMedicationFeedback
                    .filter(feed => feed.consultation_code === soap.consultation_code),
            });
        });

        return res.send(this.build("GeneratePatientHistory: " + req.params.id, 1, {
            data: dataToSend
        }));
    }

    private async getDoctorCallInvitationInfo(patientid) {
        patientid = parseInt(patientid);
        const now = StaticHelpers.toMysql(new Date());
        const meetMedimetryUrl = this._config.get("meetMedimetryUrl", "https://meet.medimetry.com/");
        let chosenConsultation = {};

        const futureScheduledConsultations = await this._db.wpdb(`select * from medi_consultation where patient_id = ${patientid} and schedule is not null and schedule > '${now}' order by schedule asc limit 0, 1`);
        if ( futureScheduledConsultations && futureScheduledConsultations.length) {
            chosenConsultation = futureScheduledConsultations[0];

            return {
                "time": chosenConsultation["schedule"],
                "message": `You have been invited to participate in the Consult at :time with following link.`,
                "link": meetMedimetryUrl + chosenConsultation["code"],
            };
        }

        const pastMostRecentConsultation = await this._db.wpdb(`select * from medi_consultation where patient_id = ${patientid} and created < '${now}' order by created desc limit 0, 1`);
        if ( pastMostRecentConsultation && pastMostRecentConsultation.length) {
            chosenConsultation = pastMostRecentConsultation[0];

            return {
                "time": chosenConsultation["schedule"],
                "message": `You have been invited to participate in the Consult with following link.`,
                "link": meetMedimetryUrl + chosenConsultation["code"],
            };
        }

        return {};
    }

    async generateLink(req, res) {
        if (!req.body.patient_id || !req.body.data || !req.body.to_name)
            return res.send(this.build("Missing required fields"));

        // get last soap for this patient.
        const soap = await Soap.repo().createQueryBuilder()
            .where('patient_id = :patient', {
                patient: req.body.patient_id
            })
            .orderBy('id', 'DESC')
            .take(1)
            .getOne();

        let patientHistory = new GeneratedHistory;

        patientHistory.data = req.body.data;
        if ( req.body.inviteToConsult )
            patientHistory.data["callInvitation"] = 
                await this.getDoctorCallInvitationInfo(req.body.patient_id);

        patientHistory.soap = soap;
        patientHistory.patient_id = req.body.patient_id;
        patientHistory.consultation_code = soap.consultation_code;
        patientHistory.for_name = req.body.to_name;
        patientHistory.unique_id = StaticHelpers.strRandom(32);

        patientHistory = await GeneratedHistory.repo().save(patientHistory);

        return res.send(this.build("Created", 1, {
            row: patientHistory
        }));
    }
    async getViaUniqueId(req, res) {
        if (! req.params.uniqueid)
            return res.send(this.build("Patient History Not found"));

        const generatedHistory = await GeneratedHistory.repo()
            .findOne({
                where: { unique_id: req.params.uniqueid},
                relations: ["soap", "soap.medications"],
            });

        if (! generatedHistory)
            return res.send(this.build("Patient History Not found"));

        let tillDate = generatedHistory.created_at;
        tillDate.setHours(tillDate.getHours() + 24);

        const timeLeft = tillDate.getTime() - (new Date).getTime();
        if (timeLeft < 1) return res.send(this.build("This link is expired"));

        const user = await User.repo()
            .createQueryBuilder()
            .where("user_id = :user", {
                user: generatedHistory.soap.created_by,
            })
            .orderBy("id", "DESC")
            .getOne();
        const token = user ? user.access_token : "not provided";

        const consultation = await (new ConsultationsController("/temp", this.app))
            .getConsultationListByCodes([generatedHistory.consultation_code]);

        return res.send(this.build("Here you go", 1, {
            row: generatedHistory,
            access_token: token,
            consultation: consultation[0] || {},
        }));
    }
    async saveTreatmentPlan(req, res) {
        if (!req.body.unique_id)
            return res.send(this.build("Missing required fields"));

        const generatedHitory = await GeneratedHistory.repo()
            .findOne({
                "where": { unique_id: req.body.unique_id },
                "relations": ["soap"]
            });

        await AuditLog.create(req, AuditLog.TYPES.GenerateHistoryController.SaveTreatmentPlan, {
            code: generatedHitory.consultation_code,
        });


        let doctorId = await this._db.wpdb(`select * from medi_consultation where code = '${generatedHitory.soap.consultation_code}'`);

        if (doctorId && doctorId[0] && doctorId[0]['user_id'])
            doctorId = doctorId[0]['user_id'];
        else doctorId = 0;

        let treatmentPlanLog = new TreatmentPlanLogs;
        treatmentPlanLog.generatedHistory = generatedHitory;
        treatmentPlanLog.remarks = req.body.remarks || "";
        treatmentPlanLog.follow_up = req.body.follow_up || "";
        treatmentPlanLog.data = req.body.data || {};

        treatmentPlanLog = await TreatmentPlanLogs.repo().save(treatmentPlanLog);


        // TODO: other medication and notification functionality.
        if (treatmentPlanLog.remarks) {

            const params = {
                center_code: generatedHitory.soap.center_code,
                from: 46, // Dr. Bhawana, for now
                to: doctorId || generatedHitory.soap.created_by,
                consultation_code: generatedHitory.soap.consultation_code,
                title: generatedHitory.for_name + " sent treatment plan. " 
                    + (treatmentPlanLog.follow_up ? ("with followup: " + treatmentPlanLog.follow_up ) : ""),
                description: "Said: " + treatmentPlanLog.remarks,
                meta: treatmentPlanLog.data,
            };

            await this._request.seRequest('api/v1/notifications/partner-notification/pms-receivedtreatmentplan', params);
        }

        if (req.body.observations && req.body.observations.length) {

            let foundNotes = await Examination.repo()
                .createQueryBuilder()
                .delete()
                .where("soap_id = :soap and remarks = :remark", {
                    soap: generatedHitory.soap.id,
                    remark: req.body.observations,
                })
                .execute();

            let examinationNote = new Examination();
            examinationNote.patient_id = generatedHitory.soap.patient_id;
            examinationNote.uuid = generatedHitory.soap.uuid;
            examinationNote.soap = generatedHitory.soap;
            examinationNote.examined_place = "";
            examinationNote.examined_organ = "";
            examinationNote.examined_by = "";
            examinationNote.doctor_id = generatedHitory.soap.created_by;
            examinationNote.remarks = req.body.observations;

            await Examination.repo().save(examinationNote);
        }
        
        generatedHitory.soap.follow_up = treatmentPlanLog.follow_up;
        generatedHitory.soap.remark = treatmentPlanLog.remarks;
        await Soap.repo().save(generatedHitory.soap);

        res.send(this.build("Saved Successfully", 1, {
            row: treatmentPlanLog,
        }));

        // disabling generate prescription for now
        if (false && treatmentPlanLog.data['generateRx']) {
            req.params.soapId = generatedHitory.soap.id;
            req.params.attachToCurrentSoap = true;

            req.user = await User.repo()
                .createQueryBuilder()
                .where("user_id = :user", {
                    user: doctorId || generatedHitory.soap.created_by,
                })
                .orderBy("id", "DESC")
                .getOne();

            return (new SoapController("/temp", this.app))
                .sendPrescription(req, res);
        } else return this.build("Saved Successfully", 1, {
            row: treatmentPlanLog
        });
    }
}
