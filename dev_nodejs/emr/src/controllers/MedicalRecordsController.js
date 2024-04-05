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
var AttachmentsRepository_1 = require("../database/repository/AttachmentsRepository");
var AuthMiddleware_1 = require("./middlewares/AuthMiddleware");
var Attachment_1 = require("../database/models/Attachment");
var Term_1 = require("../database/models/Term");
var Statics_1 = require("../helpers/Statics");
var PatientNotes_1 = require("../database/models/PatientNotes");
var HttpRequest_1 = require("../helpers/HttpRequest");
var Config_1 = require("../config/Config");
var DatabaseConfiguration_1 = require("../config/DatabaseConfiguration");
var Router = require('./Router');
var MedicalRecordsController = /** @class */ (function (_super) {
    __extends(MedicalRecordsController, _super);
    function MedicalRecordsController(routePath, app) {
        var _this = _super.call(this, routePath, app) || this;
        _this.attachmentRepository = new AttachmentsRepository_1.AttachmentsRepository();
        _this._db = DatabaseConfiguration_1.db;
        _this._config = Config_1.config;
        _this._request = new HttpRequest_1.HttpRequest();
        return _this;
    }
    Object.defineProperty(MedicalRecordsController.prototype, "services", {
        get: function () {
            return {
                '/getMedicalRecords/:patientId': 'getMedicalRecords',
                '/get-medical-records/:patientId': 'getMedicalRecords2',
                '/notes/list/:patient': 'getPatientNotes',
                'DELETE /notes/:id': "deletePatientNote",
                'PATCH /notes/:id': "updatePatientNote",
                'POST /notes/:patient': "createPatientNote",
                'POST /patient-tag/:patient': "addPatientTag",
                '/grammer-list': 'getGrammerList',
            };
        },
        enumerable: true,
        configurable: true
    });
    MedicalRecordsController.prototype.preMiddlewares = function () { return [AuthMiddleware_1.AuthMiddleware]; };
    MedicalRecordsController.prototype.getPatientNotes = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var notes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PatientNotes_1.PatientNotes.repo().find({
                            where: {
                                patient_id: req.params.patient,
                            },
                            order: { id: "DESC", },
                        })];
                    case 1:
                        notes = _a.sent();
                        return [2 /*return*/, res.send(this.build("Here you go", 1, {
                                notes: notes
                            }))];
                }
            });
        });
    };
    MedicalRecordsController.prototype.deletePatientNote = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var note;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PatientNotes_1.PatientNotes.repo().findOne({
                            where: { id: req.params.id },
                        })];
                    case 1:
                        note = _a.sent();
                        if (!note)
                            return [2 /*return*/, res.send(this.build("Note not found."))];
                        return [4 /*yield*/, PatientNotes_1.PatientNotes.repo().delete(note.id)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Deleted Successfully", 1, {
                                note: note,
                            }))];
                }
            });
        });
    };
    MedicalRecordsController.prototype.updatePatientNote = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var note;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PatientNotes_1.PatientNotes.repo().findOne({
                            where: { id: req.params.id },
                        })];
                    case 1:
                        note = _a.sent();
                        if (!note)
                            return [2 /*return*/, res.send(this.build("Record not found"))];
                        note.text = req.body.text;
                        note.writer = req.user.name;
                        return [4 /*yield*/, PatientNotes_1.PatientNotes.repo().save(note)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Updated successfully", 1, { note: note }))];
                }
            });
        });
    };
    MedicalRecordsController.prototype.createPatientNote = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var note;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        note = new PatientNotes_1.PatientNotes();
                        note.text = req.body.text;
                        note.patient_id = req.params.patient;
                        note.writer = req.user.name;
                        if (req.body.code)
                            note.consultation_code = req.body.code;
                        return [4 /*yield*/, PatientNotes_1.PatientNotes.repo().save(note)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Created successfully", 1, {
                                note: note,
                            }))];
                }
            });
        });
    };
    MedicalRecordsController.prototype.getMedicalRecords = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var getAllRecords;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.attachmentRepository.getAllMedicalRecords(req.params.userId)];
                    case 1:
                        getAllRecords = _a.sent();
                        console.debug(getAllRecords);
                        res.send(this.build("All Attachments by patient", 1, { "records": getAllRecords }));
                        return [2 /*return*/];
                }
            });
        });
    };
    MedicalRecordsController.prototype.getMedicalRecords2 = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var allAttachmentsOfPatients, uniqueTimestamps, uniqueDates, attachmentsGroupedByDates;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Attachment_1.Attachment.repo().find({
                            where: { patient_id: req.params.patientId }
                        })];
                    case 1:
                        allAttachmentsOfPatients = _a.sent();
                        uniqueTimestamps = Statics_1.StaticHelpers.getColumnFromJsonObj(allAttachmentsOfPatients, "created_at");
                        uniqueDates = [];
                        uniqueTimestamps.forEach(function (timestamp) {
                            var date = timestamp.toLocaleDateString();
                            if (uniqueDates.indexOf(date) === -1)
                                uniqueDates.push(date);
                        });
                        attachmentsGroupedByDates = {};
                        uniqueDates.forEach(function (date) {
                            attachmentsGroupedByDates[date] = allAttachmentsOfPatients.filter(function (attachment) {
                                return attachment.created_at.toLocaleDateString() === date;
                            });
                        });
                        res.send(this.build("Here you go!", 1, { attachments: attachmentsGroupedByDates }));
                        return [2 /*return*/];
                }
            });
        });
    };
    MedicalRecordsController.prototype.addPatientTag = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request.seRequest("internal-api/emr/add-patient-tag", {
                            key: this._config.getOAuthClientKey(),
                            patient: req.params.patient,
                            tag: req.body.tag,
                        })];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, res.send(resp)];
                }
            });
        });
    };
    MedicalRecordsController.prototype.getGrammerList = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var colors, PMSKeywords, PMSTerms, groupedPMSTerms, type, medications, investigations, patientTags, centers, _a, _b, channels, _c, _d, staff, _e, _f, doctors;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        colors = ['aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow'];
                        PMSKeywords = Statics_1.StaticHelpers.onlyUnique('patient notification refresh listing missing soap followup duration stats doctors binded logout open done testing filter tag tags center centers mobile phone mine name age address male female consultation complaints complaint chief history medications medicine allergies substance reaction family history relation illness past procedures treatment previous section vitals BP temp pulse height weight systolic dystolic UID fasting post parandial oxygen saturation respiratory circumference BMI head generate feedback generate history consult diagnosis investigations attachment personal history referrals examinations remarks clinical notes diet chart'.split(' '));
                        return [4 /*yield*/, Term_1.Term.repo().query("select distinct(term_body), term_type from terms")];
                    case 1:
                        PMSTerms = _g.sent();
                        groupedPMSTerms = {};
                        PMSTerms.forEach(function (term) {
                            if (groupedPMSTerms[term.term_type])
                                groupedPMSTerms[term.term_type].push(term.term_body.trim());
                            else
                                groupedPMSTerms[term.term_type] = [term.term_body.trim()];
                        });
                        for (type in groupedPMSTerms)
                            groupedPMSTerms[type] = Statics_1.StaticHelpers.onlyUnique(groupedPMSTerms[type].filter(function (body) { return body.length > 2; }));
                        PMSTerms = groupedPMSTerms;
                        return [4 /*yield*/, this._db.mailServiceDb("select distinct(name) from mail_log.medications where deprecated = false and type = 'medication'")];
                    case 2:
                        medications = _g.sent();
                        medications = Statics_1.StaticHelpers.onlyUnique(medications.map(function (med) { return med.name.trim(); }));
                        return [4 /*yield*/, this._db.mailServiceDb("select distinct(name), type from mail_log.medications where deprecated = false and type in ('pathology', 'radiology')")];
                    case 3:
                        investigations = _g.sent();
                        patientTags = this._config.get("patientTags", "").split(',');
                        _b = (_a = Statics_1.StaticHelpers).onlyUnique;
                        return [4 /*yield*/, this._db.mailServiceDb("select * from mail_log.channel_centers")];
                    case 4:
                        centers = _b.apply(_a, [(_g.sent())]);
                        _d = (_c = Statics_1.StaticHelpers).onlyUnique;
                        return [4 /*yield*/, this._db.mailServiceDb("select * from mail_log.channels")];
                    case 5:
                        channels = _d.apply(_c, [(_g.sent())]);
                        _f = (_e = Statics_1.StaticHelpers).onlyUnique;
                        return [4 /*yield*/, this._db.mailServiceDb("select * from mail_log.channel_staff")];
                    case 6:
                        staff = _f.apply(_e, [(_g.sent())]);
                        doctors = [];
                        if (req.user.user_type === 'assistant')
                            doctors = doctors.concat(req.user.meta.doctors || []);
                        if (req.user.user_type === 'contributor')
                            doctors.push({ "doctor_id": req.user.user_id, "doctor_name": req.user.name, "doctor_phone": "91" + req.user.mobile });
                        return [2 /*return*/, res.send(this.build("Here you go", 1, {
                                colors: colors, PMSKeywords: PMSKeywords, PMSTerms: PMSTerms, medications: medications, patientTags: patientTags, centers: centers, channels: channels, staff: staff, doctors: doctors, investigations: investigations,
                            }))];
                }
            });
        });
    };
    return MedicalRecordsController;
}(Router));
exports.MedicalRecordsController = MedicalRecordsController;
