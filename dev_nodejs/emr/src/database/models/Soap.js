"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
var typeorm_1 = require("typeorm");
var ChiefComplaint_1 = require("./ChiefComplaint");
var Examination_1 = require("./Examination");
var Diagnosis_1 = require("./Diagnosis");
var Medication_1 = require("./Medication");
var Referral_1 = require("./Referral");
var Procedure_1 = require("./Procedure");
var Investigation_1 = require("./Investigation");
var Attachment_1 = require("./Attachment");
var TestResult_1 = require("./TestResult");
var Vital_1 = require("./Vital");
var ClinicalNotes_1 = require("./ClinicalNotes");
var SoapController_1 = require("../../controllers/SoapController");
var PersonalHistory_1 = require("./PersonalHistory");
var GeneratedHistory_1 = require("./GeneratedHistory");
var Feedback_1 = require("./Feedback");
var Meals_1 = require("./Meals");
var DatabaseConfiguration_1 = require("../../config/DatabaseConfiguration");
var Soap = /** @class */ (function () {
    function Soap() {
        this.active = true;
        this.meta = JSON.parse("{}");
    }
    Soap_1 = Soap;
    Soap.getRepo = function () { return typeorm_1.getRepository(Soap_1); };
    Soap.repo = function () { return Soap_1.getRepo(); };
    Soap.urlTypeParamToRelationNames = function (urlParam) {
        if (urlParam === "chief-complains")
            return "chief_complaints";
        return urlParam.replace("-", "_");
    };
    // examinations,vitals,diagnosis,medications,investigations,referrals,procedures,test_results,chief_complains
    Soap.getFullById = function (soapId) {
        return __awaiter(this, void 0, void 0, function () {
            var soap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Soap_1.repo().findOne({
                            where: { id: soapId },
                            relations: Object.keys(SoapController_1.SoapController.URL_CLASS_MAPPING)
                                .map(Soap_1.urlTypeParamToRelationNames)
                                .concat(["investigations.term", "procedures.term", "diagnosis.term", "test_results.term"])
                        })];
                    case 1:
                        soap = _a.sent();
                        ["investigations", "procedures", "diagnosis", "test_results"].forEach(function (relation) {
                            soap[relation] = (soap[relation] || []).map(function (entity) {
                                if (entity.term)
                                    entity["term_text"] = entity.term.term_body || "";
                                return entity;
                            });
                        });
                        soap["diagnosis"] = (soap["diagnosis"] || []).map(function (entity) {
                            if (entity.term)
                                entity["diagnosis"] = entity.term.term_body || "";
                            return entity;
                        });
                        return [2 /*return*/, soap];
                }
            });
        });
    };
    Soap.appendMedicationSalts = function (soapMedications) {
        return __awaiter(this, void 0, void 0, function () {
            var _db, drugDBMedications, sanitizedMedicineNames, i, i, sanitizedMedicineName, medicationFound, drugDBMedicationsIds, medicationIdSalts, saltsIds, salts, mappedSalts, mappedMedications;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!soapMedications.length)
                            return [2 /*return*/, []];
                        // failsafe, if there are no salts found, dont throw error in frontend
                        soapMedications = soapMedications.map(function (row) {
                            row.salts = [];
                            return row;
                        });
                        _db = DatabaseConfiguration_1.db;
                        drugDBMedications = [];
                        sanitizedMedicineNames = [];
                        for (i = 0; i < soapMedications.length; i++)
                            sanitizedMedicineNames.push(soapMedications[i].drug_name.trim().replace(/["']/g, ""));
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < sanitizedMedicineNames.length)) return [3 /*break*/, 4];
                        sanitizedMedicineName = sanitizedMedicineNames[i];
                        return [4 /*yield*/, _db.mailServiceDb("select id, name \n                from mail_log.medications \n                where name ilike '" + sanitizedMedicineName + "' and deprecated = false")];
                    case 2:
                        medicationFound = _a.sent();
                        if (medicationFound.length && medicationFound[0])
                            drugDBMedications.push(medicationFound[0]);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (!drugDBMedications.length)
                            return [2 /*return*/, soapMedications];
                        drugDBMedicationsIds = drugDBMedications.map(function (row) { return row.id; }).join(", ");
                        if (!drugDBMedicationsIds.length)
                            return [2 /*return*/, soapMedications];
                        return [4 /*yield*/, _db.mailServiceDb("select medication_id, salt_id \n            from mail_log.medication_salt \n            where medication_id in (" + drugDBMedicationsIds + ")")];
                    case 5:
                        medicationIdSalts = _a.sent();
                        saltsIds = medicationIdSalts.map(function (row) { return row.salt_id; }).join(", ");
                        if (!saltsIds.length)
                            return [2 /*return*/, soapMedications];
                        return [4 /*yield*/, _db.mailServiceDb("select id, name, dosage, dosage_unit \n            from mail_log.salts \n            where id in (" + saltsIds + ")")];
                    case 6:
                        salts = _a.sent();
                        mappedSalts = {};
                        salts.forEach(function (salt) { mappedSalts[salt.id] = salt.name + " " + salt.dosage + salt.dosage_unit; });
                        mappedMedications = {};
                        drugDBMedications.forEach(function (drugDBMedication) {
                            var saltsIds = medicationIdSalts.filter(function (row) { return row.medication_id == drugDBMedication.id; })
                                .map(function (row) { return row.salt_id; });
                            drugDBMedication.salts = saltsIds.map(function (id) { return mappedSalts[id]; });
                            mappedMedications[drugDBMedication.name.trim().toLowerCase()] = drugDBMedication.salts;
                        });
                        soapMedications = soapMedications.map(function (medication) {
                            var medicationDrugName = medication.drug_name.trim().toLowerCase();
                            medication.salts = (mappedMedications[medicationDrugName]
                                && mappedMedications[medicationDrugName].length)
                                ? mappedMedications[medicationDrugName]
                                : [];
                            return medication;
                        });
                        return [2 /*return*/, soapMedications];
                }
            });
        });
    };
    var Soap_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Soap.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 80 }),
        __metadata("design:type", String)
    ], Soap.prototype, "soap_code", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 70 }),
        __metadata("design:type", String)
    ], Soap.prototype, "consultation_code", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Soap.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Soap.prototype, "created_by", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar" }),
        __metadata("design:type", String)
    ], Soap.prototype, "center_code", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 255, nullable: true }),
        __metadata("design:type", String)
    ], Soap.prototype, "follow_up", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 511, nullable: true }),
        __metadata("design:type", String)
    ], Soap.prototype, "remark", void 0);
    __decorate([
        typeorm_1.Column({ type: "boolean", "default": true }),
        __metadata("design:type", Boolean)
    ], Soap.prototype, "active", void 0);
    __decorate([
        typeorm_1.Column({ type: 'jsonb', "default": "{}" }),
        __metadata("design:type", Object)
    ], Soap.prototype, "meta", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], Soap.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], Soap.prototype, "updated_at", void 0);
    __decorate([
        typeorm_1.Index(),
        typeorm_1.Column({ type: "varchar", length: 100 }),
        __metadata("design:type", String)
    ], Soap.prototype, "uuid", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Feedback_1.Feedback; }, function (feedbacks) { return feedbacks.soap; }),
        __metadata("design:type", Array)
    ], Soap.prototype, "feedbacks", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return ChiefComplaint_1.ChiefComplaint; }, function (chief_complaints) { return chief_complaints.soap; }),
        __metadata("design:type", Array)
    ], Soap.prototype, "chief_complaints", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return GeneratedHistory_1.GeneratedHistory; }, function (generated_histories) { return generated_histories.soap; }),
        __metadata("design:type", Array)
    ], Soap.prototype, "generated_histories", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Examination_1.Examination; }, function (examinations) { return examinations.soap; }),
        __metadata("design:type", Array)
    ], Soap.prototype, "examinations", void 0);
    __decorate([
        typeorm_1.OneToOne(function (type) { return Vital_1.Vitals; }, function (vitals) { return vitals.soap; }),
        __metadata("design:type", Vital_1.Vitals)
    ], Soap.prototype, "vitals", void 0);
    __decorate([
        typeorm_1.OneToOne(function (type) { return PersonalHistory_1.PersonalHistory; }, function (personal_history) { return personal_history.soap; }),
        __metadata("design:type", PersonalHistory_1.PersonalHistory)
    ], Soap.prototype, "personal_history", void 0);
    __decorate([
        typeorm_1.OneToOne(function (type) { return ClinicalNotes_1.ClinicalNote; }, function (clinical_notes) { return clinical_notes.soap; }),
        __metadata("design:type", ClinicalNotes_1.ClinicalNote)
    ], Soap.prototype, "clinical_notes", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Diagnosis_1.Diagnosis; }, function (diagnosis) { return diagnosis.soap; }),
        __metadata("design:type", Array)
    ], Soap.prototype, "diagnosis", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Medication_1.Medication; }, function (medication) { return medication.soap; }),
        __metadata("design:type", Array)
    ], Soap.prototype, "medications", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Referral_1.Referral; }, function (referral) { return referral.soap; }),
        __metadata("design:type", Array)
    ], Soap.prototype, "referrals", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Procedure_1.Procedure; }, function (procedure) { return procedure.soap; }),
        __metadata("design:type", Array)
    ], Soap.prototype, "procedures", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Investigation_1.Investigation; }, function (investigation) { return investigation.soap; }),
        __metadata("design:type", Array)
    ], Soap.prototype, "investigations", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Attachment_1.Attachment; }, function (attachment) { return attachment.soap; }),
        __metadata("design:type", Array)
    ], Soap.prototype, "attachments", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return TestResult_1.TestResult; }, function (test_results) { return test_results.soap; }),
        __metadata("design:type", Array)
    ], Soap.prototype, "test_results", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Meals_1.Meal; }, function (meals) { return meals.soap; }),
        __metadata("design:type", Array)
    ], Soap.prototype, "meals", void 0);
    Soap = Soap_1 = __decorate([
        typeorm_1.Entity("soaps")
    ], Soap);
    return Soap;
}());
exports.Soap = Soap;
