#!/usr/bin/env node
"use strict";
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
var DatabaseConfiguration_1 = require("../config/DatabaseConfiguration");
var Config_1 = require("../config/Config");
var Statics_1 = require("../helpers/Statics");
var Soap_1 = require("../database/models/Soap");
var Allergy_1 = require("../database/models/Allergy");
var FamilyHistory_1 = require("../database/models/FamilyHistory");
var Habit_1 = require("../database/models/Habit");
var PastIllness_1 = require("../database/models/PastIllness");
var PastMedication_1 = require("../database/models/PastMedication");
var typeorm_1 = require("typeorm");
var ShadowSave_1 = require("../controllers/middlewares/ShadowSave");
var Procedure_1 = require("../database/models/Procedure");
var ExportShadowZip_1 = require("./ExportShadowZip");
var uuidv1 = require('uuid/v1');
var CreateJsonForDate = /** @class */ (function () {
    function CreateJsonForDate() {
        this.DATE_STAMP = Statics_1.StaticHelpers.dateStamp();
        this._db = DatabaseConfiguration_1.db;
        this._config = Config_1.config;
        this._sh = require('shelljs');
        this._fs = require('fs');
        if (process.argv[2])
            this.DATE_STAMP = process.argv[2];
    }
    CreateJsonForDate.prototype.handle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var today, todate, tomorrow, year, month, requestIdPrefix, count, soaps, allChannels, allCenters, consultationCodes, mediConsultations, mediPObjects, postIds, mediPosts, patientIds, mediPatients, userIds, mediUsers, mediUserAddress, mediUserIdVsAddress, colPatientId, fullSoaps, i, _a, _b, allergies, familyHistories, habits, procedures, pastIllnesses, pastMedications, json, _loop_1, i, workerThread, pwd, filePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        today = this.DATE_STAMP + "T00:00:00.000Z";
                        todate = new Date(today);
                        tomorrow = new Date((todate).getTime() + 24 * 60 * 60 * 1000).toISOString();
                        year = todate.getFullYear();
                        month = todate.getMonth();
                        requestIdPrefix = uuidv1() + "-";
                        count = 0;
                        return [4 /*yield*/, Soap_1.Soap.repo().query("select * from soaps where created_at >= '" + today + "' " +
                                ("and created_at < '" + tomorrow + "'"))];
                    case 1:
                        soaps = _c.sent();
                        if (!soaps) {
                            console.error("no soaps found: ", soaps);
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, this._db.wpdb("select * from channels")];
                    case 2:
                        allChannels = _c.sent();
                        allChannels = Statics_1.StaticHelpers.arrayToMappedObject(allChannels, "id");
                        return [4 /*yield*/, this._db.wpdb("select * from channel_centers")];
                    case 3:
                        allCenters = _c.sent();
                        allCenters = Statics_1.StaticHelpers.arrayToMappedObject(allCenters, "code");
                        consultationCodes = soaps.map(function (soap) { return "'" + soap.consultation_code + "'"; }).join(",");
                        if (!consultationCodes)
                            return [2 /*return*/, console.error("No consultation found for soaps: ", consultationCodes)];
                        return [4 /*yield*/, this._db.wpdb("select * from medi_consultation where code in (" + consultationCodes + ")")];
                    case 4:
                        mediConsultations = _c.sent();
                        return [4 /*yield*/, this._db.wpdb("select * from medi_pobject where code in (" + consultationCodes + ")")];
                    case 5:
                        mediPObjects = _c.sent();
                        postIds = mediPObjects.map(function (c) { return "'" + c.post_id + "'"; }).join(",");
                        return [4 /*yield*/, this._db.wpdb("select * from medi_posts where ID in (" + postIds + ")")];
                    case 6:
                        mediPosts = _c.sent();
                        patientIds = mediConsultations.map(function (c) { return "'" + c.patient_id + "'"; }).join(",");
                        return [4 /*yield*/, this._db.wpdb("select * from medi_patients where id in (" + patientIds + ")")];
                    case 7:
                        mediPatients = _c.sent();
                        userIds = mediPatients.map(function (x) { return "'" + x.user_id + "'"; }).join(",");
                        return [4 /*yield*/, this._db.wpdb("select * from medi_users where ID in (" + userIds + ")")];
                    case 8:
                        mediUsers = _c.sent();
                        return [4 /*yield*/, this._db.wpdb("select * from medi_usermeta where user_id in (" + userIds + ") and meta_key = 'address'")];
                    case 9:
                        mediUserAddress = _c.sent();
                        mediUserIdVsAddress = {};
                        mediUserAddress.forEach(function (usermeta) {
                            mediUserIdVsAddress[usermeta["user_id"]] = usermeta["meta_value"];
                        });
                        colPatientId = Statics_1.StaticHelpers.getColumnFromJsonObj(mediConsultations, 'patient_id');
                        mediConsultations = Statics_1.StaticHelpers.arrayToMappedObject(mediConsultations, 'code');
                        mediPObjects = Statics_1.StaticHelpers.arrayToMappedObject(mediPObjects, 'code');
                        mediPosts = Statics_1.StaticHelpers.arrayToMappedObject(mediPosts, 'ID');
                        mediPatients = Statics_1.StaticHelpers.arrayToMappedObject(mediPatients, 'id');
                        mediUsers = Statics_1.StaticHelpers.arrayToMappedObject(mediUsers, 'ID');
                        fullSoaps = [];
                        i = 0;
                        _c.label = 10;
                    case 10:
                        if (!(i < soaps.length)) return [3 /*break*/, 13];
                        _b = (_a = fullSoaps).push;
                        return [4 /*yield*/, Soap_1.Soap.getFullById(soaps[i]["id"])];
                    case 11:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 12;
                    case 12:
                        i++;
                        return [3 /*break*/, 10];
                    case 13: return [4 /*yield*/, Allergy_1.Allergy.repo().find({ where: { patient_id: typeorm_1.In(colPatientId), created_at: typeorm_1.Between(this.DATE_STAMP + " 00:00:00", this.DATE_STAMP + " 23:59:59") } })];
                    case 14:
                        allergies = _c.sent();
                        allergies = allergies.map(function (allergy) {
                            var substances = [];
                            var reactions = [];
                            var terms = allergy.meta["terms"] || [];
                            for (var i = 0; i < terms.length; i++) {
                                if (terms[i].term_type == "allergy_reaction") {
                                    reactions.push(terms[i].term_body);
                                }
                                if (terms[i].term_type == "allergy_substance") {
                                    substances.push(terms[i].term_body);
                                }
                            }
                            allergy["substances"] = substances.join(",");
                            allergy["reactions"] = reactions.join(",");
                            return allergy;
                        });
                        return [4 /*yield*/, FamilyHistory_1.FamilyHistory.repo().find({ where: { patient_id: typeorm_1.In(colPatientId), created_at: typeorm_1.Between(this.DATE_STAMP + " 00:00:00", this.DATE_STAMP + " 23:59:59") } })];
                    case 15:
                        familyHistories = _c.sent();
                        return [4 /*yield*/, Habit_1.Habit.repo().find({ where: { patient_id: typeorm_1.In(colPatientId), created_at: typeorm_1.Between(this.DATE_STAMP + " 00:00:00", this.DATE_STAMP + " 23:59:59"), relations: ["terms"] } })];
                    case 16:
                        habits = _c.sent();
                        habits = habits.map(function (habit) {
                            habit["term_text"] = (habit["terms"] || {})["term_body"] || "";
                            return habit;
                        });
                        return [4 /*yield*/, Procedure_1.Procedure.repo().find({ where: { patient_id: typeorm_1.In(colPatientId), created_at: typeorm_1.Between(this.DATE_STAMP + " 00:00:00", this.DATE_STAMP + " 23:59:59"), soap_id: 1 }, relations: ["term"] })];
                    case 17:
                        procedures = _c.sent();
                        procedures = procedures.map(function (procedure) {
                            procedure["term_text"] = (procedure["term"] || {})["term_body"] || "";
                            return procedure;
                        });
                        return [4 /*yield*/, PastIllness_1.PastIllness.repo().find({ where: { patient_id: typeorm_1.In(colPatientId), created_at: typeorm_1.Between(this.DATE_STAMP + " 00:00:00", this.DATE_STAMP + " 23:59:59") } })];
                    case 18:
                        pastIllnesses = _c.sent();
                        return [4 /*yield*/, PastMedication_1.PastMedication.repo().find({ where: { patient_id: typeorm_1.In(colPatientId), created_at: typeorm_1.Between(this.DATE_STAMP + " 00:00:00", this.DATE_STAMP + " 23:59:59") } })];
                    case 19:
                        pastMedications = _c.sent();
                        json = {};
                        _loop_1 = function (i) {
                            count++;
                            var soap = fullSoaps[i];
                            var consultation = mediConsultations[soap["consultation_code"]];
                            var pobject = mediPObjects[soap["consultation_code"]];
                            var patient = mediPatients[consultation["patient_id"]];
                            var user = mediUsers[patient["user_id"]];
                            var post = mediPosts[pobject["post_id"]];
                            // why i am not using today.getTime() - DOB.getTime() & convert to month year,
                            //      is because, all months will average out to 30 days, and we cant have that.
                            var DOB = new Date(patient["date_of_birth"]);
                            var inMon = ((month - DOB.getMonth()) + 12) % 12;
                            var ageInYears = year - (((month - DOB.getMonth()) > 0) ? (DOB.getFullYear() + 1) : (DOB.getFullYear()));
                            var finalAge = ageInYears + (inMon ? "." + inMon : "");
                            var histories = [];
                            histories = histories.concat(allergies.filter(function (allery) { return allery["patient_id"] == patient["id"]; }).map(function (allery) {
                                allery["type"] = "allergy";
                                return allery;
                            }));
                            histories = histories.concat(familyHistories.filter(function (entity) { return entity["patient_id"] == patient["id"]; }).map(function (entity) {
                                entity["type"] = "family_history";
                                return entity;
                            }));
                            histories = histories.concat(habits.filter(function (entity) { return entity["patient_id"] == patient["id"]; }).map(function (entity) {
                                entity["type"] = "habit";
                                return entity;
                            }));
                            histories = histories.concat(procedures.filter(function (entity) { return entity["patient_id"] == patient["id"]; }).map(function (entity) {
                                entity["type"] = "procedure";
                                return entity;
                            }));
                            json[consultation["code"]] = {
                                "request": {
                                    "user_name": user["display_name"],
                                    "user_mobile": user["user_login"].substring(2),
                                    "user_email": user["user_email"],
                                    "user_dob": "",
                                    "patient_name": patient["name"],
                                    "patient_age": finalAge,
                                    "patient_gender": patient["gender"],
                                    "patient_relation": (patient["name"] == patient["relation"]) ? "self" : patient["relation"],
                                    "chief_complaints": post["post_content"],
                                    "center_code": patient["center_code"],
                                    "channel_name": allChannels[patient["channel_id"]]["name"],
                                    "consult_type": pobject["object_type"].toUpperCase(),
                                    "speciality": "Family Physician",
                                    "doctor": consultation["user_id"],
                                    "address": mediUserIdVsAddress[user["ID"]] || allCenters[patient["center_code"]]["address"],
                                    "user_address": mediUserIdVsAddress[user["ID"]] || allCenters[patient["center_code"]]["address"],
                                },
                                "createConsultationResp": {
                                    "message": "Consultation Created Successfully",
                                    "success": 1,
                                    "postId": post["ID"],
                                    "code": consultation["code"],
                                    "txnid": "",
                                    "patientId": patient["id"],
                                    "$$reqId": requestIdPrefix + count,
                                },
                                "code": consultation["code"],
                                "soap": soap,
                                "pastIllnesses": pastIllnesses.filter(function (entity) { return entity["patient_id"] == patient["id"]; }),
                                "pastMedications": pastMedications.filter(function (entity) { return entity["patient_id"] == patient["id"]; }),
                                "history": histories,
                            };
                        };
                        for (i = 0; i < fullSoaps.length; i++) {
                            _loop_1(i);
                        }
                        workerThread = new ShadowSave_1.ShadowSaveWorker();
                        workerThread.setDateStamp(this.DATE_STAMP);
                        pwd = this._sh.exec("pwd").stdout.replace("\n", "");
                        filePath = pwd + "/shadowSaveDumps/" + this.DATE_STAMP + ".json";
                        // console.log(StaticHelpers.stringify(json), filePath);
                        return [4 /*yield*/, this._fs.writeFile(filePath, Statics_1.StaticHelpers.stringify(json), function (err) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (err)
                                                    console.error(err);
                                                else
                                                    console.log('Saved!');
                                                return [4 /*yield*/, (new ExportShadowZip_1.ExportShadowZip()).handle()];
                                            case 1:
                                                _a.sent();
                                                process.exit(0);
                                                return [2 /*return*/, true];
                                        }
                                    });
                                });
                            })];
                    case 20:
                        // console.log(StaticHelpers.stringify(json), filePath);
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return CreateJsonForDate;
}());
exports.CreateJsonForDate = CreateJsonForDate;
console.log('Starting ...');
setTimeout(function () {
    (new CreateJsonForDate()).handle().then(function () {
        console.log('!! End !!');
        // process.exit(0);
    });
}, 2000);
