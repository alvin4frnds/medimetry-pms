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
var ConsultationStatus_1 = require("../database/models/ConsultationStatus");
var Statics_1 = require("../helpers/Statics");
var FillExistingPatientIdAndCenters = /** @class */ (function () {
    function FillExistingPatientIdAndCenters() {
        this._db = DatabaseConfiguration_1.db;
        this._config = Config_1.config;
    }
    FillExistingPatientIdAndCenters.prototype.handle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var count, TAKE, chunks, temp, _loop_1, this_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ConsultationStatus_1.ConsultationStatus.repo()
                            .createQueryBuilder()
                            .select("count(*) as count")
                            .where("patient_id is null and active = true")
                            .getRawOne()];
                    case 1:
                        count = _a.sent();
                        count = count.count;
                        TAKE = 100;
                        chunks = Math.ceil(count / TAKE);
                        temp = {};
                        _loop_1 = function (i) {
                            var SKIP, consultations, consultationCodes, consultationCodeVsPatientId, allPatientIds, patientIdVsCenterCode, _a, _b, _i, key;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        SKIP = i * TAKE;
                                        return [4 /*yield*/, ConsultationStatus_1.ConsultationStatus.repo()
                                                .createQueryBuilder()
                                                .select("consultation_code")
                                                .where("patient_id is null and active = true")
                                                .orderBy("consultation_id", "ASC")
                                                .skip(SKIP).take(TAKE)
                                                .getRawMany()];
                                    case 1:
                                        consultations = _c.sent();
                                        if (!consultations.length)
                                            process.exit(0);
                                        consultationCodes = Statics_1.StaticHelpers.getColumnFromJsonObj(consultations, "consultation_code");
                                        consultationCodeVsPatientId = {};
                                        return [4 /*yield*/, this_1._db.wpdb("\n                select code, patient_id from medi_consultation\n                where \n                    code in ( " + consultationCodes.map(function (c) { return '"' + c + '"'; }).join(', ') + " )\n                    and patient_id is not null\n            ")];
                                    case 2:
                                        temp = _c.sent();
                                        allPatientIds = Statics_1.StaticHelpers.getColumnFromJsonObj(temp, "patient_id");
                                        // @ts-ignore
                                        temp.forEach(function (row) {
                                            consultationCodeVsPatientId[row['code']] = row['patient_id'];
                                        });
                                        if (!allPatientIds.length)
                                            process.exit(0);
                                        return [4 /*yield*/, this_1._db.wpdb("\n                select id, center_code from medi_patients\n                where id in ( " + allPatientIds.join(", ") + " )\n            ")];
                                    case 3:
                                        temp = _c.sent();
                                        patientIdVsCenterCode = {};
                                        // @ts-ignore
                                        temp.forEach(function (row) {
                                            patientIdVsCenterCode[row['id']] = row['center_code'];
                                        });
                                        _a = [];
                                        for (_b in consultationCodeVsPatientId)
                                            _a.push(_b);
                                        _i = 0;
                                        _c.label = 4;
                                    case 4:
                                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                                        key = _a[_i];
                                        return [4 /*yield*/, ConsultationStatus_1.ConsultationStatus.repo()
                                                .createQueryBuilder()
                                                .update(ConsultationStatus_1.ConsultationStatus)
                                                .set({
                                                patient_id: consultationCodeVsPatientId[key],
                                                center_code: patientIdVsCenterCode[consultationCodeVsPatientId[key]],
                                            })
                                                .where("consultation_code = '" + key + "'")
                                                .execute()];
                                    case 5:
                                        _c.sent();
                                        _c.label = 6;
                                    case 6:
                                        _i++;
                                        return [3 /*break*/, 4];
                                    case 7:
                                        console.log("Done chunk " + (i + 1) + " of " + chunks);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < chunks)) return [3 /*break*/, 5];
                        return [5 /*yield**/, _loop_1(i)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return FillExistingPatientIdAndCenters;
}());
exports.FillExistingPatientIdAndCenters = FillExistingPatientIdAndCenters;
console.log('Starting ...');
setTimeout(function () {
    (new FillExistingPatientIdAndCenters()).handle().then(function () {
        console.log('!! End !!');
        process.exit(0);
    });
}, 2000);
