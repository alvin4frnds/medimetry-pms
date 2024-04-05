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
var Config_1 = require("../../config/Config");
var Soap_1 = require("../../database/models/Soap");
var DatabaseConfiguration_1 = require("../../config/DatabaseConfiguration");
var Term_1 = require("../../database/models/Term");
var SoapController_1 = require("../SoapController");
var Statics_1 = require("../../helpers/Statics");
var urlWordsTokens = [];
exports.ShadowSave = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var funcName, funcNameFallback, functionBindings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // if shadowSave bit is false || undefined,  move on
                    if (!Config_1.config.get('shadowSave', false))
                        return [2 /*return*/, next()];
                    if (req.method === "GET")
                        return [2 /*return*/, next()];
                    funcName = req.method.toLowerCase() + req.url.split("-").map(function (word) {
                        word = word.replace(/[^a-zA-Z]/g, "");
                        if (urlWordsTokens.indexOf(word) > -1)
                            word = "entity";
                        else if (Object.keys(SoapController_1.SoapController.URL_CLASS_MAPPING)
                            .indexOf(word.substring(0, word.length - 3)) > -1)
                            word = "entityAll";
                        return word.charAt(0).toUpperCase() + word.substring(1);
                    }).join("");
                    ["ChiefComplains", "ClinicalNotes", "TestResults"]
                        .forEach(function (replacer) { return funcName = funcName.replace(replacer, "Entity"); });
                    funcNameFallback = req.baseUrl.split("/").reverse()[0]
                        + funcName.charAt(0).toUpperCase()
                        + funcName.substring(1);
                    functionBindings = {
                        "postCreatePatient": "postCreatePatient",
                        "postCreateConsultation": "postCreateConsultation",
                        "patchPatient": "patchPatient",
                        "postCreate": "createSoap",
                        "soapPatch": "updateSoap",
                        "postTermscreate": "createTerm",
                        "postAttachment": "uploadAttachment",
                        "postCreateAttachment": "uploadAttachment",
                        "patchRemarkFollowUp": "updateRemarkFollowUp",
                        "postEntity": "createEntity",
                        "patchEntity": "updateEntity",
                        "deleteEntity": "removeEntity",
                        "deleteEntityall": "removeEntity",
                        "deleteEntityAll": "removeEntity",
                        "postPastIllness": "createPastIllness",
                        "deletePastIllness": "deletePastIllness",
                        "postPastMedication": "createPastMedication",
                        "deletePastMedication": "deletePastMedication",
                        "postCreateHistory": "createHistory",
                        "postCreateBulkHistory": "createBulkHistory",
                        "historyPostDelete": "deleteHistory",
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 7, 8]);
                    if (!functionBindings[funcName]) return [3 /*break*/, 3];
                    workerThread.setReq(req);
                    return [4 /*yield*/, workerThread[functionBindings[funcName]]()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 3:
                    if (!functionBindings[funcNameFallback]) return [3 /*break*/, 5];
                    workerThread.setReq(req);
                    return [4 /*yield*/, workerThread[functionBindings[funcNameFallback]]()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    console.error("Url not found: ", funcName, funcNameFallback, req.url, req.baseUrl, req.originalUrl, req.method);
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    workerThread.save();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/, next()];
            }
        });
    });
};
var ShadowSaveWorker = /** @class */ (function () {
    function ShadowSaveWorker() {
        this._store = {};
        this._sh = require('shelljs');
        this._config = Config_1.config;
        this._db = DatabaseConfiguration_1.db;
        this._fs = require('fs');
        var d = new Date;
        this.DATE_STAMP = d.getFullYear() + "-"
            + this.twoDigits(d.getMonth() + 1) + "-"
            + this.twoDigits(d.getDate());
        this.createDirectoryStructure();
        this.inStore();
        urlWordsTokens = ["examinations", "vitals", "diagnosis", "medications", "investigations", "referrals", "procedures", "test-results", "chief-complains", "attachments", "clinical-notes"];
        urlWordsTokens.push("chiefComplains", "clinicalNotes", "ChiefComplains", "ClinicalNotes");
        return this;
    }
    ShadowSaveWorker.prototype.createDirectoryStructure = function () {
        this._folderPath = __dirname.replace("/src/controllers/middlewares", "/shadowSaveDumps");
        if (!this._sh.test('-d', this._folderPath))
            this._sh.mkdir('-p', this._folderPath);
        this._filePath = this._folderPath + "/" + this.DATE_STAMP + ".json";
        if (!this._sh.test('-f', this._filePath))
            this._sh.exec("echo '{}' > " + this._filePath);
    };
    ShadowSaveWorker.prototype.twoDigits = function (d) {
        if (0 <= d && d < 10)
            return "0" + d.toString();
        if (-10 < d && d < 0)
            return "-0" + (-1 * d).toString();
        return d.toString();
    };
    ShadowSaveWorker.prototype.setDateStamp = function (stamp) {
        this.DATE_STAMP = stamp;
        this.createDirectoryStructure();
        return this;
    };
    ShadowSaveWorker.prototype.getFilePath = function () {
        return this._filePath;
    };
    ShadowSaveWorker.prototype.inStore = function () {
        try {
            this._store = JSON.parse(this._sh.cat(this._filePath).stdout.replace(/\\n/g, '')) || {};
        }
        catch (e) {
            console.error("Found error: while reading shadowDump file", e);
        }
    };
    ShadowSaveWorker.prototype.outStore = function () {
        this._fs.writeFile(this._filePath, Statics_1.StaticHelpers.stringify(this._store), function (err) {
            if (err)
                console.error(err);
            else
                console.log('Saved!');
        });
        // const storeString = StaticHelpers.stringify(this._store);
        // this._sh.exec(`echo '${storeString}' > ${this._filePath}`);
    };
    ShadowSaveWorker.prototype.searchConsultation = function (query, type) {
        var _this = this;
        if (type === void 0) { type = 'code'; }
        var intQuery = parseInt(query);
        switch (type) {
            case 'code': return this._store[query] || {};
            case 'patient':
                for (var key in this._store)
                    if (this._store[key]["createConsultationResp"]
                        && this._store[key]["createConsultationResp"]["patientId"]
                        && parseInt(query) === parseInt(this._store[key]["createConsultationResp"]["patientId"]))
                        return this._store[key];
                break;
            case 'post':
                for (var key in this._store)
                    if (this._store[key]["createConsultationResp"]
                        && this._store[key]["createConsultationResp"]["postId"]
                        && parseInt(query) === parseInt(this._store[key]["createConsultationResp"]["postId"]))
                        return this._store[key];
                break;
            case 'soap':
                var _loop_1 = function (key) {
                    if (!this_1._store[key]["soap"]) {
                        var soap = Soap_1.Soap.repo().findOne({ where: { "consultation_code": this_1._store[key]["code"] } })
                            .then(function (soap) { return _this._store[key]["soap"] = soap; });
                        this_1._store[key]["soap"] = 0;
                    }
                    if (parseInt(this_1._store[key]["soap"]["id"]) == intQuery)
                        return { value: this_1._store[key] };
                };
                var this_1 = this;
                for (var key in this._store) {
                    var state_1 = _loop_1(key);
                    if (typeof state_1 === "object")
                        return state_1.value;
                }
                break;
        }
        return {};
    };
    ShadowSaveWorker.prototype.lastResponse = function (key) {
        if (key === void 0) { key = null; }
        var resp = this._config.lastResponse(this._reqId);
        if (key)
            return resp[key] || {};
        return resp;
    };
    ShadowSaveWorker.prototype.urlComponent = function (index) {
        return this._req.url.split("/")[index];
    };
    ShadowSaveWorker.prototype.createPastEntity = function (key) {
        var patientId = this._req.body.patientId || 0;
        var entry = this.searchConsultation(patientId, 'patient');
        var response = this.lastResponse();
        var entity = response["row"] || {};
        var pastEntities = entry[key] || [];
        pastEntities.push(entity);
        entry[key] = pastEntities;
        this._store[entry["code"]] = entry;
    };
    ShadowSaveWorker.prototype.deletePastEntity = function (key) {
        var entityId = parseInt(this.urlComponent(2));
        var entity = this.lastResponse()["row"] || {};
        var patientId = entity.patient_id || 0;
        var entry = this.searchConsultation(patientId, 'patient');
        var pastEntities = entry[key] || [];
        var index = pastEntities.findIndex(function (row) { return row.id == entityId; });
        if (index > -1)
            pastEntities.splice(index, 1);
        entry[key] = pastEntities;
        this._store[entry["code"]] = entry;
    };
    ShadowSaveWorker.prototype.getTermBodyById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var term;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Term_1.Term.repo().findOne({ where: { id: id } })];
                    case 1:
                        term = _a.sent();
                        return [2 /*return*/, term ? term.term_body : ""];
                }
            });
        });
    };
    ShadowSaveWorker.prototype.setReq = function (req) {
        this._req = req;
        this._reqId = req.headers["id"];
        return this;
    };
    ShadowSaveWorker.prototype.save = function () { this.outStore(); };
    ShadowSaveWorker.prototype.postCreatePatient = function () {
        // TODO: Later, create key in .json to hold all create-patient requests.
        //       Not doing, becuase currently no patients are created using this API
        //       only create-consultation API is used.
        // console.log("File path: ", sh.cat(filePath).stdout);
    };
    ShadowSaveWorker.prototype.postCreateConsultation = function () {
        var resp = this.lastResponse();
        var soap = resp.soap;
        delete (resp.soap);
        var entry = {
            request: this._req.body,
            createConsultationResp: resp,
            code: resp.code,
            soap: soap,
        };
        this._store[entry.code] = entry;
    };
    ShadowSaveWorker.prototype.patchPatient = function () {
        var entry = this.searchConsultation(this._req.url.split("/")[2], 'patient');
        entry["updatePatient"] = this._req.body;
        this._store[entry["code"]] = entry;
    };
    ShadowSaveWorker.prototype.createSoap = function () {
        var entry = this.searchConsultation(this._req.body.id, 'post');
        var resp = this.lastResponse();
        entry["soap"] = resp["soap"];
        entry["request"]["soapId"] = resp["soap"]['id'];
        this._store[entry["code"]] = entry;
    };
    ShadowSaveWorker.prototype.updateSoap = function () {
        return __awaiter(this, void 0, void 0, function () {
            var soap, soapId, entry, components, i, j, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        soap = this.lastResponse("soap");
                        soapId = this._req.url.split("/")[1];
                        entry = this.searchConsultation(soapId, 'soap');
                        components = ["investigations", "procedures", "referrals"];
                        i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(i < components.length)) return [3 /*break*/, 6];
                        j = 0;
                        _c.label = 2;
                    case 2:
                        if (!(j < soap[components[i]].length)) return [3 /*break*/, 5];
                        _a = soap[components[i]][j];
                        _b = "term_text";
                        return [4 /*yield*/, this.getTermBodyById(soap[components[i]][j]["term_id"] || soap[components[i]][j]["terms"])];
                    case 3:
                        _a[_b] =
                            _c.sent();
                        _c.label = 4;
                    case 4:
                        j++;
                        return [3 /*break*/, 2];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        // console.log("Soap: ", soap);
                        entry["soap"] = soap;
                        this._store[entry["code"]] = entry;
                        return [2 /*return*/];
                }
            });
        });
    };
    ShadowSaveWorker.prototype.createTerm = function () {
        var entry = this._store[Object.keys(this._store)[0]];
        var resp = this.lastResponse();
        var terms = entry["terms"] || [];
        if (!terms.filter(function (term) { return term.id == resp["term"]["id"]; }).length)
            terms.push(resp["term"]);
        entry["terms"] = terms;
        this._store[entry["code"]] = entry;
    };
    ShadowSaveWorker.prototype.uploadAttachment = function () {
        var resp = this.lastResponse();
        console.log("last response: ", resp);
        var soapId = this.urlComponent(1) || resp.row.soap.id;
        var entry = this.searchConsultation(soapId, 'soap');
        var entity = resp["row"];
        delete entity["soap"];
        if (!entry)
            return;
        var attachments = entry["soap"]["attachments"] || [];
        attachments.push(entity);
        entry["soap"]["attachments"] = attachments;
        this._store[entry["code"]] = entry;
    };
    ShadowSaveWorker.prototype.updateRemarkFollowUp = function () {
        var soapId = this._req.url.split("/")[1];
        var entry = this.searchConsultation(soapId, 'soap');
        entry["soap"]["remark"] = this._req.body.remark || "";
        entry["soap"]["follow_up"] = this._req.body.follow_up || "";
        this._store[entry["code"]] = entry;
    };
    ShadowSaveWorker.prototype.createEntity = function () {
        var soapId = this.urlComponent(1);
        var entityType = this.urlComponent(2);
        var soapRelation = Soap_1.Soap.urlTypeParamToRelationNames(entityType);
        var response = this.lastResponse();
        var entry = this.searchConsultation(soapId, 'soap');
        if (!entry.code)
            return;
        var entity = response["row"];
        delete entity["soap"];
        var rows = entry["soap"][soapRelation] || [];
        rows.push(entity);
        entry["soap"][soapRelation] = rows;
        this._store[entry["code"]] = entry;
    };
    ShadowSaveWorker.prototype.updateEntity = function () {
        var soapId = this.urlComponent(1);
        var soapRelation = Soap_1.Soap.urlTypeParamToRelationNames(this.urlComponent(2));
        var entity = this.lastResponse()["row"];
        delete entity["soap"];
        var entry = this.searchConsultation(soapId, 'soap');
        if (!entry.code)
            return;
        var rows = entry["soap"][soapRelation] || [];
        var index = rows.findIndex(function (row) { return row.id === entity.id; });
        (index > -1) ? rows[index] = entity : rows.push(entity);
        entry["soap"][soapRelation] = rows;
        this._store[entry["code"]] = entry;
    };
    ShadowSaveWorker.prototype.removeEntity = function () {
        var soapId = this.urlComponent(1);
        var soapRelation = Soap_1.Soap.urlTypeParamToRelationNames(this.urlComponent(2));
        var entityId = this.urlComponent(3);
        var entry = this.searchConsultation(soapId, 'soap');
        if (!entry.code)
            return;
        var rows = entry["soap"][soapRelation] || [];
        if (entityId === "all") {
            rows = [];
        }
        else if (entityId) {
            entityId = parseInt(entityId);
            var index = rows.findIndex(function (row) { return row.id === entityId; });
            if (index > -1)
                rows.splice(index, 1);
        }
        entry["soap"][soapRelation] = rows;
        this._store[entry["code"]] = entry;
    };
    ShadowSaveWorker.prototype.createPastIllness = function () {
        this.createPastEntity("pastIllnesses");
    };
    ShadowSaveWorker.prototype.createPastMedication = function () {
        this.createPastEntity("pastMedications");
    };
    ShadowSaveWorker.prototype.deletePastIllness = function () { this.deletePastEntity("pastIllnesses"); };
    ShadowSaveWorker.prototype.deletePastMedication = function () { this.deletePastEntity("pastMedications"); };
    ShadowSaveWorker.prototype.createHistory = function () {
        //     keep in mind, the 'type' key in each history object.
        var type = this._req.body.type;
        var patientId = this._req.body.data.patient_id;
        var entity = this.lastResponse("data");
        entity["type"] = type;
        var entry = this.searchConsultation(patientId, 'patient');
        var histories = entry["history"] || [];
        histories.push(entity);
        entry["history"] = histories;
        this._store[entry["code"]] = entry;
    };
    ShadowSaveWorker.prototype.createBulkHistory = function () {
        var types = {
            "allergy": "allergy",
            "family_history": "family_history",
            "habits": "habit",
            "past_illness": "diagnosis",
            "past_treatment": "procedure",
        };
        var patientId = 0;
        var rows = [];
        var data = this._req.body.data;
        var _loop_2 = function (key) {
            var type = types[key] || "exception";
            data[key].forEach(function (row) {
                if (row["id"])
                    return;
                if (!patientId)
                    patientId = row["patient_id"];
                row["type"] = type;
                rows.push(row);
            });
        };
        for (var key in data) {
            _loop_2(key);
        }
        var entry = this.searchConsultation(patientId, "patient");
        var history = entry["history"] || [];
        history = history.concat(rows);
        entry["history"] = history;
        this._store[entry["code"]] = entry;
    };
    ShadowSaveWorker.prototype.deleteHistory = function () {
        var type = this._req.body.type;
        var historyId = this._req.body.id;
        var entity = this.lastResponse('deleteResponse');
        var entry = this.searchConsultation(entity["patient_id"], 'patient');
        var histories = entry["history"] || [];
        var index = histories.findIndex(function (history) { return (history["type"] == type) && (history["id"] == historyId); });
        if (index > -1)
            histories.splice(index, 1);
        entry["history"] = histories;
        this._store[entry["code"]] = entry;
    };
    return ShadowSaveWorker;
}());
exports.ShadowSaveWorker = ShadowSaveWorker;
var workerThread = new ShadowSaveWorker();
