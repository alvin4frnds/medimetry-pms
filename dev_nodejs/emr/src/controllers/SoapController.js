"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var PastMedication_1 = require("./../database/models/PastMedication");
"use strict";
var Statics_1 = require("../helpers/Statics");
var typeorm_1 = require("typeorm");
var AuthMiddleware_1 = require("./middlewares/AuthMiddleware");
var DatabaseConfiguration_1 = require("../config/DatabaseConfiguration");
var SOAPRepository_1 = require("../database/repository/SOAPRepository");
var Soap_1 = require("../database/models/Soap");
var ChiefComplaint_1 = require("../database/models/ChiefComplaint");
var Examination_1 = require("../database/models/Examination");
var Vital_1 = require("../database/models/Vital");
var Diagnosis_1 = require("../database/models/Diagnosis");
var Medication_1 = require("../database/models/Medication");
var Investigation_1 = require("../database/models/Investigation");
var Referral_1 = require("../database/models/Referral");
var Procedure_1 = require("../database/models/Procedure");
var TestResult_1 = require("../database/models/TestResult");
var HttpRequest_1 = require("../helpers/HttpRequest");
var Attachment_1 = require("../database/models/Attachment");
var S3_1 = require("../config/S3");
var Term_1 = require("../database/models/Term");
var ClinicalNotes_1 = require("../database/models/ClinicalNotes");
var PastIllness_1 = require("../database/models/PastIllness");
var ShadowSave_1 = require("./middlewares/ShadowSave");
var Router = require('./Router');
var Config_1 = require("../config/Config");
var PersonalHistory_1 = require("../database/models/PersonalHistory");
var Meals_1 = require("../database/models/Meals");
var TermsRepository_1 = require("../database/repository/TermsRepository");
var ConsultationStatus_1 = require("../database/models/ConsultationStatus");
var Feedback_1 = require("../database/models/Feedback");
var AuditLog_1 = require("../database/models/AuditLog");
var SoapController = /** @class */ (function (_super) {
    __extends(SoapController, _super);
    function SoapController(routePath, app) {
        var _this_1 = _super.call(this, routePath, app) || this;
        _this_1._dbConn = DatabaseConfiguration_1.db.connection();
        _this_1._db = DatabaseConfiguration_1.db;
        _this_1._request = new HttpRequest_1.HttpRequest();
        _this_1._config = Config_1.config;
        SoapController.URL_CLASS_MAPPING = {
            "examinations": Examination_1.Examination,
            "vitals": Vital_1.Vitals,
            "diagnosis": Diagnosis_1.Diagnosis,
            "medications": Medication_1.Medication,
            "investigations": Investigation_1.Investigation,
            "referrals": Referral_1.Referral,
            "procedures": Procedure_1.Procedure,
            "test-results": TestResult_1.TestResult,
            "chief-complains": ChiefComplaint_1.ChiefComplaint,
            "attachments": Attachment_1.Attachment,
            "clinical-notes": ClinicalNotes_1.ClinicalNote,
            "personal-history": PersonalHistory_1.PersonalHistory,
            "meals": Meals_1.Meal,
            "feedbacks": Feedback_1.Feedback,
        };
        return _this_1;
    }
    /**
     * Allows to add middlewares, directly to all routes inside a controller.
     *
     * @returns {[(req:Request, res:Response, next:NextFunction)=>Promise<Response>]}
     */
    SoapController.prototype.preMiddlewares = function () { return [AuthMiddleware_1.AuthMiddleware]; };
    SoapController.prototype.postMiddlewares = function () { return [ShadowSave_1.ShadowSave]; };
    Object.defineProperty(SoapController.prototype, "services", {
        /**
         * All the routes in this controller
         *
         * @returns Object as (url: function)
         */
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Takes a post id, create soap, and responds
     * Soap is root for saving all the visit information
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    SoapController.prototype.createSoap = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.body.id)
                            return [2 /*return*/, res.send(this.build("Missing required id"))];
                        return [4 /*yield*/, this.createSoapByPostId(req, res, req.body.id)];
                    case 1:
                        soap = _a.sent();
                        return [2 /*return*/, res.send(this.build("new soap created: ", 1, { soap: soap }))];
                }
            });
        });
    };
    /**
     * Based on the component 'type' given in url, fetches the entities
     * matching to 'soapId' sent in url
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    SoapController.prototype.getEntities = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var relations, soap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.soap)
                            return [2 /*return*/, res.send(this.build("Missing soapid"))];
                        relations = (["diagnosis", "investigations", "procedures", "test-results"].indexOf(req.params.type) > -1)
                            ? ["term"] : [];
                        return [4 /*yield*/, SoapController.URL_CLASS_MAPPING[req.params.type].repo().find({
                                where: { soap_id: req.params.soap },
                                relations: relations
                                // relations: [req.params.type.replace("-", "_")]
                            })];
                    case 1:
                        soap = _a.sent();
                        res.send(this.build("here you go", 1, {
                            rows: soap
                        }, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Based on the component 'type' given in url, matching to 'soapId' sent in urlParam
     * creates entity, and returns the same
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    SoapController.prototype.createEntity = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, entity, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.soap)
                            return [2 /*return*/, res.send(this.build("Missing soapid"))];
                        return [4 /*yield*/, (new SOAPRepository_1.SOAPRepository())
                                .repo().findOne(req.params.soap)];
                    case 1:
                        soap = _a.sent();
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.CreateEntities, {
                                soap: req.params.soap,
                            })];
                    case 2:
                        _a.sent();
                        if (!SoapController.URL_CLASS_MAPPING[req.params.type])
                            return [2 /*return*/];
                        entity = this.newEntityObjectFromSoap(req.params.type, req.user.user_id, soap);
                        for (key in req.body)
                            entity[key] = req.body[key];
                        return [4 /*yield*/, this.createTermBeforeEntities(req.params.type, req.user.user_id, entity)];
                    case 3:
                        // special cases:
                        // 1. for referrals fill 'procedure_term_id' based on 'procedure'
                        entity = _a.sent();
                        if (!((req.params.type === "test-results")
                            && entity.type
                            && (["image", "download"].indexOf(entity.type) > -1))) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.sendNotification(soap, { type: "testresults", entity: entity })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, SoapController.URL_CLASS_MAPPING[req.params.type]
                            .repo().save(entity)];
                    case 6:
                        entity = _a.sent();
                        return [2 /*return*/, res.send(this.build("Created: ", 1, { row: entity }, req))];
                }
            });
        });
    };
    SoapController.prototype.createTermBeforeEntities = function (type, doctorId, entity) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, term, attachment, term, resp_1, resp2_1, term, term, resp_2, attachment, resp, resp2, uniqueMeal;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = type;
                        switch (_a) {
                            case "referrals": return [3 /*break*/, 1];
                            case "test-results": return [3 /*break*/, 4];
                            case 'investigations': return [3 /*break*/, 10];
                            case 'procedures': return [3 /*break*/, 13];
                            case 'diagnosis': return [3 /*break*/, 13];
                            case 'chief-complains': return [3 /*break*/, 20];
                            case 'medications': return [3 /*break*/, 26];
                            case 'meals': return [3 /*break*/, 29];
                        }
                        return [3 /*break*/, 31];
                    case 1:
                        if (!entity.procedure) return [3 /*break*/, 3];
                        return [4 /*yield*/, Term_1.Term.createFromText(entity.procedure, "procedure", doctorId)];
                    case 2:
                        term = _b.sent();
                        entity.procedure_term_id = entity["procedure_term_id"] = term["id"];
                        _b.label = 3;
                    case 3: return [3 /*break*/, 32];
                    case 4:
                        if (!(entity.type && (["image", "download"].indexOf(entity.type) > -1))) return [3 /*break*/, 7];
                        return [4 /*yield*/, Attachment_1.Attachment.repo().findOne({ where: { url: entity.test_result, soap_id: entity.soap.id } })];
                    case 5:
                        attachment = _b.sent();
                        if (!attachment) return [3 /*break*/, 7];
                        attachment.soap_section_type = "test-results";
                        return [4 /*yield*/, Attachment_1.Attachment.repo().save(attachment)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        if (!entity.term_text) return [3 /*break*/, 9];
                        return [4 /*yield*/, Term_1.Term.createFromText(entity.term_text, "test", doctorId)];
                    case 8:
                        term = _b.sent();
                        entity.term_id = entity["term_id"] = term["id"];
                        _b.label = 9;
                    case 9: return [3 /*break*/, 32];
                    case 10:
                        if (!entity.term_text) return [3 /*break*/, 13];
                        return [4 /*yield*/, this._request.seRequest("api/v2/prescription-terms", {
                                "doctor_id": doctorId,
                                "type": entity.category,
                                "name": entity.term_text
                            })];
                    case 11:
                        resp_1 = _b.sent();
                        return [4 /*yield*/, this._request.seRequest('api/v1/drug-db/store-unverified', {
                                "type": entity.category,
                                "name": entity.term_text,
                                "doctor_id": doctorId,
                            })];
                    case 12:
                        resp2_1 = _b.sent();
                        _b.label = 13;
                    case 13:
                        if (!entity.term_text) return [3 /*break*/, 15];
                        return [4 /*yield*/, Term_1.Term.createFromText(entity.term_text, type, doctorId)];
                    case 14:
                        term = _b.sent();
                        entity.term_id = entity["term_id"] = term["id"];
                        _b.label = 15;
                    case 15:
                        if (!entity["diagnosis"]) return [3 /*break*/, 17];
                        return [4 /*yield*/, Term_1.Term.createFromText(entity["diagnosis"], type, doctorId)];
                    case 16:
                        term = _b.sent();
                        entity.term = term;
                        entity.term_id = entity["term_id"] = term["id"];
                        _b.label = 17;
                    case 17:
                        if (!(type == 'diagnosis')) return [3 /*break*/, 19];
                        return [4 /*yield*/, this._request.seRequest("api/v2/prescription-terms", {
                                "doctor_id": doctorId,
                                "type": "diagnosis",
                                "name": entity.diagnosis
                            })];
                    case 18:
                        resp_2 = _b.sent();
                        _b.label = 19;
                    case 19: return [3 /*break*/, 32];
                    case 20:
                        if (!(entity.type && (["image", "download"].indexOf(entity.type) > -1))) return [3 /*break*/, 23];
                        return [4 /*yield*/, Attachment_1.Attachment.repo().findOne({ where: { url: entity.complaint, soap_id: entity.soap.id } })];
                    case 21:
                        attachment = _b.sent();
                        if (!attachment) return [3 /*break*/, 23];
                        attachment.soap_section_type = "chief-complains";
                        return [4 /*yield*/, Attachment_1.Attachment.repo().save(attachment)];
                    case 22:
                        _b.sent();
                        _b.label = 23;
                    case 23:
                        if (!(entity.type && (entity.type == "text"))) return [3 /*break*/, 25];
                        return [4 /*yield*/, Term_1.Term.createFromText(entity.complaint, "chief-complains", doctorId)];
                    case 24:
                        _b.sent();
                        _b.label = 25;
                    case 25: return [3 /*break*/, 32];
                    case 26: return [4 /*yield*/, this._request.seRequest("api/v2/doctors/medicines/create", {
                            "wp_uid": doctorId,
                            "name": entity.drug_name,
                            "meal": entity.intake,
                            "instructions": entity.remarks,
                            "frequency": entity.frequency,
                            "duration_unit": entity.duration_unit,
                            "duration": entity.duration,
                            "dosage": entity.drug_dosage,
                            "dosage_unit": entity.drug_dosage_unit,
                        })];
                    case 27:
                        resp = _b.sent();
                        return [4 /*yield*/, this._request.seRequest('api/v1/drug-db/store-unverified', {
                                "type": 'medication',
                                "name": entity.drug_name,
                                "doctor_id": doctorId,
                                "meta": entity,
                            })];
                    case 28:
                        resp2 = _b.sent();
                        return [3 /*break*/, 32];
                    case 29: return [4 /*yield*/, this._request.seRequest("api/v1/drug-db/put/meal", {
                            "name": entity.name,
                            "quantity_unit": entity.quantity_unit,
                        })];
                    case 30:
                        uniqueMeal = _b.sent();
                        entity["unique_meal_id"] = uniqueMeal['meal'].id;
                        Term_1.Term.createFromText(entity.quantity_unit, "meal-quantity-unit", entity.doctor_id);
                        return [3 /*break*/, 32];
                    case 31: return [3 /*break*/, 32];
                    case 32: return [2 /*return*/, entity];
                }
            });
        });
    };
    /**
     * Based on the component 'type' given in url, matching to 'soapId' sent in urlParam
     * updates entity, and returns the same
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    SoapController.prototype.updateEntity = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var uniqueId, entity, uniqueMeal, _a, _b, _i, key, newTerm;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!req.params.soap)
                            return [2 /*return*/, res.send(this.build("Missing soapid"))];
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.UpdateEntities, {
                                soap: req.params.soap,
                            })];
                    case 1:
                        _c.sent();
                        uniqueId = req.params.id || req.body.id;
                        if (!!uniqueId) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createEntity(req, res)];
                    case 2: return [2 /*return*/, _c.sent()];
                    case 3: return [4 /*yield*/, SoapController.URL_CLASS_MAPPING[req.params.type]
                            .repo().findOne({ where: { id: uniqueId } })];
                    case 4:
                        entity = _c.sent();
                        if (!entity)
                            return [2 /*return*/, res.send(this.build("Couldn't find, with given creteria"))];
                        if (!(req.params.type == 'meals')) return [3 /*break*/, 7];
                        return [4 /*yield*/, this._request.seRequest("api/v1/drug-db/put/meal", {
                                "name": req.body.name,
                                "quantity_unit": req.body.quantity_unit,
                            })];
                    case 5:
                        uniqueMeal = _c.sent();
                        entity["unique_meal_id"] = uniqueMeal['meal'].id;
                        return [4 /*yield*/, Term_1.Term.createFromText(req.body.quantity_unit, "meal-quantity-unit", req.body.doctor_id)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        _a = [];
                        for (_b in req.body)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 8;
                    case 8:
                        if (!(_i < _a.length)) return [3 /*break*/, 12];
                        key = _a[_i];
                        if (["id", "term_id"].indexOf(key) > -1)
                            return [3 /*break*/, 11];
                        if (!(["term_text", "diagnosis"].indexOf(key) > -1)) return [3 /*break*/, 10];
                        return [4 /*yield*/, Term_1.Term.createFromText(req.body[key], req.params.type, req.user.user_id)];
                    case 9:
                        newTerm = _c.sent();
                        entity["term_id"] = newTerm["id"];
                        entity["term"] = newTerm;
                        entity[key] = req.body[key];
                        return [3 /*break*/, 11];
                    case 10:
                        entity[key] = req.body[key];
                        _c.label = 11;
                    case 11:
                        _i++;
                        return [3 /*break*/, 8];
                    case 12:
                        // #308: updated_at column not updating
                        entity["updated_at"] = new Date();
                        return [4 /*yield*/, SoapController.URL_CLASS_MAPPING[req.params.type]
                                .repo().save(entity)];
                    case 13:
                        entity = _c.sent();
                        return [2 /*return*/, res.send(this.build("Saved successfully ", 1, { row: entity }))];
                }
            });
        });
    };
    /**
     * Based on the component 'type' given in url, matching to 'soapId' sent in urlParam
     * Deletes entity, and returns the same
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    SoapController.prototype.deleteEntity = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var uniqueId, entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.soap)
                            return [2 /*return*/, res.send(this.build("Missing soapid"))];
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.DeleteEntity, {
                                soap: req.params.soap,
                            })];
                    case 1:
                        _a.sent();
                        uniqueId = req.params.id || req.body.id;
                        if (uniqueId === "all")
                            return [2 /*return*/];
                        return [4 /*yield*/, SoapController.URL_CLASS_MAPPING[req.params.type]
                                .repo().findOne({ where: { id: uniqueId } })];
                    case 2:
                        entity = _a.sent();
                        if (!entity)
                            return [2 /*return*/, res.send(this.build("Entry doesn't exist"))];
                        return [4 /*yield*/, this.deleteAttachedAttachmentRows(entity, req.params.type)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, SoapController.URL_CLASS_MAPPING[req.params.type]
                                .repo().delete(entity.id)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Deleted successfully ", 1, { row: entity }, req))];
                }
            });
        });
    };
    SoapController.prototype.deleteAttachedAttachmentRows = function (entity, type) {
        return __awaiter(this, void 0, void 0, function () {
            var attachment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!((["chief-complains", "test-results"].indexOf(type) > -1)
                            && entity.type
                            && (["image", "download"].indexOf(entity.type) > -1))) return [3 /*break*/, 3];
                        return [4 /*yield*/, Attachment_1.Attachment.repo().findOne({
                                where: {
                                    soap_id: entity.soap_id,
                                    url: entity.complaint || entity.test_result,
                                }
                            })];
                    case 1:
                        attachment = _a.sent();
                        if (!attachment) return [3 /*break*/, 3];
                        return [4 /*yield*/, Attachment_1.Attachment.repo().delete(attachment.id)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * if soap not found return will be success 0, message “soap not found”
     * if soap not managed by this doctor return will be success 0, message “Not authorized, owned by ($drname)”
     * if any entities (e.g. chief-complain / diagnosis) not found return will be success 1 message “no entities present”
     * deletes all entities returns success 1 message “deleted successfully”
     * soapId: all numeric generated soap id
     */
    SoapController.prototype.deleteAllEntities = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, allChiefComplain, deletionPromises;
            var _this_1 = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.soap)
                            return [2 /*return*/, res.send(this.build("Missing soapid"))];
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.DeleteAllEntities, {
                                soap: req.params.soap,
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (new SOAPRepository_1.SOAPRepository())
                                .repo().findOne({ where: { id: req.params.soap } })];
                    case 2:
                        soap = _a.sent();
                        return [4 /*yield*/, SoapController.URL_CLASS_MAPPING[req.params.type]
                                .repo().find({ where: { soap: req.params.soap } })];
                    case 3:
                        allChiefComplain = _a.sent();
                        if (!allChiefComplain.length)
                            return [2 /*return*/, res.send(this.build("No entities present", 1, {}, req))];
                        deletionPromises = [];
                        allChiefComplain.forEach(function (entity) {
                            deletionPromises.push(_this_1.deleteAttachedAttachmentRows(entity, req.params.type));
                        });
                        return [4 /*yield*/, Promise.all(deletionPromises)];
                    case 4:
                        _a.sent();
                        allChiefComplain.map(function (entity) {
                            return entity.id;
                        }).forEach(function (entityId) {
                            SoapController.URL_CLASS_MAPPING[req.params.type]
                                .repo().delete(entityId);
                        });
                        return [2 /*return*/, res.send(this.build("Delete all entities", 1, { rows: allChiefComplain }, req))];
                }
            });
        });
    };
    /**
     * Suggests chief-complains for autocomplete
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    SoapController.prototype.suggestChiefComplains = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var suggestions, uniqueNames;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Term_1.Term.repo().createQueryBuilder("terms")
                            .where("doctor_id = :user_id and term_type = 'chief-complains' and term_name ilike :search", {
                            user_id: req.user.user_id,
                            search: "%" + req.params.search + "%"
                        })
                            .getMany()];
                    case 1:
                        suggestions = _a.sent();
                        uniqueNames = [];
                        suggestions.filter(function (suggestion) {
                            if (uniqueNames.indexOf(suggestion.term_body.toLowerCase().trim()) > -1)
                                return false;
                            uniqueNames.push(suggestion.term_body.toLowerCase().trim());
                            return true;
                        });
                        res.send(this.build("here you go!", 1, { suggestions: suggestions }, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    SoapController.prototype.suggestMealQuantityUnit = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var suggestions, uniqueNames;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (new TermsRepository_1.TermsRepository()).getTerms('meal-quantity-unit', req.params.search)];
                    case 1:
                        suggestions = _a.sent();
                        uniqueNames = [];
                        suggestions.filter(function (suggestion) {
                            if (uniqueNames.indexOf(suggestion.term_body.toLowerCase().trim()) > -1)
                                return false;
                            uniqueNames.push(suggestion.term_body.toLowerCase().trim());
                            return true;
                        });
                        res.send(this.build("here you go!", 1, { suggestions: suggestions }, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    SoapController.prototype.suggestExaminationOrgans = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var suggestions;
            return __generator(this, function (_a) {
                suggestions = Examination_1.Examination.getFilteredOrgans(req.params.query || "");
                res.send(this.build("here you go!", 1, { suggestions: suggestions }, req));
                return [2 /*return*/];
            });
        });
    };
    SoapController.prototype.suggestIcd10Codes = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.query)
                            return [2 /*return*/, res.send(this.build("Missing required fields"))];
                        if (req.params.query.length < 3)
                            return [2 /*return*/, res.send(this.build("Should be atleast 3 characters", 0, {
                                    matches: []
                                }, req))];
                        return [4 /*yield*/, this._request.seRequest("api/v2/standards/icd10/search/" + req.params.query)];
                    case 1:
                        response = _a.sent();
                        res.send(this.build(response['message'], response['success'], {
                            matches: response['matches'] || [],
                            terms: response['terms'] || []
                        }, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    SoapController.prototype.suggestMedicines = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, matches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.query)
                            return [2 /*return*/, res.send(this.build("Missing required fields"))];
                        if (req.params.query.length < 2)
                            return [2 /*return*/, res.send(this.build("Should be atleast 2 characters", 0, {
                                    matches: []
                                }, req))];
                        timestamp = new Date().getTime();
                        return [4 /*yield*/, this._request.seRequest("api/v3/doctors/medicines/search/" + req.params.query + "?deprecated=no", {}, {
                                token: req.user.access_token
                            })];
                    case 1:
                        matches = _a.sent();
                        res.send(this.build("Here you go", 1, {
                            matches: matches || [],
                            timestamp: timestamp,
                        }, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    SoapController.prototype.suggestMeals = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var matches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.query)
                            return [2 /*return*/, res.send(this.build("Missing required fields"))];
                        if (req.params.query.length < 3)
                            return [2 /*return*/, res.send(this.build("Should be atleast 3 characters", 0, {
                                    matches: []
                                }, req))];
                        return [4 /*yield*/, this._request.seRequest("api/v1/drug-db/search/meals/" + req.params.query, {}, {
                                token: req.user.access_token
                            })];
                    case 1:
                        matches = _a.sent();
                        res.send(this.build("Here you go", 1, {
                            matches: matches['rows'] || []
                        }, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    SoapController.prototype.suggestInvestigations = function (req, res, next, typeOfInvestigation) {
        if (typeOfInvestigation === void 0) { typeOfInvestigation = 'both'; }
        return __awaiter(this, void 0, void 0, function () {
            var endurl, matches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.query)
                            return [2 /*return*/, res.send(this.build("Missing required fields"))];
                        endurl = "api/v3/standards/loinc/search/" + req.params.query + "?type=" + typeOfInvestigation + "&deprecated=no";
                        return [4 /*yield*/, this._request.seRequest(endurl, {}, {
                                token: req.user.access_token
                            })];
                    case 1:
                        matches = _a.sent();
                        return [2 /*return*/, res.send(this.build("Here you go", 1, {
                                matches: matches["matches"] || [],
                                terms: matches['terms'] || []
                            }, req))];
                }
            });
        });
    };
    /**
     * Wrappers for suggestInvestigation distinguished for 'path' and 'radio'
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void|boolean|Response|void|boolean|Response>}
     */
    SoapController.prototype.suggestPathInvestigations = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.suggestInvestigations(req, res, next, 'pathology')];
            });
        });
    };
    SoapController.prototype.suggestRadioInvestigations = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.suggestInvestigations(req, res, next, 'radiology')];
            });
        });
    };
    SoapController.prototype.viewSoap = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, count, consultationRow, consultationTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.soap)
                            return [2 /*return*/, res.send(this.build("Missing soapid"))];
                        return [4 /*yield*/, Soap_1.Soap.getFullById(req.params.soap)];
                    case 1:
                        soap = _a.sent();
                        return [4 /*yield*/, Soap_1.Soap.repo()
                                .createQueryBuilder()
                                .where('patient_id = :patient and active = true', {
                                patient: soap.patient_id
                            })
                                .select('COUNT(*)', 'count')
                                .getRawOne()];
                    case 2:
                        count = _a.sent();
                        return [4 /*yield*/, this._db.wpdb("select * from medi_consultation where code = '" + soap.consultation_code + "' limit 0, 1")];
                    case 3:
                        consultationRow = _a.sent();
                        consultationTime = soap.created_at;
                        if (consultationRow && consultationRow[0] && consultationRow[0]["created"])
                            consultationTime = new Date(consultationRow[0]["created"]);
                        soap["consultationTime"] = consultationTime;
                        return [2 /*return*/, res.send(this.build("Here you go!", 1, { soap: soap, count: count.count, consultationTime: consultationTime }, req))];
                }
            });
        });
    };
    SoapController.prototype.updateRemarkFollowUp = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.soap)
                            return [2 /*return*/, res.send(this.build("Missing soapid"))];
                        return [4 /*yield*/, (new SOAPRepository_1.SOAPRepository())
                                .repo().findOne(req.params.soap)];
                    case 1:
                        soap = _a.sent();
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.UpdateRemarkFollowup, {
                                soap: req.params.soap,
                            })];
                    case 2:
                        _a.sent();
                        if (!soap)
                            return [2 /*return*/, res.send(this.build("Soap not found"))];
                        if (req.body.follow_up && (req.body.follow_up.split(" ").length < 2))
                            req.body.follow_up = req.body.follow_up + " Day(s)";
                        if (!(req.body.follow_up
                            && ((soap.remark != req.body.remark) || (soap.follow_up != req.body.follow_up))
                            && (req.body.follow_up.split(" ").length === 2)
                            && (['Day(s)', 'Week(s)', 'Month(s)'].indexOf(req.body.follow_up.split(" ")[1]) > -1))) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.sendNotification(soap, {
                                type: "followup",
                                remarks: req.body.remark,
                                followup: req.body.follow_up
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        soap.remark = req.body.remark;
                        soap.follow_up = req.body.follow_up;
                        return [4 /*yield*/, (new SOAPRepository_1.SOAPRepository())
                                .repo().save(soap)];
                    case 5:
                        soap = _a.sent();
                        return [2 /*return*/, res.send(this.build("Saved successfully: ", 1, { soap: soap }, req))];
                }
            });
        });
    };
    /**
     * Bulk update, basically the functionality of 'save-all' button
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    SoapController.prototype.updateSoap = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, _this;
            var _this_1 = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.soap)
                            return [2 /*return*/, res.send(this.build("Missing soapid"))];
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.UpdateSoap, {
                                soap: req.params.soap,
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (new SOAPRepository_1.SOAPRepository())
                                .repo().findOne(req.params.soap)];
                    case 2:
                        soap = _a.sent();
                        console.debug("The soap i am saving to: ", soap);
                        if (!soap)
                            return [2 /*return*/, res.send(this.build("Soap not found"))];
                        if (!(req.body.remark || req.body.follow_up)) return [3 /*break*/, 4];
                        soap.remark = req.body.remark;
                        soap.follow_up = req.body.follow_up;
                        return [4 /*yield*/, (new SOAPRepository_1.SOAPRepository())
                                .repo()
                                .save(soap)
                                .then(Statics_1.StaticHelpers.doNothingOnError)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _this = this;
                        Object.keys(SoapController.URL_CLASS_MAPPING).forEach(function (componentType) { return __awaiter(_this_1, void 0, void 0, function () {
                            var soapRelation, clinicalNote, soapKeyNameAsDb_1;
                            var _this_1 = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        soapRelation = Soap_1.Soap.urlTypeParamToRelationNames(componentType);
                                        if (!(componentType === "clinical-notes")) return [3 /*break*/, 2];
                                        return [4 /*yield*/, ClinicalNotes_1.ClinicalNote.repo().findOne({ where: { soap: soap } })];
                                    case 1:
                                        clinicalNote = _a.sent();
                                        if (clinicalNote)
                                            req.body[soapRelation]["id"] = clinicalNote["id"];
                                        _a.label = 2;
                                    case 2:
                                        if (["vitals", "clinical_notes", "clinical-notes"].indexOf(componentType) > -1 && !req.body[soapRelation][0]) {
                                            req.body[soapRelation] = [req.body[soapRelation]];
                                        }
                                        if (req.body[soapRelation] && req.body[soapRelation].length) {
                                            soapKeyNameAsDb_1 = SoapController.convertForMappings(soapRelation);
                                            req.body[soapRelation].forEach(function (data) { return __awaiter(_this_1, void 0, void 0, function () {
                                                var found, key, entity, key;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (!data["id"]) return [3 /*break*/, 3];
                                                            return [4 /*yield*/, SoapController.URL_CLASS_MAPPING[componentType]
                                                                    .repo().findOne({
                                                                    where: { id: data["id"] }
                                                                })];
                                                        case 1:
                                                            found = _a.sent();
                                                            if (!found) return [3 /*break*/, 3];
                                                            for (key in data) {
                                                                if (["created_at", "updated_at"].indexOf(key) > -1)
                                                                    continue;
                                                                found[key] = data[key];
                                                            }
                                                            console.debug("Updating: ", found);
                                                            return [4 /*yield*/, SoapController.URL_CLASS_MAPPING[componentType]
                                                                    .repo()
                                                                    .save(found)
                                                                    .then(Statics_1.StaticHelpers.doNothingOnError)];
                                                        case 2: return [2 /*return*/, _a.sent()];
                                                        case 3:
                                                            entity = _this.newEntityObjectFromSoap(soapKeyNameAsDb_1, req.user.user_id, soap);
                                                            for (key in data) {
                                                                if (["created_at", "updated_at"].indexOf(key) > -1)
                                                                    continue;
                                                                entity[key] = data[key];
                                                            }
                                                            return [4 /*yield*/, _this.createTermBeforeEntities(soapKeyNameAsDb_1, req.user.user_id, entity)];
                                                        case 4:
                                                            _a.sent();
                                                            entity["patient_id"] = soap.patient_id;
                                                            console.debug("Inserting: ", entity);
                                                            if ((componentType == "vitals") && !entity.vital_information)
                                                                return [2 /*return*/];
                                                            return [4 /*yield*/, SoapController.URL_CLASS_MAPPING[componentType]
                                                                    .repo()
                                                                    .save(entity)
                                                                    .then(Statics_1.StaticHelpers.doNothingOnError)];
                                                        case 5:
                                                            _a.sent();
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); });
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Soap_1.Soap.getFullById(req.params.soap)];
                    case 5:
                        soap = _a.sent();
                        return [2 /*return*/, res.send(this.build("Updated Successfully", 1, { soap: soap }, req))];
                }
            });
        });
    };
    SoapController.convertForMappings = function (key) {
        if (key === "chief_complaints")
            return "chief-complains";
        if (key === "clinical_notes")
            return "clinical-notes";
        return key;
    };
    SoapController.prototype.uploadAttachment = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, fileObject, fileUrl, entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.soap)
                            return [2 /*return*/, res.send(this.build("Missing soapid"))];
                        return [4 /*yield*/, (new SOAPRepository_1.SOAPRepository())
                                .repo().findOne(req.params.soap)];
                    case 1:
                        soap = _a.sent();
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.UploadAttachment, {
                                soap: req.params.soap,
                            })];
                    case 2:
                        _a.sent();
                        if (!req.files.file)
                            return [2 /*return*/, res.send(this.build("Missing required file: on key 'file'"))];
                        fileObject = req.files.file;
                        return [4 /*yield*/, S3_1.uploader.uploadFromData(fileObject)];
                    case 3:
                        fileUrl = _a.sent();
                        req.params.type = "attachments";
                        entity = this.newEntityObjectFromSoap(req.params.type, req.user.user_id, soap);
                        entity.attachment_type = fileObject.mimetype;
                        if (req.body.type)
                            entity.soap_section_type = req.body.type;
                        entity.url = fileUrl;
                        entity.meta = {};
                        return [4 /*yield*/, SoapController.URL_CLASS_MAPPING[req.params.type]
                                .repo().save(entity)];
                    case 4:
                        entity = _a.sent();
                        return [2 /*return*/, res.send(this.build("Created: ", 1, { row: entity }, req))];
                }
            });
        });
    };
    SoapController.prototype.createAttachment = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, imageData, fileObject, fileUrl, entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.soap)
                            return [2 /*return*/, res.send(this.build("Missing soapid"))];
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.CreateAttachment, {
                                soap: req.params.soap,
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (new SOAPRepository_1.SOAPRepository())
                                .repo().findOne(req.params.soap)];
                    case 2:
                        soap = _a.sent();
                        if (!req.body.file)
                            return [2 /*return*/, res.send(this.build("Missing required file: on key 'file'"))];
                        imageData = Buffer.from(req.body.file.replace("data:image/png;base64,", "").replace(" ", "+"), 'base64');
                        fileObject = {
                            name: Date.now() + ".png",
                            mimetype: "image/png",
                            data: imageData,
                            size: imageData.byteLength
                        };
                        return [4 /*yield*/, S3_1.uploader.uploadFromData(fileObject)];
                    case 3:
                        fileUrl = _a.sent();
                        req.params.type = "attachments";
                        entity = this.newEntityObjectFromSoap(req.params.type, req.user.user_id, soap);
                        entity.attachment_type = fileObject.mimetype;
                        if (req.body.type)
                            entity.soap_section_type = req.body.type;
                        entity.url = fileUrl;
                        entity.meta = {};
                        return [4 /*yield*/, SoapController.URL_CLASS_MAPPING[req.params.type]
                                .repo().save(entity)];
                    case 4:
                        entity = _a.sent();
                        return [2 /*return*/, res.send(this.build("Created: ", 1, { row: entity }, req))];
                }
            });
        });
    };
    SoapController.prototype.createTerm = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var seResp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.body.type || !req.body.name)
                            return [2 /*return*/, res.send(this.build("Missing required fields."))];
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.CreateTerm)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._request.seRequest("api/v2/prescription-terms", {
                                doctor_id: req.user.user_id,
                                type: req.body.type,
                                name: req.body.name
                            })];
                    case 2:
                        seResp = _a.sent();
                        return [2 /*return*/, res.send(this.build(seResp["message"], seResp["success"], {
                                term: seResp['term']
                            }, req))];
                }
            });
        });
    };
    SoapController.prototype.listPreviousSoaps = function (req, res, take, except) {
        if (take === void 0) { take = 3; }
        if (except === void 0) { except = null; }
        return __awaiter(this, void 0, void 0, function () {
            var skip, soaps, consultationCodes, consultationCodesString, consultations, pobjects, postIds, postIdsString, posts, _loop_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.patientId)
                            return [2 /*return*/, res.send(this.build("Missing required feilds"))];
                        take = take || 3;
                        skip = ((req.params.page || 1) - 1) * 3;
                        return [4 /*yield*/, (new SOAPRepository_1.SOAPRepository()).repo().find({
                                order: { id: "DESC" }, skip: skip, take: take,
                                where: {
                                    patient_id: req.params.patientId,
                                    id: typeorm_1.Not(except),
                                    active: true
                                },
                                relations: Object.keys(SoapController.URL_CLASS_MAPPING)
                                    .map(Soap_1.Soap.urlTypeParamToRelationNames)
                                    .concat(["investigations.term", "procedures.term", "diagnosis.term", "test_results.term"])
                            })];
                    case 1:
                        soaps = _a.sent();
                        consultationCodes = [];
                        soaps.forEach(function (soap) {
                            consultationCodes.push("'" + soap.consultation_code + "'");
                        });
                        soaps = soaps.map(function (soap) {
                            ["investigations", "procedures", "diagnosis", "test_results"].forEach(function (relation) {
                                soap[relation] = (soap[relation] || []).map(function (entity) {
                                    if (entity.term)
                                        entity["term_text"] = entity.term.term_body || "";
                                    return entity;
                                });
                            });
                            soap["diagnosis"] = (soap["diagnosis"] || []).map(function (entity) {
                                if (entity.term)
                                    entity["diagnosis"] = entity.term.term_body || "";
                                return entity;
                            });
                            return soap;
                        });
                        if (!consultationCodes.length)
                            res.send(this.build("No previous soaps found: ", 1, { soaps: [] }, req));
                        consultationCodesString = consultationCodes.join(", ");
                        return [4 /*yield*/, this._db.wpdb("select * from medi_consultation where code in (" + consultationCodesString + ")")];
                    case 2:
                        consultations = _a.sent();
                        return [4 /*yield*/, this._db.wpdb("select * from medi_pobject where code in (" + consultationCodesString + ")")];
                    case 3:
                        pobjects = _a.sent();
                        postIds = [];
                        pobjects.forEach(function (pobject) {
                            postIds.push(pobject["post_id"]);
                        });
                        postIdsString = postIds.join(", ");
                        return [4 /*yield*/, this._db.wpdb("select * from medi_posts where ID in (" + postIdsString + ")")];
                    case 4:
                        posts = _a.sent();
                        _loop_1 = function (i) {
                            var soap = soaps[i];
                            var consultation = consultations.filter(function (consultation) {
                                return consultation["code"] == soap.consultation_code;
                            })[0];
                            var pobject = pobjects.filter(function (pobject) {
                                return pobject["code"] == soap.consultation_code;
                            })[0];
                            var post = posts.filter(function (post) {
                                return post["ID"] == pobject["post_id"];
                            })[0];
                            soap["consultation"] = consultation;
                            soap["pobject"] = pobject;
                            soap["post"] = post;
                            soaps[i] = soap;
                        };
                        for (i = 0; i < soaps.length; i++) {
                            _loop_1(i);
                        }
                        return [2 /*return*/, res.send(this.build("Here you go!", 1, { soaps: soaps }, req))];
                }
            });
        });
    };
    SoapController.prototype.newEntityObjectFromSoap = function (type, doctorId, soap) {
        // console.debug("Creating entity for type: ", type, SoapController.URL_CLASS_MAPPING[type]);
        var entity = new SoapController.URL_CLASS_MAPPING[type]();
        SoapController.SOAP_COMMON_PROPERTIES.forEach(function (property) {
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
    };
    SoapController.prototype.createPastIllness = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var created;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.SavePastIllness, {
                            patient: req.body.patientId,
                        })];
                    case 1:
                        _a.sent();
                        if (!req.body.patientId || !req.body.remark)
                            return [2 /*return*/, res.send(this.build("MIssing required fields"))];
                        return [4 /*yield*/, PastIllness_1.PastIllness.repo().save({
                                "patient_id": req.body.patientId,
                                "remark": req.body.remark
                            })];
                    case 2:
                        created = _a.sent();
                        return [2 /*return*/, res.send(this.build("created Successfully", 1, { row: created }, req))];
                }
            });
        });
    };
    SoapController.prototype.createPastMedication = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var created;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.SavePastMedications, {
                            patient: req.body.patientId,
                        })];
                    case 1:
                        _a.sent();
                        if (!req.body.patientId || !req.body.remark)
                            return [2 /*return*/, res.send(this.build("MIssing required fields"))];
                        return [4 /*yield*/, PastMedication_1.PastMedication.repo().save({
                                "patient_id": req.body.patientId,
                                "remark": req.body.remark
                            })];
                    case 2:
                        created = _a.sent();
                        return [2 /*return*/, res.send(this.build("created Successfully", 1, { row: created }, req))];
                }
            });
        });
    };
    SoapController.prototype.deletePastIllness = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PastIllness_1.PastIllness.repo().findOne(req.params.id)];
                    case 1:
                        row = _a.sent();
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.DeletePastIllness, {
                                previous: row,
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, PastIllness_1.PastIllness.repo().delete(req.params.id)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Deleted successfully", 1, { row: row }, req))];
                }
            });
        });
    };
    SoapController.prototype.deletePastMedication = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PastMedication_1.PastMedication.repo().findOne(req.params.id)];
                    case 1:
                        row = _a.sent();
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.DeletePastMedications, {
                                previous: row,
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, PastMedication_1.PastMedication.repo().delete(req.params.id)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Deleted successfully", 1, { row: row }, req))];
                }
            });
        });
    };
    SoapController.prototype.listPreviousSoapsV2 = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                req.params.patientId = req.body.patientId;
                req.params.page = req.body.page;
                return [2 /*return*/, this.listPreviousSoaps(req, res, 15, req.body.except)];
            });
        });
    };
    SoapController.prototype.getPreviousMedications = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, previousSoapId, previousMedication, previousMedications;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Soap_1.Soap.repo().findOne({
                            where: { id: req.params.soap }
                        })];
                    case 1:
                        soap = _a.sent();
                        if (!soap)
                            return [2 /*return*/, res.send(this.build("Invalid soap"))];
                        return [4 /*yield*/, Medication_1.Medication.repo()
                                .createQueryBuilder()
                                .where("soap_id < :soap and patient_id = :patient", {
                                soap: soap.id,
                                patient: soap.patient_id,
                            })
                                .orderBy('soap_id', "DESC")
                                .getOne()];
                    case 2:
                        previousSoapId = _a.sent();
                        if (!previousSoapId)
                            return [2 /*return*/, res.send(this.build("Previous medications not found"))];
                        return [4 /*yield*/, Medication_1.Medication.repo()
                                .findOne({
                                where: { id: previousSoapId.id },
                                relations: ['soap']
                            })];
                    case 3:
                        previousMedication = _a.sent();
                        return [4 /*yield*/, Medication_1.Medication.repo()
                                .createQueryBuilder()
                                .where("soap_id = :soap", {
                                soap: previousMedication.soap.id
                            })
                                .getMany()];
                    case 4:
                        previousMedications = _a.sent();
                        return [2 /*return*/, res.send(this.build("Here you go!", 1, {
                                rows: previousMedications
                            }))];
                }
            });
        });
    };
    SoapController.prototype.getPreviousMeals = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, previousSoapId, previousMeal, previousMeals;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Soap_1.Soap.repo().findOne({
                            where: { id: req.params.soap }
                        })];
                    case 1:
                        soap = _a.sent();
                        if (!soap)
                            return [2 /*return*/, res.send(this.build("Invalid soap"))];
                        return [4 /*yield*/, Meals_1.Meal.repo()
                                .createQueryBuilder()
                                .where("soap_id < :soap and patient_id = :patient", {
                                soap: soap.id,
                                patient: soap.patient_id,
                            })
                                .orderBy('soap_id', "DESC")
                                .getOne()];
                    case 2:
                        previousSoapId = _a.sent();
                        if (!previousSoapId)
                            return [2 /*return*/, res.send(this.build("Previous meals not found"))];
                        return [4 /*yield*/, Meals_1.Meal.repo()
                                .findOne({
                                where: { id: previousSoapId.id },
                                relations: ['soap']
                            })];
                    case 3:
                        previousMeal = _a.sent();
                        return [4 /*yield*/, Meals_1.Meal.repo()
                                .createQueryBuilder()
                                .where("soap_id = :soap", {
                                soap: previousMeal.soap.id
                            })
                                .getMany()];
                    case 4:
                        previousMeals = _a.sent();
                        return [2 /*return*/, res.send(this.build("Here you go!", 1, {
                                rows: previousMeals
                            }))];
                }
            });
        });
    };
    SoapController.prototype.createSoapByPostId = function (req, res, postId) {
        return __awaiter(this, void 0, void 0, function () {
            var post, pobject, consultation, patient, createdAt, theValues, foundSoaps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DatabaseConfiguration_1.db.wpdb("select * from medi_posts where ID = " + postId)];
                    case 1:
                        post = (_a.sent())[0];
                        return [4 /*yield*/, DatabaseConfiguration_1.db.wpdb("select * from medi_pobject where post_id = " + postId + " order by start_date desc")];
                    case 2:
                        pobject = (_a.sent())[0];
                        return [4 /*yield*/, DatabaseConfiguration_1.db.wpdb("select * from medi_consultation where code = '" + pobject.code + "'")];
                    case 3:
                        consultation = (_a.sent())[0];
                        return [4 /*yield*/, DatabaseConfiguration_1.db.wpdb("select * from medi_patients where id = " + consultation.patient_id)];
                    case 4:
                        patient = (_a.sent())[0];
                        createdAt = pobject.start_date ? (new Date(pobject.start_date)) : new Date;
                        theValues = {
                            "soap_code": Statics_1.StaticHelpers.strRandom(32),
                            "consultation_code": pobject.code,
                            "patient_id": patient.id,
                            "meta": {},
                            "created_by": req.user.user_id,
                            "center_code": patient.center_code,
                            "uuid": patient.id + "/" + post.post_author + "/" + consultation.channel_id,
                            "created_at": createdAt,
                            "updated_at": createdAt,
                        };
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.CreateSoap, {
                                code: pobject.code,
                            })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, Soap_1.Soap.getRepo().find({ where: { consultation_code: pobject.code } })];
                    case 6:
                        foundSoaps = _a.sent();
                        if (foundSoaps.length)
                            return [2 /*return*/, foundSoaps[0]];
                        return [4 /*yield*/, (new SOAPRepository_1.SOAPRepository()).save(theValues)];
                    case 7: 
                    // if not lets create new one
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SoapController.prototype.previewPrescription = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, _a, prescriptionData, postId, resp, argumentsForCostCalculation, calculations;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Soap_1.Soap.getFullById(req.params.soapId)];
                    case 1:
                        soap = _b.sent();
                        _a = soap;
                        return [4 /*yield*/, Soap_1.Soap.appendMedicationSalts(soap.medications)];
                    case 2:
                        _a.medications = _b.sent();
                        return [4 /*yield*/, this.convertSoapToPrescriptionData(soap)];
                    case 3:
                        prescriptionData = _b.sent();
                        return [4 /*yield*/, this._db.wpdb("select post_id from medi_pobject where code = '" + soap.consultation_code + "' limit 0, 1")];
                    case 4:
                        postId = _b.sent();
                        if (postId && postId[0] && postId[0]["post_id"])
                            postId = postId[0]["post_id"];
                        return [4 /*yield*/, this._request.coreRequest('previewPrescription', {
                                'data': prescriptionData,
                                'userId': req.user.user_id,
                                'deviceId': this._config.get('defaultDeviceId', 'emr'),
                                'encrypted': req.user.encrypted,
                                'to': soap.uuid.split("/")[1],
                                'postId': postId,
                            }, true)];
                    case 5:
                        resp = _b.sent();
                        argumentsForCostCalculation = [];
                        prescriptionData.radiologyInvestigations.forEach(function (investigationName) {
                            argumentsForCostCalculation.push({
                                name: investigationName,
                                type: "radiology",
                            });
                        });
                        prescriptionData.pathologyInvestigations.forEach(function (investigationName) {
                            argumentsForCostCalculation.push({
                                name: investigationName,
                                type: "pathology",
                            });
                        });
                        prescriptionData.medication.forEach(function (medication) {
                            argumentsForCostCalculation.push({
                                type: "medication",
                                name: medication.rawName,
                                perDay: medication.perDay,
                                forDays: medication.forDays,
                                sos: medication.sos,
                            });
                        });
                        return [4 /*yield*/, this._request.seRequest('api/v1/drug-db/calculate', argumentsForCostCalculation, {
                                token: req.user.access_token
                            })];
                    case 6:
                        calculations = _b.sent();
                        res.send(this.build("Here you go!", 1, {
                            "html": resp,
                            "calc": calculations,
                        }));
                        return [2 /*return*/];
                }
            });
        });
    };
    SoapController.prototype.sendPrescription = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, _a, prescriptionData, postId, resp, attachment, resp2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.PrescriptionSend, {
                            soap: req.params.soapId,
                        })];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, Soap_1.Soap.getFullById(req.params.soapId)];
                    case 2:
                        soap = _b.sent();
                        _a = soap;
                        return [4 /*yield*/, Soap_1.Soap.appendMedicationSalts(soap.medications)];
                    case 3:
                        _a.medications = _b.sent();
                        return [4 /*yield*/, this.convertSoapToPrescriptionData(soap)];
                    case 4:
                        prescriptionData = _b.sent();
                        return [4 /*yield*/, this._db.wpdb("select post_id from medi_pobject where code = '" + soap.consultation_code + "' limit 0, 1")];
                    case 5:
                        postId = _b.sent();
                        if (postId && postId[0] && postId[0]["post_id"])
                            postId = postId[0]["post_id"];
                        return [4 /*yield*/, this._request.self('api/v1/consultations/mark-done/' + soap.consultation_code)];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, this._request.coreRequest('createPrescription', {
                                'data': prescriptionData,
                                'userId': req.user.user_id,
                                'deviceId': this._config.get('defaultDeviceId', 'emr'),
                                'encrypted': req.user.encrypted,
                                'to': soap.uuid.split("/")[1],
                                'postId': postId,
                            }, true)];
                    case 7:
                        resp = _b.sent();
                        if (!(req.params.attachToCurrentSoap && resp['url'] && resp['url'].length)) return [3 /*break*/, 9];
                        attachment = new Attachment_1.Attachment;
                        attachment.soap = soap;
                        attachment.patient_id = soap.patient_id;
                        attachment.doctor_id = soap.created_by;
                        attachment.attachment_type = 'image/jpeg';
                        attachment.url = resp['url'];
                        attachment.meta = JSON.parse('{"from": "treatmentPlan"}');
                        attachment.soap_section_type = "prescription";
                        return [4 /*yield*/, Attachment_1.Attachment.repo().save(attachment)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        if (!(resp && resp['url'] && resp['url'].length)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.sendNotification(soap, { postId: postId, type: "prescription", meta: { url: resp['url'] } })];
                    case 10:
                        _b.sent();
                        _b.label = 11;
                    case 11:
                        if (!(req.body.closeConsult && (req.body.closeConsult == 1))) return [3 /*break*/, 13];
                        return [4 /*yield*/, this._request.coreRequest('expire-consultation', {
                                'userId': req.user.user_id,
                                'deviceId': this._config.get('defaultDeviceId', 'emr'),
                                'postId': postId,
                                'encrypted': req.user.encrypted,
                            }, true)];
                    case 12:
                        resp2 = _b.sent();
                        return [2 /*return*/, res.send(this.build("Prescription sent, & consultation closed successfully.", 1, {
                                resp: resp, resp2: resp2
                            }))];
                    case 13: return [2 /*return*/, res.send(this.build("Prescription sent successfully.", 1, {
                            resp: resp
                        }))];
                }
            });
        });
    };
    /**
     * Kind of wrapper function to send notifications through Se.Medimetry panel
     * this function, i am assuming should be called in every case for notifications.
     *
     * @param {Soap}   soap  Whose regarding we are creating the notification ( required )
     * @param {[type]} extra Any extra options, one might want to send {
     *     "type", "postId" ( required )
     * }
     */
    SoapController.prototype.sendNotification = function (soap, extra) {
        return __awaiter(this, void 0, void 0, function () {
            var patient, consultationRow, postId, userId, channelSettings, notificationTitle, notificationDescription, notificationMeta, notificationTexts, key, params, followUpDate, dayBefore, dayAfter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._db.wpdb("select * from medi_patients where id = '" + soap.patient_id + "'")];
                    case 1:
                        patient = (_a.sent())[0];
                        return [4 /*yield*/, this._db.wpdb("select * from medi_consultation where code = '" + soap.consultation_code + "'")];
                    case 2:
                        consultationRow = (_a.sent())[0];
                        if (!extra["type"])
                            extra["type"] = "notification";
                        if (!!extra["postId"]) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._db.wpdb("select post_id from medi_pobject where code = '" + soap.consultation_code + "' limit 0, 1")];
                    case 3:
                        postId = _a.sent();
                        if (postId && postId[0] && postId[0]["post_id"])
                            postId = postId[0]["post_id"];
                        extra["postId"] = postId;
                        _a.label = 4;
                    case 4:
                        userId = patient.user_id;
                        return [4 /*yield*/, this._db.wpdb("select * from medi_postmeta where post_id = " + extra["postId"] + " and meta_key = 'channel_settings'")];
                    case 5:
                        channelSettings = _a.sent();
                        if (channelSettings && channelSettings[0] && channelSettings[0]["meta_value"]) {
                            channelSettings = Statics_1.StaticHelpers.unserialize(channelSettings[0]["meta_value"]);
                            if (channelSettings["affiliate_code"])
                                userId = channelSettings["affiliate_code"].split('+')[1];
                        }
                        notificationTitle = "notification title";
                        notificationDescription = "description of the notification";
                        notificationMeta = extra['meta'] || {};
                        notificationTexts = {
                            "prescription": {
                                "title": "Prescription generated for patient '" + patient.name + "'",
                                "description": "from PMS, click for more information",
                                "meta": { translations: {
                                        hindi: {
                                            "title": " '" + patient.name + "' \u0915\u0947 \u0932\u093F\u090F \u092A\u0930\u094D\u091A\u0947 \u092C\u0928 \u0917\u090F \u0939\u0948\u0964",
                                            "description": "\u0905\u0927\u093F\u0915 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0915\u0947 \u0932\u093F\u090F \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902\u0964"
                                        }
                                    } }
                            },
                            "testresults": {
                                "title": patient.name + "'s lab reports have arrived",
                                "description": "from doctor's assistant, click to view reports",
                                "meta": { extra: extra["entity"], translations: {
                                        hindi: {
                                            "title": patient.name + " \u0915\u0940 \u0932\u0948\u092C \u0930\u093F\u092A\u094B\u0930\u094D\u091F \u0906 \u0917\u0908 \u0939\u0948\u0964",
                                            "description": "\u0930\u093F\u092A\u094B\u0930\u094D\u091F \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902\u0964",
                                        }
                                    } }
                            },
                            "followup": {
                                "title": patient.name + "'s follow-up reminder",
                                "description": extra["remarks"] ? "Dr. says: " + extra["remarks"] : "",
                                "meta": { remark: extra["remarks"], translations: {
                                        hindi: { "title": patient.name + " \u0915\u094B \u0921\u0949\u0915\u094D\u091F\u0930 \u0938\u0947 \u092C\u093E\u0924 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u092F\u093E\u0926 \u0926\u093F\u0932\u093E\u090F\u0902\u0964",
                                            "description": extra["remarks"] ? "\u0921\u0949 \u0928\u0947 \u0915\u0939\u093E \u0925\u093E: " + extra["remarks"] : ""
                                        }
                                    } }
                            }
                        };
                        if (extra["type"] && notificationTexts[extra["type"]]) {
                            notificationTitle = notificationTexts[extra["type"]]["title"] || notificationTitle;
                            notificationDescription = notificationTexts[extra["type"]]["description"] || notificationDescription;
                            if (notificationTexts[extra['type']]['meta']) {
                                for (key in notificationTexts[extra['type']]['meta']) {
                                    notificationMeta[key] = notificationTexts[extra['type']]['meta'][key];
                                }
                            }
                        }
                        params = {
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
                                followUpDate = Statics_1.StaticHelpers.daysDurationToMySqlDate(extra["followup"], soap.created_at);
                                dayBefore = new Date(followUpDate);
                                dayBefore.setDate(dayBefore.getDate() - 1);
                                dayAfter = new Date(followUpDate);
                                dayAfter.setDate(dayAfter.getDate() + 1);
                                params["due_at"] = "" + dayBefore.toISOString() + ", " + followUpDate.toISOString() + ", " + dayAfter.toISOString();
                                break;
                            default: break;
                        }
                        return [4 /*yield*/, this._request.seRequest('api/v1/notifications/partner-notification/partnerapp-' + extra["type"], params)];
                    case 6: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SoapController.prototype.convertHabitToText = function (type, value) {
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
    };
    SoapController.prototype.convertSoapToPrescriptionData = function (soap) {
        return __awaiter(this, void 0, void 0, function () {
            var prescriptionData, vitals, info, pastMedications, durationUnitValueMapping;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prescriptionData = {
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
                        prescriptionData.chiefComplains = soap.chief_complaints.map(function (row) { return row.complaint; });
                        prescriptionData.referrals = soap.referrals.map(function (row) { return row.remarks; });
                        prescriptionData.procedures = soap.procedures.map(function (row) { return row.term_text; });
                        if (soap.vitals && soap.vitals.vital_information) {
                            vitals = soap.vitals.vital_information;
                            if (vitals["BP(S)"] && vitals["BP(D)"])
                                prescriptionData.vitals.push("BP: " + vitals["BP(S)"] + " / " + vitals["BP(D)"]);
                            if (vitals["Pulse"])
                                prescriptionData.vitals.push("Pulse: " + vitals["Pulse"] + " bpm");
                            if (vitals["Temp (F)"])
                                prescriptionData.vitals.push("Body Temprature: " + vitals["Temp (F)"] + " deg f");
                            if (vitals["Height(ft)"] && vitals["Height(in)"])
                                prescriptionData.vitals.push("Height: " + vitals["Height(ft)"] + "' " + vitals["Height(in)"] + "\"");
                            if (vitals["Weight (kg)"])
                                prescriptionData.vitals.push("Weight: " + vitals["Weight (kg)"] + " kg");
                            if (vitals["Random Sugar"])
                                prescriptionData.vitals.push("Sugar: " + vitals["Random Sugar"] + " mg/dl (random)");
                            if (vitals["Fasting Sugar"])
                                prescriptionData.vitals.push("Sugar: " + vitals["Fasting Sugar"] + " mg/dl (fasting)");
                            if (vitals["Post Prandial Sugar"])
                                prescriptionData.vitals.push("Sugar: " + vitals["Post Prandial Sugar"] + " mg/dl (post-parandial)");
                            if (vitals["Oxygen Saturation"])
                                prescriptionData.vitals.push("Oxygen saturation: " + vitals["Oxygen Saturation"] + "%");
                            if (vitals["Respiratory  Rate"])
                                prescriptionData.vitals.push("Respiratory rate: " + vitals["Respiratory  Rate"] + " bpm");
                            if (vitals["Head Circumference"])
                                prescriptionData.vitals.push("Head circumference: " + vitals["Head Circumference"] + " cm");
                            if (vitals["BMI"])
                                prescriptionData.vitals.push("BMI: " + vitals["BMI"] + " kg/m");
                        }
                        if (soap.personal_history && soap.personal_history.info) {
                            info = soap.personal_history.info;
                            if (info["lifeStyle"])
                                prescriptionData.habits.push("Lifestyle: " + info["lifeStyle"]);
                            if (info["smokingHabit"])
                                prescriptionData.habits.push("Smoking: " + this.convertHabitToText("smokingHabit", info["smokingHabit"]));
                            if (info["drinkingHabit"])
                                prescriptionData.habits.push("Drinking: " + this.convertHabitToText("drinkingHabit", info["drinkingHabit"]));
                        }
                        return [4 /*yield*/, PastMedication_1.PastMedication.repo()
                                .createQueryBuilder()
                                .where("patient_id = :patient", { patient: soap.patient_id })
                                .getMany()];
                    case 1:
                        pastMedications = _a.sent();
                        prescriptionData.pastMedications = pastMedications.map(function (row) { return row.remark; });
                        soap.investigations.forEach(function (investigation) {
                            if (investigation && investigation.term && investigation.term.term_body) { }
                            else
                                return;
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
                        soap.diagnosis.forEach(function (diagnosis) {
                            if (diagnosis && diagnosis.term && diagnosis.term.term_body) { }
                            else
                                return;
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
                        durationUnitValueMapping = {
                            "Day(s)": 1,
                            "Week(s)": 7,
                            "Month(s)": 30,
                        };
                        soap.medications.forEach(function (medication) {
                            var dosage = (medication.drug_dosage && medication.drug_dosage_unit
                                && (medication.drug_dosage_unit != 'null')
                                && (medication.drug_dosage != '0')) ? "( " + medication.drug_dosage + " " + medication.drug_dosage_unit + " )" : "";
                            var duration = (medication.duration && medication.duration_unit
                                && (medication.duration_unit != 'null')
                                && (medication.duration != '0')) ? medication.duration + " " + medication.duration_unit : "";
                            var frequency = Statics_1.StaticHelpers.extractMedicationFrequency(parseInt(medication.frequency), true);
                            var medicationObject = {
                                "name": medication.drug_name + " " + dosage,
                                "dosage": frequency + " For " + duration + " " + medication.intake,
                                "precaution": medication.remarks,
                                "rawName": medication.drug_name,
                                "salts": (medication.salts || []).join(" + "),
                                "perDay": (frequency.match(/1/g) || []).length,
                                "sos": !!(frequency.toLowerCase().match(/sos/g) || []).length,
                                "forDays": parseInt(medication.duration) * (durationUnitValueMapping[medication.duration_unit] || 1),
                            };
                            prescriptionData.medication.push(medicationObject);
                        });
                        console.log("prescriptionData: ", prescriptionData);
                        return [2 /*return*/, prescriptionData];
                }
            });
        });
    };
    SoapController.prototype.getPreviousSoapVitals = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, previousVitals;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Soap_1.Soap.repo()
                            .createQueryBuilder()
                            .where("id = :soap", {
                            soap: req.params.soap,
                        })
                            .getOne()];
                    case 1:
                        soap = _a.sent();
                        if (!soap)
                            return [2 /*return*/, res.send(this.build("Soap not found"))];
                        return [4 /*yield*/, Vital_1.Vitals.repo()
                                .createQueryBuilder()
                                .where("patient_id = :patient and soap_id < :soap", {
                                patient: soap.patient_id,
                                soap: req.params.soap,
                            })
                                .orderBy('id', 'DESC')
                                .getOne()];
                    case 2:
                        previousVitals = _a.sent();
                        if (!previousVitals)
                            return [2 /*return*/, res.send(this.build("Previous soap not found"))];
                        return [2 /*return*/, res.send(this.build("Here you go", 1, {
                                vitals: previousVitals
                            }))];
                }
            });
        });
    };
    SoapController.prototype.removeSoapFromListing = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.DeleteSoap, {
                            soap: req.params.soap,
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Soap_1.Soap.repo().findOne({
                                where: {
                                    id: req.params.soap
                                }
                            })];
                    case 2:
                        soap = _a.sent();
                        if (!soap)
                            return [2 /*return*/, res.send(this.build("Soap not found"))];
                        soap.active = false;
                        return [4 /*yield*/, Soap_1.Soap.repo().save(soap)];
                    case 3:
                        _a.sent();
                        this._dbConn.createQueryBuilder()
                            .update(ConsultationStatus_1.ConsultationStatus)
                            .set({ consultation_modified: new Date, active: false })
                            .where("consultation_code = :code", {
                            code: soap.consultation_code
                        })
                            .execute();
                        return [2 /*return*/, res.send(this.build("Removed", 1))];
                }
            });
        });
    };
    SoapController.prototype.addEmptyFUP = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.SoapController.EmptyFollowupDuration, {
                            soap: req.params.soap,
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Soap_1.Soap.repo().findOne({
                                where: {
                                    id: req.params.soap
                                }
                            })];
                    case 2:
                        soap = _a.sent();
                        if (!soap)
                            return [2 /*return*/, res.send(this.build("Soap not found"))];
                        soap.follow_up = '0 Day(s)';
                        return [4 /*yield*/, Soap_1.Soap.repo().save(soap)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Followup Saved", 1))];
                }
            });
        });
    };
    SoapController.prototype.updateSoapMeta = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSoapFromReq(req)];
                    case 1:
                        soap = _a.sent();
                        if (!soap)
                            return [2 /*return*/, res.send(this.build("Soap not found"))];
                        soap.meta = req.body || {};
                        return [4 /*yield*/, Soap_1.Soap.repo().save(soap)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Meta updated successfully", 1))];
                }
            });
        });
    };
    SoapController.prototype.updateSoapMedicationStock = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, stockRow, stocks, existIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.body.stock)
                            return [2 /*return*/, res.send(this.build("Missing required vars"))];
                        return [4 /*yield*/, this.getSoapFromReq(req)];
                    case 1:
                        soap = _a.sent();
                        stockRow = req.body.stock;
                        stocks = soap.meta.stocks || [];
                        existIndex = Statics_1.StaticHelpers.arraySearch(stocks, "name", stockRow.name);
                        if (existIndex > -1)
                            stocks.splice(existIndex, 1);
                        stocks.push(stockRow);
                        soap.meta['stocks'] = stocks;
                        return [4 /*yield*/, Soap_1.Soap.repo().save(soap)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Saved Successfully", 1, { soap: soap }))];
                }
            });
        });
    };
    SoapController.prototype.getSoapFromReq = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var soap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        soap = null;
                        if (!req.params.soap) return [3 /*break*/, 2];
                        return [4 /*yield*/, Soap_1.Soap.repo().findOne({ where: { id: req.params.soap } })];
                    case 1:
                        soap = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!req.params.code) return [3 /*break*/, 4];
                        return [4 /*yield*/, Soap_1.Soap.repo().findOne({ where: { consultation_code: req.params.code } })];
                    case 3:
                        soap = _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, soap];
                }
            });
        });
    };
    SoapController.URL_CLASS_MAPPING = {};
    /**
     * Properties that will be common, in all soap entities.
     *
     * @type {[string,string,string,string]}
     */
    SoapController.SOAP_COMMON_PROPERTIES = [
        "uuid", "doctor_id", "patient_id", "soap"
    ];
    return SoapController;
}(Router));
exports.SoapController = SoapController;
// in-case the constructor isn't getting called
SoapController.URL_CLASS_MAPPING = {
    "examinations": Examination_1.Examination,
    "vitals": Vital_1.Vitals,
    "diagnosis": Diagnosis_1.Diagnosis,
    "medications": Medication_1.Medication,
    "investigations": Investigation_1.Investigation,
    "referrals": Referral_1.Referral,
    "procedures": Procedure_1.Procedure,
    "test-results": TestResult_1.TestResult,
    "chief-complains": ChiefComplaint_1.ChiefComplaint,
    "attachments": Attachment_1.Attachment,
    "clinical-notes": ClinicalNotes_1.ClinicalNote,
    "personal-history": PersonalHistory_1.PersonalHistory,
    "feedbacks": Feedback_1.Feedback,
    "meals": Meals_1.Meal,
};
