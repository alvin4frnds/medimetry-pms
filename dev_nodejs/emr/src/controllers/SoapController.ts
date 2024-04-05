import { PastMedication } from './../database/models/PastMedication';
"use strict";
import { StaticHelpers } from '../helpers/Statics';
import { getConnection, Like, Not } from 'typeorm';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import { db } from '../config/DatabaseConfiguration';
import { SOAPRepository } from '../database/repository/SOAPRepository';
import { Soap } from '../database/models/Soap';
import { ChiefComplaint } from '../database/models/ChiefComplaint';
import { Examination } from '../database/models/Examination';
import { Vitals } from '../database/models/Vital';
import { Diagnosis } from '../database/models/Diagnosis';
import { Medication } from '../database/models/Medication';
import { Investigation } from '../database/models/Investigation';
import { Referral } from '../database/models/Referral';
import { Procedure } from '../database/models/Procedure';
import { TestResult } from '../database/models/TestResult';
import { HttpRequest } from '../helpers/HttpRequest';
import { Attachment } from '../database/models/Attachment';
import { uploader } from '../config/S3';
import { Term } from '../database/models/Term';
import { ClinicalNote } from '../database/models/ClinicalNotes';
import { PastIllness } from '../database/models/PastIllness';
import { ShadowSave } from './middlewares/ShadowSave';
const Router = require('./Router');
import { config } from '../config/Config'
import { PersonalHistory } from '../database/models/PersonalHistory';
import {Meal} from "../database/models/Meals";
import {TermsRepository} from "../database/repository/TermsRepository";
import { ConsultationStatus } from '../database/models/ConsultationStatus';
import { Feedback } from '../database/models/Feedback';
import { AuditLog } from '../database/models/AuditLog';

export class SoapController extends Router {
    private _dbConn;
    private _db;
    private _request: HttpRequest;
    private _config;

    public static URL_CLASS_MAPPING = {};

    /**
     * Properties that will be common, in all soap entities.
     *
     * @type {[string,string,string,string]}
     */
    private static readonly SOAP_COMMON_PROPERTIES = [
        "uuid", "doctor_id", "patient_id", "soap"
    ];

    constructor(routePath, app) {
        super(routePath, app);

        this._dbConn = db.connection();
        this._db = db;
        this._request = new HttpRequest();
        this._config = config;

        SoapController.URL_CLASS_MAPPING = {
            "examinations": Examination,
            "vitals": Vitals,
            "diagnosis": Diagnosis,
            "medications": Medication,
            "investigations": Investigation,
            "referrals": Referral,
            "procedures": Procedure,
            "test-results": TestResult,
            "chief-complains": ChiefComplaint,
            "attachments": Attachment,
            "clinical-notes": ClinicalNote,
            "personal-history": PersonalHistory,
            "meals": Meal,
            "feedbacks": Feedback,
        };
    }

    /**
     * Allows to add middlewares, directly to all routes inside a controller.
     *
     * @returns {[(req:Request, res:Response, next:NextFunction)=>Promise<Response>]}
     */
    private preMiddlewares() { return [ AuthMiddleware ]; }
    private postMiddlewares() { return [ ShadowSave ]; }

    /**
     * All the routes in this controller
     *
     * @returns Object as (url: function)
     */
    get services() {
        return {
            '/:soap': 'viewSoap',
            '/list/:patientId/:page?': 'listPreviousSoaps',
            'POST /list': 'listPreviousSoapsV2',
            'POST /create': 'createSoap',
            'POST /terms/create': 'createTerm',
            '/:soap(\\d+)/medications/get-previous': 'getPreviousMedications',
            '/:soap(\\d+)/meals/get-previous': 'getPreviousMeals',
            '/:soap(\\d+)/vitals/get-previous': 'getPreviousSoapVitals',
            'PATCH /:soap': 'updateSoap',
            'POST /:soap(\\d+)/attachment': 'uploadAttachment',
            'POST /:soap(\\d+)/create-attachment': 'createAttachment',
            'PATCH /:soap(\\d+)/remark-follow-up': 'updateRemarkFollowUp',
            'PATCH /:soap(\\d+)/meta': 'updateSoapMeta',
            'PATCH /:code/medication-stock': 'updateSoapMedicationStock',
            '/:soap(\\d+)/:type': 'getEntities',
            'POST /:soap(\\d+)/:type': 'createEntity',
            'PATCH /:soap(\\d+)/:type/:id?': 'updateEntity',
            'DELETE /:soap(\\d+)/:type/all': 'deleteAllEntities',
            'DELETE /:soap(\\d+)/:type/:id?': 'deleteEntity',
            '/suggestions/cheif-complains/:search?': 'suggestChiefComplains',
            '/suggestions/meal-quantity-unit/:search?': 'suggestMealQuantityUnit',
            '/suggestions/examination-organs/:query?': 'suggestExaminationOrgans',
            '/suggestions/icd10/:query?': 'suggestIcd10Codes',
            '/suggestions/medicines/:query?': 'suggestMedicines',
            '/suggestions/meals/:query?': 'suggestMeals',
            '/suggestions/investigations/:query?': 'suggestInvestigations',
            '/suggestions/path-investigations/:query?': 'suggestPathInvestigations',
            '/suggestions/radio-investigations/:query?': 'suggestRadioInvestigations',
            'POST /past-illness': "createPastIllness",
            'POST /past-medication': "createPastMedication",
            'DELETE /past-illness/:id': "deletePastIllness",
            'DELETE /past-medication/:id': "deletePastMedication",
            '/prescription/preview/:soapId': "previewPrescription",
            'POST /prescription/send/:soapId': "sendPrescription",
            'DELETE /:soap(\\d+)': "removeSoapFromListing",
            '/empty-fup/:soap(\\d+)': "addEmptyFUP",
        };
    }

