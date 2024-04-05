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
var FamilyHistoryRepository_1 = require("../database/repository/FamilyHistoryRepository");
var HabitRepository_1 = require("../database/repository/HabitRepository");
var AllergiesRepository_1 = require("../database/repository/AllergiesRepository");
var FamilyHistory_1 = require("../database/models/FamilyHistory");
var Habit_1 = require("../database/models/Habit");
var Allergy_1 = require("../database/models/Allergy");
var TermsRepository_1 = require("../database/repository/TermsRepository");
var MedicationRepository_1 = require("../database/repository/MedicationRepository");
var DiagnosisRepository_1 = require("../database/repository/DiagnosisRepository");
var ProcedureRepository_1 = require("../database/repository/ProcedureRepository");
var Diagnosis_1 = require("../database/models/Diagnosis");
var Procedure_1 = require("../database/models/Procedure");
var AuthMiddleware_1 = require("./middlewares/AuthMiddleware");
var PastIllness_1 = require("../database/models/PastIllness");
var PastMedication_1 = require("../database/models/PastMedication");
var ShadowSave_1 = require("./middlewares/ShadowSave");
var AuditLog_1 = require("../database/models/AuditLog");
var Router = require('./Router');
var HistoryController = /** @class */ (function (_super) {
    __extends(HistoryController, _super);
    function HistoryController(routePath, app) {
        var _this = _super.call(this, routePath, app) || this;
        //Need to make Global
        _this.termRepository = new TermsRepository_1.TermsRepository();
        _this.habitRepo = new HabitRepository_1.PatientHabitRepository();
        _this.familyHistoryRepo = new FamilyHistoryRepository_1.FamilyHistoryRepository();
        _this.allergiesRepo = new AllergiesRepository_1.AllergyRepository();
        _this.medicineRepository = new MedicationRepository_1.MedicationRepository();
        _this.diagnosisRepository = new DiagnosisRepository_1.DiagnosisRepository();
        _this.procedureRepo = new ProcedureRepository_1.ProcedureRepository();
        return _this;
    }
    HistoryController.prototype.preMiddlewares = function () { return [AuthMiddleware_1.AuthMiddleware]; };
    HistoryController.prototype.postMiddlewares = function () { return [ShadowSave_1.ShadowSave]; };
    Object.defineProperty(HistoryController.prototype, "services", {
        get: function () {
            return {
                'POST /getHistory': "getHistory",
                '/getHistoryV2/:patient': "getHistoryV2",
                'POST /createHistory': 'createHistory',
                'POST /createBulkHistory': 'createBulkHistory',
                'POST /getTerms': 'getTerms',
                '/getPastMedications/:patientId': 'getPastMedications',
                'POST /delete': 'deleteHistory'
            };
        },
        enumerable: true,
        configurable: true
    });
    HistoryController.prototype.deleteHistory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var deleteResponse, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!req.body.type || !req.body.id) {
                            return [2 /*return*/, res.send(this.build("Some Params are missing", 0))];
                        }
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.HistoryController.DeleteHistory)];
                    case 1:
                        _b.sent();
                        _a = req.body.type;
                        switch (_a) {
                            case FamilyHistory_1.FamilyHistory.REQUEST_TYPE: return [3 /*break*/, 2];
                            case Habit_1.Habit.REQUEST_TYPE: return [3 /*break*/, 5];
                            case Allergy_1.Allergy.REQUEST_TYPE: return [3 /*break*/, 8];
                            case Diagnosis_1.Diagnosis.REQUST_TYPE: return [3 /*break*/, 11];
                            case Procedure_1.Procedure.REQUEST_TYPE: return [3 /*break*/, 14];
                        }
                        return [3 /*break*/, 17];
                    case 2: return [4 /*yield*/, FamilyHistory_1.FamilyHistory.repo().findOne({ where: { id: req.body.id } })];
                    case 3:
                        deleteResponse = _b.sent();
                        return [4 /*yield*/, this.familyHistoryRepo.deleteHistory(req.body.id)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 5: return [4 /*yield*/, Habit_1.Habit.repo().findOne({ where: { id: req.body.id } })];
                    case 6:
                        deleteResponse = _b.sent();
                        return [4 /*yield*/, this.habitRepo.deleteHabits(req.body.id)];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 8: return [4 /*yield*/, Allergy_1.Allergy.repo().findOne({ where: { id: req.body.id } })];
                    case 9:
                        deleteResponse = _b.sent();
                        return [4 /*yield*/, this.allergiesRepo.deleteById(req.body.id)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 11: return [4 /*yield*/, Diagnosis_1.Diagnosis.repo().findOne({ where: { id: req.body.id } })];
                    case 12:
                        deleteResponse = _b.sent();
                        return [4 /*yield*/, this.diagnosisRepository.deleteById(req.body.id)];
                    case 13:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 14: return [4 /*yield*/, Procedure_1.Procedure.repo().findOne({ where: { id: req.body.id } })];
                    case 15:
                        deleteResponse = _b.sent();
                        return [4 /*yield*/, this.procedureRepo.deleteById(req.body.id)];
                    case 16:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 17: return [2 /*return*/, res.send(this.build("type missing", 0))];
                    case 18: return [2 /*return*/, res.send(this.build("Successfully Deleted", 1, { deleteResponse: deleteResponse }))];
                }
            });
        });
    };
    HistoryController.prototype.getTerms = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var rows, uniqueNames;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.termRepository.getTerms(req.body.type, req.body.term || req.body.text)];
                    case 1:
                        rows = _a.sent();
                        uniqueNames = [];
                        rows.filter(function (row) {
                            if (uniqueNames.indexOf(row.term_body.toLowerCase().trim()) > -1)
                                return false;
                            uniqueNames.push(row.term_body.toLowerCase().trim());
                            return true;
                        });
                        res.send(this.build("Terms sent", "1", { 'data': rows }, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    HistoryController.prototype.getHistory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var allergies, habits, diagnosis, procedures, familyHistory, allergies_1, habits_1, diagnosis_1, procedures_1, pastIllnesses, pastMedications;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.getPatientId = req.body.patientId;
                        return [4 /*yield*/, this.allergiesRepo.getAllergiesByPatientId(this.getPatientId)];
                    case 1:
                        allergies = _a.sent();
                        return [4 /*yield*/, this.habitRepo.getHabitsByPatientId(this.getPatientId)];
                    case 2:
                        habits = _a.sent();
                        return [4 /*yield*/, this.diagnosisRepository.getPastDiagnosisByPatientId(this.getPatientId)];
                    case 3:
                        diagnosis = _a.sent();
                        diagnosis.map(function (diag) {
                            diag["diagnosis"] = diag.term.term_body;
                            return diag;
                        });
                        return [4 /*yield*/, this.procedureRepo.getProceduresById(this.getPatientId)];
                    case 4:
                        procedures = _a.sent();
                        return [4 /*yield*/, this.familyHistoryRepo.getFamilyHistoryByPatientId(this.getPatientId)];
                    case 5:
                        familyHistory = _a.sent();
                        if (!!req.body.type) return [3 /*break*/, 6];
                        res.send(this.build("No Type Found with request", 0));
                        return [3 /*break*/, 14];
                    case 6:
                        if (!(req.body.type === FamilyHistory_1.FamilyHistory.REQUEST_TYPE)) return [3 /*break*/, 7];
                        console.debug("Data Entering ", req.body);
                        console.debug("Data Getting ", familyHistory);
                        this.historyObject = {
                            "familyHistory": familyHistory,
                            "allergies": [],
                            "habits": [],
                            "past_illness": [],
                            "past_treatment": []
                        };
                        return [3 /*break*/, 14];
                    case 7: return [4 /*yield*/, this.allergiesRepo.getAllergiesByPatientId(this.getPatientId)];
                    case 8:
                        allergies_1 = _a.sent();
                        return [4 /*yield*/, this.habitRepo.getHabitsByPatientId(this.getPatientId)];
                    case 9:
                        habits_1 = _a.sent();
                        return [4 /*yield*/, this.diagnosisRepository.getPastDiagnosisByPatientId(this.getPatientId)];
                    case 10:
                        diagnosis_1 = _a.sent();
                        diagnosis_1.map(function (diag) {
                            diag["diagnosis"] = diag.term.term_body;
                            return diag;
                        });
                        return [4 /*yield*/, this.procedureRepo.getProceduresById(this.getPatientId)];
                    case 11:
                        procedures_1 = _a.sent();
                        return [4 /*yield*/, PastIllness_1.PastIllness.repo().find({
                                where: { patient_id: this.getPatientId }
                            })];
                    case 12:
                        pastIllnesses = _a.sent();
                        return [4 /*yield*/, PastMedication_1.PastMedication.repo().find({
                                where: { patient_id: this.getPatientId }
                            })];
                    case 13:
                        pastMedications = _a.sent();
                        this.historyObject = {
                            "familyHistory": familyHistory,
                            "allergies": allergies_1,
                            "habits": habits_1,
                            "past_illness": diagnosis_1,
                            "past_treatment": procedures_1,
                            "past_illness_2": pastIllnesses,
                            "past_medication_2": pastMedications
                        };
                        _a.label = 14;
                    case 14:
                        res.send(this.build("History Data", 1, this.historyObject, req));
                        return [2 /*return*/];
                }
            });
        });
    };
    HistoryController.prototype.createBulkHistory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var termsToSave, getHabitObject, getFamilyHistoryObject, getAllergiesObject, getPastIllenessObject, getPastTreatments, response, termVsId;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.HistoryController.CreateBulkHistory)];
                    case 1:
                        _a.sent();
                        termsToSave = Array();
                        getHabitObject = req.body.data.habits;
                        getFamilyHistoryObject = req.body.data.family_history;
                        getAllergiesObject = req.body.data.allergy;
                        getPastIllenessObject = req.body.data.past_illness;
                        getPastTreatments = req.body.data.past_treatment;
                        getHabitObject.forEach(function (habit) {
                            if (habit.terms < 1) {
                                termsToSave.push(_this.makeTermObject(Habit_1.Habit.REQUEST_TYPE, habit, habit.term_text));
                            }
                        });
                        getPastIllenessObject.forEach(function (past_illness) {
                            termsToSave.push(_this.makeTermObject(Diagnosis_1.Diagnosis.REQUST_TYPE, past_illness, past_illness.diagnosis));
                        });
                        getPastTreatments.forEach(function (past_treatment) {
                            termsToSave.push(_this.makeTermObject(Procedure_1.Procedure.REQUEST_TYPE, past_treatment, past_treatment.term_text));
                        });
                        return [4 /*yield*/, this.termRepository.syncTerms(termsToSave)];
                    case 2:
                        response = _a.sent();
                        termVsId = {};
                        termVsId = this.termsVsIdExtractor(response, termVsId);
                        console.debug("term vs id", termVsId);
                        getHabitObject.map(function (obj) {
                            if (!obj.terms)
                                obj.terms = termVsId["habit"][obj.term_text];
                            return obj;
                        });
                        getPastIllenessObject.map(function (obj) {
                            if (!obj.term) {
                                obj.term = termVsId["diagnosis"][obj.diagnosis];
                            }
                            return obj;
                        });
                        getPastTreatments.map(function (obj) {
                            if (!obj.term_id)
                                obj.term_id = termVsId["procedure"][obj.term_text];
                            return obj;
                        });
                        if (!(getHabitObject.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.habitRepo.saveHabits(getHabitObject).catch(function (error) {
                                console.debug("Habit", error);
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(getFamilyHistoryObject.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.familyHistoryRepo.saveHistory(getFamilyHistoryObject).catch(function (error) {
                                console.debug("Family " + error);
                            })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!(getPastIllenessObject.length > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.diagnosisRepository.saveDiagnosis(getPastIllenessObject).catch(function (error) {
                                console.debug("diagnosis ", error);
                            })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        if (!(getPastTreatments.length > 0)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.procedureRepo.saveProcedure(getPastTreatments).catch(function (error) {
                                console.debug("diagnosis ", error);
                            })];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        getAllergiesObject.forEach((function (data_allergy) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Allergy_1.Allergy.saveFromRequest(data_allergy)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }));
                        return [2 /*return*/, res.send(this.build("Successful", 1, req))];
                }
            });
        });
    };
    HistoryController.prototype.getUnsavedTermsList = function (data_allergy, termsToSave) {
        if (data_allergy.terms < 1) {
            termsToSave.push(this.makeTermObject(Allergy_1.Allergy.REQUEST_TYPE, data_allergy, data_allergy.term_name));
        }
        //Only if allergy substance term id is 0
        if (data_allergy.substance < 1) {
            termsToSave.push(this.makeTermObject(Allergy_1.Allergy.REQUEST_TYPE_SUBSTANCE, data_allergy, data_allergy.substance_name));
        }
        return termsToSave;
    };
    HistoryController.prototype.createHistory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, term, _c, _d, term_1, _e, term_2, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!(req.body.data && req.body.data.patient_id)) return [3 /*break*/, 2];
                        return [4 /*yield*/, AuditLog_1.AuditLog.create(req, AuditLog_1.AuditLog.TYPES.HistoryController.CreateHistory, {
                                patient: req.body.data.patient_id,
                            })];
                    case 1:
                        _g.sent();
                        _g.label = 2;
                    case 2:
                        _a = req.body.type;
                        switch (_a) {
                            case FamilyHistory_1.FamilyHistory.REQUEST_TYPE: return [3 /*break*/, 3];
                            case Habit_1.Habit.REQUEST_TYPE: return [3 /*break*/, 5];
                            case Allergy_1.Allergy.REQUEST_TYPE: return [3 /*break*/, 8];
                            case Diagnosis_1.Diagnosis.REQUST_TYPE: return [3 /*break*/, 10];
                            case Procedure_1.Procedure.REQUEST_TYPE: return [3 /*break*/, 14];
                        }
                        return [3 /*break*/, 18];
                    case 3:
                        _b = this;
                        return [4 /*yield*/, this.familyHistoryRepo.saveHistory(req.body.data).catch(function (error) {
                                console.debug("Error", error);
                            })];
                    case 4:
                        _b.response = _g.sent();
                        return [3 /*break*/, 19];
                    case 5:
                        term = void 0;
                        return [4 /*yield*/, this.saveTermIfNotExists(req, term)];
                    case 6:
                        _g.sent();
                        _c = this;
                        return [4 /*yield*/, this.habitRepo.saveHabits(req.body.data).catch(function (error) {
                                console.error("Error", error);
                            })];
                    case 7:
                        _c.response = _g.sent();
                        return [3 /*break*/, 19];
                    case 8:
                        //It can be 0 only if no term available.
                        _d = this;
                        return [4 /*yield*/, Allergy_1.Allergy.saveFromRequest(req.body.data)];
                    case 9:
                        //It can be 0 only if no term available.
                        _d.response = _g.sent();
                        return [3 /*break*/, 19];
                    case 10:
                        if (!(req.body.data.term == 0 && !req.body.data.icd_code)) return [3 /*break*/, 12];
                        // #280: use 'diagnosis' text intead of term_text
                        if (req.body.data.diagnosis)
                            req.body.data.term_text = req.body.data.diagnosis;
                        return [4 /*yield*/, this.termRepository.saveTerm(req.body)];
                    case 11:
                        term_1 = _g.sent();
                        req.body.data.term = term_1.id;
                        _g.label = 12;
                    case 12:
                        _e = this;
                        return [4 /*yield*/, this.diagnosisRepository.saveDiagnosis(req.body.data)];
                    case 13:
                        _e.response = _g.sent();
                        return [3 /*break*/, 19];
                    case 14:
                        if (!!req.body.data.term) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.termRepository.saveTerm(req.body)];
                    case 15:
                        term_2 = _g.sent();
                        req.body.data.term = req.body.data.term_id = term_2.id || term_2.term;
                        _g.label = 16;
                    case 16:
                        _f = this;
                        return [4 /*yield*/, this.procedureRepo.saveProcedure(req.body.data)];
                    case 17:
                        _f.response = _g.sent();
                        return [3 /*break*/, 19];
                    case 18: return [2 /*return*/, res.send(this.build("Invalid Request Type", 0))];
                    case 19: return [2 /*return*/, res.send(this.build("Terms Data", 1, { "data": this.response }, req))];
                }
            });
        });
    };
    HistoryController.prototype.getHistoryV2 = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var allergies, familyHistories, diagnosis, procedures, habits, pastIllnesses, pastMedications;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.allergiesRepo.getAllergiesByPatientId(req.params.patient)];
                    case 1:
                        allergies = _a.sent();
                        return [4 /*yield*/, FamilyHistory_1.FamilyHistory.repo().find({ where: { patient_id: req.params.patient } })];
                    case 2:
                        familyHistories = _a.sent();
                        return [4 /*yield*/, (new DiagnosisRepository_1.DiagnosisRepository()).getPastDiagnosisByPatientId(req.params.patient)];
                    case 3:
                        diagnosis = _a.sent();
                        return [4 /*yield*/, (new ProcedureRepository_1.ProcedureRepository()).getProceduresById(req.params.patient)];
                    case 4:
                        procedures = _a.sent();
                        return [4 /*yield*/, Habit_1.Habit.repo().find({ where: { patient_id: req.params.patient } })];
                    case 5:
                        habits = _a.sent();
                        return [4 /*yield*/, PastIllness_1.PastIllness.repo().find({ where: { patient_id: this.getPatientId } })];
                    case 6:
                        pastIllnesses = _a.sent();
                        return [4 /*yield*/, PastMedication_1.PastMedication.repo().find({ where: { patient_id: this.getPatientId } })];
                    case 7:
                        pastMedications = _a.sent();
                        return [2 /*return*/, res.send(this.build("Here you go", 1, {
                                "familyHistory": this.groupByCreatedDate(familyHistories),
                                "allergies": this.groupByCreatedDate(allergies),
                                "habits": this.groupByCreatedDate(habits),
                                "past_illness": this.groupByCreatedDate(diagnosis),
                                "past_treatment": this.groupByCreatedDate(procedures),
                                "past_illness_2": this.groupByCreatedDate(pastIllnesses),
                                "past_medication_2": this.groupByCreatedDate(pastMedications)
                            }, req))];
                }
            });
        });
    };
    HistoryController.prototype.replaceTermsIdToAllergy = function (allergyObject, termVsId) {
        if (!allergyObject.terms) {
            allergyObject.terms = termVsId['allergy'][allergyObject.term_name];
        }
        if (!allergyObject.substance) {
            allergyObject.substance = termVsId['allergy_substance'][allergyObject.substance_name];
        }
        return allergyObject;
    };
    HistoryController.prototype.termsVsIdExtractor = function (savedTerms, termVsId) {
        savedTerms.forEach(function (row) {
            if (typeof termVsId[row.term_type] === "object") {
                termVsId[row.term_type][row.term_name] = row.id;
            }
            else {
                termVsId[row.term_type] = {};
                termVsId[row.term_type][row.term_name] = row.id;
            }
        });
        return termVsId;
    };
    HistoryController.prototype.saveTermIfNotExists = function (req, term) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!req.body.data.terms) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.termRepository.saveTerm(req.body)];
                    case 1:
                        term = _a.sent();
                        req.body.data.terms = term.id;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    HistoryController.prototype.groupByCreatedDate = function (rows) {
        var uniqueDates = [];
        rows.forEach(function (row) {
            if (uniqueDates.indexOf(row.created_at.toDateString()) === -1)
                uniqueDates.push(row.created_at.toDateString());
        });
        var groupedRows = {};
        uniqueDates.forEach(function (date) {
            groupedRows[date] = rows.filter(function (row) {
                return row.created_at.toDateString() === date;
            });
        });
        return groupedRows;
    };
    HistoryController.prototype.getPastMedications = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.medicineRepository.getPastMedicationByPatientId(req.params.patientId).then(function (row) {
                    res.send(_this.build("success", 1, { "medication": row }, req));
                }).catch(function (err) {
                    console.error(err);
                    res.send(_this.build("Error Occured", 0));
                });
                return [2 /*return*/];
            });
        });
    };
    HistoryController.prototype.makeTermObject = function (term_type, object, term_name) {
        return {
            "doctor_id": object.doctor_id,
            "term_type": term_type,
            "term_name": term_name,
            "term_body": term_name,
            "meta": [],
            "created_at": object.created_at
        };
    };
    return HistoryController;
}(Router));
exports.HistoryController = HistoryController;
