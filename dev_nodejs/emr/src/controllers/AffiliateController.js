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
var Config_1 = require("../config/Config");
var S3_1 = require("../config/S3");
var SoapController_1 = require("./SoapController");
var ConsultationsController_1 = require("./ConsultationsController");
var DatabaseConfiguration_1 = require("../config/DatabaseConfiguration");
var HttpRequest_1 = require("../helpers/HttpRequest");
var User_1 = require("../database/models/User");
var Meals_1 = require("../database/models/Meals");
var Vital_1 = require("../database/models/Vital");
var TestResult_1 = require("../database/models/TestResult");
var PersonalHistory_1 = require("../database/models/PersonalHistory");
var Soap_1 = require("../database/models/Soap");
var Attachment_1 = require("../database/models/Attachment");
var Feedback_1 = require("../database/models/Feedback");
var typeorm_1 = require("typeorm");
var AuditLog_1 = require("../database/models/AuditLog");
var ConsultationStatus_1 = require("../database/models/ConsultationStatus");
var SOAPRepository_1 = require("../database/repository/SOAPRepository");
var Router = require('./Router');
var fs = require('fs');
var AWS = require('aws-sdk');
var AffiliateController = /** @class */ (function (_super) {
    __extends(AffiliateController, _super);
    function AffiliateController(routePath, app) {
        var _this = _super.call(this, routePath, app) || this;
        _this._config = Config_1.config;
        _this._s3 = S3_1.uploader;
        _this._db = DatabaseConfiguration_1.db;
        _this._request = new HttpRequest_1.HttpRequest();
        return _this;
    }
    Object.defineProperty(AffiliateController.prototype, "services", {
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    AffiliateController.prototype.getSugarStripCount = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var sugarStripsCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._config.getOAuthClientKey() != req.query.token.replace("?", "")) // for some reason, there is an extra '?'
                            return [2 /*return*/, res.send(this.build("Not allowed to access", 1, { confir: this._config.getOAuthClientKey(), query: req.query.token }))];
                        return [4 /*yield*/, this.getSugarStripsUsedThisMonthCount(req.params.patient)];
                    case 1:
                        sugarStripsCount = _a.sent();
                        return [2 /*return*/, res.send(this.build("here you go!", 1, { sugarStripsCount: sugarStripsCount }))];
                }
            });
        });
    };
    AffiliateController.prototype.getPreviousSoapVitals = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._config.getOAuthClientKey() != req.headers.token)
                            return [2 /*return*/, res.send(this.build("Not allowed to access"))];
                        return [4 /*yield*/, (new SoapController_1.SoapController("", this.app))
                                .getPreviousSoapVitals(req, res)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AffiliateController.prototype.saveVitals = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var getAccessToken, user, vitals, soap, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (Config_1.config.get("oauthClientKey") != req.body.oauth_token)
                            return [2 /*return*/, res.send(this.build("Invalid or missing token"))];
                        getAccessToken = Config_1.config.get("defaultToken");
                        return [4 /*yield*/, User_1.User.getRepo().createQueryBuilder("user")
                                .where("user.refresh_token = :token")
                                .setParameters({ token: getAccessToken })
                                .orderBy("user.id", "DESC")
                                .getOne()];
                    case 1:
                        user = _a.sent();
                        req.user = user;
                        req.headers.token = user.access_token;
                        req.params.type = "vitals";
                        return [4 /*yield*/, Vital_1.Vitals.repo().createQueryBuilder()
                                .delete()
                                .where('soap_id = :soapId', {
                                soapId: req.params.soap
                            }).execute()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 10, , 11]);
                        return [4 /*yield*/, (new SoapController_1.SoapController("", this.app))
                                .createEntity(req, res)];
                    case 4:
                        vitals = _a.sent();
                        return [4 /*yield*/, Soap_1.Soap.repo().createQueryBuilder()
                                .where("id = :soap", {
                                soap: req.params.soap,
                            })
                                .getOne()];
                    case 5:
                        soap = _a.sent();
                        if (!(req.body['vital_information'] &&
                            req.body['vital_information']['Random Sugar'] &&
                            (parseInt(req.body['vital_information']['Random Sugar']) > 150))) return [3 /*break*/, 7];
                        return [4 /*yield*/, this._request.seRequest("internal-api/emr/add-patient-tag", {
                                key: this._config.getOAuthClientKey(),
                                patient: soap.patient_id,
                                tag: "Sugar,Chronic",
                            })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!(req.body['vital_information'] &&
                            req.body['vital_information']['BP(S)'] &&
                            (parseInt(req.body['vital_information']['BP(S)']) > 150))) return [3 /*break*/, 9];
                        return [4 /*yield*/, this._request.seRequest("internal-api/emr/add-patient-tag", {
                                key: this._config.getOAuthClientKey(),
                                patient: soap.patient_id,
                                tag: "B.P.,Chronic",
                            })];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        console.log("Request: ", req.body);
                        console.log("and patientId: ", soap.patient_id);
                        return [3 /*break*/, 11];
                    case 10:
                        e_1 = _a.sent();
                        return [3 /*break*/, 11];
                    case 11: // For: UnhandledPromiseRejectionWarning: Error [ERR_HTTP_HEADERS_SENT]:
                    // Cannot set headers after they are sent to the client
                    return [2 /*return*/, res.send(this.build("Successfully Updated", 1))];
                }
            });
        });
    };
    AffiliateController.prototype.createSoap = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var previousSoap, pobject, user, soap, sugarStripsCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // excluded from shadowSave onPurpose
                        if (!req.params.code)
                            return [2 /*return*/, res.send(this.build("Missing required fields"))];
                        return [4 /*yield*/, Soap_1.Soap.repo()
                                .createQueryBuilder()
                                .where("consultation_code = :code", {
                                code: req.params.code
                            })
                                .getOne()];
                    case 1:
                        previousSoap = _a.sent();
                        if (previousSoap)
                            return [2 /*return*/, res.send(this.build("Found existing", 1, { soap: previousSoap }))];
                        return [4 /*yield*/, this._db.wpdb("select * from medi_pobject where code = '" + req.params.code + "'")];
                    case 2:
                        pobject = _a.sent();
                        if (!pobject.length)
                            return [2 /*return*/, res.send(this.build("pobject not found;"))];
                        pobject = pobject[0];
                        return [4 /*yield*/, User_1.User.getRepo().createQueryBuilder("user")
                                .where("user.refresh_token = :token")
                                .setParameters({ token: this._config.get('defaultToken') })
                                .orderBy("user.id", "DESC")
                                .getOne()];
                    case 3:
                        user = _a.sent();
                        return [4 /*yield*/, (new SoapController_1.SoapController("", this.app))
                                .createSoapByPostId({ user: user }, res, pobject["post_id"])];
                    case 4:
                        soap = _a.sent();
                        return [4 /*yield*/, (new ConsultationsController_1.ConsultationsController("", this.app))
                                .syncConsultationStatus()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.getSugarStripsUsedThisMonthCount(soap.patient_id)];
                    case 6:
                        sugarStripsCount = _a.sent();
                        return [2 /*return*/, res.send(this.build("here you go!", 1, { soap: soap, sugarStripsCount: sugarStripsCount }))];
                }
            });
        });
    };
    AffiliateController.prototype.attachImage = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, pobjectRow, attachment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.body.code)
                            return [2 /*return*/, res.send(this.build("Missing required fields"))];
                        return [4 /*yield*/, Soap_1.Soap.repo().createQueryBuilder()
                                .where('consultation_code = :code', {
                                code: req.body.code
                            }).getOne()];
                    case 1:
                        soap = _a.sent();
                        if (!!soap) return [3 /*break*/, 4];
                        return [4 /*yield*/, DatabaseConfiguration_1.db.wpdb("select * from medi_pobject where code = '" + req.body.code + "' and active = 1 order by id desc")];
                    case 2:
                        pobjectRow = (_a.sent())[0];
                        if (!pobjectRow)
                            return [2 /*return*/, res.send(this.build("Invalid consultation code"))];
                        return [4 /*yield*/, (new SOAPRepository_1.SOAPRepository()).createSoapByPostId(pobjectRow['post_id'])];
                    case 3:
                        soap = _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, Attachment_1.Attachment.repo()
                            .createQueryBuilder()
                            .where('soap_id = :soap and url = :url', {
                            "soap": soap.id,
                            "url": req.body.image,
                        })
                            .getOne()];
                    case 5:
                        // already exists a row with same attachment url in same soap_id, just return.
                        if (!!(_a.sent()))
                            return [2 /*return*/, res.send(this.build("Attachment already exists, but thanks", 1))];
                        attachment = new Attachment_1.Attachment();
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
                        return [4 /*yield*/, Attachment_1.Attachment.repo().save(attachment)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("uploaded successfully", 1))];
                }
            });
        });
    };
    AffiliateController.prototype.getTestReportsBeCode = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, testResults, prescription;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.code)
                            return [2 /*return*/, res.send(this.build("Missing required fields"))];
                        return [4 /*yield*/, Soap_1.Soap.repo().createQueryBuilder()
                                .where('consultation_code = :code', {
                                code: req.params.code
                            }).getOne()];
                    case 1:
                        soap = _a.sent();
                        if (!soap)
                            return [2 /*return*/, res.send(this.build("Invalid consultation code"))];
                        return [4 /*yield*/, TestResult_1.TestResult.repo().createQueryBuilder()
                                .where("soap_id = :soap and type in ('image', 'download')", {
                                soap: soap.id
                            }).getMany()];
                    case 2:
                        testResults = (_a.sent()).map(function (result) {
                            return result.test_result;
                        });
                        return [4 /*yield*/, Attachment_1.Attachment.repo().createQueryBuilder()
                                .where("soap_id = :soap and soap_section_type in ('prescription')", {
                                soap: soap.id
                            }).getMany()];
                    case 3:
                        prescription = (_a.sent())
                            .map(function (row) { return row.url; }) || [];
                        console.log("prescription: ", prescription);
                        return [2 /*return*/, res.send(this.build("here you go", 1, {
                                rows: testResults,
                                prescription: prescription.length ? prescription[0] : "",
                            }))];
                }
            });
        });
    };
    AffiliateController.prototype.saveFeedback = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, feedback;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Soap_1.Soap.repo().findOne({
                            where: { consultation_code: req.params.code }
                        })];
                    case 1:
                        soap = _a.sent();
                        if (!soap)
                            return [2 /*return*/, res.send(this.build("Soap not tracked in EMR"))];
                        feedback = new Feedback_1.Feedback();
                        feedback.consultation_code = soap.consultation_code;
                        feedback.soap = soap;
                        feedback.body = req.body.body;
                        feedback.value = req.body.value;
                        feedback.from = soap.patient_id;
                        feedback.to = soap.created_by;
                        return [4 /*yield*/, Feedback_1.Feedback.repo().save(feedback)];
                    case 2:
                        feedback = _a.sent();
                        return [2 /*return*/, res.send(this.build("Saved Successfully", 1, { feedback: feedback }))];
                }
            });
        });
    };
    AffiliateController.prototype.getConsultations = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var consultationCodes, soaps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._config.getOAuthClientKey() != req.query.token)
                            return [2 /*return*/, res.send(this.build("Not allowed to access"))];
                        if (!req.query.codes)
                            return [2 /*return*/, res.send(this.build("Missing required fields"))];
                        consultationCodes = req.query.codes.split(",");
                        if (!consultationCodes.length)
                            return [2 /*return*/, res.send("Here you go", 1, { soaps: [] })];
                        return [4 /*yield*/, Soap_1.Soap.repo().find({
                                where: {
                                    consultation_code: typeorm_1.In(consultationCodes)
                                },
                                relations: [
                                    "vitals", "attachments"
                                ],
                            })];
                    case 1:
                        soaps = _a.sent();
                        return [2 /*return*/, res.send(this.build("Here you go", 1, { soaps: soaps }))];
                }
            });
        });
    };
    AffiliateController.prototype.updateSoapViaCode = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, key, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (this._config.getOAuthClientKey() != req.query.token)
                            return [2 /*return*/, res.send(this.build("Not allowed to access"))];
                        if (!req.params.code)
                            return [2 /*return*/, res.send(this.build("Missing required fields"))];
                        _a = [];
                        for (_b in req.body)
                            _a.push(_b);
                        _i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        key = _a[_i];
                        _c = key;
                        switch (_c) {
                            case "created_at": return [3 /*break*/, 2];
                        }
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, Soap_1.Soap.repo()
                            .createQueryBuilder()
                            .update(Soap_1.Soap)
                            .set({ created_at: req.body.created_at })
                            .where("consultation_code = :code", {
                            code: req.params.code
                        })
                            .execute()];
                    case 3:
                        _d.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, res.send(this.build("Updated successfully", 1))];
                }
            });
        });
    };
    AffiliateController.prototype.updateSoap = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, key, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        /* await AuditLog.create(req, AuditLog.TYPES.AffiliateController.UpdateSoap, {
                         soap: req.params.soap
                         }); */
                        if (this._config.getOAuthClientKey() != req.query.token)
                            return [2 /*return*/, res.send(this.build("Not allowed to access"))];
                        if (!req.params.soap)
                            return [2 /*return*/, res.send(this.build("Missing required fields"))];
                        _a = [];
                        for (_b in req.body)
                            _a.push(_b);
                        _i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        key = _a[_i];
                        _c = key;
                        switch (_c) {
                            case "created_at": return [3 /*break*/, 2];
                        }
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, Soap_1.Soap.repo()
                            .createQueryBuilder()
                            .update(Soap_1.Soap)
                            .set({ created_at: req.body.created_at })
                            .where("id = :id", {
                            id: req.params.soap
                        })
                            .execute()];
                    case 3:
                        _d.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, res.send(this.build("Updated successfully", 1))];
                }
            });
        });
    };
    AffiliateController.prototype.getSoapByCode = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, sugarStripsCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._config.getOAuthClientKey() != req.query.token)
                            return [2 /*return*/, res.send(this.build("Not allowed to access"))];
                        return [4 /*yield*/, Soap_1.Soap.repo().findOne({
                                where: { consultation_code: req.params.code }
                            })];
                    case 1:
                        soap = _a.sent();
                        if (!soap)
                            return [2 /*return*/, res.send(this.build("Invalid consultation code"))];
                        return [4 /*yield*/, this.getSugarStripsUsedThisMonthCount(soap.patient_id)];
                    case 2:
                        sugarStripsCount = _a.sent();
                        return [4 /*yield*/, Soap_1.Soap.getFullById(soap.id)];
                    case 3:
                        soap = _a.sent();
                        return [2 /*return*/, res.send(this.build("Here you go", 1, {
                                soap: soap,
                                sugarStripsCount: sugarStripsCount,
                            }))];
                }
            });
        });
    };
    AffiliateController.prototype.putDietChart = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, meals, now, i, row, meal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._config.getOAuthClientKey() != req.query.token)
                            return [2 /*return*/, res.send(this.build("Not allowed to access"))];
                        return [4 /*yield*/, Soap_1.Soap.repo().findOne({
                                where: { consultation_code: req.params.code }
                            })];
                    case 1:
                        soap = _a.sent();
                        if (!req.body.dietChart || !req.body.dietChart.length)
                            return [2 /*return*/, res.send(this.build("Diet chart row required."))];
                        return [4 /*yield*/, Meals_1.Meal.repo().createQueryBuilder()
                                .delete()
                                .where("soap_id = :soap", { soap: soap.id })
                                .execute()];
                    case 2:
                        _a.sent();
                        meals = [];
                        now = new Date;
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < req.body.dietChart.length)) return [3 /*break*/, 6];
                        row = req.body.dietChart[i];
                        if (!row['name'])
                            return [3 /*break*/, 5];
                        meal = new Meals_1.Meal();
                        meal.meal_time = row['meal_time'] || 0;
                        meal.name = row['name'];
                        meal.quantity = row['quantity'].split(" ")[0] || 1;
                        meal.quantity_unit = row['quantity_unit'] || "";
                        meal.weekend = req.body.weekend || false;
                        meal.patient_id = soap.patient_id;
                        meal.doctor_id = soap.created_by;
                        meal.soap = soap;
                        meal.unique_meal_id = row['unique_meal_id'];
                        meal.created_at = now;
                        meal.updated_at = now;
                        return [4 /*yield*/, Meals_1.Meal.repo().save(meal)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, res.send(this.build("Saved Successfully", 1))];
                }
            });
        });
    };
    AffiliateController.prototype.putPersonalHistory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, personalHistory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._config.getOAuthClientKey() != req.query.token)
                            return [2 /*return*/, res.send(this.build("Not allowed to access"))];
                        return [4 /*yield*/, Soap_1.Soap.repo().findOne({
                                where: { consultation_code: req.params.code }
                            })];
                    case 1:
                        soap = _a.sent();
                        if (!req.body.personalHistory)
                            return [2 /*return*/, res.send(this.build("Missing required fields"))];
                        return [4 /*yield*/, PersonalHistory_1.PersonalHistory.repo().findOne({
                                where: {
                                    soap: soap,
                                },
                            })];
                    case 2:
                        personalHistory = _a.sent();
                        if (!personalHistory) {
                            personalHistory = new PersonalHistory_1.PersonalHistory();
                            personalHistory.patient_id = soap.patient_id + "";
                            personalHistory.doctor_id = soap.created_by;
                            personalHistory.uuid = soap.uuid;
                            personalHistory.soap = soap;
                        }
                        personalHistory.info = req.body.personalHistory;
                        return [4 /*yield*/, PersonalHistory_1.PersonalHistory.repo().save(personalHistory)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Saved Successfully", 1))];
                }
            });
        });
    };
    AffiliateController.prototype.markConsultationsDone = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var codes, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._config.getOAuthClientKey() != req.query.token)
                            return [2 /*return*/, res.send(this.build("Not allowed to access"))];
                        codes = req.query.codes.split(",");
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < codes.length)) return [3 /*break*/, 5];
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.AffiliateController.MarkConsultationDone, {
                                code: codes[i],
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, ConsultationStatus_1.ConsultationStatus.repo().createQueryBuilder()
                                .update(ConsultationStatus_1.ConsultationStatus)
                                .set({ done: true, consultation_modified: new Date })
                                .where("consultation_code = :code", {
                                code: codes[i]
                            }).execute()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, res.send(this.build("Marked Done successfully", 1))];
                }
            });
        });
    };
    AffiliateController.prototype.disableLoggedInSessions = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var wpuserid, defaultToken, queryStatement, queryResp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._config.getOAuthClientKey() != req.body.token)
                            return [2 /*return*/, res.send(this.build("Not allowed to access"))];
                        wpuserid = parseInt(req.params.uid);
                        defaultToken = this._config.get("defaultToken", "");
                        queryStatement = "UPDATE users SET access_token = CONCAT('dump', access_token) WHERE user_id = '" + wpuserid + "' AND refresh_token != '" + defaultToken + "'";
                        return [4 /*yield*/, User_1.User.repo().query(queryStatement)];
                    case 1:
                        queryResp = _a.sent();
                        return [2 /*return*/, res.send("All tokens updated.")];
                }
            });
        });
    };
    AffiliateController.prototype.getSugarStripsUsedThisMonthCount = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var today, query, sugarCounts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        today = new Date();
                        query = "select count(*) as counts from vitals where patient_id = " + patientId + " and date(created_at) > '" + today.getFullYear() + "-" + (today.getMonth() + 1) + "-01' and ( vital_information::jsonb->>'Random Sugar' != '' or vital_information::jsonb->>'Fasting Sugar' != '' or vital_information::jsonb->>'Post Prandial Sugar' != '' );";
                        return [4 /*yield*/, this._db.connection().query(query)];
                    case 1:
                        sugarCounts = _a.sent();
                        return [2 /*return*/, parseInt((sugarCounts[0] || {})['counts'] || 0)];
                }
            });
        });
    };
    return AffiliateController;
}(Router));
exports.AffiliateController = AffiliateController;
