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
var DatabaseConfiguration_1 = require("../config/DatabaseConfiguration");
var HttpRequest_1 = require("../helpers/HttpRequest");
var Router = require('./Router');
var Soap_1 = require("../database/models/Soap");
var ChiefComplaint_1 = require("../database/models/ChiefComplaint");
var Vital_1 = require("../database/models/Vital");
var Medication_1 = require("../database/models/Medication");
var User_1 = require("../database/models/User");
var TestResult_1 = require("../database/models/TestResult");
var PersonalHistory_1 = require("../database/models/PersonalHistory");
var Attachment_1 = require("../database/models/Attachment");
var Statics_1 = require("../helpers/Statics");
var GeneratedHistory_1 = require("../database/models/GeneratedHistory");
var TreatmentPlanLogs_1 = require("../database/models/TreatmentPlanLogs");
var ConsultationsController_1 = require("./ConsultationsController");
var SoapController_1 = require("./SoapController");
var AllergiesRepository_1 = require("../database/repository/AllergiesRepository");
var FamilyHistory_1 = require("../database/models/FamilyHistory");
var DiagnosisRepository_1 = require("../database/repository/DiagnosisRepository");
var ProcedureRepository_1 = require("../database/repository/ProcedureRepository");
var PastIllness_1 = require("../database/models/PastIllness");
var Habit_1 = require("../database/models/Habit");
var PastMedication_1 = require("../database/models/PastMedication");
var Feedback_1 = require("../database/models/Feedback");
var typeorm_1 = require("typeorm");
var Examination_1 = require("../database/models/Examination");
var Meals_1 = require("../database/models/Meals");
var AuditLog_1 = require("../database/models/AuditLog");
var GenerateHistoryController = /** @class */ (function (_super) {
    __extends(GenerateHistoryController, _super);
    function GenerateHistoryController(routePath, app) {
        var _this = _super.call(this, routePath, app) || this;
        _this._config = Config_1.config;
        _this._s3 = S3_1.uploader;
        _this._db = DatabaseConfiguration_1.db;
        _this._request = new HttpRequest_1.HttpRequest();
        return _this;
    }
    Object.defineProperty(GenerateHistoryController.prototype, "services", {
        get: function () {
            return {
                '/generate/:id': "generatePatientHistory",
                "POST /link": "generateLink",
                "/view/:uniqueid": "getViaUniqueId",
                "POST /treatment-plan": "saveTreatmentPlan",
            };
        },
        enumerable: true,
        configurable: true
    });
    GenerateHistoryController.prototype.generatePatientHistory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var patientId, dataToSend, temp, recentHistoryMonthCount, threeMonthsAgo, mysqlDateThreeMonthsAgo, _a, recentSoaps, recentSoapIdStr, recentSoapIdVsDate, cheifComplains, soapId, examinations, date, weekdayMeal, weekendMeal, _b, _c, _d, _e, _f, _g, vitals, testResultTypes, _loop_1, i, key, personalHistories, pastImages, testsBydate, prescriptionsByDate, othersByDate, day, day, day, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, last3SoapsMedications, last3SoapsMedicationFeedback;
            return __generator(this, function (_x) {
                switch (_x.label) {
                    case 0:
                        if (!req.params.id)
                            return [2 /*return*/, res.send(this.build("Missing required params"))];
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.GenerateHistoryController.GenerateLink, {
                                patient: req.params.id,
                            })];
                    case 1:
                        _x.sent();
                        patientId = parseInt(req.params.id);
                        dataToSend = { "chiefComplains": [], "examinations": [], "vitals": [], "testResults": [], "lastPersonalHistory": {}, "appendix": {
                                "testResults": [], "prescriptions": [], "others": [],
                            }, "patient": {}, "patientHistory": {}, "medicationsAndFeedbacks": [], "meals": [], "personalHistories": [{}] };
                        temp = {};
                        recentHistoryMonthCount = parseInt(req.query.months) || 3;
                        threeMonthsAgo = new Date();
                        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - recentHistoryMonthCount);
                        mysqlDateThreeMonthsAgo = Statics_1.StaticHelpers.toMysql(threeMonthsAgo);
                        _a = dataToSend;
                        return [4 /*yield*/, this._db.wpdb('select * from medi_patients where id = ' + patientId)];
                    case 2:
                        _a.patient = _x.sent();
                        dataToSend.patient = dataToSend.patient[0];
                        return [4 /*yield*/, Soap_1.Soap.repo()
                                .createQueryBuilder()
                                .where("patient_id = :patient and created_at >= :date", {
                                patient: patientId,
                                date: mysqlDateThreeMonthsAgo
                            })
                                .orderBy('id', 'DESC')
                                .getMany()];
                    case 3:
                        recentSoaps = _x.sent();
                        if (!recentSoaps.length)
                            return [2 /*return*/, res.send(this.build("No Recent Soaps found in given duration."))];
                        recentSoapIdStr = Statics_1.StaticHelpers.getColumnFromJsonObj(recentSoaps, 'id').join(", ");
                        recentSoapIdVsDate = {};
                        recentSoaps.forEach(function (soap) {
                            recentSoapIdVsDate[soap.id] = soap.created_at.toDateString();
                        });
                        return [4 /*yield*/, ChiefComplaint_1.ChiefComplaint.repo()
                                .find({
                                "where": {
                                    "patient_id": req.params.id,
                                    "created_at": typeorm_1.Raw(function (alias) { return alias + " > '" + mysqlDateThreeMonthsAgo + "'"; })
                                },
                                "order": {
                                    "id": "DESC"
                                },
                                "relations": ["soap"]
                            })];
                    case 4:
                        cheifComplains = _x.sent();
                        temp = {};
                        cheifComplains.forEach(function (complain) {
                            if (temp[complain.soap.id])
                                temp[complain.soap.id].push(complain.complaint);
                            else
                                temp[complain.soap.id] = [complain.complaint];
                        });
                        for (soapId in temp)
                            if (recentSoapIdVsDate[soapId])
                                dataToSend.chiefComplains.push({
                                    date: recentSoapIdVsDate[soapId],
                                    complains: temp[soapId].filter(function (value, index, array) { return array.indexOf(value) === index; }),
                                });
                        return [4 /*yield*/, Examination_1.Examination.repo()
                                .createQueryBuilder()
                                .where("soap_id in (" + recentSoapIdStr + ")")
                                .orderBy('id', "DESC")
                                .getMany()];
                    case 5:
                        examinations = _x.sent();
                        temp = {};
                        examinations.forEach(function (examination) {
                            if (temp[examination.created_at.toDateString()])
                                temp[examination.created_at.toDateString()].push(examination.remarks);
                            else
                                temp[examination.created_at.toDateString()] = [examination.remarks];
                        });
                        for (date in temp)
                            dataToSend.examinations.push({
                                date: date,
                                complains: temp[date],
                            });
                        return [4 /*yield*/, Meals_1.Meal.repo()
                                .createQueryBuilder()
                                .where("patient_id = :patient and weekend = false", { patient: req.params.id })
                                .orderBy("updated_at", "DESC")
                                .getRawOne()];
                    case 6:
                        weekdayMeal = _x.sent();
                        return [4 /*yield*/, Meals_1.Meal.repo()
                                .createQueryBuilder()
                                .where("patient_id = :patient and weekend = true", { patient: req.params.id })
                                .orderBy("updated_at", "DESC")
                                .getRawOne()];
                    case 7:
                        weekendMeal = _x.sent();
                        if (!(weekdayMeal && weekdayMeal.Meal_soap_id)) return [3 /*break*/, 9];
                        _b = dataToSend;
                        _d = (_c = (dataToSend.meals || [])).concat;
                        return [4 /*yield*/, Meals_1.Meal.repo()
                                .createQueryBuilder()
                                .where("soap_id = :weekdaySoapId ", {
                                weekdaySoapId: weekdayMeal.Meal_soap_id,
                            }).getMany()];
                    case 8:
                        _b.meals = _d.apply(_c, [_x.sent()]);
                        _x.label = 9;
                    case 9:
                        if (!(weekendMeal && weekendMeal.Meal_soap_id)) return [3 /*break*/, 11];
                        _e = dataToSend;
                        _g = (_f = (dataToSend.meals || [])).concat;
                        return [4 /*yield*/, Meals_1.Meal.repo()
                                .createQueryBuilder()
                                .where("soap_id = :weekendSoapId ", {
                                weekendSoapId: weekendMeal.Meal_soap_id,
                            }).getMany()];
                    case 10:
                        _e.meals = _g.apply(_f, [_x.sent()]);
                        _x.label = 11;
                    case 11: return [4 /*yield*/, Vital_1.Vitals.repo()
                            .createQueryBuilder()
                            .where("patient_id = :patient and created_at > :date", {
                            patient: patientId,
                            date: Statics_1.StaticHelpers.toMysql(threeMonthsAgo),
                        })
                            .orderBy('id', "ASC")
                            .getMany()];
                    case 12:
                        vitals = _x.sent();
                        temp = {};
                        vitals.forEach(function (vital) {
                            if (vital.vital_information['Height(ft)']) {
                                vital.vital_information["Height"] = (vital.vital_information['Height(ft)'] * 12) +
                                    (parseFloat(vital.vital_information['Height(in)']) || 0);
                            }
                            for (var key in vital.vital_information)
                                if (temp[key] && vital.vital_information[key])
                                    temp[key].push({
                                        datetime: vital.created_at.toISOString(),
                                        value: vital.vital_information[key],
                                    });
                                else if (vital.vital_information[key])
                                    temp[key] = [{
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
                        return [4 /*yield*/, TestResult_1.TestResult.repo()
                                .createQueryBuilder()
                                .where("type = 'json' and patient_id = :patient", {
                                patient: patientId,
                            })
                                .getMany()];
                    case 13:
                        testResultTypes = _x.sent();
                        testResultTypes = Statics_1.StaticHelpers.arrayUnique(Statics_1.StaticHelpers.getColumnFromJsonObj(testResultTypes, 'remarks'));
                        _loop_1 = function (i) {
                            var type, referenceValues, resultsOfType, resultRow, rows, fieldType;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        type = testResultTypes[i];
                                        referenceValues = {};
                                        return [4 /*yield*/, TestResult_1.TestResult.repo().createQueryBuilder()
                                                .where("type = 'json' and patient_id = :patient and remarks = :type and created_at >= :date", {
                                                patient: patientId,
                                                type: type,
                                                date: mysqlDateThreeMonthsAgo,
                                            })
                                                .orderBy('id', 'DESC')
                                                .getMany()];
                                    case 1:
                                        resultsOfType = _a.sent();
                                        resultRow = {};
                                        resultsOfType.reverse().forEach(function (result) {
                                            if (result && result.json && result.json['fields'] && result.json['fields'].length) { }
                                            else
                                                return;
                                            result.json['fields'].forEach(function (field) {
                                                if (!referenceValues[field.name])
                                                    referenceValues[field.name] = field.reference;
                                                field.date = result.created_at.toISOString();
                                                delete field.loincs;
                                                delete field.reference;
                                                if (resultRow[field.name])
                                                    resultRow[field.name].push(field);
                                                else
                                                    resultRow[field.name] = [field];
                                            });
                                        });
                                        rows = [];
                                        for (fieldType in resultRow) {
                                            rows.push({
                                                type: fieldType,
                                                values: resultRow[fieldType],
                                                reference: referenceValues[fieldType],
                                            });
                                        }
                                        temp[type + ""] = rows;
                                        return [2 /*return*/];
                                }
                            });
                        };
                        i = 0;
                        _x.label = 14;
                    case 14:
                        if (!(i < testResultTypes.length)) return [3 /*break*/, 17];
                        return [5 /*yield**/, _loop_1(i)];
                    case 15:
                        _x.sent();
                        _x.label = 16;
                    case 16:
                        i++;
                        return [3 /*break*/, 14];
                    case 17:
                        for (key in temp)
                            dataToSend.testResults.push({
                                "type": key,
                                "results": temp[key],
                            });
                        return [4 /*yield*/, PersonalHistory_1.PersonalHistory.repo()
                                .createQueryBuilder()
                                .where('patient_id = :patient', { patient: patientId })
                                .orderBy('id', 'DESC')
                                .getMany()];
                    case 18:
                        personalHistories = _x.sent();
                        if (personalHistories && personalHistories.length) {
                            if (personalHistories[0] && personalHistories[0].info)
                                dataToSend.lastPersonalHistory = personalHistories[0].info;
                            dataToSend.personalHistories = personalHistories.map(function (row) {
                                var info = row.info;
                                info['date'] = row.created_at.toISOString();
                                return info;
                            });
                        }
                        return [4 /*yield*/, Attachment_1.Attachment.repo()
                                .createQueryBuilder()
                                .where("patient_id = :patient and soap_id in (" + recentSoapIdStr + ")", {
                                patient: patientId,
                            })
                                .orderBy('id', 'DESC')
                                .getMany()];
                    case 19:
                        pastImages = _x.sent();
                        testsBydate = {}, prescriptionsByDate = {}, othersByDate = {};
                        temp = {};
                        pastImages.forEach(function (attachment) {
                            var date = attachment.created_at;
                            switch (attachment.soap_section_type) {
                                case 'test-results':
                                    if (testsBydate[date.toDateString()])
                                        testsBydate[date.toDateString()].push(attachment.url);
                                    else
                                        testsBydate[date.toDateString()] = [attachment.url];
                                    break;
                                case 'prescription':
                                    if (prescriptionsByDate[date.toDateString()])
                                        prescriptionsByDate[date.toDateString()].push(attachment.url);
                                    else
                                        prescriptionsByDate[date.toDateString()] = [attachment.url];
                                    break;
                                default:
                                    if (othersByDate[date.toDateString()])
                                        othersByDate[date.toDateString()].push(attachment.url);
                                    else
                                        othersByDate[date.toDateString()] = [attachment.url];
                                    break;
                            }
                        });
                        for (day in testsBydate)
                            dataToSend.appendix.testResults.push({
                                date: day,
                                images: testsBydate[day],
                            });
                        for (day in prescriptionsByDate)
                            dataToSend.appendix.prescriptions.push({
                                date: day,
                                images: prescriptionsByDate[day],
                            });
                        for (day in othersByDate)
                            dataToSend.appendix.others.push({
                                date: day,
                                images: othersByDate[day],
                            });
                        _h = dataToSend.patientHistory;
                        _j = 'allergies';
                        return [4 /*yield*/, (new AllergiesRepository_1.AllergyRepository()).getAllergiesByPatientId(patientId)];
                    case 20:
                        _h[_j] = _x.sent();
                        _k = dataToSend.patientHistory;
                        _l = 'familyHistories';
                        return [4 /*yield*/, FamilyHistory_1.FamilyHistory.repo().find({ where: { patient_id: patientId } })];
                    case 21:
                        _k[_l] = _x.sent();
                        _m = dataToSend.patientHistory;
                        _o = 'diagnosis';
                        return [4 /*yield*/, (new DiagnosisRepository_1.DiagnosisRepository()).getPastDiagnosisByPatientId(patientId)];
                    case 22:
                        _m[_o] = _x.sent();
                        _p = dataToSend.patientHistory;
                        _q = 'procedures';
                        return [4 /*yield*/, (new ProcedureRepository_1.ProcedureRepository()).getProceduresById(patientId)];
                    case 23:
                        _p[_q] = _x.sent();
                        _r = dataToSend.patientHistory;
                        _s = 'habits';
                        return [4 /*yield*/, Habit_1.Habit.repo().find({ where: { patient_id: patientId } })];
                    case 24:
                        _r[_s] = _x.sent();
                        _t = dataToSend.patientHistory;
                        _u = 'pastIllnesses';
                        return [4 /*yield*/, PastIllness_1.PastIllness.repo().find({ where: { patient_id: patientId } })];
                    case 25:
                        _t[_u] = _x.sent();
                        _v = dataToSend.patientHistory;
                        _w = 'pastMedications';
                        return [4 /*yield*/, PastMedication_1.PastMedication.repo().find({ where: { patient_id: patientId } })];
                    case 26:
                        _v[_w] = _x.sent();
                        return [4 /*yield*/, Medication_1.Medication.repo()
                                .createQueryBuilder("row")
                                .where("row.soap_id in (" + recentSoapIdStr + ")")
                                .orderBy('id', 'DESC')
                                .getRawMany()];
                    case 27:
                        last3SoapsMedications = _x.sent();
                        return [4 /*yield*/, Soap_1.Soap.appendMedicationSalts(Statics_1.StaticHelpers.removePrefixFromTypeormRawResults(last3SoapsMedications))];
                    case 28:
                        last3SoapsMedications = _x.sent();
                        return [4 /*yield*/, Feedback_1.Feedback.repo()
                                .createQueryBuilder()
                                .where("soap_id in (" + recentSoapIdStr + ")")
                                .orderBy('id', 'DESC')
                                .getMany()];
                    case 29:
                        last3SoapsMedicationFeedback = _x.sent();
                        recentSoaps.forEach(function (soap) {
                            dataToSend.medicationsAndFeedbacks.push({
                                "date": soap.created_at,
                                "medications": last3SoapsMedications
                                    .filter(function (med) { return (med['soap_id'] === soap.id); })
                                    .map(function (med) {
                                    delete med.soap;
                                    return med;
                                }),
                                "feedbacks": last3SoapsMedicationFeedback
                                    .filter(function (feed) { return feed.consultation_code === soap.consultation_code; }),
                            });
                        });
                        return [2 /*return*/, res.send(this.build("GeneratePatientHistory: " + req.params.id, 1, {
                                data: dataToSend
                            }))];
                }
            });
        });
    };
    GenerateHistoryController.prototype.getDoctorCallInvitationInfo = function (patientid) {
        return __awaiter(this, void 0, void 0, function () {
            var now, meetMedimetryUrl, chosenConsultation, futureScheduledConsultations, pastMostRecentConsultation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        patientid = parseInt(patientid);
                        now = Statics_1.StaticHelpers.toMysql(new Date());
                        meetMedimetryUrl = this._config.get("meetMedimetryUrl", "https://meet.medimetry.com/");
                        chosenConsultation = {};
                        return [4 /*yield*/, this._db.wpdb("select * from medi_consultation where patient_id = " + patientid + " and schedule is not null and schedule > '" + now + "' order by schedule asc limit 0, 1")];
                    case 1:
                        futureScheduledConsultations = _a.sent();
                        if (futureScheduledConsultations && futureScheduledConsultations.length) {
                            chosenConsultation = futureScheduledConsultations[0];
                            return [2 /*return*/, {
                                    "time": chosenConsultation["schedule"],
                                    "message": "You have been invited to participate in the Consult at :time with following link.",
                                    "link": meetMedimetryUrl + chosenConsultation["code"],
                                }];
                        }
                        return [4 /*yield*/, this._db.wpdb("select * from medi_consultation where patient_id = " + patientid + " and created < '" + now + "' order by created desc limit 0, 1")];
                    case 2:
                        pastMostRecentConsultation = _a.sent();
                        if (pastMostRecentConsultation && pastMostRecentConsultation.length) {
                            chosenConsultation = pastMostRecentConsultation[0];
                            return [2 /*return*/, {
                                    "time": chosenConsultation["schedule"],
                                    "message": "You have been invited to participate in the Consult with following link.",
                                    "link": meetMedimetryUrl + chosenConsultation["code"],
                                }];
                        }
                        return [2 /*return*/, {}];
                }
            });
        });
    };
    GenerateHistoryController.prototype.generateLink = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, patientHistory, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!req.body.patient_id || !req.body.data || !req.body.to_name)
                            return [2 /*return*/, res.send(this.build("Missing required fields"))];
                        return [4 /*yield*/, Soap_1.Soap.repo().createQueryBuilder()
                                .where('patient_id = :patient', {
                                patient: req.body.patient_id
                            })
                                .orderBy('id', 'DESC')
                                .take(1)
                                .getOne()];
                    case 1:
                        soap = _c.sent();
                        patientHistory = new GeneratedHistory_1.GeneratedHistory;
                        patientHistory.data = req.body.data;
                        if (!req.body.inviteToConsult) return [3 /*break*/, 3];
                        _a = patientHistory.data;
                        _b = "callInvitation";
                        return [4 /*yield*/, this.getDoctorCallInvitationInfo(req.body.patient_id)];
                    case 2:
                        _a[_b] =
                            _c.sent();
                        _c.label = 3;
                    case 3:
                        patientHistory.soap = soap;
                        patientHistory.patient_id = req.body.patient_id;
                        patientHistory.consultation_code = soap.consultation_code;
                        patientHistory.for_name = req.body.to_name;
                        patientHistory.unique_id = Statics_1.StaticHelpers.strRandom(32);
                        return [4 /*yield*/, GeneratedHistory_1.GeneratedHistory.repo().save(patientHistory)];
                    case 4:
                        patientHistory = _c.sent();
                        return [2 /*return*/, res.send(this.build("Created", 1, {
                                row: patientHistory
                            }))];
                }
            });
        });
    };
    GenerateHistoryController.prototype.getViaUniqueId = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var generatedHistory, tillDate, timeLeft, user, token, consultation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.params.uniqueid)
                            return [2 /*return*/, res.send(this.build("Patient History Not found"))];
                        return [4 /*yield*/, GeneratedHistory_1.GeneratedHistory.repo()
                                .findOne({
                                where: { unique_id: req.params.uniqueid },
                                relations: ["soap", "soap.medications"],
                            })];
                    case 1:
                        generatedHistory = _a.sent();
                        if (!generatedHistory)
                            return [2 /*return*/, res.send(this.build("Patient History Not found"))];
                        tillDate = generatedHistory.created_at;
                        tillDate.setHours(tillDate.getHours() + 24);
                        timeLeft = tillDate.getTime() - (new Date).getTime();
                        if (timeLeft < 1)
                            return [2 /*return*/, res.send(this.build("This link is expired"))];
                        return [4 /*yield*/, User_1.User.repo()
                                .createQueryBuilder()
                                .where("user_id = :user", {
                                user: generatedHistory.soap.created_by,
                            })
                                .orderBy("id", "DESC")
                                .getOne()];
                    case 2:
                        user = _a.sent();
                        token = user ? user.access_token : "not provided";
                        return [4 /*yield*/, (new ConsultationsController_1.ConsultationsController("/temp", this.app))
                                .getConsultationListByCodes([generatedHistory.consultation_code])];
                    case 3:
                        consultation = _a.sent();
                        return [2 /*return*/, res.send(this.build("Here you go", 1, {
                                row: generatedHistory,
                                access_token: token,
                                consultation: consultation[0] || {},
                            }))];
                }
            });
        });
    };
    GenerateHistoryController.prototype.saveTreatmentPlan = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var generatedHitory, doctorId, treatmentPlanLog, params, foundNotes, examinationNote, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!req.body.unique_id)
                            return [2 /*return*/, res.send(this.build("Missing required fields"))];
                        return [4 /*yield*/, GeneratedHistory_1.GeneratedHistory.repo()
                                .findOne({
                                "where": { unique_id: req.body.unique_id },
                                "relations": ["soap"]
                            })];
                    case 1:
                        generatedHitory = _b.sent();
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.GenerateHistoryController.SaveTreatmentPlan, {
                                code: generatedHitory.consultation_code,
                            })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this._db.wpdb("select * from medi_consultation where code = '" + generatedHitory.soap.consultation_code + "'")];
                    case 3:
                        doctorId = _b.sent();
                        if (doctorId && doctorId[0] && doctorId[0]['user_id'])
                            doctorId = doctorId[0]['user_id'];
                        else
                            doctorId = 0;
                        treatmentPlanLog = new TreatmentPlanLogs_1.TreatmentPlanLogs;
                        treatmentPlanLog.generatedHistory = generatedHitory;
                        treatmentPlanLog.remarks = req.body.remarks || "";
                        treatmentPlanLog.follow_up = req.body.follow_up || "";
                        treatmentPlanLog.data = req.body.data || {};
                        return [4 /*yield*/, TreatmentPlanLogs_1.TreatmentPlanLogs.repo().save(treatmentPlanLog)];
                    case 4:
                        treatmentPlanLog = _b.sent();
                        if (!treatmentPlanLog.remarks) return [3 /*break*/, 6];
                        params = {
                            center_code: generatedHitory.soap.center_code,
                            from: 46,
                            to: doctorId || generatedHitory.soap.created_by,
                            consultation_code: generatedHitory.soap.consultation_code,
                            title: generatedHitory.for_name + " sent treatment plan. "
                                + (treatmentPlanLog.follow_up ? ("with followup: " + treatmentPlanLog.follow_up) : ""),
                            description: "Said: " + treatmentPlanLog.remarks,
                            meta: treatmentPlanLog.data,
                        };
                        return [4 /*yield*/, this._request.seRequest('api/v1/notifications/partner-notification/pms-receivedtreatmentplan', params)];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        if (!(req.body.observations && req.body.observations.length)) return [3 /*break*/, 9];
                        return [4 /*yield*/, Examination_1.Examination.repo()
                                .createQueryBuilder()
                                .delete()
                                .where("soap_id = :soap and remarks = :remark", {
                                soap: generatedHitory.soap.id,
                                remark: req.body.observations,
                            })
                                .execute()];
                    case 7:
                        foundNotes = _b.sent();
                        examinationNote = new Examination_1.Examination();
                        examinationNote.patient_id = generatedHitory.soap.patient_id;
                        examinationNote.uuid = generatedHitory.soap.uuid;
                        examinationNote.soap = generatedHitory.soap;
                        examinationNote.examined_place = "";
                        examinationNote.examined_organ = "";
                        examinationNote.examined_by = "";
                        examinationNote.doctor_id = generatedHitory.soap.created_by;
                        examinationNote.remarks = req.body.observations;
                        return [4 /*yield*/, Examination_1.Examination.repo().save(examinationNote)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        generatedHitory.soap.follow_up = treatmentPlanLog.follow_up;
                        generatedHitory.soap.remark = treatmentPlanLog.remarks;
                        return [4 /*yield*/, Soap_1.Soap.repo().save(generatedHitory.soap)];
                    case 10:
                        _b.sent();
                        res.send(this.build("Saved Successfully", 1, {
                            row: treatmentPlanLog,
                        }));
                        if (!(false && treatmentPlanLog.data['generateRx'])) return [3 /*break*/, 12];
                        req.params.soapId = generatedHitory.soap.id;
                        req.params.attachToCurrentSoap = true;
                        _a = req;
                        return [4 /*yield*/, User_1.User.repo()
                                .createQueryBuilder()
                                .where("user_id = :user", {
                                user: doctorId || generatedHitory.soap.created_by,
                            })
                                .orderBy("id", "DESC")
                                .getOne()];
                    case 11:
                        _a.user = _b.sent();
                        return [2 /*return*/, (new SoapController_1.SoapController("/temp", this.app))
                                .sendPrescription(req, res)];
                    case 12: return [2 /*return*/, this.build("Saved Successfully", 1, {
                            row: treatmentPlanLog
                        })];
                }
            });
        });
    };
    return GenerateHistoryController;
}(Router));
exports.GenerateHistoryController = GenerateHistoryController;
