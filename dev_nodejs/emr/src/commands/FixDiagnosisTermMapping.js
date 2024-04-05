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
var Term_js_1 = require("../database/models/Term.js");
var typeorm_1 = require("typeorm");
var Diagnosis_1 = require("../database/models/Diagnosis");
var ImportChiefComplains = /** @class */ (function () {
    function ImportChiefComplains() {
        this._db = DatabaseConfiguration_1.db;
        this._config = Config_1.config;
    }
    ImportChiefComplains.prototype.handle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var diagnosisCount, i, diagnosis, j, diag, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('Starting ...');
                        return [4 /*yield*/, Diagnosis_1.Diagnosis.repo().createQueryBuilder("diagnosis")
                                .select("COUNT(*)", "count")
                                .getRawOne()];
                    case 1:
                        diagnosisCount = (_c.sent()).count;
                        i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(i < diagnosisCount)) return [3 /*break*/, 10];
                        return [4 /*yield*/, typeorm_1.getConnection()
                                .query("select * from diagnosis order by id desc limit 100 offset " + i)];
                    case 3:
                        diagnosis = _c.sent();
                        diagnosis = JSON.parse(JSON.stringify(diagnosis));
                        j = 0;
                        _c.label = 4;
                    case 4:
                        if (!(j < diagnosis.length)) return [3 /*break*/, 8];
                        diag = diagnosis[j];
                        if (!diag || !diag["diagnosis"])
                            return [3 /*break*/, 7];
                        if (diag["term_id"])
                            return [3 /*break*/, 7];
                        _a = diag;
                        _b = "term";
                        return [4 /*yield*/, Term_js_1.Term.createFromText(diag["diagnosis"], "diagnosis", diag.doctor_id)];
                    case 5:
                        _a[_b] = _c.sent();
                        diag["term_id"] = diag.term.id;
                        return [4 /*yield*/, Diagnosis_1.Diagnosis.repo().save(diag)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        j++;
                        return [3 /*break*/, 4];
                    case 8:
                        console.log("Processed: ", diagnosis.length);
                        _c.label = 9;
                    case 9:
                        i += 100;
                        return [3 /*break*/, 2];
                    case 10:
                        console.log('!! End !!');
                        process.exit(0);
                        return [2 /*return*/];
                }
            });
        });
    };
    return ImportChiefComplains;
}());
exports.ImportChiefComplains = ImportChiefComplains;
var obj = new ImportChiefComplains();
setTimeout(function () {
    obj.handle();
}, 2000);