    /**
     * Takes a post id, create soap, and responds
     * Soap is root for saving all the visit information
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    async createSoap(req, res) {
        if (!req.body.id) return res.send(this.build("Missing required id"));

        // if not lets create new one
        const soap = await this.createSoapByPostId(req, res, req.body.id);
        return res.send(this.build("new soap created: ", 1, {soap}));
    }

    /**
     * Based on the component 'type' given in url, fetches the entities
     * matching to 'soapId' sent in url
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    async getEntities(req, res) {
        if (!req.params.soap) return res.send(this.build("Missing soapid"));

        const relations = ( ["diagnosis", "investigations", "procedures", "test-results"].indexOf(req.params.type) > -1 )
            ? ["term"] : [];
        const soap: Soap = await SoapController.URL_CLASS_MAPPING[req.params.type].repo().find({
            where: {soap_id: req.params.soap},
            relations: relations
            // relations: [req.params.type.replace("-", "_")]
        });

        res.send(this.build("here you go", 1, {
            rows: soap
        }, req));
    }

    /**
     * Based on the component 'type' given in url, matching to 'soapId' sent in urlParam
     * creates entity, and returns the same
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    async createEntity(req, res) {
        if (!req.params.soap) return res.send(this.build("Missing soapid"));
        const soap: Soap = await (new SOAPRepository())
            .repo().findOne(req.params.soap);

        await AuditLog.create(req, AuditLog.TYPES.SoapController.CreateEntities, {
            soap: req.params.soap,
        });

        if (!SoapController.URL_CLASS_MAPPING[req.params.type]) return;
        let entity = this.newEntityObjectFromSoap(req.params.type, req.user.user_id, soap);

        for (let key in req.body) entity[key] = req.body[key];

        // special cases:
        // 1. for referrals fill 'procedure_term_id' based on 'procedure'
        entity = await this.createTermBeforeEntities(req.params.type, req.user.user_id, entity);

        // in case of test-results and image/download file type, send notifications as well.
        if ((req.params.type === "test-results") 
            && entity.type 
            && (["image", "download"].indexOf(entity.type) > -1 )
        ) await this.sendNotification(soap, { type: "testresults", entity });

        entity = await SoapController.URL_CLASS_MAPPING[req.params.type]
            .repo().save(entity);
        return res.send(this.build("Created: ", 1, {row: entity}, req));
    }

    private async createTermBeforeEntities(type, doctorId, entity: any) {
        switch (type) {
            case "referrals":
                if (entity.procedure) {
                    const term = await Term.createFromText(entity.procedure, "procedure", doctorId);
                    entity.procedure_term_id = entity["procedure_term_id"] = term["id"];
                }
                break;
            case "test-results":
                if (entity.type && (["image", "download"].indexOf(entity.type) > -1 )) {
                    const attachment = await Attachment.repo().findOne({where: { url: entity.test_result, soap_id: entity.soap.id }});

                    if (attachment) {
                        attachment.soap_section_type = "test-results";
                        await Attachment.repo().save(attachment);
                    }
                }

                if (entity.term_text) {
                    const term = await Term.createFromText(entity.term_text, "test", doctorId);
                    entity.term_id = entity["term_id"] = term["id"];
                }
                break;
            case 'investigations':
                if (entity.term_text) {
                    const resp = await this._request.seRequest("api/v2/prescription-terms", {
                        "doctor_id": doctorId,
                        "type": entity.category,
                        "name": entity.term_text
                    });

                    const resp2 = await this._request.seRequest('api/v1/drug-db/store-unverified', {
                        "type": entity.category,
                        "name": entity.term_text,
                        "doctor_id": doctorId,
                    });
                }


            case 'procedures':
            case 'diagnosis':
                if (entity.term_text) {
                    const term = await Term.createFromText(entity.term_text, type, doctorId);
                    entity.term_id = entity["term_id"] = term["id"];
                }

                // #280: use 'diagnosis' text intead of term_text
                if (entity["diagnosis"]) {
                    const term = await Term.createFromText(entity["diagnosis"], type, doctorId);
                    entity.term = term;
                    entity.term_id = entity["term_id"] = term["id"];
                }

                if (type == 'diagnosis') {
                    const resp = await this._request.seRequest("api/v2/prescription-terms", {
                        "doctor_id": doctorId,
                        "type": "diagnosis",
                        "name": entity.diagnosis
                    });

                }

                break;
            case 'chief-complains':
                if (entity.type && (["image", "download"].indexOf(entity.type) > -1 )) {
                    const attachment = await Attachment.repo().findOne({where: { url: entity.complaint, soap_id: entity.soap.id }});

                    if (attachment) {
                        attachment.soap_section_type = "chief-complains";
                        await Attachment.repo().save(attachment);
                    }
                }

                if (entity.type && (entity.type == "text"))
                    await Term.createFromText(entity.complaint, "chief-complains", doctorId);
                break;
            case 'medications':
                const resp = await this._request.seRequest("api/v2/doctors/medicines/create", {
                    "wp_uid": doctorId,
                    "name": entity.drug_name,
                    "meal": entity.intake,
                    "instructions": entity.remarks,
                    "frequency": entity.frequency,
                    "duration_unit": entity.duration_unit,
                    "duration": entity.duration,
                    "dosage": entity.drug_dosage,
                    "dosage_unit": entity.drug_dosage_unit,
                });

                const resp2 = await this._request.seRequest('api/v1/drug-db/store-unverified', {
                        "type": 'medication',
                        "name": entity.drug_name,
                        "doctor_id": doctorId,
                        "meta": entity,
                    });

                break;
            case 'meals':
                const uniqueMeal = await this._request.seRequest("api/v1/drug-db/put/meal", {
                    "name": entity.name,
                    "quantity_unit": entity.quantity_unit,
                });
                entity["unique_meal_id"] = uniqueMeal['meal'].id;
                Term.createFromText(entity.quantity_unit, "meal-quantity-unit", entity.doctor_id);
                break;

            default:
                break;
        }


        return entity;
    }

    /**
     * Based on the component 'type' given in url, matching to 'soapId' sent in urlParam
     * updates entity, and returns the same
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    async updateEntity(req, res) {
        if (!req.params.soap) return res.send(this.build("Missing soapid"));

        await AuditLog.create(req, AuditLog.TYPES.SoapController.UpdateEntities, {
            soap: req.params.soap,
        });

        const uniqueId = req.params.id || req.body.id;
        if (!uniqueId) return await this.createEntity(req, res);

        let entity = await SoapController.URL_CLASS_MAPPING[req.params.type]
            .repo().findOne({where: {id: uniqueId}});
        if (!entity) return res.send(this.build("Couldn't find, with given creteria"));

        if(req.params.type == 'meals') {
            const uniqueMeal = await this._request.seRequest("api/v1/drug-db/put/meal", {
                "name": req.body.name,
                "quantity_unit": req.body.quantity_unit,
            });
            entity["unique_meal_id"] = uniqueMeal['meal'].id;
            await Term.createFromText(req.body.quantity_unit, "meal-quantity-unit", req.body.doctor_id);
        }

        for (let key in req.body) {
            if (["id", "term_id"].indexOf(key) > -1) continue;

            if (["term_text", "diagnosis"].indexOf(key) > -1) {
                const newTerm = await Term.createFromText(req.body[key], req.params.type, req.user.user_id);
                entity["term_id"] = newTerm["id"];
                entity["term"] = newTerm;
                entity[key] = req.body[key];
                continue;
            }

            entity[key] = req.body[key];
        }

        // #308: updated_at column not updating
        entity["updated_at"] = new Date();

        entity = await SoapController.URL_CLASS_MAPPING[req.params.type]
            .repo().save(entity);
        return res.send(this.build("Saved successfully ", 1, {row: entity}));
    }

    /**
     * Based on the component 'type' given in url, matching to 'soapId' sent in urlParam
     * Deletes entity, and returns the same
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    async deleteEntity(req, res) {
        if (!req.params.soap) return res.send(this.build("Missing soapid"));

        await AuditLog.create(req, AuditLog.TYPES.SoapController.DeleteEntity, {
            soap: req.params.soap,
        });

        const uniqueId = req.params.id || req.body.id;
        if (uniqueId === "all") return;

        let entity = await SoapController.URL_CLASS_MAPPING[req.params.type]
            .repo().findOne({where: {id: uniqueId}});
        if (!entity) return res.send(this.build("Entry doesn't exist"));

        await this.deleteAttachedAttachmentRows(entity, req.params.type);

        await SoapController.URL_CLASS_MAPPING[req.params.type]
            .repo().delete(entity.id);
        return res.send(this.build("Deleted successfully ", 1, {row: entity}, req));
    }

    private async deleteAttachedAttachmentRows(entity, type) {
        if (
            ( ["chief-complains", "test-results"].indexOf(type) > -1 )
            && entity.type
            && ( ["image", "download"].indexOf(entity.type) > -1 )
        ) {
            const attachment = await Attachment.repo().findOne({
                where: {
                    soap_id: entity.soap_id,
                    url: entity.complaint || entity.test_result,
                }
            });

            if (attachment) {
                await Attachment.repo().delete(attachment.id);
                return true;
            }
        }

        return false;
    }

    /**
     * if soap not found return will be success 0, message “soap not found”
     * if soap not managed by this doctor return will be success 0, message “Not authorized, owned by ($drname)”
     * if any entities (e.g. chief-complain / diagnosis) not found return will be success 1 message “no entities present”
     * deletes all entities returns success 1 message “deleted successfully”
     * soapId: all numeric generated soap id
     */
    async deleteAllEntities(req, res) {
        if (!req.params.soap) return res.send(this.build("Missing soapid"));

        await AuditLog.create(req, AuditLog.TYPES.SoapController.DeleteAllEntities, {
            soap: req.params.soap,
        });

        const soap: Soap = await (new SOAPRepository())
            .repo().findOne({where: {id: req.params.soap}});


        /*If there is assistant binded with doctor and he/she want to delete the soap entity, it would be not possible
         * and according to me there will be no such case when Doctor A will try to delete the Content created by Doctor B.
         * Even if patient have two consultation 1 & 2, and both are assigned to different doctors, then even its not possible.
         if (soap.created_by !== req.user.user_id)
             return res.send(this.build("Not authorized, owned by another Dr."));

*/
        const allChiefComplain = await SoapController.URL_CLASS_MAPPING[req.params.type]
            .repo().find({where: {soap: req.params.soap}});

        if (!allChiefComplain.length)
            return res.send(this.build("No entities present", 1, {}, req));

        const deletionPromises = [];
        allChiefComplain.forEach(entity => {
            deletionPromises.push(this.deleteAttachedAttachmentRows(entity, req.params.type));
        });

        await Promise.all(deletionPromises);

        allChiefComplain.map(entity => {
            return entity.id
        }).forEach(entityId => {
            SoapController.URL_CLASS_MAPPING[req.params.type]
                .repo().delete(entityId)
        });

        return res.send(this.build("Delete all entities", 1, {rows: allChiefComplain}, req));
    }

