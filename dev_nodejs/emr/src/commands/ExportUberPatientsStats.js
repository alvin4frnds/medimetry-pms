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
var Soap_1 = require("../database/models/Soap");
var typeorm_1 = require("typeorm");
var ExportUberPatientsStats = /** @class */ (function () {
    function ExportUberPatientsStats() {
        this.DATE_STAMP = Statics_1.StaticHelpers.dateStamp();
        this.places = ['chandigarh', 'gurgaon', 'mumbai'];
        this.uniqueMeals = [];
        this.idealMeals = {};
        this.dietStats = {};
        // TODO: Incude all places data, not just chandigarh's
        this.centerCodes = ['medimetry-camps-QuGYJY5ywnEAlxGh5P0gKn0pVljCkrmz', 'medimetry-camps-EFO9lucHxfAI1EGnAvnEgqAlT9ktMTkh', 'medimetry-camps-0sqdtbB09yLdAKslslP6GxJ81Uf0xkKk'];
        this._db = DatabaseConfiguration_1.db;
        this._config = Config_1.config;
        this._sh = require('shelljs');
        this._fs = require('fs');
        this._s3Uploader = S3_1.uploader;
        this._http = new HttpRequest_1.HttpRequest;
        if (process.argv[2])
            this.DATE_STAMP = process.argv[2];
    }
    ExportUberPatientsStats.prototype.handle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, centerCodesQuery, patientsCount, chunksCount, statsData, i, SKIP, patients, _b, _c, _d, uniqueMealsUsedIds, key;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        // sheet 1 unique food items, load them, store in memory.
                        // TODO: UNcomment below code
                        _a = this;
                        return [4 /*yield*/, this._db.mailServiceDb("select * from mail_log.unique_meals")];
                    case 1:
                        // sheet 1 unique food items, load them, store in memory.
                        // TODO: UNcomment below code
                        _a.uniqueMeals = _e.sent();
                        console.log("UniqueMeals loaded length: ", this.uniqueMeals.length);
                        centerCodesQuery = this.centerCodes.map(function (code) { return "'" + code + "'"; }).join(",");
                        return [4 /*yield*/, this._db.wpdb("select count(*) as count from medi_patients where center_code in (" + centerCodesQuery + ") order by id asc")];
                    case 2:
                        patientsCount = _e.sent();
                        patientsCount = patientsCount[0]['count'];
                        chunksCount = Math.ceil(patientsCount / ExportUberPatientsStats.TAKE);
                        statsData = [];
                        i = 0;
                        _e.label = 3;
                    case 3:
                        if (!(i < chunksCount)) return [3 /*break*/, 8];
                        SKIP = i * ExportUberPatientsStats.TAKE;
                        return [4 /*yield*/, this._db.wpdb("select * from medi_patients where center_code in (" + centerCodesQuery + ") order by id asc limit " + SKIP + ", " + ExportUberPatientsStats.TAKE)];
                    case 4:
                        patients = _e.sent();
                        _c = (_b = statsData).concat;
                        _d = this.toCSVArray;
                        return [4 /*yield*/, this.getPatientsStatDataFor(patients)];
                    case 5:
                        statsData = _c.apply(_b, [_d.apply(this, [_e.sent()])]);
                        return [4 /*yield*/, this.sleep(100)];
                    case 6:
                        _e.sent();
                        console.info("processed chunk: of ", i + 1, chunksCount);
                        _e.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 3];
                    case 8:
                        console.log("Writing patients data for graph: ", statsData.length);
                        return [4 /*yield*/, this.writePatientsDataForGraph(statsData)];
                    case 9:
                        _e.sent();
                        uniqueMealsUsedIds = [];
                        for (key in this.dietStats)
                            uniqueMealsUsedIds.push(parseInt(key));
                        this.uniqueMeals = this.uniqueMeals.filter(function (meal) { return (uniqueMealsUsedIds.indexOf(meal.id) > -1); });
                        console.log("writing unique meals ...", this.uniqueMeals.length);
                        return [4 /*yield*/, this.writeUniqueMealsToCSV(this.uniqueMeals)];
                    case 10:
                        _e.sent();
                        console.log("patientsCount: ", patientsCount);
                        return [2 /*return*/];
                }
            });
        });
    };
    ExportUberPatientsStats.prototype.toCSVArray = function (objects) {
        return objects.map(function (obj) {
            return [
                obj['patientId'] || "",
                obj["place"] || "",
                obj['phone'] ? obj['phone'].substr(2, 10) : "",
                obj['name'] || "",
                obj['age'] || "",
                obj['height'] || "",
                obj['weight'] || "",
                obj['BPS'] || "",
                obj['BPD'] || "",
                obj['pulse'] || "",
                obj['RBS'] || "",
                (obj['stats'] && obj['stats']['calories']) ? obj['stats']['calories'] : "",
                (obj['stats'] && obj['stats']['carbohydrates']) ? obj['stats']['carbohydrates'] : "",
                (obj['stats'] && obj['stats']['protiens']) ? obj['stats']['protiens'] : "",
                (obj['stats'] && obj['stats']['fats']) ? obj['stats']['fats'] : "",
                (obj['stats'] && obj['stats']['saturated_fats']) ? obj['stats']['saturated_fats'] : "",
                (obj['ideals'] && obj['ideals']['calories']) ? obj['ideals']['calories'] : "",
                (obj['ideals'] && obj['ideals']['carbohydrates']) ? obj['ideals']['carbohydrates'] : "",
                (obj['ideals'] && obj['ideals']['protiens']) ? obj['ideals']['protiens'] : "",
                (obj['ideals'] && obj['ideals']['fats']) ? obj['ideals']['fats'] : "",
                (obj['ideals'] && obj['ideals']['saturated_fats']) ? obj['ideals']['saturated_fats'] : "",
                (obj['meals'] && obj['meals']['wakeup']) ? obj['meals']['wakeup'] : "",
                (obj['meals'] && obj['meals']['sleep']) ? obj['meals']['sleep'] : "",
                (obj['meals'] && obj['meals']['breakfast'] && obj['meals']['breakfast']['calories']) ? obj['meals']['breakfast']['calories'] : "",
                (obj['meals'] && obj['meals']['breakfast'] && obj['meals']['breakfast']['carbohydrates']) ? obj['meals']['breakfast']['carbohydrates'] : "",
                (obj['meals'] && obj['meals']['breakfast'] && obj['meals']['breakfast']['protiens']) ? obj['meals']['breakfast']['protiens'] : "",
                (obj['meals'] && obj['meals']['breakfast'] && obj['meals']['breakfast']['fats']) ? obj['meals']['breakfast']['fats'] : "",
                (obj['meals'] && obj['meals']['breakfast'] && obj['meals']['breakfast']['saturated_fats']) ? obj['meals']['breakfast']['saturated_fats'] : "",
                (obj['meals'] && obj['meals']['lunch'] && obj['meals']['lunch']['calories']) ? obj['meals']['lunch']['calories'] : "",
                (obj['meals'] && obj['meals']['lunch'] && obj['meals']['lunch']['carbohydrates']) ? obj['meals']['lunch']['carbohydrates'] : "",
                (obj['meals'] && obj['meals']['lunch'] && obj['meals']['lunch']['protiens']) ? obj['meals']['lunch']['protiens'] : "",
                (obj['meals'] && obj['meals']['lunch'] && obj['meals']['lunch']['fats']) ? obj['meals']['lunch']['fats'] : "",
                (obj['meals'] && obj['meals']['lunch'] && obj['meals']['lunch']['saturated_fats']) ? obj['meals']['lunch']['saturated_fats'] : "",
                (obj['meals'] && obj['meals']['dinner'] && obj['meals']['dinner']['calories']) ? obj['meals']['dinner']['calories'] : "",
                (obj['meals'] && obj['meals']['dinner'] && obj['meals']['dinner']['carbohydrates']) ? obj['meals']['dinner']['carbohydrates'] : "",
                (obj['meals'] && obj['meals']['dinner'] && obj['meals']['dinner']['protiens']) ? obj['meals']['dinner']['protiens'] : "",
                (obj['meals'] && obj['meals']['dinner'] && obj['meals']['dinner']['fats']) ? obj['meals']['dinner']['fats'] : "",
                (obj['meals'] && obj['meals']['dinner'] && obj['meals']['dinner']['saturated_fats']) ? obj['meals']['dinner']['saturated_fats'] : "",
                (obj['mealDifferences'] && obj['mealDifferences']['w-b']) ? obj['mealDifferences']['w-b'] : "",
                (obj['mealDifferences'] && obj['mealDifferences']['b-l']) ? obj['mealDifferences']['b-l'] : "",
                (obj['mealDifferences'] && obj['mealDifferences']['l-d']) ? obj['mealDifferences']['l-d'] : "",
                (obj['mealDifferences'] && obj['mealDifferences']['d-s']) ? obj['mealDifferences']['d-s'] : "",
                obj['mealsText'],
            ];
        });
    };
    ExportUberPatientsStats.prototype.writeUniqueMealsToCSV = function (meals) {
        return __awaiter(this, void 0, void 0, function () {
            var text, writeFile, fileLocation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        text = "\"Unique Food Item\",\"Quantity\",\"Quantity Unit\",\"Kcal\",\"carbs\",\"protein\",\"fats\",\"Unsaturated Fats\"\n";
                        meals.forEach(function (row) {
                            text += "\"" + row.name + "\",\"" + row.quantity + "\",\"" + row.quantity_unit + "\",\"" + row.calories + "\",\"" + row.carbohydrates + "\",\"" + row.fat + "\",\"" + row.protein + "\",\"" + row.saturated_fat + "\"\n";
                        });
                        writeFile = util.promisify(this._fs.writeFile);
                        fileLocation = __dirname.replace("src/commands", "") + "unique-meals.csv";
                        return [4 /*yield*/, writeFile(fileLocation, text)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ExportUberPatientsStats.prototype.writePatientsDataForGraph = function (stats) {
        return __awaiter(this, void 0, void 0, function () {
            var parameters, text, writeFile, fileLocation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parameters = "Calories,Carbohydrates,Proteins,Fats,Saturated Fats";
                        text = "ID,Place,Phone,Name,Age,Height,Weight,BPD,BPS,Pulse,RBS,"
                            + parameters + ","
                            + (parameters.split(",").map(function (w) { return "Ideal " + w; }).join(",")) + ","
                            + "Wakes At,Sleeps At,"
                            + (parameters.split(",").map(function (w) { return "Breakfast " + w; }).join(",")) + ","
                            + (parameters.split(",").map(function (w) { return "Lunch " + w; }).join(",")) + ","
                            + (parameters.split(",").map(function (w) { return "Dinner " + w; }).join(",")) + ","
                            + "Wakeup to Breakfast,Breakfast to Lunch,Lunch to Dinner,Dinner to Sleep,Meals";
                        text = text.split(",").map(function (w) { return '"' + w + '"'; }).join(",");
                        text += "\n";
                        stats.forEach(function (stat) {
                            var row = stat.map(function (w) { return '"' + w + '"'; }).join(",");
                            text = text + row + "\n";
                        });
                        writeFile = util.promisify(this._fs.writeFile);
                        fileLocation = __dirname.replace("src/commands", "") + "patients-data-for-graphs.csv";
                        return [4 /*yield*/, writeFile(fileLocation, text)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ExportUberPatientsStats.prototype.getPatientsStatDataFor = function (patients) {
        return __awaiter(this, void 0, void 0, function () {
            var soaps, uniquePatientSoaps, date, patientsStats, _loop_1, this_1, j;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Soap_1.Soap.repo().find({
                            where: { patient_id: typeorm_1.In(patients.map(function (patient) { return patient.id; })), },
                            relations: ["vitals", "personal_history", "meals"],
                            order: { id: "DESC", }
                        })];
                    case 1:
                        soaps = _a.sent();
                        uniquePatientSoaps = [];
                        soaps = soaps.filter(function (soap) {
                            if (uniquePatientSoaps.indexOf(soap.patient_id) > -1)
                                return false;
                            uniquePatientSoaps.push(soap.patient_id);
                            return true;
                        });
                        date = new Date();
                        patientsStats = [];
                        _loop_1 = function (j) {
                            var soap = soaps[j];
                            var patient = patients.filter(function (row) { return soap.patient_id === row.id; });
                            // if soap not found for that patient, continue
                            if (patient.length)
                                patient = patient[0];
                            else
                                return "continue";
                            var dob = new Date(patient['date_of_birth']);
                            var age = date.getFullYear() - dob.getFullYear();
                            var patientData = {
                                patientId: soap.patient_id,
                                place: this_1.places[this_1.centerCodes.indexOf(patient['center_code'])],
                                phone: patient['mobile_number'],
                                name: patient['name'],
                                age: age + "",
                                height: null,
                                weight: null,
                                BPD: null,
                                BPS: null,
                                pulse: null,
                                RBS: null,
                                stats: null,
                                ideals: null,
                                mealsText: "",
                                meals: null,
                                mealDifferences: {
                                    "w-b": 0,
                                    "b-l": 0,
                                    "l-d": 0,
                                    "d-s": 0,
                                },
                                mealTimings: [],
                            };
                            if (soap && soap['vitals'] && soap['vitals']['vital_information']) {
                                if (soap['vitals']['vital_information']['BP(D)'])
                                    patientData.BPD
                                        = soap['vitals']['vital_information']['BP(D)'];
                                if (soap['vitals']['vital_information']['BP(S)'])
                                    patientData.BPS
                                        = soap['vitals']['vital_information']['BP(S)'];
                                if (soap['vitals']['vital_information']['Weight (kg)'])
                                    patientData.weight
                                        = soap['vitals']['vital_information']['Weight (kg)'];
                                if (soap['vitals']['vital_information']['Random Sugar'])
                                    patientData.RBS
                                        = soap['vitals']['vital_information']['Random Sugar'];
                                if (soap['vitals']['vital_information']['Pulse'])
                                    patientData.pulse
                                        = soap['vitals']['vital_information']['Pulse'];
                                if (soap['vitals']['vital_information']['Height(ft)'])
                                    patientData.height
                                        = ((soap['vitals']['vital_information']['Height(ft)'] * 30.48)
                                            + (soap['vitals']['vital_information']['Height(in)'] * 2.54));
                            }
                            if (patientData.height)
                                patientData.ideals = this_1.calculateIdealsByHeight(patientData.height);
                            if (soap.meals && soap.meals.length) {
                                var mealsText_1 = "";
                                soap.meals = soap.meals.filter(function (meal) {
                                    if (meal.quantity && meal.quantity.length) {
                                        meal['quantity_values'] = meal.quantity + ' ' + meal.quantity_unit;
                                    }
                                    return meal;
                                }).sort(function (a, b) {
                                    var x = parseInt(a.meal_time);
                                    var y = parseInt(b.meal_time);
                                    if (!x && y) {
                                        return 1;
                                    }
                                    else if (x && !y) {
                                        return -1;
                                    }
                                    else if (!x && !y) {
                                        return 0;
                                    }
                                    if (!a.weekend && b.weekend) {
                                        return -1;
                                    }
                                    else if (a.weekend && !b.weekend) {
                                        return 1;
                                    }
                                    return x - y;
                                });
                                soap.meals.forEach(function (meal) {
                                    var mealTime = parseInt(meal.meal_time);
                                    mealsText_1 += mealTime + ":00 ->" + meal.name + " : " + meal.quantity + " " + meal.quantity_unit + ";";
                                    // differenciating between, late nights and early mornings
                                    if (mealTime < ExportUberPatientsStats.SLEEPING_TIME)
                                        mealTime += 24;
                                    if (patientData.mealTimings.indexOf(mealTime) > -1) { }
                                    else
                                        patientData.mealTimings.push(mealTime);
                                });
                                patientData.mealsText = mealsText_1;
                                patientData.mealTimings = patientData.mealTimings.sort(function (a, b) {
                                    if (a < b)
                                        return -1;
                                    return a > b ? 1 : 0;
                                });
                                var eatingRoutine_1 = this_1.bestGuessMealTimings(patientData.mealTimings);
                                patientData.stats = this_1.addDietStats(soap.meals.map(function (meal) { return _this.getDietStatFor(meal); }), "full-day");
                                var breakfastStats = this_1.addDietStats(soap.meals.filter(function (meal) {
                                    var mealTime = parseInt(meal.meal_time);
                                    if (mealTime < ExportUberPatientsStats.SLEEPING_TIME)
                                        mealTime += 24;
                                    return eatingRoutine_1.breakfast.indexOf(mealTime) > -1;
                                }).map(function (meal) { return _this.getDietStatFor(meal); }), "breakfast");
                                var lunchStats = this_1.addDietStats(soap.meals.filter(function (meal) {
                                    var mealTime = parseInt(meal.meal_time);
                                    if (mealTime < ExportUberPatientsStats.SLEEPING_TIME)
                                        mealTime += 24;
                                    return eatingRoutine_1.lunch.indexOf(mealTime) > -1;
                                }).map(function (meal) { return _this.getDietStatFor(meal); }), "lunch");
                                var dinnerStats = this_1.addDietStats(soap.meals.filter(function (meal) {
                                    var mealTime = parseInt(meal.meal_time);
                                    if (mealTime < ExportUberPatientsStats.SLEEPING_TIME)
                                        mealTime += 24;
                                    return eatingRoutine_1.dinner.indexOf(mealTime) > -1;
                                }).map(function (meal) { return _this.getDietStatFor(meal); }), "dinner");
                                patientData.meals = {
                                    wakeup: eatingRoutine_1.wakeup || 0,
                                    breakfast: breakfastStats,
                                    lunch: lunchStats,
                                    dinner: dinnerStats,
                                    sleep: eatingRoutine_1.sleep || 0,
                                };
                                if (patientData.meals.wakeup && patientData.meals.breakfast.timeOfDay) {
                                    //@ts-ignore
                                    patientData.mealDifferences["w-b"] = patientData.meals.breakfast.timeOfDay - patientData.meals.wakeup;
                                    if (patientData.mealDifferences["w-b"] < 0)
                                        patientData.mealDifferences["w-b"] = patientData.mealDifferences["w-b"] + 24;
                                }
                                if (patientData.meals.breakfast.timeOfDay && patientData.meals.lunch.timeOfDay) {
                                    patientData.mealDifferences["b-l"] = patientData.meals.lunch.timeOfDay - patientData.meals.breakfast.timeOfDay;
                                    if (patientData.mealDifferences["b-l"] < 0)
                                        patientData.mealDifferences["b-l"] = patientData.mealDifferences["b-l"] + 24;
                                }
                                if (patientData.meals.lunch.timeOfDay && patientData.meals.dinner.timeOfDay) {
                                    patientData.mealDifferences["l-d"] = patientData.meals.dinner.timeOfDay - patientData.meals.lunch.timeOfDay;
                                    if (patientData.mealDifferences["l-d"] < 0)
                                        patientData.mealDifferences["l-d"] = patientData.mealDifferences["l-d"] + 24;
                                }
                                if (patientData.meals.dinner.timeOfDay && patientData.meals.sleep) {
                                    //@ts-ignore
                                    patientData.mealDifferences["d-s"] = patientData.meals.sleep - patientData.meals.dinner.timeOfDay;
                                    if (patientData.mealDifferences["d-s"] < 0)
                                        patientData.mealDifferences["d-s"] = patientData.mealDifferences["d-s"] + 24;
                                }
                            }
                            patientsStats.push(patientData);
                        };
                        this_1 = this;
                        for (j = 0; j < soaps.length; j++) {
                            _loop_1(j);
                        }
                        return [2 /*return*/, patientsStats];
                }
            });
        });
    };
    ExportUberPatientsStats.prototype.calculateIdealsByHeight = function (height) {
        var hFactor = height - 100;
        if (this.idealMeals[hFactor])
            return this.idealMeals[hFactor];
        var meal = {
            timeOfDay: 0,
            tag: "ideal",
            calories: 0,
            carbohydrates: 0,
            protiens: 0,
            fats: 0,
            saturated_fats: 0,
        };
        meal.calories = Math.round(hFactor * 25);
        meal.carbohydrates = Math.round((meal.calories * 0.65) / 4);
        meal.protiens = Math.round(((meal.calories * 0.2) / 4));
        meal.fats = Math.round((meal.calories * 0.15) / 9);
        meal.saturated_fats = Math.round(meal.fats / 3);
        this.idealMeals[hFactor] = meal;
        return meal;
    };
    ExportUberPatientsStats.prototype.bestGuessMealTimings = function (mealTimings) {
        var wakeup = null, breakfast = [], lunch = [], dinner = [], sleep = null;
        switch (mealTimings.length) {
            case 0: break;
            case 1:
                wakeup = mealTimings[0] - 1;
                breakfast.push(mealTimings[0]);
                break;
            case 2:
                wakeup = mealTimings[0] - 1;
                sleep = mealTimings[1] + 1;
                breakfast.push(mealTimings[0]);
                dinner.push(mealTimings[1]);
                break;
            case 3:
                if ((mealTimings[1] - mealTimings[0]) < 3) {
                    wakeup = mealTimings[0];
                    breakfast.push(mealTimings[0], mealTimings[1]);
                    sleep = mealTimings[2] + 1;
                    dinner.push(mealTimings[2]);
                }
                else if ((mealTimings[2] - mealTimings[1]) < 3) {
                    wakeup = mealTimings[0] - 1;
                    breakfast.push(mealTimings[0]);
                    sleep = mealTimings[2];
                    dinner.push(mealTimings[1], mealTimings[2]);
                }
                else {
                    wakeup = mealTimings[0] - 1;
                    sleep = mealTimings[2] + 1;
                    breakfast.push(mealTimings[0]);
                    lunch.push(mealTimings[1]);
                    dinner.push(mealTimings[2]);
                }
                break;
            case 4:
                wakeup = mealTimings[0];
                breakfast.push(mealTimings[0], mealTimings[1]);
                lunch.push(mealTimings[2]);
                dinner.push(mealTimings[3]);
                sleep = mealTimings[3] + 1;
                break;
            case 5:
                wakeup = mealTimings[0];
                sleep = mealTimings[4];
                breakfast.push(mealTimings[0], mealTimings[1]);
                if ((mealTimings[3] - mealTimings[2]) < 3) {
                    lunch.push(mealTimings[2], mealTimings[3]);
                    dinner.push(mealTimings[4]);
                }
                else {
                    lunch.push(mealTimings[2]);
                    dinner.push(mealTimings[3], mealTimings[4]);
                }
                break;
            case 6:
                wakeup = mealTimings[0];
                sleep = mealTimings[5];
                breakfast.push(mealTimings[0], mealTimings[1]);
                lunch.push(mealTimings[2], mealTimings[3]);
                dinner.push(mealTimings[4], mealTimings[5]);
                break;
            case 7:
                wakeup = mealTimings[0];
                sleep = mealTimings[6];
                breakfast.push(mealTimings[0], mealTimings[1]);
                lunch.push(mealTimings[2], mealTimings[3]);
                dinner.push(mealTimings[4], mealTimings[5], mealTimings[6]);
                break;
            case 8:
                wakeup = mealTimings[0];
                sleep = mealTimings[7];
                breakfast.push(mealTimings[0], mealTimings[1], mealTimings[2]);
                lunch.push(mealTimings[3], mealTimings[4]);
                dinner.push(mealTimings[5], mealTimings[6], mealTimings[7]);
                break;
            case 9:
                wakeup = mealTimings[0];
                sleep = mealTimings[8];
                breakfast.push(mealTimings[0], mealTimings[1], mealTimings[2]);
                lunch.push(mealTimings[3], mealTimings[4], mealTimings[5]);
                dinner.push(mealTimings[6], mealTimings[7], mealTimings[8]);
                break;
            default:
                wakeup = mealTimings[0];
                sleep = mealTimings[mealTimings.length - 1];
                for (var i = 0; i < 3; i++)
                    breakfast.push(mealTimings[i]);
                for (var i = 3; i < mealTimings.length - 3; i++)
                    lunch.push(mealTimings[i]);
                for (var i = mealTimings.length - 3; i < mealTimings.length; i++)
                    dinner.push(mealTimings[i]);
                break;
        }
        if (sleep > 24)
            sleep -= 24;
        if (wakeup > 24)
            wakeup -= 24;
        return {
            wakeup: wakeup, breakfast: breakfast, lunch: lunch, dinner: dinner, sleep: sleep
        };
    };
    ExportUberPatientsStats.prototype.getDietStatFor = function (meal) {
        var uniqueMealId = meal.unique_meal_id;
        var dietStat;
        if (this.dietStats[uniqueMealId])
            dietStat = this.dietStats[uniqueMealId];
        else {
            var uniqueMeal = this.uniqueMeals.filter(function (row) { return row.id === uniqueMealId; });
            dietStat = (uniqueMeal.length) ? uniqueMeal[0] : ExportUberPatientsStats.DEFAULT_MEAL;
            this.dietStats[uniqueMealId] = dietStat;
        }
        var quantity = meal.quantity || 1;
        return {
            tag: meal.name + " " + meal.quantity + " " + meal.quantity_unit,
            timeOfDay: meal.meal_time,
            calories: parseFloat(dietStat['calories']) * quantity,
            carbohydrates: parseFloat(dietStat['carbohydrates']) * quantity,
            protiens: parseFloat(dietStat['protein'] || dietStat['proteins']) * quantity,
            fats: parseFloat(dietStat['fat'] || dietStat['fats']) * quantity,
            saturated_fats: parseFloat(dietStat['saturated_fat'] || dietStat['saturated_fats']) * quantity,
        };
    };
    ExportUberPatientsStats.prototype.addDietStats = function (stats, tag) {
        if (tag === void 0) { tag = ""; }
        var calories = 0, carbohydrates = 0, protiens = 0, fats = 0, saturated_fats = 0, timeOfDay = null;
        for (var i = 0; i < stats.length; i++) {
            var stat = stats[i];
            calories += stat.calories;
            carbohydrates += stat.carbohydrates;
            protiens += stat.protiens;
            fats += stat.fats;
            saturated_fats += stat.saturated_fats;
            if (stat.calories || stat.carbohydrates || stat.protiens || stat.fats || stat.saturated_fats)
                timeOfDay = stat.timeOfDay;
        }
        return {
            timeOfDay: timeOfDay || null,
            calories: calories, carbohydrates: carbohydrates, protiens: protiens, fats: fats, saturated_fats: saturated_fats, tag: tag
        };
    };
    ExportUberPatientsStats.prototype.sleep = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    // private readonly centerCodes = ['medimetry-camps-QuGYJY5ywnEAlxGh5P0gKn0pVljCkrmz'];
    ExportUberPatientsStats.DEFAULT_MEAL = {
        id: 0,
        calories: 2,
        carbohydrates: 1,
        protiens: 0,
        fats: 1,
        saturated_fats: 0,
        timeOfDay: null,
        tag: "",
    };
    ExportUberPatientsStats.TAKE = 20;
    ExportUberPatientsStats.SLEEPING_TIME = 3;
    return ExportUberPatientsStats;
}());
exports.ExportUberPatientsStats = ExportUberPatientsStats;
console.log('Starting ...');
setTimeout(function () {
    (new ExportUberPatientsStats()).handle().then(function () {
        console.log('!! End !!');
        process.exit(0);
    });
}, 2000);
