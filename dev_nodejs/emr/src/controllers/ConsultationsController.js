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
var Router = require('./Router');
var PHPUnserialize = require('php-unserialize');
var DatabaseConfiguration_1 = require("../config/DatabaseConfiguration");
var HttpRequest_1 = require("../helpers/HttpRequest");
var Config_1 = require("../config/Config");
var AuthMiddleware_1 = require("./middlewares/AuthMiddleware");
var Soap_1 = require("../database/models/Soap");
var typeorm_1 = require("typeorm");
var ConsultationStatus_1 = require("../database/models/ConsultationStatus");
var Statics_1 = require("../helpers/Statics");
var SoapController_1 = require("./SoapController");
var ShadowSave_1 = require("./middlewares/ShadowSave");
var AuditLog_1 = require("../database/models/AuditLog");
var SOAPRepository_1 = require("../database/repository/SOAPRepository");
var ConsultationsController = /** @class */ (function (_super) {
    __extends(ConsultationsController, _super);
    /**
     * Initializes, private variables: DB Connection, Config, HTTP Request
     *
     * @param routePath The base url for this controller
     * @param app       The expressJs app, to work on
     */
    function ConsultationsController(routePath, app) {
        var _this = _super.call(this, routePath, app) || this;
        _this._dbConn = DatabaseConfiguration_1.db.connection();
        _this._db = DatabaseConfiguration_1.db;
        _this._config = Config_1.config;
        _this._request = new HttpRequest_1.HttpRequest();
        return _this;
    }
    /**
     * We will be using `Token` based authentication, all over the controller
     *
     * @returns {[(req:Request, res:Response, next:NextFunction)=>Promise<Response>]}
     */
    ConsultationsController.prototype.preMiddlewares = function () { return [AuthMiddleware_1.AuthMiddleware]; };
    ConsultationsController.prototype.postMiddlewares = function () { return [ShadowSave_1.ShadowSave]; };
    Object.defineProperty(ConsultationsController.prototype, "services", {
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    ConsultationsController.prototype.getConsultations = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var params, httpResp, uniqueConsultationCodes, i, soaps, _loop_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            doctor: req.user.user_id,
                            page: req.params.page || 1,
                            key: this._config.get('oauthClientKey'),
                            isAssistant: req.user.user_type == "assistant",
                            date: req.params.date || null
                        };
                        if (params.isAssistant) {
                            params.doctor = req.user.getDoctorIds();
                        }
                        return [4 /*yield*/, this._request.seRequest("internal-api/emr/doctors-consultation-listing", params)];
                    case 1:
                        httpResp = _a.sent();
                        uniqueConsultationCodes = [];
                        for (i = 0; i < httpResp.length; i++)
                            uniqueConsultationCodes.push(httpResp[i]["consultation_code"]);
                        return [4 /*yield*/, Soap_1.Soap.getRepo().find({
                                consultation_code: typeorm_1.In(uniqueConsultationCodes),
                            })];
                    case 2:
                        soaps = _a.sent();
                        _loop_1 = function (i) {
                            var soap = soaps.filter(function (soap) {
                                return httpResp[i]["consultation_code"] == soap.consultation_code;
                            })[0] || false;
                            httpResp[i]["soap_id"] = (soap === false) ? 0 : soap.id;
                        };
                        for (i = 0; i < httpResp.length; i++) {
                            _loop_1(i);
                        }
                        return [2 /*return*/, res.send(this.build("Here you go!", 1, {
                                consultations: httpResp
                            }, req))];
                }
            });
        });
    };
    ConsultationsController.prototype.createPatient = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var httpResp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.ConsultationController.CreatePatient)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._request.coreRequest("create-patient", {
                                name: req.body.name,
                                email: req.body.email,
                                dontSendNotification: this._config.get('shadowSave', false) ? 1 : 0,
                                dob: req.body.dob,
                                mobile: req.body.mobile,
                            })];
                    case 2:
                        httpResp = _a.sent();
                        return [2 /*return*/, res.send(this.build("Here we go", 1, httpResp, req))];
                }
            });
        });
    };
    ConsultationsController.prototype.createConsultation = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var deviceId, dontSendNotif, prefix, today, yearTime, consultation, metaValues, soap, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deviceId = this._config.get("defaultDeviceId");
                        dontSendNotif = this._config.get('shadowSave', false) ? 1 : 0;
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.ConsultationController.CreateConsultation)];
                    case 1:
                        _a.sent();
                        // client is sending me 'address' instead of 'user_address', so adding a patch for that
                        if (!req.body.user_address && req.body.address)
                            req.body.user_address = req.body.address;
                        if (req.body.user_address && !req.body.user_mobile) {
                            prefix = (req.body.user_address.substr(0, 3) || "mmy").toUpperCase();
                            today = new Date;
                            if (["0.0.0.0", "127.0.0.1", "localhost", null].indexOf(this._config.get('host', null)) < 0)
                                today.setTime(today.getTime() + (5.5 * 60 * 60 * 1000)); // only in case of cloudServers
                            yearTime = today.getFullYear() % 100 + ""
                                + Statics_1.StaticHelpers.twoDigits(today.getMonth() + 1)
                                + Statics_1.StaticHelpers.twoDigits(today.getDate())
                                + Statics_1.StaticHelpers.twoDigits(today.getHours())
                                + Statics_1.StaticHelpers.twoDigits(today.getMinutes())
                                + Statics_1.StaticHelpers.twoDigits(today.getSeconds());
                            req.body.user_mobile = prefix + yearTime;
                        }
                        if (!req.body.user_email)
                            req.body.user_email = req.body.user_mobile + "@medimetry.com";
                        if ((req.user.user_type === 'contributor') && !req.body.doctor)
                            req.body.doctor = req.user.user_id;
                        else if ((req.user.user_type === 'assistant') && !req.body.doctor && req.user.meta.doctors.length)
                            req.body.doctor = req.user.meta.doctors[req.user.meta.doctors.length - 1]['doctor_id'];
                        return [4 /*yield*/, this._request.seRequest("internal-api/consultation/create-consultation", {
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
                            })];
                    case 2:
                        consultation = _a.sent();
                        if (!consultation.success)
                            return [2 /*return*/, res.send(consultation)];
                        metaValues = {};
                        soap = {};
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 8, , 9]);
                        if (!consultation.success) return [3 /*break*/, 6];
                        return [4 /*yield*/, (new SoapController_1.SoapController("/temp", this.app))
                                .createSoapByPostId(req, res, consultation.postId)];
                    case 4:
                        soap = _a.sent();
                        metaValues = {
                            "postId": consultation.postId,
                            "code": consultation.code,
                            "txnid": consultation.txnid,
                            "patientId": consultation.viewQuestionReply.patient.id,
                            "soap": soap,
                        };
                        if (!(soap && soap['id'] && req.body.soap_date)) return [3 /*break*/, 6];
                        soap['created_at'] = new Date(req.body.soap_date);
                        return [4 /*yield*/, Soap_1.Soap.repo().save(soap)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [4 /*yield*/, this.syncConsultationStatus()];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        error_1 = _a.sent();
                        console.error("Found error: ", error_1);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/, res.send(this.build(consultation.message, consultation.success, metaValues, req))];
                }
            });
        });
    };
    ConsultationsController.prototype.searchPatient = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var doctorIds, resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        doctorIds = req.query.assigned && (req.query.assigned === "1")
                            ? ConsultationsController.getDoctorsArrayFromAuthToken(req)
                            : "";
                        return [4 /*yield*/, this._request.seRequest("internal-api/emr/search-patients", {
                                query: req.params.query.trim(),
                                center: req.query.center || "",
                                tags: (req.query.tags || "").split(","),
                                page: req.params.page || 1,
                                doctors: doctorIds,
                            })];
                    case 1:
                        resp = _a.sent();
                        res.send(this.build(resp.message, resp.success, {
                            patients: resp.patients,
                            patient: resp.patient
                        }, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    ConsultationsController.prototype.viewConsultation = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var consultation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // checking if, 'doctorId' came in request is legit.
                        if (req.user.user_type === 'assistant' && req.params.doctor) { // in assistant, doctor should be one of the assigned ones
                            if (!req.user.meta.doctors.filter(function (doctor) { return doctor.doctor_id == req.params.doctor; }).length)
                                return [2 /*return*/, res.send(this.build("Doctor ID not found in assistant's assigned doctors."))];
                        }
                        else if (req.user.user_type === 'contributor') { // in doctor, it should always be same
                            if (req.user.user_id != req.params.doctor)
                                return [2 /*return*/, res.send(this.build("Can't open in another doctor's context"))];
                        }
                        else
                            return [2 /*return*/, res.send("More roles handling is not built yet.")];
                        return [4 /*yield*/, this._request.seRequest("internal-api/emr/view-consultation", {
                                key: this._config.get('oauthClientKey'),
                                doctor: req.params.doctor || req.user.user_id,
                                id: req.params.id
                            })];
                    case 1:
                        consultation = _a.sent();
                        res.send(this.build("Here you go", 1, consultation, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    ConsultationsController.prototype.getBindedDoctors = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (req.user.user_type !== 'assistant')
                            return [2 /*return*/, res.send(this.build("Not a doctor's assistant"))];
                        return [4 /*yield*/, this._request.seRequest("internal-api/emr/get-doctors-bindings", {
                                key: this._config.get("oauthClientKey"),
                                assistant: req.user.meta["id"],
                            })];
                    case 1:
                        response = _a.sent();
                        res.send(this.build(response.message, response.success, response, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    ConsultationsController.prototype.putBindedDoctors = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.ConsultationController.SaveDoctorBindings)];
                    case 1:
                        _a.sent();
                        if (req.user.user_type !== 'assistant')
                            return [2 /*return*/, res.send(this.build("Not a doctor's assistant"))];
                        return [4 /*yield*/, this._request.seRequest("internal-api/emr/put-doctors-bindings", {
                                key: this._config.getOAuthClientKey(),
                                assistant: req.user.meta["id"],
                                doctors: req.body.doctors,
                            })];
                    case 2:
                        response = _a.sent();
                        res.send(this.build(response.message, response.success, response, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    ConsultationsController.prototype.closeConsultation = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pobjectRow, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.body.postId || !req.body.doctorId)
                            return [2 /*return*/, res.send(this.build("Missing required fieldds"))];
                        return [4 /*yield*/, this._db.wpdb("select * from medi_pobject where post_id = '" + parseInt(req.body.postId) + "' order by id desc")];
                    case 1:
                        pobjectRow = _a.sent();
                        if (!(pobjectRow && pobjectRow[0] && pobjectRow[0]['code'])) return [3 /*break*/, 3];
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.ConsultationController.CloseConsultation, {
                                code: pobjectRow[0]['code'],
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this._request.seRequest("api/doc", {
                            job: "closeConsultation",
                            postId: req.body.postId,
                            doctorId: req.body.doctorId,
                        })];
                    case 4:
                        response = _a.sent();
                        res.send(this.build(response.message, response.success, {}, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    ConsultationsController.prototype.getDoctorAvailablity = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (req.user.user_type !== "contributor")
                            return [2 /*return*/, res.send(this.build("Not a doctor"))];
                        return [4 /*yield*/, this._request.seRequest("internal-api/emr/get-doctor-availablity", {
                                key: this._config.getOAuthClientKey(),
                                doctor: req.user.user_id,
                            })];
                    case 1:
                        response = _a.sent();
                        res.send(this.build(response.message, response.success, {
                            available: response.available
                        }, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    ConsultationsController.prototype.setDoctorAvailablity = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (req.user.user_type !== "contributor")
                            return [2 /*return*/, res.send(this.build("Not a doctor"))];
                        return [4 /*yield*/, this._request.seRequest("internal-api/emr/set-doctor-availablity", {
                                key: this._config.getOAuthClientKey(),
                                doctor: req.user.user_id,
                                available: req.body.available,
                            })];
                    case 1:
                        response = _a.sent();
                        res.send(this.build(response.message, response.success, {
                            available: response.available
                        }, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    ConsultationsController.prototype.assignDoctor = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (req.user.user_type !== "assistant")
                            return [2 /*return*/, res.send(this.build("Not a doctor's assistant"))];
                        if (!req.body.doctorId || !req.body.postId)
                            return [2 /*return*/, res.send(this.build("Missing required feilds"))];
                        return [4 /*yield*/, this._request.seRequest("api/doc", {
                                doctorId: req.body.doctorId,
                                job: "assistantToDoctorAssign",
                                postId: req.body.postId,
                                assistantId: req.user.meta["id"],
                            })];
                    case 1:
                        response = _a.sent();
                        res.send(this.build(response.message, response.success, response, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    ConsultationsController.prototype.getChannelsIAmAssociatedWith = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {};
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
                        return [4 /*yield*/, this._request.seRequest("api/doc", params)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, res.send(this.build(response.message, response.success, response, req))];
                }
            });
        });
    };
    ConsultationsController.prototype.assignBroadcastConsultation = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.body.postId)
                            return [2 /*return*/, res.send(this.build("Missing required feidl"))];
                        if (req.user.user_type !== "contributor")
                            return [2 /*return*/, res.send(this.build("This API is for doctor's only"))];
                        return [4 /*yield*/, this._request.seRequest("internal-api/emr/assign-broadcast-consultation", {
                                key: this._config.getOAuthClientKey(),
                                doctor: req.user.user_id,
                                post: req.body.postId,
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, res.send(this.build(response.message, response.success, response, req))];
                }
            });
        });
    };
    ConsultationsController.prototype.listClosedConsultations = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var TAKE, SKIP, doctorIdString, closedConsultationsCodes, _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        TAKE = 20;
                        SKIP = ((req.params.page || 1) - 1) * TAKE;
                        doctorIdString = ConsultationsController.getDoctorsArrayFromAuthToken(req);
                        return [4 /*yield*/, this._db.wpdbGetColumn("select p.code as code from medi_pobject as p join medi_consultation as c on (p.code = c.code) where p.status = 'closed' and c.user_id in (" + doctorIdString + ") order by end_date desc limit " + SKIP + ", " + TAKE, "code")];
                    case 1:
                        closedConsultationsCodes = _f.sent();
                        _b = (_a = res).send;
                        _c = this.build;
                        _d = ["Here you go!", 1];
                        _e = {};
                        return [4 /*yield*/, this.getConsultationListByCodes(closedConsultationsCodes)];
                    case 2: return [2 /*return*/, _b.apply(_a, [_c.apply(this, _d.concat([(_e.rows = _f.sent(),
                                    _e), req]))])];
                }
            });
        });
    };
    ConsultationsController.getDoctorsArrayFromAuthToken = function (req) {
        var doctorIdsArray = [];
        if (req.user.user_type === "contributor")
            doctorIdsArray = [req.user.user_id];
        else if (req.user.user_type === "assistant")
            doctorIdsArray = req.user.meta.doctors.map(function (doctor) {
                return doctor.doctor_id;
            });
        return doctorIdsArray.map(function (doctor) {
            return "'" + doctor + "'";
        }).join(", ");
    };
    ConsultationsController.prototype.listDoneConsultations = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var doctorIdString, doctorIdsArray, channels, toSendConsultationCodes, rowsToSend;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        doctorIdString = ConsultationsController.getDoctorsArrayFromAuthToken(req);
                        doctorIdsArray = doctorIdString.split(", ").map(function (doctor) { return doctor.substring(1, doctor.length - 1); });
                        if (!doctorIdsArray.length)
                            return [2 /*return*/, res.send(this.build("Doctor's not found"))];
                        channels = (req.user && req.user.meta
                            && req.user.meta.user
                            && req.user.meta.user.channels
                            && req.user.meta.user.channels.length) ? req.user.meta.user.channels : [];
                        return [4 /*yield*/, this.consultationsListQuery(doctorIdsArray, (req.params.page || 1), (req.query.center || ""), true, (req.query.tags.length ? req.query.tags.split(",") : []), channels)];
                    case 1:
                        toSendConsultationCodes = _a.sent();
                        return [4 /*yield*/, this.getConsultationListByCodes(toSendConsultationCodes)];
                    case 2:
                        rowsToSend = _a.sent();
                        rowsToSend.map(function (row) {
                            return row.done = true;
                            return row;
                        });
                        return [2 /*return*/, res.send(this.build("Here you go!", 1, {
                                rows: rowsToSend
                            }, req))];
                }
            });
        });
    };
    ConsultationsController.prototype.getConsultationsByCode = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var rowsToSend;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConsultationListByCodes([req.params.code], { ignoreFutureSoapDates: true })];
                    case 1:
                        rowsToSend = _a.sent();
                        return [2 /*return*/, res.send(this.build("Here you go!", 1, {
                                rows: rowsToSend
                            }, req))];
                }
            });
        });
    };
    ConsultationsController.prototype.listOpenConsultations = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var TAKE, SKIP, doctorIdString, doctorIdsArray, channels, toSendConsultationCodes, rowsToSend;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        TAKE = 20;
                        SKIP = ((req.params.page || 1) - 1) * TAKE;
                        doctorIdString = ConsultationsController.getDoctorsArrayFromAuthToken(req);
                        doctorIdsArray = doctorIdString.split(", ")
                            .map(function (doctor) { return doctor.substring(1, doctor.length - 1); });
                        if (!doctorIdsArray)
                            return [2 /*return*/, res.send(this.build("Doctor's not found"))];
                        return [4 /*yield*/, this.syncConsultationStatus()];
                    case 1:
                        _a.sent();
                        channels = (req.user && req.user.meta
                            && req.user.meta.user
                            && req.user.meta.user.channels
                            && req.user.meta.user.channels.length) ? req.user.meta.user.channels : [];
                        return [4 /*yield*/, this.consultationsListQuery(doctorIdsArray, (req.params.page || 1), (req.query.center || ""), false, (req.query.tags.length ? req.query.tags.split(",") : []), channels)];
                    case 2:
                        toSendConsultationCodes = _a.sent();
                        console.log("toSendConsultationCodes: ", toSendConsultationCodes);
                        return [4 /*yield*/, this.getConsultationListByCodes(toSendConsultationCodes)];
                    case 3:
                        rowsToSend = _a.sent();
                        rowsToSend = rowsToSend.map(function (row) {
                            row.done = false;
                            return row;
                        });
                        rowsToSend = rowsToSend.sort(function (a, b) {
                            if (a["consultation_id"] < b["consultation_id"])
                                return -1;
                            if (a["consultation_id"] > b["consultation_id"])
                                return 1;
                            return 0;
                        });
                        return [2 /*return*/, res.send(this.build("Here you go!", 1, {
                                rows: rowsToSend
                            }, req))];
                }
            });
        });
    };
    ConsultationsController.prototype.consultationsListQuery = function (doctorIds, page, centerCode, isDone, tags, channels) {
        return __awaiter(this, void 0, void 0, function () {
            var TAKE, SKIP, _a, _b, consultationCodes, patientsWhereClauses, consultationRowsPatientId, patientQuery, patientsTake, patientsSkip, patientIds, patientIdStr, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        TAKE = 20;
                        SKIP = ((page || 1) - 1) * TAKE;
                        if (!(tags.length || (centerCode && centerCode.length))) return [3 /*break*/, 1];
                        return [3 /*break*/, 3];
                    case 1:
                        _b = (_a = Statics_1.StaticHelpers).getColumnFromJsonObj;
                        return [4 /*yield*/, ConsultationStatus_1.ConsultationStatus.repo()
                                .createQueryBuilder()
                                .where("active = true and doctor_id in ( " + doctorIds.join(",") + " ) and done = " + (isDone ? 'true' : 'false') + " and created_at < NOW() ")
                                .skip(SKIP).take(TAKE)
                                .orderBy("consultation_id", isDone ? "DESC" : "ASC")
                                .getMany()];
                    case 2: return [2 /*return*/, _b.apply(_a, [_g.sent(), "consultation_code"]) || []];
                    case 3:
                        consultationCodes = [];
                        patientsWhereClauses = [];
                        consultationRowsPatientId = [];
                        if (centerCode && centerCode.length)
                            patientsWhereClauses.push("center_code = '" + centerCode + "' ");
                        if (tags && tags.length)
                            patientsWhereClauses.push("( " + tags.map(function (tag) { return "meta LIKE '%" + tag + "%'"; }).join(" AND ") + " ) ");
                        patientQuery = "SELECT id FROM medi_patients WHERE " + patientsWhereClauses.join(" AND ") + " ORDER BY updated_at DESC  ";
                        patientsTake = TAKE * 5;
                        patientsSkip = Math.floor(page / 5);
                        _g.label = 4;
                    case 4:
                        if (!(consultationCodes.length < 20)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this._db.wpdb(patientQuery + (" LIMIT " + patientsSkip + ", " + patientsTake))];
                    case 5:
                        patientIds = _g.sent();
                        if (!patientIds.length)
                            return [3 /*break*/, 7]; // no point in going forward, no patients found.
                        patientIdStr = patientIds.map(function (row) { return row.id; }).join(",");
                        _d = (_c = consultationCodes).concat;
                        _f = (_e = Statics_1.StaticHelpers).getColumnFromJsonObj;
                        return [4 /*yield*/, ConsultationStatus_1.ConsultationStatus.repo()
                                .createQueryBuilder()
                                .where("active = true and doctor_id in ( " + doctorIds.join(",") + " ) and done = " + (isDone ? 'true' : 'false') + " and patient_id in ( " + patientIdStr + " ) ")
                                .skip(SKIP).take(TAKE)
                                .orderBy("consultation_id", isDone ? "DESC" : "ASC")
                                .getMany()];
                    case 6:
                        consultationCodes = _d.apply(_c, [_f.apply(_e, [(_g.sent()).filter(function (row) {
                                    if (consultationRowsPatientId.indexOf(row['patient_id']) > -1)
                                        return;
                                    consultationRowsPatientId.push(row['patient_id']);
                                    return true;
                                }), "consultation_code"]) || []]);
                        page += 5;
                        patientsSkip = Math.floor(page / 5);
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, consultationCodes];
                }
            });
        });
    };
    ConsultationsController.prototype.syncConsultationStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var maxConsultationId, consultationsAfterLastModified, patientIds, patients, patientIdVsPatient, insertingRows, i, consultation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ConsultationStatus_1.ConsultationStatus.repo().query("select MAX(consultation_id) from consultations_status")];
                    case 1:
                        maxConsultationId = _a.sent();
                        maxConsultationId = maxConsultationId[0]["max"];
                        return [4 /*yield*/, this._db.wpdb("select * from medi_consultation where id > " + maxConsultationId)];
                    case 2:
                        consultationsAfterLastModified = _a.sent();
                        patientIds = Statics_1.StaticHelpers.getColumnFromJsonObj(consultationsAfterLastModified, "patient_id");
                        if (!patientIds.length)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this._db.wpdb("select * from medi_patients where id in ( " + patientIds.join(", ") + " )")];
                    case 3:
                        patients = _a.sent();
                        patientIdVsPatient = {};
                        patients.forEach(function (patient) {
                            patientIdVsPatient[patient['id']] = patient;
                        });
                        insertingRows = [];
                        for (i = 0; i < consultationsAfterLastModified.length; i++) {
                            consultation = consultationsAfterLastModified[i];
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
                        if (!insertingRows.length) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._dbConn.createQueryBuilder()
                                .insert()
                                .into(ConsultationStatus_1.ConsultationStatus)
                                .values(insertingRows)
                                .onConflict("(\"consultation_code\") DO NOTHING")
                                .execute()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 5: return [2 /*return*/, false];
                }
            });
        });
    };
    ConsultationsController.prototype.markConsultationDone = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.ConsultationController.MarkDone, {
                            code: req.params.code
                        })];
                    case 1:
                        _a.sent();
                        this._dbConn.createQueryBuilder()
                            .update(ConsultationStatus_1.ConsultationStatus)
                            .set({ done: true, consultation_modified: new Date })
                            .where("consultation_code = :code", {
                            code: req.params.code
                        })
                            .execute();
                        return [4 /*yield*/, this._db.wpdb("update medi_consultation set done = 1 where code = '" + req.params.code + "'")];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Done", 1, {}, req))];
                }
            });
        });
    };
    ConsultationsController.prototype.markConsultationUnDone = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.ConsultationController.MarkUndone, {
                            code: req.params.code
                        })];
                    case 1:
                        _a.sent();
                        this._dbConn.createQueryBuilder()
                            .update(ConsultationStatus_1.ConsultationStatus)
                            .set({ done: false, consultation_modified: new Date })
                            .where("consultation_code = :code", {
                            code: req.params.code
                        })
                            .execute();
                        return [4 /*yield*/, this._db.wpdb("update medi_consultation set done = 0 where code = '" + req.params.code + "'")];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Done", 1, {}, req))];
                }
            });
        });
    };
    ConsultationsController.prototype.getConsultationListByCodes = function (codes, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var codesJoinedString, pobjects, consultations, postIds, postIdString, paymentsActivity, mappedPaymentsActivity, posts, keyName, getPostMeta, postAuthors, patientIds, doctorIds, users, patients, soaps, allAffiliates, allCenters, _loop_2, i, finalData, meetMedimetryUrl, docMedimetryUrl, currentDate, currentTime, _loop_3, this_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!codes.length)
                            return [2 /*return*/, []];
                        options = options || {};
                        codesJoinedString = codes.map(function (code) { return "'" + code + "'"; }).join(", ");
                        return [4 /*yield*/, this._db.wpdb("select * from medi_pobject where code in (" + codesJoinedString + ")")];
                    case 1:
                        pobjects = _a.sent();
                        return [4 /*yield*/, this._db.wpdb("select * from medi_consultation where code in (" + codesJoinedString + ")")];
                    case 2:
                        consultations = _a.sent();
                        if (!pobjects.length)
                            return [2 /*return*/, []];
                        postIds = [];
                        pobjects.forEach(function (pobject) { postIds.push(pobject["post_id"]); });
                        postIdString = Statics_1.StaticHelpers.arrayToCommaSeperatedString(postIds);
                        return [4 /*yield*/, this._db.wpdb("select * from medi_payments_activity where post_id in (" + pobjects.map(function (r) { return r.post_id; }) + ")")];
                    case 3:
                        paymentsActivity = _a.sent();
                        mappedPaymentsActivity = {};
                        paymentsActivity.forEach(function (row) {
                            if (((["PGateway_Payu", "paytm"].indexOf(row.gateway)) > -1) && (row.status === "success"))
                                mappedPaymentsActivity[row.post_id] = row.gateway;
                        });
                        return [4 /*yield*/, this._db.wpdb("select * from medi_posts where ID in (" + postIdString + ")")];
                    case 4:
                        posts = _a.sent();
                        keyName = 'channel_settings';
                        return [4 /*yield*/, this._db.wpdb("select post_id,meta_value from medi_postmeta where meta_key='" + keyName + "' and post_id in (" + postIdString + ")")];
                    case 5:
                        getPostMeta = _a.sent();
                        postAuthors = Statics_1.StaticHelpers.arrayToCommaSeperatedString(Statics_1.StaticHelpers.getColumnFromJsonObj(posts, "post_author"));
                        patientIds = Statics_1.StaticHelpers.arrayToCommaSeperatedString(Statics_1.StaticHelpers.getColumnFromJsonObj(consultations, "patient_id"));
                        doctorIds = Statics_1.StaticHelpers.arrayToCommaSeperatedString(Statics_1.StaticHelpers.getColumnFromJsonObj(consultations, "user_id"));
                        return [4 /*yield*/, this._db.wpdb("select * from medi_users where ID in (" + postAuthors + ") or ID in (" + doctorIds + ")")];
                    case 6:
                        users = _a.sent();
                        return [4 /*yield*/, this._db.wpdb("select * from medi_patients where id in (" + patientIds + ")")];
                    case 7:
                        patients = _a.sent();
                        return [4 /*yield*/, Soap_1.Soap.getRepo().find({
                                where: { consultation_code: typeorm_1.In(codes) },
                            })];
                    case 8:
                        soaps = _a.sent();
                        return [4 /*yield*/, this._db.mailServiceDb("select * from mail_log.channel_staff where type = 'operator'")];
                    case 9:
                        allAffiliates = _a.sent();
                        return [4 /*yield*/, this._db.mailServiceDb("select * from mail_log.channel_centers")];
                    case 10:
                        allCenters = _a.sent();
                        _loop_2 = function (i) {
                            allCenters[i]["affiliates"] = allAffiliates.filter(function (affiliate) {
                                return (affiliate["center_id"] == allCenters[i]["id"])
                                    && (affiliate["channel_id"] == allCenters[i]["channel_id"]);
                            });
                        };
                        for (i = 0; i < allCenters.length; i++) {
                            _loop_2(i);
                        }
                        finalData = [];
                        meetMedimetryUrl = this._config.get("meetMedimetryUrl", "https://meet.medimetry.com/");
                        docMedimetryUrl = this._config.get("docMedimetryUrl", "https://doc.medimetry.com/") + "?token=:token&code=";
                        currentDate = new Date();
                        currentDate.setMinutes(currentDate.getMinutes() + 15);
                        currentTime = currentDate.getTime();
                        _loop_3 = function (i) {
                            var code, pobject, consultation, post, post_meta, user, patient, doctor, soap, center, theValues, moreVideoUrls, getUserIdForVideoCall, getLastVideoCallRequestTime, i_1, soapDate;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        code = codes[i];
                                        pobject = pobjects.filter(function (pobject) { return pobject["code"] == code; })[0] || {};
                                        if (!pobject)
                                            return [2 /*return*/, "continue"];
                                        consultation = consultations.filter(function (consultation) { return consultation["code"] == code; })[0] || {};
                                        post = posts.filter(function (post) { return post["ID"] == pobject["post_id"]; })[0] || {};
                                        post_meta = getPostMeta.filter(function (post) { return post["post_id"] == pobject["post_id"]; })[0] || {};
                                        if (post_meta.meta_value) {
                                            post_meta = PHPUnserialize.unserialize(post_meta['meta_value']);
                                        }
                                        user = users.filter(function (user) { return user["ID"] == post["post_author"]; })[0] || {};
                                        patient = patients.filter(function (patient) { return patient["id"] == consultation["patient_id"]; })[0] || {};
                                        doctor = users.filter(function (doctor) { return doctor["ID"] == consultation["user_id"]; })[0] || {};
                                        soap = soaps.filter(function (soap) { return soap["consultation_code"] == code; })[0] || {};
                                        center = allCenters.filter(function (center) { return patient["center_code"] == center["code"]; })[0] || {};
                                        if (!(soap['id'] && (!soap['active'] || (!options["ignoreFutureSoapDates"] && (new Date(soap["created_at"]).getTime() > currentTime))))) return [3 /*break*/, 1];
                                        return [2 /*return*/, "continue"];
                                    case 1:
                                        if (!(!soap["id"] && consultation["user_id"])) return [3 /*break*/, 3];
                                        theValues = {
                                            "soap_code": Statics_1.StaticHelpers.strRandom(32),
                                            "consultation_code": pobject['code'],
                                            "patient_id": patient['id'],
                                            "meta": {},
                                            "created_by": consultation['user_id'],
                                            "center_code": patient['center_code'],
                                            "uuid": patient['id'] + "/" + post['post_author'] + "/" + consultation['channel_id'],
                                            "created_at": consultation["created"],
                                            "updated_at": new Date,
                                        };
                                        return [4 /*yield*/, (new SOAPRepository_1.SOAPRepository()).save(theValues)];
                                    case 2:
                                        soap = _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        if (patient && patient['meta'])
                                            patient['meta'] = Statics_1.StaticHelpers.unserialize(patient['meta']);
                                        moreVideoUrls = [];
                                        // these post types are not allowed in listing
                                        if (["publish"].indexOf(post["post_type"]) > -1)
                                            return [2 /*return*/, "continue"];
                                        // console.debug(code, pobject, consultation, post, user, patient, doctor, soap);
                                        if (!pobject.id)
                                            return [2 /*return*/, "continue"];
                                        getUserIdForVideoCall = post_meta['affiliate_code']
                                            ? post_meta['affiliate_code'].split('+')[1]
                                            : post['post_author'];
                                        getLastVideoCallRequestTime = post_meta['lastVideoCallRequestedAt'] || false;
                                        if ((getUserIdForVideoCall === post['post_author'])
                                            && center && center.id
                                            && center["affiliates"] && center["affiliates"].length) {
                                            moreVideoUrls.push({
                                                "name": patient["name"],
                                                "type": "patient",
                                                "link": this_1.getVideoCallUrl(consultation["user_id"], post['post_author']),
                                            });
                                            for (i_1 = 0; i_1 < center["affiliates"].length; i_1++) {
                                                moreVideoUrls.push({
                                                    "name": center["affiliates"][i_1]["name"],
                                                    "type": "partner",
                                                    "link": this_1.getVideoCallUrl(consultation["user_id"], center["affiliates"][i_1]["wp_userid"]),
                                                });
                                            }
                                        }
                                        soapDate = Statics_1.StaticHelpers.toLocalTime(new Date(soap['created_at']));
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
                                            "showVideoCallIndicator": Statics_1.StaticHelpers.showVideoCallIndicator(getLastVideoCallRequestTime),
                                            "last_videocall_request_time": getLastVideoCallRequestTime,
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
                                            "consultationStatus": this_1.getConsultationStatus(consultation),
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _a.label = 11;
                    case 11:
                        if (!(i < codes.length)) return [3 /*break*/, 14];
                        return [5 /*yield**/, _loop_3(i)];
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13:
                        i++;
                        return [3 /*break*/, 11];
                    case 14: return [2 /*return*/, finalData];
                }
            });
        });
    };
    ConsultationsController.prototype.getConsultationStatus = function (consultation) {
        var status = "confirmed";
        if (consultation["done"] == "1")
            status = "done";
        if (consultation["status"].toLowerCase() == "firstassigned")
            status = "queued";
        if (consultation["status"].toLowerCase() == "refund")
            status = "regreted";
        return status;
    };
    /**
     * Calls existing core.medimetry admin dashboard expireConsultation API
     * Via bridge created by se.medimetry using key, provided to emr.medimetry
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    ConsultationsController.prototype.expireConsultation = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pobjects, pobject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.body.code)
                            return [2 /*return*/, res.send(this.build("Missing required fields."))];
                        return [4 /*yield*/, this._db.wpdb("select * from medi_pobject where code like '" + req.body.code + "'")];
                    case 1:
                        pobjects = _a.sent();
                        if (!pobjects.length)
                            return [2 /*return*/, res.send(this.build("Invalid consultation code"))];
                        pobject = pobjects[0];
                        if (pobject["status"] != "open")
                            return [2 /*return*/, res.send(this.build("Object not in 'open' state"))];
                        return [4 /*yield*/, this.adminExpireClose(req, res, "expire")];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Calls existing core.medimetry admin dashboard adminClose Consultation API
     * Via bridge created by se.medimetry using key, provided to emr.medimetry
     *
     * @param req
     * @param res
     * @returns {Promise<void|boolean|Response>}
     */
    ConsultationsController.prototype.adminCloseConsultation = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pobjects, pobject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.body.code)
                            return [2 /*return*/, res.send(this.build("Missing required fields."))];
                        return [4 /*yield*/, this._db.wpdb("select * from medi_pobject where code like '" + req.body.code + "'")];
                    case 1:
                        pobjects = _a.sent();
                        if (!pobjects.length)
                            return [2 /*return*/, res.send(this.build("Invalid consultation code"))];
                        pobject = pobjects[0];
                        if (pobject["status"] != "open")
                            return [2 /*return*/, res.send(this.build("Object not in 'open' state"))];
                        return [4 /*yield*/, this.adminExpireClose(req, res, "close")];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
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
    ConsultationsController.prototype.refundConsultation = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var payments, payment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.body.code)
                            return [2 /*return*/, res.send(this.build("Missing required fields."))];
                        return [4 /*yield*/, this._db.wpdb("select * from medi_payments where code like '" + req.body.code + "'")];
                    case 1:
                        payments = _a.sent();
                        if (!payments.length)
                            return [2 /*return*/, res.send(this.build("Invalid consultation code"))];
                        payment = payments[0];
                        if (payment["refund"] != "0")
                            return [2 /*return*/, res.send(this.build("Already refunded"))];
                        return [4 /*yield*/, this.adminExpireClose(req, res, "refund")];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Wrapper for the common se.med API, just to reuse the code.
     * for API's: expireConsultation, adminCloseConsultation, refundConsultation
     * @param req
     * @param res
     * @param type
     * @returns {Promise<void|boolean|Response>}
     */
    ConsultationsController.prototype.adminExpireClose = function (req, res, type) {
        return __awaiter(this, void 0, void 0, function () {
            var seResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request.seRequest("internal-api/emr/admin-expire-close", {
                            "key": this._config.getOAuthClientKey(),
                            "type": type,
                            "code": req.body.code,
                        })];
                    case 1:
                        seResponse = _a.sent();
                        return [2 /*return*/, res.send(seResponse)];
                }
            });
        });
    };
    ConsultationsController.prototype.updatePatient = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var patient, mobile, resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.ConsultationController.UpdatePatient, {
                            patient: req.params.id,
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._db.wpdb("select * from medi_patients where id = " + req.params.id)];
                    case 2:
                        patient = _a.sent();
                        if (!patient.length)
                            return [2 /*return*/, res.send(this.build("Patient not found"))];
                        else
                            patient = patient[0];
                        if (!(req.body.center && (patient.center_code != req.body.center))) return [3 /*break*/, 4];
                        return [4 /*yield*/, ConsultationStatus_1.ConsultationStatus.repo()
                                .createQueryBuilder()
                                .update(ConsultationStatus_1.ConsultationStatus)
                                .set({
                                center_code: req.body.center
                            })
                                .where("patient_id = :id", {
                                id: req.params.id
                            })
                                .execute()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        mobile = req.body.mobile || req.body.mobile_number || null;
                        if (mobile && (mobile.length > 10))
                            mobile = mobile.substr(mobile.length - 10);
                        return [4 /*yield*/, this._request.seRequest("internal-api/patient/update", {
                                "patientId": req.params.id,
                                "key": this._config.getOAuthClientKey(),
                                "patientDOB": req.body.dob || null,
                                "patientAge": req.body.age || null,
                                "patientName": req.body.name || null,
                                "patientGender": req.body.gender || null,
                                "patientCenter": req.body.center || null,
                                "patientMobile": mobile,
                                "meta": JSON.stringify(req.body.meta || {}),
                            })];
                    case 5:
                        resp = _a.sent();
                        return [2 /*return*/, res.send(resp)];
                }
            });
        });
    };
    /**
     * Soft deleting the patient, once remove, patient should not be shown in any kind of listing.
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    ConsultationsController.prototype.deletePatient = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request.seRequest("internal-api/patient/delete", {
                            "patientId": req.params.id,
                            "key": this._config.getOAuthClientKey(),
                        })];
                    case 1:
                        resp = _a.sent();
                        this._dbConn.createQueryBuilder()
                            .update(ConsultationStatus_1.ConsultationStatus)
                            .set({ consultation_modified: new Date, active: false })
                            .where("patient_id = :patient", {
                            patient: req.params.id
                        })
                            .execute();
                        return [2 /*return*/, res.send(this.build(resp.message, resp.success, resp, req))];
                }
            });
        });
    };
    ConsultationsController.prototype.listPatientConsultations = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var consultationsRelated, consultationCodes, consltationStatus, consultationVsDone, rowsToSend;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._db.wpdb("select * from medi_consultation where patient_id = " + req.params.patient + " order by id desc")];
                    case 1:
                        consultationsRelated = (_a.sent()) || [];
                        consultationCodes = consultationsRelated.map(function (consultation) { return consultation["code"]; });
                        return [4 /*yield*/, ConsultationStatus_1.ConsultationStatus.repo()
                                .createQueryBuilder('cs')
                                .select("consultation_code, done")
                                .where("active = true and consultation_code in ( :codes )", {
                                "codes": consultationCodes.map(function (code) { return "'" + code + "'"; }).join(",")
                            })
                                .orderBy("consultation_id", "DESC")
                                .getMany()];
                    case 2:
                        consltationStatus = _a.sent();
                        consultationVsDone = {};
                        consltationStatus.forEach(function (consultation) {
                            consultationVsDone["" + consultation["consultation_code"]] = !!consultation["done"];
                            return consultationVsDone;
                        });
                        return [4 /*yield*/, this.getConsultationListByCodes(consultationCodes, { ignoreFutureSoapDates: true })];
                    case 3:
                        rowsToSend = _a.sent();
                        rowsToSend = rowsToSend.map(function (row) {
                            row["done"] = !!(consultationVsDone[row["consultation_code"]] && consultationVsDone[row["consultation_code"]]["done"]);
                            return row;
                        });
                        rowsToSend = rowsToSend.sort(function (a, b) { return a["soapDate"] - b["soapDate"]; });
                        return [2 /*return*/, res.send(this.build("Here you go!", 1, {
                                rows: rowsToSend
                            }))];
                }
            });
        });
    };
    ConsultationsController.prototype.getPatientDetail = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var consultationCode, lastConsultation, detail;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        consultationCode = req.params.code || "";
                        if (!!consultationCode) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._db.wpdb("select * from medi_consultation where patient_id = " + req.params.id + " order by id desc")];
                    case 1:
                        lastConsultation = _a.sent();
                        if (lastConsultation && lastConsultation[0] && lastConsultation[0]['code'])
                            consultationCode = lastConsultation[0]['code'];
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this._request.seRequest("api/v1/partner-app/patient/" + req.params.id + "/" + consultationCode, {}, {
                            token: req.user.access_token
                        })];
                    case 3:
                        detail = _a.sent();
                        return [2 /*return*/, res.send(this.build("Here you go!", 1, detail))];
                }
            });
        });
    };
    ConsultationsController.prototype.updatePatientLogin = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var resp, soap, newUUID, tables, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.ConsultationController.UpdatePatientUID, {
                            patient: req.body.patientId,
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._request.seRequest("api/v1/partner-app/update-user-login", {
                                patientId: req.body.patientId,
                                newLogin: req.body.newLogin,
                                onConflict: req.body.onConflict,
                            }, {
                                token: req.user.access_token
                            })];
                    case 2:
                        resp = _a.sent();
                        if (!resp.newUserId) return [3 /*break*/, 7];
                        return [4 /*yield*/, Soap_1.Soap.repo().findOne({
                                where: {
                                    patient_id: req.body.patientId
                                }
                            })];
                    case 3:
                        soap = _a.sent();
                        if (!soap)
                            return [2 /*return*/, res.send(this.build(resp.message, resp.success, resp))];
                        newUUID = soap.uuid.split("/").map(function (value, index) {
                            // on 1st index, it will old userId
                            if (index === 1)
                                return resp.newUserId;
                            return value;
                        }).join("/");
                        tables = [
                            'soaps', 'attachments', 'chief_complaints', 'clinical_notes',
                            'diagnosis', 'examinations', 'investigation', 'medications',
                            'referral', 'test_result', 'vitals',
                        ];
                        i = 0;
                        _a.label = 4;
                    case 4:
                        if (!(i < tables.length)) return [3 /*break*/, 7];
                        return [4 /*yield*/, typeorm_1.getConnection()
                                .query("update " + tables[i] + " set \"uuid\" = '" + newUUID + "' where \"uuid\" = '" + soap.uuid + "'")];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, res.send(this.build(resp.message, resp.success, resp))];
                }
            });
        });
    };
    ConsultationsController.prototype.addVideoCallLogs = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.ConsultationController.AddVideoCallLogs)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._request.seRequest("/api/v1/partner-app/add-video-call-logs", {
                                "consultation_id": req.body.consultation_id,
                                "start_time": req.body.start_time,
                                "end_time": req.body.end_time,
                                "doctor_id": req.body.doctor_id,
                                "user_id": req.body.user_id,
                            }, {
                                token: req.headers.token
                            }).then(function (result) {
                                return res.send(_this.build("Updated successfully", 1, {}));
                            }).catch(function (err) {
                                return res.send(_this.build("Something went wrong", 0, {}));
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConsultationsController.prototype.sendSmsToDoctor = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.ConsultationController.SendSMS)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._request.seRequest("/sendSms", {
                                "mobile": req.body.mobile,
                                "smstext": req.body.smstext
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("send successfully", 1, {}, req))];
                }
            });
        });
    };
    ConsultationsController.prototype.getVideocallRecordRow = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = res).send;
                        return [4 /*yield*/, this._request.coreRequest("video-call/started?code=" + req.params.code, {})];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    ConsultationsController.prototype.submitPartnerAppFeedback = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.ConsultationController.SubmitPartnerAppFeedback, {
                            code: req.params.code,
                        })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._request.seRequest("/api/v1/partner-app/submit-consultation-feedback/" + req.params.code, {
                                feedback: req.body.feedback,
                                rating: req.body.rating,
                            }, {
                                token: req.headers.token,
                            })];
                    case 2:
                        resp = _a.sent();
                        return [2 /*return*/, res.send(resp)];
                }
            });
        });
    };
    ConsultationsController.prototype.getUnfollowupedSoaps = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var page, TAKE, SKIP, thirtyDaysBefore, consultationCodes, rowsToSend;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = req.params.page || 1;
                        TAKE = 20;
                        SKIP = (page - 1) * TAKE;
                        thirtyDaysBefore = new Date();
                        thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);
                        return [4 /*yield*/, Soap_1.Soap.repo()
                                .createQueryBuilder()
                                .where("follow_up IS NULL AND active = true AND created_at > :date", {
                                date: thirtyDaysBefore
                            })
                                .skip(SKIP).take(TAKE)
                                .getMany()];
                    case 1:
                        consultationCodes = _a.sent();
                        if (!consultationCodes.length)
                            return [2 /*return*/, res.send(this.build("no rows", 1))];
                        consultationCodes = Statics_1.StaticHelpers.getColumnFromJsonObj(consultationCodes, "consultation_code");
                        return [4 /*yield*/, this.getConsultationListByCodes(consultationCodes)];
                    case 2:
                        rowsToSend = _a.sent();
                        return [2 /*return*/, res.send(this.build("Here you go!", 1, {
                                rows: rowsToSend,
                            }))];
                }
            });
        });
    };
    ConsultationsController.prototype.followupsListing = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var page, TAKE, SKIP, doctorIds, consultationCodes, centerCodeQuery, priorityQuery, patientIds, rowsToSend, thirtyDaysBefore, today, notifications, consultationCodesVsNotification_1, today, notifications, consultationCodesVsNotification_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = req.body.page || 1;
                        TAKE = 20;
                        SKIP = (page - 1) * TAKE;
                        doctorIds = req.wpUserIds.join(", ");
                        consultationCodes = [];
                        centerCodeQuery = req.body.centers && req.body.centers.length
                            ? " and center_code in ( " + req.body.centers.map(function (center) { return "'" + center + "'"; }).join(', ') + " )"
                            : "";
                        priorityQuery = req.body.priority && req.body.priority.length
                            ? " and meta like '%:\"" + req.body.priority + "\";%'"
                            : "";
                        return [4 /*yield*/, this._db.wpdb("select id from medi_patients where 1 " + centerCodeQuery + " " + priorityQuery)];
                    case 1:
                        patientIds = _a.sent();
                        patientIds = patientIds.map(function (row) { return row.id; });
                        if (!patientIds.length)
                            return [2 /*return*/, res.send(this.build("No patients found for criteria."))];
                        rowsToSend = [];
                        if (!(req.body.followup === 'without')) return [3 /*break*/, 4];
                        thirtyDaysBefore = new Date(req.body.time);
                        thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);
                        return [4 /*yield*/, Soap_1.Soap.repo()
                                .createQueryBuilder()
                                .where("follow_up IS NULL AND active = true AND created_at > :date AND patient_id in ( " + patientIds.join(', ') + " )", {
                                date: thirtyDaysBefore
                            })
                                .skip(SKIP).take(TAKE)
                                .getMany()];
                    case 2:
                        consultationCodes = _a.sent();
                        consultationCodes = Statics_1.StaticHelpers.getColumnFromJsonObj(consultationCodes, "consultation_code");
                        return [4 /*yield*/, this.getConsultationListByCodes(consultationCodes)];
                    case 3:
                        rowsToSend = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(req.body.followup === 'today')) return [3 /*break*/, 8];
                        today = new Date(req.body.time);
                        return [4 /*yield*/, Soap_1.Soap.repo()
                                .createQueryBuilder()
                                .where("active = true AND created_at < NOW() AND patient_id in ( " + patientIds.join(", ") + " )")
                                .getMany()];
                    case 5:
                        // No need of center sanchalaks now.
                        /* let centerIds = await this._db.mailServiceDb(`select id from mail_log.channel_centers
                            where true ${centerCodeQuery.replace('center_code', 'code')}`);
                        let wpUserIdsOfSanchalaks = await this._db.mailServiceDb(`select wp_userid from mail_log.channel_staff
                            where center_id in ( ${centerIds.map( row => row.id )} )`);
                        wpUserIdsOfSanchalaks.forEach( row => patientIds.push(row.wp_userid));  */
                        consultationCodes = _a.sent();
                        if (!consultationCodes.length)
                            return [2 /*return*/, res.send(this.build("No consultations found."))];
                        consultationCodes = consultationCodes.map(function (row) { return "'" + row.consultation_code + "'"; });
                        return [4 /*yield*/, this._db.mailServiceDb("\n                select *,\n                    case when due_at is null then created_at\n                         else due_at\n                    end as \"date\"\n                from mail_log.notifications where \"done\" = false \n                    and \"from\" in ( " + doctorIds + " )\n                    and \"type\" in ( 'partnerapp-feedback', 'partnerapp-followup' )\n                    and ( \"due_at\" is null or \"due_at\" < NOW() )\n                    and \"consultation_code\" in ( " + consultationCodes.join(", ") + " )\n                order by \"date\" desc\n                limit " + TAKE + " offset " + SKIP + "\n            ")];
                    case 6:
                        notifications = _a.sent();
                        consultationCodes = Statics_1.StaticHelpers
                            .getColumnFromJsonObj(notifications, "consultation_code")
                            .filter(function (value, index, self) {
                            return self.indexOf(value) === index;
                        });
                        consultationCodesVsNotification_1 = {};
                        notifications.forEach(function (notif) {
                            if (consultationCodesVsNotification_1[notif['consultation_code']])
                                return;
                            else
                                consultationCodesVsNotification_1[notif['consultation_code']] = notif;
                        });
                        return [4 /*yield*/, this.getConsultationListByCodes(consultationCodes)];
                    case 7:
                        rowsToSend = _a.sent();
                        rowsToSend = rowsToSend.map(function (row) {
                            if (consultationCodesVsNotification_1[row['consultation_code']])
                                row['notification'] = consultationCodesVsNotification_1[row['consultation_code']];
                            return row;
                        });
                        _a.label = 8;
                    case 8:
                        if (!(req.body.followup === 'done')) return [3 /*break*/, 12];
                        today = new Date(req.body.time);
                        return [4 /*yield*/, Soap_1.Soap.repo()
                                .createQueryBuilder()
                                .where("active = true AND created_at < NOW() AND patient_id in ( " + patientIds.join(", ") + " )")
                                .getMany()];
                    case 9:
                        consultationCodes = _a.sent();
                        if (!consultationCodes.length)
                            return [2 /*return*/, res.send(this.build("No consultations found."))];
                        consultationCodes = consultationCodes.map(function (row) { return "'" + row.consultation_code + "'"; });
                        return [4 /*yield*/, this._db.mailServiceDb("\n                select *,\n                    updated_at as \"date\"\n                from mail_log.notifications where \"done\" = true \n                    and \"from\" in ( " + doctorIds + " )\n                    and \"type\" in ( 'partnerapp-feedback', 'partnerapp-followup' )\n                    and ( \"due_at\" is null or \"due_at\" < NOW() )\n                    and \"consultation_code\" in ( " + consultationCodes.join(", ") + " )\n                order by \"date\" desc\n                limit " + TAKE + " offset " + SKIP + "\n            ")];
                    case 10:
                        notifications = _a.sent();
                        consultationCodes = Statics_1.StaticHelpers
                            .getColumnFromJsonObj(notifications, "consultation_code")
                            .filter(function (value, index, self) {
                            return self.indexOf(value) === index;
                        });
                        consultationCodesVsNotification_2 = {};
                        notifications.forEach(function (notif) {
                            if (consultationCodesVsNotification_2[notif['consultation_code']])
                                return;
                            else
                                consultationCodesVsNotification_2[notif['consultation_code']] = notif;
                        });
                        return [4 /*yield*/, this.getConsultationListByCodes(consultationCodes)];
                    case 11:
                        rowsToSend = _a.sent();
                        rowsToSend = rowsToSend.map(function (row) {
                            if (consultationCodesVsNotification_2[row['consultation_code']])
                                row['notification'] = consultationCodesVsNotification_2[row['consultation_code']];
                            return row;
                        });
                        _a.label = 12;
                    case 12:
                        if (!consultationCodes.length)
                            return [2 /*return*/, res.send(this.build("no rows", 1))];
                        return [2 /*return*/, res.send(this.build("Here you go!", 1, {
                                rows: rowsToSend,
                            }))];
                }
            });
        });
    };
    ConsultationsController.prototype.getAppointmentDates = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var httpResp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request.seRequest("internal-api/appointment/get-dates", {
                            startTime: req.body.startTime || null,
                            endTime: req.body.endTime || null,
                            user: req.body.user || null,
                            patient: req.body.patient || null,
                        }, {
                            token: req.headers.token,
                        })];
                    case 1:
                        httpResp = _a.sent();
                        return [2 /*return*/, res.send(httpResp)];
                }
            });
        });
    };
    ConsultationsController.prototype.getAppointmentconsultations = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var httpResp, rowsToSend;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request.seRequest("internal-api/appointment/get-consultations", {
                            startTime: req.body.startTime || null,
                            endTime: req.body.endTime || null,
                            user: req.body.user || null,
                            patient: req.body.patient || null,
                            codeOnly: 1,
                        }, {
                            token: req.headers.token,
                        })];
                    case 1:
                        httpResp = _a.sent();
                        if (!httpResp.success)
                            return [2 /*return*/, res.send(httpResp)];
                        return [4 /*yield*/, this.getConsultationListByCodes(httpResp.codes, { ignoreFutureSoapDates: true })];
                    case 2:
                        rowsToSend = _a.sent();
                        console.log("getAppointmentconsultations: ", httpResp.codes.length, rowsToSend.length);
                        return [2 /*return*/, res.send(this.build("Here you go", 1, {
                                "rows": rowsToSend,
                                "totalWaiting": httpResp.totalWaiting,
                            }))];
                }
            });
        });
    };
    ConsultationsController.prototype.updateAppointmentStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var channel, httpResp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._db.wpdb("select * from channels where id = ( select channel_id from medi_consultation where code = \"" + req.body.code + "\" )")];
                    case 1:
                        channel = _a.sent();
                        if (!channel)
                            return [2 /*return*/, res.send(this.build("Invalid consultation code"))];
                        channel = channel[0];
                        return [4 /*yield*/, this._request.seRequest("api/v1/integrations/UpdateStatus", {
                                channel: channel.key,
                                code: req.body.code,
                                comment: req.body.comment || "",
                                to: req.body.to || null,
                                time: req.body.time
                            }, {
                                token: req.headers.token,
                            })];
                    case 2:
                        httpResp = _a.sent();
                        return [2 /*return*/, res.send(httpResp)];
                }
            });
        });
    };
    ConsultationsController.prototype.createConsultationsJobFromCSV = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var channels, channel, centers, center, csv, secondRow, postData, seResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        channels = req.user.meta.user.channels;
                        channel = channels.length > 1 ? channels.filter(function (name) { return name != "MediMetry"; })[0] : channels[0];
                        centers = req.user.meta.user.centers[channel];
                        center = centers[0].code;
                        if (req.body.center_code && (centers.filter(function (row) { return row.code == req.body.center_code; }).length))
                            center = req.body.center_code;
                        csv = req.body.csv;
                        if (csv.split("\n").length < 2)
                            return [2 /*return*/, res.send(this.build("Should have atleast 2 rows"))];
                        secondRow = csv.split("\n")[1];
                        if (secondRow.split(",").length != 5)
                            return [2 /*return*/, res.send(this.build("rows should have exactly 5 columns, leave empty for default values"))];
                        postData = {
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
                        };
                        return [4 /*yield*/, this._request.seRequest("internal-api/consultations/save-csv", postData)];
                    case 1:
                        seResponse = _a.sent();
                        return [2 /*return*/, res.send(seResponse)];
                }
            });
        });
    };
    ConsultationsController.prototype.initiateDocMedimetryAudioCall = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var seResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request.seRequest("internal-api/consultations/intiate-doctor-call", {
                            code: req.body.code,
                            key: this._config.getOAuthClientKey(),
                        })];
                    case 1:
                        seResponse = _a.sent();
                        return [2 /*return*/, res.send(seResponse)];
                }
            });
        });
    };
    ConsultationsController.prototype.requestPayment = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var seResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request.seRequest("internal-api/consultations/request-payment", {
                            code: req.params.code,
                            key: this._config.getOAuthClientKey(),
                        })];
                    case 1:
                        seResponse = _a.sent();
                        return [2 /*return*/, res.send(seResponse)];
                }
            });
        });
    };
    ConsultationsController.prototype.getVideoCallUrl = function (callerId, receiverId) {
        return this._config.get('videoCallBaseUrl', this._config.get("seMedimetryUrl", "https://se.medimetry.com/")) + 'video-call/' + callerId + '/' + receiverId;
    };
    ConsultationsController.prototype.getMaxDoneConsultationId = function (doctorIdStr) {
        return __awaiter(this, void 0, void 0, function () {
            var lastDoneConsultationId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ConsultationStatus_1.ConsultationStatus.repo()
                            .createQueryBuilder()
                            .select("MAX(consultation_id) as max")
                            .where("doctor_id in ( " + doctorIdStr + " ) and done = true and active = true")
                            .getRawOne()];
                    case 1:
                        lastDoneConsultationId = _a.sent();
                        return [2 /*return*/, lastDoneConsultationId.max || 0];
                }
            });
        });
    };
    return ConsultationsController;
}(Router));
exports.ConsultationsController = ConsultationsController;
