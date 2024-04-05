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
var User_1 = require("../database/models/User");
var ImportShadowZip = /** @class */ (function () {
    function ImportShadowZip() {
        this.DATE_STAMP = Statics_1.StaticHelpers.dateStamp();
        this._db = DatabaseConfiguration_1.db;
        this._config = Config_1.config;
        this._sh = require('shelljs');
        this._fs = require('fs');
        this._s3Uploader = S3_1.uploader;
        this._http = new HttpRequest_1.HttpRequest;
        if (process.argv[2])
            this.DATE_STAMP = process.argv[2];
    }
    ImportShadowZip.prototype.handle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var todaysFolder, pwd, zipLocation, shadowSaveDir, shadowSaveJsonFile, files, i, _a, _b, doctor, store, soapRelationsMapping, _c, _d, _i, consultationCode, consultation, responses, _e, _f, _g, _h, _j, i, obj, _k, _l, i, obj, _m, _o, i, obj, _p, _q, i, obj, _r, _s, soapRelations, i, j, obj, _t, _u;
            return __generator(this, function (_v) {
                switch (_v.label) {
                    case 0:
                        todaysFolder = __dirname + "/temp/" + this.DATE_STAMP;
                        this._sh.rm("-rf", todaysFolder);
                        this._sh.mkdir("-p", todaysFolder);
                        pwd = this._sh.exec("pwd").stdout.replace("\n", "");
                        zipLocation = pwd + "/" + this.DATE_STAMP + ".zip";
                        if (!this._sh.test('-f', zipLocation))
                            return [2 /*return*/, console.error("Zip not found at: " + zipLocation)];
                        console.log("Unzipping ... ");
                        this._sh.exec("unzip -o " + this.DATE_STAMP + ".zip", { silent: true });
                        shadowSaveDir = __dirname + "/temp/" + this.DATE_STAMP;
                        shadowSaveJsonFile = shadowSaveDir + "/dump.json";
                        console.log("Loading dump file ...");
                        files = this._sh.exec("ls " + shadowSaveDir + "/files", { silent: true })
                            .stdout.split("\n")
                            .filter(function (path) { return !!path; });
                        this.filesMap = {};
                        i = 0;
                        _v.label = 1;
                    case 1:
                        if (!(i < files.length)) return [3 /*break*/, 4];
                        _a = this.filesMap;
                        _b = files[i];
                        return [4 /*yield*/, this._s3Uploader
                                .upload(shadowSaveDir + "/files/" + files[i])];
                    case 2:
                        _a[_b] = _v.sent();
                        _v.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, User_1.User.getRepo().createQueryBuilder("user")
                            .where("user.refresh_token = :token")
                            .setParameters({ token: this._config.get("defaultToken") })
                            .orderBy("user.id", "DESC")
                            .getOne()];
                    case 5:
                        doctor = _v.sent();
                        store = JSON.parse(this._sh.cat(shadowSaveJsonFile).stdout.replace(/\\n/g, '')) || {};
                        soapRelationsMapping = {
                            "examinations": "examinations",
                            "vitals": "vitals",
                            "diagnosis": "diagnosis",
                            "medications": "medications",
                            "investigations": "investigations",
                            "referrals": "referrals",
                            "procedures": "procedures",
                            "test_results": "test-results",
                            "chief_complaints": "chief-complains",
                            "attachments": "attachments",
                            "clinical_notes": "clinical-notes",
                        };
                        _c = [];
                        for (_d in store)
                            _c.push(_d);
                        _i = 0;
                        _v.label = 6;
                    case 6:
                        if (!(_i < _c.length)) return [3 /*break*/, 34];
                        consultationCode = _c[_i];
                        if (consultationCode == "undefined")
                            return [3 /*break*/, 33];
                        consultation = {};
                        if (store.hasOwnProperty(consultationCode))
                            consultation = store[consultationCode];
                        else
                            return [3 /*break*/, 33]; // although this could never happen.
                        // override: doctor id will be loaded from token only
                        consultation["request"]["doctor"] = doctor.user_id;
                        responses = [];
                        _e = this;
                        return [4 /*yield*/, this._http.self("api/v1/consultations/create-consultation", consultation["request"])];
                    case 7:
                        _e._consultationCreationResp = _v.sent();
                        responses.push(this._consultationCreationResp); // 0
                        _g = (_f = responses).push;
                        return [4 /*yield*/, this._http.self("api/v1/soap/create", { id: responses[0]["postId"] })];
                    case 8:
                        _g.apply(_f, [_v.sent()]); // 1
                        this._soap = responses[1]["soap"];
                        if (!(consultation["soap"] && (consultation["soap"]["remark"] || consultation["soap"]["follow_up"]))) return [3 /*break*/, 10];
                        _j = (_h = responses).push;
                        return [4 /*yield*/, this._http.self("api/v1/soap/" + this._soap["id"] + "/remark-follow-up", {
                                remark: consultation["soap"]["remark"],
                                follow_up: consultation["soap"]["follow_up"],
                            }, { method: "PATCH" })];
                    case 9:
                        _j.apply(_h, [_v.sent()]); //2
                        _v.label = 10;
                    case 10:
                        if (!(consultation["terms"] && consultation["terms"].length)) return [3 /*break*/, 14];
                        i = 0;
                        _v.label = 11;
                    case 11:
                        if (!(i < consultation["terms"].length)) return [3 /*break*/, 14];
                        obj = this.updateKeys('terms', consultation["terms"][i]);
                        _l = (_k = responses).push;
                        return [4 /*yield*/, this._http.self('api/v1/soap/terms/create', {
                                type: obj["type"],
                                name: obj["name"],
                            })];
                    case 12:
                        _l.apply(_k, [_v.sent()]);
                        _v.label = 13;
                    case 13:
                        i++;
                        return [3 /*break*/, 11];
                    case 14:
                        if (!(consultation["pastMedications"] && consultation["pastMedications"].length)) return [3 /*break*/, 18];
                        i = 0;
                        _v.label = 15;
                    case 15:
                        if (!(i < consultation["pastMedications"].length)) return [3 /*break*/, 18];
                        obj = this.updateKeys('pastMedications', consultation["pastMedications"][i]);
                        _o = (_m = responses).push;
                        return [4 /*yield*/, this._http.self('api/v1/soap/past-medication', {
                                "patientId": obj["patient_id"],
                                "remark": obj["remark"],
                            })];
                    case 16:
                        _o.apply(_m, [_v.sent()]);
                        _v.label = 17;
                    case 17:
                        i++;
                        return [3 /*break*/, 15];
                    case 18:
                        if (!(consultation["pastIllnesses"] && consultation["pastIllnesses"].length)) return [3 /*break*/, 22];
                        i = 0;
                        _v.label = 19;
                    case 19:
                        if (!(i < consultation["pastIllnesses"].length)) return [3 /*break*/, 22];
                        obj = this.updateKeys('pastIllnesses', consultation["pastIllnesses"][i]);
                        _q = (_p = responses).push;
                        return [4 /*yield*/, this._http.self('api/v1/soap/past-illness', {
                                "patientId": obj["patient_id"],
                                "remark": obj["remark"],
                            })];
                    case 20:
                        _q.apply(_p, [_v.sent()]);
                        _v.label = 21;
                    case 21:
                        i++;
                        return [3 /*break*/, 19];
                    case 22:
                        if (!(consultation["history"] && consultation["history"].length)) return [3 /*break*/, 26];
                        i = 0;
                        _v.label = 23;
                    case 23:
                        if (!(i < consultation["history"].length)) return [3 /*break*/, 26];
                        obj = this.updateKeys('history', consultation["history"][i]);
                        _s = (_r = responses).push;
                        return [4 /*yield*/, this._http.self('api/v1/history/createHistory', {
                                data: obj,
                                type: obj["type"],
                            })];
                    case 24:
                        _s.apply(_r, [_v.sent()]);
                        _v.label = 25;
                    case 25:
                        i++;
                        return [3 /*break*/, 23];
                    case 26:
                        soapRelations = Object.keys(soapRelationsMapping);
                        i = 0;
                        _v.label = 27;
                    case 27:
                        if (!(i < soapRelations.length)) return [3 /*break*/, 32];
                        if (!(consultation["soap"]
                            && consultation["soap"][soapRelations[i]]
                            && consultation["soap"][soapRelations[i]].length)) return [3 /*break*/, 31];
                        j = 0;
                        _v.label = 28;
                    case 28:
                        if (!(j < consultation["soap"][soapRelations[i]].length)) return [3 /*break*/, 31];
                        obj = this.updateKeys('entity', consultation["soap"][soapRelations[i]][j]);
                        _u = (_t = responses).push;
                        return [4 /*yield*/, this._http.self("api/v1/soap/" + this._soap.id + "/" + soapRelationsMapping[soapRelations[i]], obj)];
                    case 29:
                        _u.apply(_t, [_v.sent()]);
                        _v.label = 30;
                    case 30:
                        j++;
                        return [3 /*break*/, 28];
                    case 31:
                        i++;
                        return [3 /*break*/, 27];
                    case 32:
                        if (responses.filter(function (response) { return !response["success"]; }).length)
                            return [2 /*return*/, console.error("Some API failed: ", responses)];
                        _v.label = 33;
                    case 33:
                        _i++;
                        return [3 /*break*/, 6];
                    case 34: return [2 /*return*/, true];
                }
            });
        });
    };
    ImportShadowZip.prototype.updateKeys = function (type, object) {
        for (var key in object) {
            if (typeof object[key] == "string") {
                var value = object[key].substring(object[key].lastIndexOf('/') + 1);
                if (this.filesMap[value])
                    object[key] = this.filesMap[value];
            }
        }
        switch (type) {
            case 'pastIllnesses':
            case 'pastMedications':
                ["created_at", "updated_at", "id"]
                    .forEach(function (key) { return delete object[key]; });
                object["patient_id"] = this._soap["patient_id"];
                break;
            case 'history':
                object["patient_id"] = this._soap["patient_id"];
                object["doctor_id"] = this._soap["created_by"];
                object["uuid"] = this._soap["uuid"];
                if (object["terms"] && object["terms"]["term_body"])
                    object["term_text"] = object["terms"]["term_body"];
                if (object["term"] && object["term"]["term_body"])
                    object["term_text"] = object["term"]["term_body"];
                if (object["substance"] && object["substance"]["term_body"])
                    object["substance_name"] = object["substance"]["term_body"];
                ["id", "terms", "substance", "created_at", "updated_at", "term_id", "term"]
                    .forEach(function (key) { return delete object[key]; });
                break;
            case 'entity':
                object["patient_id"] = this._soap["patient_id"];
                object["doctor_id"] = this._soap["created_by"];
                object["uuid"] = this._soap["uuid"];
                ["id", "term_id", "procedure_term_id", "created_at", "updated_at", "term"]
                    .forEach(function (elKey) { return delete object[elKey]; });
                break;
            default: break;
        }
        return object;
    };
    return ImportShadowZip;
}());
exports.ImportShadowZip = ImportShadowZip;
console.log('Starting ...');
setTimeout(function () {
    (new ImportShadowZip()).handle().then(function () {
        console.log('!! End !!');
        process.exit(0);
    });
}, 2000);
