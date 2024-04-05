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
var S3_1 = require("../config/S3");
var HttpRequest_1 = require("../helpers/HttpRequest");
var util = require("util");
var ImportUberPatientsSheetData = /** @class */ (function () {
    function ImportUberPatientsSheetData() {
        this.DATE_STAMP = Statics_1.StaticHelpers.dateStamp();
        this.places = ['gurgaon', 'mumbai'];
        this.centerCodes = ['medimetry-camps-EFO9lucHxfAI1EGnAvnEgqAlT9ktMTkh', 'medimetry-camps-0sqdtbB09yLdAKslslP6GxJ81Uf0xkKk'];
        this._consultationCreationResp = {};
        this.wordmap = {
            "never": 1,
            "naver": 1,
            "niver": 1,
            "occasionally": 2,
            "addicted": 5,
            "reglur": 5,
            "regular": 5,
            "exercise": 4,
        };
        this.allergyMaterials = ['dust', 'unripe mango', 'honey', 'dye', 'sun exposure',
            'spicey food', 'changing wheather', 'onion', 'garlic', 'eggs', 'perfume',
            'winters', 'climate change', 'sunlight', 'reflection of light', 'co-cola',
            'warm food', 'drink', 'summer', 'dast', 'heavy medicine', 'chauli', 'fungal treatment',
            'mutton', 'dahi', 'ghee', 'butter',
        ];
        this.bloodRelations = [
            "father", "mother", "brother", "wife", "grandfather", "sister", "grandmother",
        ];
        this._db = DatabaseConfiguration_1.db;
        this._config = Config_1.config;
        this._sh = require('shelljs');
        this._fs = require('fs');
        this._s3Uploader = S3_1.uploader;
        this._http = new HttpRequest_1.HttpRequest;
        if (process.argv[2])
            this.DATE_STAMP = process.argv[2];
    }
    ImportUberPatientsSheetData.prototype.handle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var readFile, filePath, i, fileName, data, rows, j;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        readFile = util.promisify(this._fs.readFile);
                        filePath = __dirname.replace("src/commands", "uber-patients-data-:place.csv");
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.places.length)) return [3 /*break*/, 7];
                        fileName = filePath.replace(":place", this.places[i]);
                        console.log("File path: ", fileName);
                        return [4 /*yield*/, readFile(fileName)];
                    case 2:
                        data = _a.sent();
                        rows = this.CSVToArray(data.toString());
                        j = 0;
                        _a.label = 3;
                    case 3:
                        if (!(j < rows.length)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.createPatientAndWork(rows[j], this.centerCodes[i], this.places[i])];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        j++;
                        return [3 /*break*/, 3];
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ImportUberPatientsSheetData.prototype.CSVToArray = function (strData, strDelimiter) {
        if (strDelimiter === void 0) { strDelimiter = ','; }
        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp((
        // Delimiters.
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];
        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;
        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];
            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter) {
                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);
            }
            var strMatchedValue = void 0;
            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {
                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
            }
            else {
                // We found a non-quoted value.
                strMatchedValue = arrMatches[3];
            }
            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue);
        }
        // Return the parsed data.
        return (arrData);
    };
    ImportUberPatientsSheetData.prototype.createPatientAndWork = function (row, centerCode, place) {
        return __awaiter(this, void 0, void 0, function () {
            var object, patient, today, yearTime, UID, _a, response, heightFt, heightIn, pastIllnesses, k, pastMedications, k, substances_1, relatives_1, k, relative, pastProcedures, k;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (row.length == 20) {
                            row.unshift('');
                        }
                        if (row.length != 21) {
                            console.error("Row length is not 21: ", row);
                            return [2 /*return*/];
                        }
                        object = {
                            UID: row[0].trim().toUpperCase().replace("91-", "").replace(/-/g, ""),
                            name: Statics_1.StaticHelpers.ucfirst(row[1].trim()).toLowerCase(),
                            age: row[2].trim().toLowerCase(),
                            gender: row[3].trim().toLowerCase(),
                            mobile: row[4].trim().toLowerCase(),
                            BPS: parseInt(row[5].trim().toLowerCase()),
                            BPD: parseInt(row[6].trim().toLowerCase()),
                            pulse: parseInt(row[7].trim().toLowerCase()),
                            RBS: parseInt(row[8].trim().toLowerCase()),
                            weight: parseInt(row[9].trim().toLowerCase()),
                            height: parseInt(row[10].trim().toLowerCase()),
                            lifestyle: row[11].trim().toLowerCase(),
                            alcohol: row[12].trim().toLowerCase(),
                            smoking: row[13].trim().toLowerCase(),
                            exercise: row[14].trim().toLowerCase(),
                            occupation: row[15].trim().toLowerCase(),
                            pastIllness: row[16].trim().toLowerCase(),
                            pastMedication: row[17].trim().toLowerCase(),
                            allergy: row[18].trim().toLowerCase(),
                            familyHistory: row[19].trim().toLowerCase(),
                            pastProcedure: row[20].trim().toLowerCase(),
                        };
                        if (object.mobile.length < 10)
                            object.mobile = "0".repeat(10 - object.mobile.length) + object.mobile;
                        return [4 /*yield*/, this._db.wpdb("select * from medi_patients where mobile_number = '91" + object.mobile + "'")];
                    case 1:
                        patient = _b.sent();
                        if (patient.length)
                            return [2 /*return*/];
                        console.log("Entering: ", object);
                        return [4 /*yield*/, this.sleep(2000)];
                    case 2:
                        _b.sent();
                        today = new Date;
                        if (["0.0.0.0", "127.0.0.1", "localhost", null].indexOf(this._config.get('host', null)) < 0)
                            today.setTime(today.getTime() + (5.5 * 60 * 60 * 1000)); // only in case of cloudServers
                        yearTime = today.getFullYear() % 100 + ""
                            + Statics_1.StaticHelpers.twoDigits(today.getMonth() + 1)
                            + Statics_1.StaticHelpers.twoDigits(today.getDate())
                            + Statics_1.StaticHelpers.twoDigits(today.getHours())
                            + Statics_1.StaticHelpers.twoDigits(today.getMinutes())
                            + Statics_1.StaticHelpers.twoDigits(today.getSeconds());
                        UID = object.UID.length ? object.UID : "UBE" + yearTime;
                        _a = this;
                        return [4 /*yield*/, this._http.self("api/v1/consultations/create-consultation", {
                                "user_name": object.name,
                                "user_mobile": UID,
                                "user_email": UID + "@camps.medimetry.com",
                                "user_dob": "",
                                "patient_age": object.age,
                                "patient_name": object.name,
                                "patient_gender": object.gender,
                                "patient_mobile": object.mobile,
                                "patient_relation": "self",
                                "chief_complaints": "Clinical Visit at " + today,
                                "center_code": centerCode,
                                "channel_name": "MediMetry Camps",
                                "consult_type": "AUDIO",
                                "speciality": "Family Physician",
                                "doctor": 87648,
                                "address": "Uber " + Statics_1.StaticHelpers.ucfirst(place),
                                "user_address": Statics_1.StaticHelpers.ucfirst(place),
                            })];
                    case 3:
                        _a._consultationCreationResp = _b.sent();
                        return [4 /*yield*/, this._http.self("api/v1/soap/create", { id: this._consultationCreationResp["postId"] })];
                    case 4:
                        response = _b.sent();
                        this._soap = response['soap'];
                        heightFt = object.height ? Math.floor(object.height / 30.48) : "";
                        heightIn = object.height ? Math.floor((object.height % 30.48) / 2.54) : "";
                        // filling vitals:
                        return [4 /*yield*/, this._http.self("api/v1/soap/" + this._soap.id + "/vitals", {
                                id: 0,
                                vital_collected_at: "Uber Superday " + place,
                                vital_information: {
                                    "BP(D)": isNaN(object.BPD) ? "" : (object.BPD + ""),
                                    "BP(S)": isNaN(object.BPS) ? "" : (object.BPS + ""),
                                    "Height(ft)": heightFt,
                                    "Height(in)": heightIn,
                                    "Pulse": isNaN(object.pulse) ? "" : (object.pulse + ""),
                                    "Random Sugar": isNaN(object.RBS) ? "" : (object.RBS + ""),
                                    "Temp (F)": "",
                                    "Weight (kg)": isNaN(object.weight) ? "" : (object.weight + ""),
                                },
                            })];
                    case 5:
                        // filling vitals:
                        _b.sent();
                        // filling personal history:
                        return [4 /*yield*/, this._http.self('api/v1/soap/' + this._soap.id + '/personal-history', {
                                id: 0,
                                info: {
                                    dietaryCompliance: 0,
                                    drugCompliance: 0,
                                    drinkingHabit: "" + this.wordmap[object.alcohol] || "",
                                    exercise: "" + this.wordmap[object.exercise] || "",
                                    lifeStyle: object.lifestyle,
                                    occupation: 0,
                                    occupationText: object.occupation,
                                    smokingHabit: "" + this.wordmap[object.smoking] || "",
                                }
                            })];
                    case 6:
                        // filling personal history:
                        _b.sent();
                        if (!object.pastIllness.length) return [3 /*break*/, 10];
                        pastIllnesses = object.pastIllness.split(",").map(function (str) {
                            return str.trim().toLowerCase();
                        });
                        k = 0;
                        _b.label = 7;
                    case 7:
                        if (!(k < pastIllnesses.length)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this._http.self('api/v1/soap/past-illness', {
                                id: 0,
                                patientId: this._soap.patient_id,
                                processed: false,
                                remark: pastIllnesses[k],
                            })];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        k++;
                        return [3 /*break*/, 7];
                    case 10:
                        if (!object.pastMedication.length) return [3 /*break*/, 14];
                        pastMedications = object.pastMedication.split(",").map(function (str) {
                            return str.trim().toLowerCase();
                        });
                        k = 0;
                        _b.label = 11;
                    case 11:
                        if (!(k < pastMedications.length)) return [3 /*break*/, 14];
                        return [4 /*yield*/, this._http.self('api/v1/soap/past-medication', {
                                id: 0,
                                patientId: this._soap.patient_id,
                                processed: false,
                                remark: pastMedications[k],
                            })];
                    case 12:
                        _b.sent();
                        _b.label = 13;
                    case 13:
                        k++;
                        return [3 /*break*/, 11];
                    case 14:
                        if (!object.allergy.length) return [3 /*break*/, 16];
                        substances_1 = [];
                        this.allergyMaterials.forEach(function (material) {
                            if (object.allergy.indexOf(material) > -1)
                                substances_1.push(material);
                        });
                        if (!substances_1.length)
                            substances_1 = ['unspecified'];
                        return [4 /*yield*/, this._http.self('api/v1/history/createHistory', {
                                "type": "allergy",
                                "data": {
                                    "created_at": today,
                                    "started_at": today,
                                    "updated_at": today,
                                    "doctor_id": 0,
                                    "substance": 0,
                                    "terms": 0,
                                    "patient_id": this._soap.patient_id,
                                    "processed": true,
                                    "term_name": "",
                                    "reactions": object.allergy,
                                    "substances": substances_1.join(",")
                                }
                            })];
                    case 15:
                        _b.sent();
                        _b.label = 16;
                    case 16:
                        if (!object.familyHistory.length) return [3 /*break*/, 20];
                        relatives_1 = [];
                        this.bloodRelations.forEach(function (relation) {
                            if (object.familyHistory.indexOf(relation) > -1)
                                relatives_1.push(relation);
                        });
                        if (!relatives_1.length)
                            relatives_1 = ['unspecified'];
                        k = 0;
                        _b.label = 17;
                    case 17:
                        if (!(k < relatives_1.length)) return [3 /*break*/, 20];
                        relative = relatives_1[k];
                        return [4 /*yield*/, this._http.self('api/v1/history/createHistory', {
                                "type": "family_history",
                                "data": {
                                    "created_at": today,
                                    "diagnosed_at": today,
                                    "updated_at": today,
                                    "name": "",
                                    "diagnosis": "",
                                    "processed": true,
                                    "patient_id": this._soap.patient_id,
                                    "relation": Statics_1.StaticHelpers.ucfirst(relative),
                                    "remark": object.familyHistory.replace(relative, ""),
                                }
                            })];
                    case 18:
                        _b.sent();
                        _b.label = 19;
                    case 19:
                        k++;
                        return [3 /*break*/, 17];
                    case 20:
                        if (!object.pastProcedure.length) return [3 /*break*/, 24];
                        pastProcedures = object.pastProcedure.split(",").map(function (str) {
                            return str.trim().toLowerCase();
                        });
                        k = 0;
                        _b.label = 21;
                    case 21:
                        if (!(k < pastProcedures.length)) return [3 /*break*/, 24];
                        return [4 /*yield*/, this._http.self('api/v1/history/createHistory', {
                                "type": "procedure",
                                "data": {
                                    "created_at": today,
                                    "doctor_id": 0,
                                    "meta": [],
                                    "processed": true,
                                    "patient_id": this._soap.patient_id,
                                    "remarks": "",
                                    "soap": 1,
                                    "speciality": "",
                                    "status": "",
                                    "term": 0,
                                    "term_text": pastProcedures[k],
                                    "uuid": "0",
                                }
                            })];
                    case 22:
                        _b.sent();
                        _b.label = 23;
                    case 23:
                        k++;
                        return [3 /*break*/, 21];
                    case 24: return [2 /*return*/];
                }
            });
        });
    };
    ImportUberPatientsSheetData.prototype.sleep = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    return ImportUberPatientsSheetData;
}());
exports.ImportUberPatientsSheetData = ImportUberPatientsSheetData;
console.log('Starting ...');
setTimeout(function () {
    (new ImportUberPatientsSheetData()).handle().then(function () {
        console.log('!! End !!');
        process.exit(0);
    });
}, 2000);