    /**
     * Suggests chief-complains for autocomplete
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async suggestChiefComplains(req, res) {
        // typeorm doesn't have 'ilike' and its FindOperator also doesn't supports it.
        /* const suggestions = await Term.repo().find({
             where: {
                 doctor_id: req.user.user_id,
                 term_type: "chief-complains",
                 term_body: Like("%" + (req.params.search || "") + "%"),
             }
         }); */

        const suggestions = await Term.repo().createQueryBuilder("terms")
            .where("doctor_id = :user_id and term_type = 'chief-complains' and term_name ilike :search", {
                user_id: req.user.user_id,
                search: "%" + req.params.search + "%"
            })
            .getMany();

        const uniqueNames = [];
        suggestions.filter( suggestion => {
            if(uniqueNames.indexOf(suggestion.term_body.toLowerCase().trim()) > -1)
                return false;

            uniqueNames.push(suggestion.term_body.toLowerCase().trim());
            return true;
        });

        res.send(this.build("here you go!", 1, {suggestions}, req));
    }

    async suggestMealQuantityUnit(req, res) {
      const suggestions = await (new TermsRepository()).getTerms('meal-quantity-unit', req.params.search);

        const uniqueNames = [];
        suggestions.filter( suggestion => {
            if(uniqueNames.indexOf(suggestion.term_body.toLowerCase().trim()) > -1)
                return false;

            uniqueNames.push(suggestion.term_body.toLowerCase().trim());
            return true;
        });


        res.send(this.build("here you go!", 1, {suggestions}, req));
    }

    async suggestExaminationOrgans(req, res) {
        const suggestions = Examination.getFilteredOrgans(req.params.query || "");

        res.send(this.build("here you go!", 1, {suggestions}, req));
    }

    async suggestIcd10Codes(req, res) {
        if (!req.params.query) return res.send(this.build("Missing required fields"));

        if (req.params.query.length < 3) return res.send(this.build("Should be atleast 3 characters", 0, {
            matches: []
        }, req));

        const response = await this._request.seRequest(`api/v2/standards/icd10/search/${req.params.query}`);
        res.send(this.build(response['message'], response['success'], {
            matches: response['matches'] || [],
            terms: response['terms'] || []
        }, req));
    }

    async suggestMedicines(req, res) {
        if (!req.params.query) return res.send(this.build("Missing required fields"));

        if (req.params.query.length < 2) return res.send(this.build("Should be atleast 2 characters", 0, {
            matches: []
        }, req));

        const timestamp = new Date().getTime();

        // for older version and functioning of this API, change 'v3' to 'v2'
        const matches = await this._request.seRequest(`api/v3/doctors/medicines/search/${req.params.query}?deprecated=no`, {}, {
            token: req.user.access_token
        });
        res.send(this.build("Here you go", 1, {
            matches: matches || [],
            timestamp: timestamp,
        }, req));
    }

    async suggestMeals(req, res) {
        if (!req.params.query) return res.send(this.build("Missing required fields"));

        if (req.params.query.length < 3) return res.send(this.build("Should be atleast 3 characters", 0, {
            matches: []
        }, req));

        const matches = await this._request.seRequest(`api/v1/drug-db/search/meals/${req.params.query}`, {}, {
            token: req.user.access_token
        });
        res.send(this.build("Here you go", 1, {
            matches: matches['rows'] || []
        }, req));

    }

    async suggestInvestigations(req, res, next, typeOfInvestigation = 'both') {
        if (!req.params.query) return res.send(this.build("Missing required fields"));

        /*
         * Disabling for now, since we have very few completions.
         * 
        if (req.params.query.length < 3)
            return res.send(this.build("Should be atleast 3 characters", 0, {
                matches: []
            }, req));
        */

        // for older version and functioning of this API, change 'v3' to 'v2'
        const endurl = `api/v3/standards/loinc/search/${req.params.query}?type=${typeOfInvestigation}&deprecated=no`;
        const matches = await this._request.seRequest(endurl, {}, {
            token: req.user.access_token
        });
        return res.send(this.build("Here you go", 1, {
            matches: matches["matches"] || [],
            terms: matches['terms'] || []
        }, req));
    }

    /**
     * Wrappers for suggestInvestigation distinguished for 'path' and 'radio'
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void|boolean|Response|void|boolean|Response>}
     */
    async suggestPathInvestigations(req, res, next) {
        return this.suggestInvestigations(req, res, next, 'pathology');
    }

    async suggestRadioInvestigations(req, res, next) {
        return this.suggestInvestigations(req, res, next, 'radiology');
    }

    async viewSoap(req, res) {
        if (!req.params.soap) return res.send(this.build("Missing soapid"));
        const soap: Soap = await Soap.getFullById(req.params.soap);

        const count = await Soap.repo()
            .createQueryBuilder()
            .where('patient_id = :patient and active = true', {
                patient: soap.patient_id
            })
            .select('COUNT(*)', 'count')
            .getRawOne();

        const consultationRow = await this._db.wpdb(`select * from medi_consultation where code = '${soap.consultation_code}' limit 0, 1`);
        let consultationTime = soap.created_at;
        if ( consultationRow && consultationRow[0] && consultationRow[0]["created"]) 
            consultationTime = new Date(consultationRow[0]["created"]);
        
        soap["consultationTime"] = consultationTime;

        return res.send(this.build("Here you go!", 1, {soap, count: count.count, consultationTime}, req));
    }

    async updateRemarkFollowUp(req, res) {
        if (!req.params.soap) return res.send(this.build("Missing soapid"));

        let soap: Soap = await (new SOAPRepository())
            .repo().findOne(req.params.soap);

        await AuditLog.create(req, AuditLog.TYPES.SoapController.UpdateRemarkFollowup, {
            soap: req.params.soap,
        });

        if (!soap) return res.send(this.build("Soap not found"));

        if (req.body.follow_up && (req.body.follow_up.split(" ").length < 2))
            req.body.follow_up = req.body.follow_up + " Day(s)";

        /**
         * only sends/updates notification, anything is changed, 
         * both values are present
         * date is proper and unit is one of 'Day(s)', 'Week(s)', 'Month(s)'.
         */
        if (req.body.follow_up
            && ((soap.remark != req.body.remark) || (soap.follow_up != req.body.follow_up ))
            && (req.body.follow_up.split(" ").length === 2)
            && (['Day(s)', 'Week(s)', 'Month(s)'].indexOf(req.body.follow_up.split(" ")[1]) > -1)
        ) await this.sendNotification(soap, { 
            type: "followup", 
            remarks: req.body.remark, 
            followup: req.body.follow_up 
        });

        soap.remark = req.body.remark;
        soap.follow_up = req.body.follow_up;

        soap = await (new SOAPRepository())
            .repo().save(soap);

        return res.send(this.build("Saved successfully: ", 1, {soap}, req));
    }

    /**
     * Bulk update, basically the functionality of 'save-all' button
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    async updateSoap(req, res) {
        if (!req.params.soap) return res.send(this.build("Missing soapid"));

        await AuditLog.create(req, AuditLog.TYPES.SoapController.UpdateSoap, {
            soap: req.params.soap,
        });

        let soap: Soap = await (new SOAPRepository())
            .repo().findOne(req.params.soap);
        console.debug("The soap i am saving to: ", soap);

        if (!soap) return res.send(this.build("Soap not found"));

        if (req.body.remark || req.body.follow_up) {
            soap.remark = req.body.remark;
            soap.follow_up = req.body.follow_up;

            await (new SOAPRepository())
                .repo()
                .save(soap)
                .then(StaticHelpers.doNothingOnError);
        }

        const _this = this;
        Object.keys(SoapController.URL_CLASS_MAPPING).forEach(async componentType => {
            const soapRelation = Soap.urlTypeParamToRelationNames(componentType);

            // Fix: pradeep never sends me id for 'clinical-notes',
            //      patch, find that id from server, and put it.
            if (componentType === "clinical-notes") {
                const clinicalNote = await ClinicalNote.repo().findOne({where: {soap: soap}});
                if (clinicalNote) req.body[soapRelation]["id"] = clinicalNote["id"];
            }

            if (["vitals", "clinical_notes", "clinical-notes"].indexOf(componentType) > -1 && !req.body[soapRelation][0]) {
                req.body[soapRelation] = [req.body[soapRelation]];
            }

            if (req.body[soapRelation] && req.body[soapRelation].length) {
                const soapKeyNameAsDb = SoapController.convertForMappings(soapRelation);

                req.body[soapRelation].forEach(async data => {
                    if (data["id"]) {
                        const found = await SoapController.URL_CLASS_MAPPING[componentType]
                            .repo().findOne({
                                where: {id: data["id"]}
                            });

                        if (found) {
                            for (let key in data) {
                                if (["created_at", "updated_at"].indexOf(key) > -1)
                                    continue;

                                found[key] = data[key];
                            }

                            console.debug("Updating: ", found);
                            return await SoapController.URL_CLASS_MAPPING[componentType]
                                .repo()
                                .save(found)
                                .then(StaticHelpers.doNothingOnError);
                        }
                    }

                    let entity = _this.newEntityObjectFromSoap(soapKeyNameAsDb, req.user.user_id, soap);
                    for (let key in data) {
                        if (["created_at", "updated_at"].indexOf(key) > -1)
                            continue;

                        entity[key] = data[key];
                    }

                    await _this.createTermBeforeEntities(soapKeyNameAsDb, req.user.user_id, entity);
                    entity["patient_id"] = soap.patient_id;

                    console.debug("Inserting: ", entity);
                    if ( (componentType == "vitals") && ! entity.vital_information)
                        return;

                    await SoapController.URL_CLASS_MAPPING[componentType]
                        .repo()
                        .save(entity)
                        .then(StaticHelpers.doNothingOnError);
                });
            }
        });

        soap = await Soap.getFullById(req.params.soap);

        return res.send(this.build("Updated Successfully", 1, {soap}, req));
    }

    private static convertForMappings(key) {
        if (key === "chief_complaints") return "chief-complains";
        if (key === "clinical_notes") return "clinical-notes";

        return key;
    }

    async uploadAttachment(req, res) {
        if (!req.params.soap) return res.send(this.build("Missing soapid"));
        const soap: Soap = await (new SOAPRepository())
            .repo().findOne(req.params.soap);

        await AuditLog.create(req, AuditLog.TYPES.SoapController.UploadAttachment, {
            soap: req.params.soap,
        });

        if (!req.files.file) return res.send(this.build("Missing required file: on key 'file'"));

        const fileObject = req.files.file;
        const fileUrl = await uploader.uploadFromData(fileObject);

        req.params.type = "attachments";
        let entity = this.newEntityObjectFromSoap(req.params.type, req.user.user_id, soap);

        entity.attachment_type = fileObject.mimetype;
        if (req.body.type) entity.soap_section_type = req.body.type;
        entity.url = fileUrl;
        entity.meta = {};

        entity = await SoapController.URL_CLASS_MAPPING[req.params.type]
            .repo().save(entity);
        return res.send(this.build("Created: ", 1, {row: entity}, req));
    }

    async createAttachment(req, res) {
        if (!req.params.soap) return res.send(this.build("Missing soapid"));

        await AuditLog.create(req, AuditLog.TYPES.SoapController.CreateAttachment, {
            soap: req.params.soap,
        });

        const soap: Soap = await (new SOAPRepository())
            .repo().findOne(req.params.soap);

        if (!req.body.file) return res.send(this.build("Missing required file: on key 'file'"));

        const imageData = Buffer.from(req.body.file.replace("data:image/png;base64,", "").replace(" ", "+"), 'base64');

        const fileObject = {
            name: Date.now() + ".png",
            mimetype: "image/png",
            data: imageData,
            size: imageData.byteLength
        };
        const fileUrl = await uploader.uploadFromData(fileObject);
        req.params.type = "attachments";
        let entity = this.newEntityObjectFromSoap(req.params.type, req.user.user_id, soap);

        entity.attachment_type = fileObject.mimetype;
        if (req.body.type) entity.soap_section_type = req.body.type;
        entity.url = fileUrl;
        entity.meta = {};

        entity = await SoapController.URL_CLASS_MAPPING[req.params.type]
            .repo().save(entity);
        return res.send(this.build("Created: ", 1, {row: entity}, req));

        // return res.send(this.build("createAttachment"));
    }

    async createTerm(req, res) {
        if (!req.body.type || !req.body.name)
            return res.send(this.build("Missing required fields."));

        await AuditLog.create(req, AuditLog.TYPES.SoapController.CreateTerm);

        const seResp = await this._request.seRequest("api/v2/prescription-terms", {
            doctor_id: req.user.user_id,
            type: req.body.type,
            name: req.body.name
        });

        return res.send(this.build(seResp["message"], seResp["success"], {
            term: seResp['term']
        }, req));
    }

    async listPreviousSoaps(req, res, take = 3, except = null) {
        if (!req.params.patientId)
            return res.send(this.build("Missing required feilds"));

        take = take || 3;
        const skip = ((req.params.page || 1) - 1 ) * 3;

        let soaps = await (new SOAPRepository()).repo().find({
            order: {id: "DESC"}, skip, take,
            where: {
                patient_id: req.params.patientId,
                id: Not(except),
                active: true
            },
            relations: Object.keys(SoapController.URL_CLASS_MAPPING)
                .map(Soap.urlTypeParamToRelationNames)
                .concat(["investigations.term", "procedures.term", "diagnosis.term", "test_results.term"])
        });

        let consultationCodes = [];
        soaps.forEach(function (soap) {
            consultationCodes.push("'" + soap.consultation_code + "'");
        });

        soaps = soaps.map(soap => {
            ["investigations", "procedures", "diagnosis", "test_results"].forEach(relation => {
                soap[relation] = (soap[relation] || []).map(entity => {
                    if (entity.term) entity["term_text"] = entity.term.term_body || "";
                    return entity;
                });
            });

            soap["diagnosis"] = (soap["diagnosis"] || []).map(entity => {
                if (entity.term) entity["diagnosis"] = entity.term.term_body || "";
                return entity;
            });

            return soap;
        });

        if (!consultationCodes.length) res.send(this.build("No previous soaps found: ", 1, {soaps: []}, req));

        let consultationCodesString = consultationCodes.join(", ");
        const consultations = await this._db.wpdb(`select * from medi_consultation where code in (${consultationCodesString})`);
        const pobjects = await this._db.wpdb(`select * from medi_pobject where code in (${consultationCodesString})`);

        let postIds = [];
        pobjects.forEach(function (pobject) {
            postIds.push(pobject["post_id"]);
        });
        let postIdsString = postIds.join(", ");

        const posts = await this._db.wpdb(`select * from medi_posts where ID in (${postIdsString})`);

        for (let i = 0; i < soaps.length; i++) {
            let soap = soaps[i];

            let consultation = consultations.filter(function (consultation) {
                return consultation["code"] == soap.consultation_code;
            })[0];

            let pobject = pobjects.filter(function (pobject) {
                return pobject["code"] == soap.consultation_code;
            })[0];

            let post = posts.filter(function (post) {
                return post["ID"] == pobject["post_id"];
            })[0];

            soap["consultation"] = consultation;
            soap["pobject"] = pobject;
            soap["post"] = post;

            soaps[i] = soap;
        }

        return res.send(this.build("Here you go!", 1, {soaps}, req));
    }


    private newEntityObjectFromSoap(type, doctorId, soap: Soap) {
        // console.debug("Creating entity for type: ", type, SoapController.URL_CLASS_MAPPING[type]);
        let entity = new SoapController.URL_CLASS_MAPPING[type]();

        SoapController.SOAP_COMMON_PROPERTIES.forEach(property => {
            if (property === "doctor_id") {
                entity.doctor_id = doctorId;
                return;
            }

            if (property === "soap") {
                entity.soap = soap;
                return;
            }

            entity[property] = soap[property];
        });
        return entity;
    }

    async createPastIllness(req, res) {
        await AuditLog.create(req, AuditLog.TYPES.SoapController.SavePastIllness, {
            patient: req.body.patientId,
        });

        if (!req.body.patientId || !req.body.remark)
            return res.send(this.build("MIssing required fields"));

        const created = await PastIllness.repo().save({
            "patient_id": req.body.patientId,
            "remark": req.body.remark
        });

        return res.send(this.build("created Successfully", 1, {row: created}, req));
    }

    async createPastMedication(req, res) {
        await AuditLog.create(req, AuditLog.TYPES.SoapController.SavePastMedications, {
            patient: req.body.patientId,
        });

        if (!req.body.patientId || !req.body.remark)
            return res.send(this.build("MIssing required fields"));

        const created = await PastMedication.repo().save({
            "patient_id": req.body.patientId,
            "remark": req.body.remark
        });

        return res.send(this.build("created Successfully", 1, {row: created}, req));
    }

    async deletePastIllness(req, res) {

        const row = await PastIllness.repo().findOne(req.params.id);

        await AuditLog.create(req, AuditLog.TYPES.SoapController.DeletePastIllness, {
            previous: row,
        });

        await PastIllness.repo().delete(req.params.id);

        return res.send(this.build("Deleted successfully", 1, {row}, req));
    }

    async deletePastMedication(req, res) {
        const row = await PastMedication.repo().findOne(req.params.id);
        await AuditLog.create(req, AuditLog.TYPES.SoapController.DeletePastMedications, {
            previous: row,
        });

        await PastMedication.repo().delete(req.params.id);

        return res.send(this.build("Deleted successfully", 1, {row}, req));
    }

    async listPreviousSoapsV2(req, res) {
        req.params.patientId = req.body.patientId;
        req.params.page = req.body.page;

        return this.listPreviousSoaps(req, res, 15, req.body.except);
    }

    async getPreviousMedications(req, res) {
        const soap = await Soap.repo().findOne({
            where: { id: req.params.soap }
        });

        if (! soap) return res.send(this.build("Invalid soap"));

        let previousSoapId = await Medication.repo()
            .createQueryBuilder()
            .where("soap_id < :soap and patient_id = :patient", {
                soap: soap.id,
                patient: soap.patient_id,
            })
            .orderBy('soap_id', "DESC")
            .getOne();
        if (! previousSoapId)
            return res.send(this.build("Previous medications not found"));

        const previousMedication = await Medication.repo()
            .findOne({
                where: { id: previousSoapId.id},
                relations: ['soap']
            });
        const previousMedications = await Medication.repo()
            .createQueryBuilder()
            .where("soap_id = :soap", {
                soap: previousMedication.soap.id
            })
            .getMany();

        return res.send(this.build("Here you go!", 1, {
            rows: previousMedications
        }));
    }

    async getPreviousMeals(req, res) {
        const soap = await Soap.repo().findOne({
            where: { id: req.params.soap }
        });

        if (! soap) return res.send(this.build("Invalid soap"));

        let previousSoapId = await Meal.repo()
            .createQueryBuilder()
            .where("soap_id < :soap and patient_id = :patient", {
                soap: soap.id,
                patient: soap.patient_id,
            })
            .orderBy('soap_id', "DESC")
            .getOne();
        if (! previousSoapId)
            return res.send(this.build("Previous meals not found"));

        const previousMeal = await Meal.repo()
            .findOne({
                where: { id: previousSoapId.id},
                relations: ['soap']
            });

        const previousMeals = await Meal.repo()
            .createQueryBuilder()
            .where("soap_id = :soap", {
                soap: previousMeal.soap.id
            })
            .getMany();

        return res.send(this.build("Here you go!", 1, {
            rows: previousMeals
        }));
    }

    public async createSoapByPostId(req, res, postId) {
        const post = (await db.wpdb(`select * from medi_posts where ID = ${postId}`))[0];
        const pobject = (await db.wpdb(`select * from medi_pobject where post_id = ${postId} order by start_date desc`))[0];
        const consultation = (await db.wpdb(`select * from medi_consultation where code = '${pobject.code}'`))[0];
        const patient = (await db.wpdb(`select * from medi_patients where id = ${consultation.patient_id}`))[0];

        const createdAt = pobject.start_date ? (new Date(pobject.start_date)) : new Date;

        // soap-uuid: patient/user/channel/center
        const theValues = {
            "soap_code": StaticHelpers.strRandom(32),
            "consultation_code": pobject.code,
            "patient_id": patient.id,
            "meta": {},
            "created_by": req.user.user_id,
            "center_code": patient.center_code,
            "uuid": patient.id + "/" + post.post_author + "/" + consultation.channel_id,
            "created_at": createdAt,
            "updated_at": createdAt,
        };

        await AuditLog.create(req, AuditLog.TYPES.SoapController.CreateSoap, {
            code: pobject.code,
        });

        // console.debug("creating soap with these values: ", theValues);

        // check if soap with this consultation_code already exists, dont create
        const foundSoaps = await Soap.getRepo().find({where: {consultation_code: pobject.code}}); // returns an array

        if (foundSoaps.length) return foundSoaps[0];

        // if not lets create new one
        return await (new SOAPRepository()).save(theValues);
    }

    public async previewPrescription (req, res) {

        let soap = await Soap.getFullById(req.params.soapId);
            soap.medications = await Soap.appendMedicationSalts(soap.medications);
        const prescriptionData = await this.convertSoapToPrescriptionData(soap);

        let postId = await this._db.wpdb(`select post_id from medi_pobject where code = '${soap.consultation_code}' limit 0, 1`);
        if (postId && postId[0] && postId[0]["post_id"])
            postId = postId[0]["post_id"];

        const resp = await this._request.coreRequest('previewPrescription', {
            'data': prescriptionData, 
            'userId': req.user.user_id,
            'deviceId': this._config.get('defaultDeviceId', 'emr'),
            'encrypted': req.user.encrypted,
            'to': soap.uuid.split("/")[1],
            'postId': postId,
        }, true);

        let argumentsForCostCalculation = [];
        prescriptionData.radiologyInvestigations.forEach( investigationName => {
            argumentsForCostCalculation.push({
                name: investigationName,
                type: "radiology",
            });
        });
        prescriptionData.pathologyInvestigations.forEach( investigationName => {
            argumentsForCostCalculation.push({
                name: investigationName,
                type: "pathology",
            });
        });
        prescriptionData.medication.forEach( medication => {
            argumentsForCostCalculation.push({
                type: "medication",
                name: medication.rawName,
                perDay: medication.perDay,
                forDays: medication.forDays,
                sos: medication.sos,
            });
        });

        const calculations = await this._request.seRequest('api/v1/drug-db/calculate', 
            argumentsForCostCalculation, {
            token: req.user.access_token
        });


        res.send(this.build("Here you go!", 1, {
            "html": resp,
            "calc": calculations,
        }));
    }

    public async sendPrescription (req, res) {
        await AuditLog.create(req, AuditLog.TYPES.SoapController.PrescriptionSend, {
            soap: req.params.soapId,
        });

        let soap = await Soap.getFullById(req.params.soapId);
            soap.medications = await Soap.appendMedicationSalts(soap.medications);
        const prescriptionData = await this.convertSoapToPrescriptionData(soap);

        let postId = await this._db.wpdb(`select post_id from medi_pobject where code = '${soap.consultation_code}' limit 0, 1`);
        if (postId && postId[0] && postId[0]["post_id"])
            postId = postId[0]["post_id"];

        await this._request.self('api/v1/consultations/mark-done/' + soap.consultation_code);

        const resp = await this._request.coreRequest('createPrescription', {
            'data': prescriptionData, 
            'userId': req.user.user_id,
            'deviceId': this._config.get('defaultDeviceId', 'emr'),
            'encrypted': req.user.encrypted,
            'to': soap.uuid.split("/")[1],
            'postId': postId,
        }, true);

        if (req.params.attachToCurrentSoap && resp['url'] && resp['url'].length) {
            const attachment = new Attachment;
            attachment.soap = soap;
            attachment.patient_id = soap.patient_id;
            attachment.doctor_id = soap.created_by;
            attachment.attachment_type = 'image/jpeg';
            attachment.url = resp['url'];
            attachment.meta = JSON.parse('{"from": "treatmentPlan"}');
            attachment.soap_section_type = "prescription";

            await Attachment.repo().save(attachment);
        }

        if (resp && resp['url'] && resp['url'].length) {
            await this.sendNotification(soap, { postId, type: "prescription", meta: { url: resp['url']} });
        }

        if (req.body.closeConsult && ( req.body.closeConsult == 1 )) {
            const resp2 = await this._request.coreRequest('expire-consultation', {
                'userId': req.user.user_id,
                'deviceId': this._config.get('defaultDeviceId', 'emr'),
                'postId': postId,
                'encrypted': req.user.encrypted,
            }, true);

            return res.send(this.build("Prescription sent, & consultation closed successfully.", 1, {
                resp, resp2
            }));
        }

        return res.send(this.build("Prescription sent successfully.", 1, {
            resp: resp
        }));
    }

    /**
     * Kind of wrapper function to send notifications through Se.Medimetry panel
     * this function, i am assuming should be called in every case for notifications.
     * 
     * @param {Soap}   soap  Whose regarding we are creating the notification ( required )
     * @param {[type]} extra Any extra options, one might want to send {
     *     "type", "postId" ( required )
     * }
     */
    private async sendNotification(soap: Soap, extra) {

        const patient = (await this._db.wpdb(`select * from medi_patients where id = '${soap.patient_id}'`))[0];
        const consultationRow = (await this._db.wpdb(`select * from medi_consultation where code = '${soap.consultation_code}'`))[0];

        if (! extra["type"]) extra["type"] = "notification";

        if (! extra["postId"]) {
            let postId = await this._db.wpdb(`select post_id from medi_pobject where code = '${soap.consultation_code}' limit 0, 1`);
            if (postId && postId[0] && postId[0]["post_id"])
                postId = postId[0]["post_id"];

            extra["postId"] = postId;
        }

        let userId = patient.user_id;
        let channelSettings = await this._db.wpdb(`select * from medi_postmeta where post_id = ${extra["postId"]} and meta_key = 'channel_settings'`);
        if (channelSettings && channelSettings[0] && channelSettings[0]["meta_value"]) {
            channelSettings = StaticHelpers.unserialize(channelSettings[0]["meta_value"]);

            if (channelSettings["affiliate_code"]) userId = channelSettings["affiliate_code"].split('+')[1];
        }

        let notificationTitle = "notification title";
        let notificationDescription = "description of the notification";
        let notificationMeta = extra['meta'] || {};

        const notificationTexts = {
            "prescription": {
                "title": `Prescription generated for patient '${patient.name}'`,
                "description": `from PMS, click for more information`,
                "meta": {translations: {
                    hindi: {
                        "title": ` '${patient.name}' के लिए पर्चे बन गए है।`,
                        "description": `अधिक जानकारी के लिए क्लिक करें।`
                    }
                }}
            },
            "testresults": {
                "title": `${patient.name}'s lab reports have arrived`,
                "description": `from doctor's assistant, click to view reports`,
                "meta": { extra: extra["entity"], translations: {
                    hindi: {
                        "title": `${patient.name} की लैब रिपोर्ट आ गई है।`,
                "description": `रिपोर्ट देखने के लिए क्लिक करें।`,
                    }
                }}
            },
            "followup": {
                "title": `${patient.name}'s follow-up reminder`,
                "description": extra["remarks"] ? `Dr. says: ${extra["remarks"]}` : "",
                "meta": { remark: extra["remarks"], translations: {
                    hindi: {"title": `${patient.name} को डॉक्टर से बात करने के लिए याद दिलाएं।`,
                    "description": extra["remarks"] ? `डॉ ने कहा था: ${extra["remarks"]}` : ""
                    }
                } }
            }
        };

        if (extra["type"] && notificationTexts[extra["type"]]) {
            notificationTitle = notificationTexts[extra["type"]]["title"] || notificationTitle;
            notificationDescription = notificationTexts[extra["type"]]["description"] || notificationDescription;
            if (notificationTexts[extra['type']]['meta']) {
                for (const key in notificationTexts[extra['type']]['meta']) {
                    notificationMeta[key] = notificationTexts[extra['type']]['meta'][key];
                }
            }
        }

        const params = {
            center_code: patient.center_code,
            from: consultationRow["user_id"],
            to: userId,
            consultation_code: soap.consultation_code,
            title: notificationTitle,
            description: notificationDescription,
            meta: notificationMeta,
        };

        switch (extra["type"]) {
            case "followup":
                const followUpDate = StaticHelpers.daysDurationToMySqlDate(extra["followup"], soap.created_at);
                let dayBefore = new Date(followUpDate); dayBefore.setDate(dayBefore.getDate() - 1);
                let dayAfter = new Date(followUpDate); dayAfter.setDate(dayAfter.getDate() + 1);

                params["due_at"] = "" + dayBefore.toISOString() + ", " + followUpDate.toISOString() + ", " + dayAfter.toISOString();

                break;
            
            default: break;
        }

        return await this._request.seRequest('api/v1/notifications/partner-notification/partnerapp-' + extra["type"], params);
    }

    private convertHabitToText(type, value) {
        if (["smokingHabit", "drinkingHabit"].indexOf(type) > -1) {
            switch (value) {
                case "0": return "n/a";
                case "1": return "never";
                case "2": return "occasional";
                case "3": return "mild";
                case "4": return "regular";
                case "5": return (type === "smokingHabit") ? "chain" : "heavy";
            }
        }

        return "normal";
    }

    private async convertSoapToPrescriptionData (soap) {
        let prescriptionData = {
            "radiologyInvestigations": [],
            "pathologyInvestigations": [],
            "diagnosis": [],
            "diagnosisObject": [],
            "medication": [],
            "specialNote": "",
            "followUp": "",
            "vitals": [],
            "chiefComplains": [],
            "referrals": [],
            "procedures": [],
            "habits": [],
            "pastMedications": [],
        };

        prescriptionData.chiefComplains = soap.chief_complaints.map( row => row.complaint);
        prescriptionData.referrals = soap.referrals.map( row => row.remarks );
        prescriptionData.procedures = soap.procedures.map( row => row.term_text );

        if ( soap.vitals && soap.vitals.vital_information) {
            const vitals = soap.vitals.vital_information;
            if ( vitals["BP(S)"] && vitals["BP(D)"] ) prescriptionData.vitals.push("BP: " + vitals["BP(S)"] + " / " + vitals["BP(D)"]);
            if ( vitals["Pulse"] ) prescriptionData.vitals.push("Pulse: " + vitals["Pulse"] + " bpm");
            if ( vitals["Temp (F)"] ) prescriptionData.vitals.push("Body Temprature: " + vitals["Temp (F)"] + " deg f");
            if ( vitals["Height(ft)"] && vitals["Height(in)"] ) prescriptionData.vitals.push("Height: " + vitals["Height(ft)"] + "' " + vitals["Height(in)"] + "\"");
            if ( vitals["Weight (kg)"] ) prescriptionData.vitals.push("Weight: " + vitals["Weight (kg)"] + " kg");

            if ( vitals["Random Sugar"] ) prescriptionData.vitals.push("Sugar: " + vitals["Random Sugar"] + " mg/dl (random)");
            if ( vitals["Fasting Sugar"] ) prescriptionData.vitals.push("Sugar: " + vitals["Fasting Sugar"] + " mg/dl (fasting)");
            if ( vitals["Post Prandial Sugar"] ) prescriptionData.vitals.push("Sugar: " + vitals["Post Prandial Sugar"] + " mg/dl (post-parandial)");

            if ( vitals["Oxygen Saturation"] ) prescriptionData.vitals.push("Oxygen saturation: " + vitals["Oxygen Saturation"] + "%");
            if ( vitals["Respiratory  Rate"] ) prescriptionData.vitals.push("Respiratory rate: " + vitals["Respiratory  Rate"] + " bpm");
            if ( vitals["Head Circumference"] ) prescriptionData.vitals.push("Head circumference: " + vitals["Head Circumference"] + " cm");
            if ( vitals["BMI"] ) prescriptionData.vitals.push("BMI: " + vitals["BMI"] + " kg/m");
        }

        if ( soap.personal_history && soap.personal_history.info ) {
            const info = soap.personal_history.info;
            if (info["lifeStyle"]) prescriptionData.habits.push("Lifestyle: " + info["lifeStyle"]);
            if (info["smokingHabit"]) prescriptionData.habits.push("Smoking: " + this.convertHabitToText("smokingHabit", info["smokingHabit"]));
            if (info["drinkingHabit"]) prescriptionData.habits.push("Drinking: " + this.convertHabitToText("drinkingHabit", info["drinkingHabit"]));
        }

        const pastMedications = await PastMedication.repo()
            .createQueryBuilder()
            .where("patient_id = :patient", { patient: soap.patient_id })
            .getMany();
        prescriptionData.pastMedications = pastMedications.map( row => row.remark );

        soap.investigations.forEach( investigation => {
            if (investigation && investigation.term && investigation.term.term_body) {}
            else return;

            switch (investigation.category) {
                case 'pathology': 
                    prescriptionData.pathologyInvestigations.push(investigation.term.term_body);
                    break;
                case 'radiology':
                    prescriptionData.radiologyInvestigations.push(investigation.term.term_body);
                    break;
                default: break;
            }
        });

        soap.diagnosis.forEach( diagnosis => {
            if (diagnosis && diagnosis.term && diagnosis.term.term_body) {}
            else return;

            prescriptionData.diagnosis.push(diagnosis.term.term_body);
            prescriptionData.diagnosisObject.push({
                "uuid": diagnosis.uuid,
                "category": diagnosis.category,
                "icd_code": diagnosis.icd_code,
                "chronic": diagnosis.chronic,
                "status": diagnosis.status,
                "remarks": diagnosis.remarks,
            });
        });

        if (soap.remark && soap.remark.length) 
            prescriptionData.specialNote = soap.remark;

        if (soap.follow_up && soap.follow_up.length) 
            prescriptionData.followUp = soap.follow_up;

        const durationUnitValueMapping = {
            "Day(s)": 1,
            "Week(s)": 7,
            "Month(s)": 30,
        };

        soap.medications.forEach( medication => {
            const dosage = (medication.drug_dosage && medication.drug_dosage_unit 
                && ( medication.drug_dosage_unit != 'null' )
                && ( medication.drug_dosage != '0' )
            ) ? `( ${medication.drug_dosage} ${medication.drug_dosage_unit} )` : "";

            const duration = (medication.duration && medication.duration_unit 
                && ( medication.duration_unit != 'null' )
                && ( medication.duration != '0' )
            ) ? `${medication.duration} ${medication.duration_unit}` : "";

            const frequency = StaticHelpers.extractMedicationFrequency(parseInt(medication.frequency), true);
            const medicationObject = {
                "name": `${medication.drug_name} ${dosage}`,
                "dosage": `${frequency} For ${duration} ${medication.intake}`,
                "precaution": medication.remarks,
                "rawName": medication.drug_name,
                "salts": (medication.salts || []).join(" + "),
                "perDay": (frequency.match(/1/g) || []).length,
                "sos": !! (frequency.toLowerCase().match(/sos/g) || []).length,
                "forDays": parseInt(medication.duration) * (durationUnitValueMapping[medication.duration_unit] || 1),
            };

            prescriptionData.medication.push(medicationObject);
        });

        console.log("prescriptionData: ", prescriptionData);

        return prescriptionData;
    }

    async getPreviousSoapVitals(req, res) {

        const soap = await Soap.repo()
            .createQueryBuilder()
            .where("id = :soap", { 
                soap: req.params.soap,
            })
            .getOne();

       if (! soap) return res.send(this.build("Soap not found"));

        const previousVitals = await Vitals.repo()
            .createQueryBuilder()
            .where("patient_id = :patient and soap_id < :soap", {
                patient: soap.patient_id,
                soap: req.params.soap,
            })
            .orderBy('id', 'DESC')
            .getOne();

        if (! previousVitals) return res.send(this.build("Previous soap not found"));


        return res.send(this.build("Here you go", 1, {
            vitals: previousVitals
        }));
    }

    async removeSoapFromListing(req, res) {
        await AuditLog.create(req, AuditLog.TYPES.SoapController.DeleteSoap, {
            soap: req.params.soap,
        });

        const soap = await Soap.repo().findOne({
            where: {
                id: req.params.soap
            }
        });

        if (! soap) return res.send(this.build("Soap not found"));

        soap.active = false;
        await Soap.repo().save(soap);

        this._dbConn.createQueryBuilder()
            .update(ConsultationStatus)
            .set({consultation_modified: new Date, active: false})
            .where("consultation_code = :code", {
                code: soap.consultation_code
            })
            .execute();

        return res.send(this.build("Removed", 1));
    }

    async addEmptyFUP(req, res) {
        await AuditLog.create(req, AuditLog.TYPES.SoapController.EmptyFollowupDuration, {
            soap: req.params.soap,
        });

        const soap = await Soap.repo().findOne({
            where: {
                id: req.params.soap
            }
        });

        if (! soap) return res.send(this.build("Soap not found"));

        soap.follow_up = '0 Day(s)';
        await Soap.repo().save(soap);
        
        return res.send(this.build("Followup Saved", 1));
    }

    public async updateSoapMeta(req, res) {
        const soap = await this.getSoapFromReq(req);

        if (! soap) return res.send(this.build("Soap not found"));

        soap.meta = req.body || {};
        await Soap.repo().save(soap);

        return res.send(this.build("Meta updated successfully", 1));
    }

    public async updateSoapMedicationStock(req, res) {
        if ( ! req.body.stock)
            return res.send(this.build("Missing required vars"));

        const soap = await this.getSoapFromReq(req);

        const stockRow = req.body.stock;
        const stocks = soap.meta.stocks || [];

        const existIndex = StaticHelpers.arraySearch(stocks, "name", stockRow.name);
        if (existIndex > -1) stocks.splice(existIndex, 1);

        stocks.push(stockRow);

        soap.meta['stocks'] = stocks;

        await Soap.repo().save(soap);
        return res.send(this.build("Saved Successfully", 1, { soap }));
    }

    private async getSoapFromReq(req) {

        let soap = null;

        if (req.params.soap) soap = await Soap.repo().findOne({where: {id: req.params.soap}});
        if (req.params.code) soap = await Soap.repo().findOne({where: {consultation_code: req.params.code}});

        return soap;
    }
}

// in-case the constructor isn't getting called
SoapController.URL_CLASS_MAPPING = {
    "examinations": Examination,
    "vitals": Vitals,
    "diagnosis": Diagnosis,
    "medications": Medication,
    "investigations": Investigation,
    "referrals": Referral,
    "procedures": Procedure,
    "test-results": TestResult,
    "chief-complains": ChiefComplaint,
    "attachments": Attachment,
    "clinical-notes": ClinicalNote,
    "personal-history": PersonalHistory,
    "feedbacks": Feedback,
    "meals": Meal,
};
