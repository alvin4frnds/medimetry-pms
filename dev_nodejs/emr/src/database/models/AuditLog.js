"use strict";
/**
 * Created by praveen on 08/07/19.
 */
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
var Soap_1 = require("./Soap");
var User_1 = require("../../database/models/User");
var Category;
(function (Category) {
    Category["Consultation"] = "Consultation";
    Category["Soap"] = "Soap";
    Category["Patient"] = "Patient";
    Category["PatientEntity"] = "PatientEntity";
    Category["TreatmentPlan"] = "TreatmentPlan";
    Category["SoapEntity"] = "SoapEntity";
    Category["PatientFeedback"] = "PatientFeedback";
    Category["DoctorBindings"] = "DoctorBindings";
    Category["Logs"] = "Logs";
    Category["ThirdPartyService"] = "ThirdPartyService";
})(Category || (Category = {}));
var Authority;
(function (Authority) {
    Authority["Fresh"] = "Fresh";
    Authority["Update"] = "Update";
    Authority["Delete"] = "Delete";
    Authority["BulkDelete"] = "BulkDelete";
})(Authority || (Authority = {}));
var AuditLog = /** @class */ (function () {
    function AuditLog() {
        this.consultation_code = "";
        this.wp_user_id = 1;
        this.token_used = "";
        this.user_agent = "";
        this.ip = "";
        // consultation / soap / patient / patient-history
        this.log_category = "";
        // fresh / update / delete / bulk-delete
        this.log_authority = "";
        this.title = "";
        this.new_content = JSON.parse("{}");
        this.old_content = "";
        this.full_req = JSON.parse("{}");
    }
    AuditLog_1 = AuditLog;
    AuditLog.repo = function () { return typeorm_1.getRepository(AuditLog_1); };
    AuditLog.create = function (request, logType, extra) {
        if (extra === void 0) { extra = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var soap, findOptions, auditLog, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        soap = null;
                        if (!(extra['code'] || extra['consultation'] || extra['soap'] || extra['patient'])) return [3 /*break*/, 2];
                        findOptions = {};
                        if (extra['code'])
                            findOptions = { where: { consultation_code: extra['code'] } };
                        if (extra['consultation'])
                            findOptions = { where: { consultation_code: extra['consultation'] } };
                        if (extra['soap'])
                            findOptions = { where: { id: extra['soap'] } };
                        if (extra['patient'])
                            findOptions = { where: { patient_id: extra['patient'] }, order: { id: "DESC" } };
                        return [4 /*yield*/, Soap_1.Soap.repo().findOne(findOptions)];
                    case 1:
                        soap = _a.sent();
                        _a.label = 2;
                    case 2:
                        auditLog = new AuditLog_1();
                        if (soap && soap['consultation_code'])
                            auditLog.consultation_code = soap.consultation_code;
                        if (soap && soap['created_by'])
                            auditLog.doctor_id = soap.created_by;
                        if (soap && soap['patient_id'])
                            auditLog.patient_id = soap.patient_id;
                        if (request && request['user'] && request['user']['user_id'])
                            auditLog.wp_user_id = request['user']['user_id'];
                        if (request && request['headers'] && request['headers']['token'])
                            auditLog.token_used = request['headers']['token'];
                        if (request && request['headers'] && request['headers']['user-agent'])
                            auditLog.user_agent = request['headers']['user-agent'];
                        else
                            auditLog.user_agent = "undefined";
                        if (!(!auditLog.wp_user_id && !request.headers.token)) return [3 /*break*/, 3];
                        // for affiliate cases
                        auditLog.wp_user_id = 1;
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(!auditLog.wp_user_id && request.headers.token)) return [3 /*break*/, 5];
                        return [4 /*yield*/, User_1.User.getRepo().createQueryBuilder("user")
                                .where("user.access_token = :token")
                                .setParameters({ token: request.headers.token })
                                .orderBy("user.id", "DESC")
                                .getOne()];
                    case 4:
                        user = _a.sent();
                        auditLog.wp_user_id = user['user_id'];
                        _a.label = 5;
                    case 5:
                        auditLog.ip = "0.0.0.0";
                        if (request && request['connection'] && request['connection']['remoteAddress'])
                            auditLog.ip = request['connection']['remoteAddress'];
                        if (request && request['headers'] && request['headers']['x-forwarded-for'])
                            auditLog.ip = request['headers']['x-forwarded-for'];
                        auditLog.log_category = logType['category'] || "";
                        auditLog.log_authority = logType['authority'] || "";
                        auditLog.title = logType['title'] || "";
                        auditLog.new_content = request['body'] || request['params'] || {};
                        auditLog.old_content = extra['previous'] ? JSON.stringify(extra['previous']) : "";
                        auditLog.full_req = JSON.parse(JSON.stringify({
                            "params": request['params'] || {},
                            "query": request['query'] || {},
                            "body": request['body'] || {},
                            "headers": request['headers'] || {},
                            "url": request['originalUrl'] || "",
                        }));
                        return [4 /*yield*/, AuditLog_1.repo().save(auditLog)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    var AuditLog_1;
    AuditLog.TYPES = {
        AffiliateController: {
            CreateSoap: { category: Category.Soap, authority: Authority.Fresh, title: "create soap from outside" },
            AttachImage: { category: Category.SoapEntity, authority: Authority.Fresh, title: "added attachment from outside" },
            SaveVitals: { category: Category.SoapEntity, authority: Authority.Fresh, title: "received vitals from outside" },
            SaveFeedback: { category: Category.PatientFeedback, authority: Authority.Fresh, title: "received feedback from partner app" },
            UpdateSoap: { category: Category.Soap, authority: Authority.Update, title: "received soap update from outside" },
            MarkConsultationDone: { cateogory: Category.Consultation, authority: Authority.Update, title: "cron marked consultation done" }
        },
        ConsultationController: {
            MarkDone: { category: Category.Consultation, authority: Authority.Update, title: "marked a consultation done" },
            MarkUndone: { category: Category.Consultation, authority: Authority.Update, title: "marked a consultation open" },
            CreatePatient: { category: Category.Patient, authority: Authority.Fresh, title: "request to create new patient" },
            CreateConsultation: { category: Category.Consultation, authority: Authority.Fresh, title: "request to create new consultation" },
            SaveDoctorBindings: { category: Category.DoctorBindings, authority: Authority.Update, title: "updating managing doctors list" },
            CloseConsultation: { category: Category.Consultation, authority: Authority.Delete, title: "closing a consultation" },
            UpdatePatient: { category: Category.Patient, authority: Authority.Update, title: "update patient's other details" },
            UpdatePatientUID: { category: Category.Patient, authority: Authority.Update, title: "update patient's UID" },
            AddVideoCallLogs: { category: Category.Logs, authority: Authority.Fresh, title: "added video-call logs" },
            SendSMS: { category: Category.ThirdPartyService, authority: Authority.Fresh, title: "sending SMS to patient" },
            GeneratePatientHistory: { category: Category.TreatmentPlan, authority: Authority.Fresh, title: "patient history link generate request" },
            SubmitPartnerAppFeedback: { category: Category.PatientFeedback, authority: Authority.Fresh, title: "patient feedback for patient created" },
        },
        GenerateHistoryController: {
            GenerateLink: { category: Category.TreatmentPlan, authority: Authority.Fresh, title: "created treatment plan link for sharing to doctors" },
            SaveTreatmentPlan: { category: Category.Soap, authority: Authority.Update, title: "updated soap based on treatment plan from consultant doctor" },
        },
        HistoryController: {
            CreateHistory: { category: Category.PatientEntity, authority: Authority.Fresh, title: "patient history component fill request" },
            CreateBulkHistory: { category: Category.PatientEntity, authority: Authority.Fresh, title: "multiple patient history component fill request" },
            DeleteHistory: { category: Category.PatientEntity, authority: Authority.Delete, title: "deleting rows of patient history" },
        },
        SoapController: {
            CreateSoap: { category: Category.Soap, authority: Authority.Fresh, title: "new soap creation request" },
            CreateTerm: { category: Category.SoapEntity, authority: Authority.Fresh, title: "new term creation request" },
            UpdateSoap: { category: Category.Soap, authority: Authority.Update, title: "soap bulk updation request" },
            CreateAttachment: { category: Category.SoapEntity, authority: Authority.Fresh, title: "create attachment from bit data request" },
            UploadAttachment: { category: Category.SoapEntity, authority: Authority.Fresh, title: "create attachment from binary file request" },
            UpdateRemarkFollowup: { category: Category.Soap, authority: Authority.Update, title: "remarks and followup updation request" },
            CreateEntities: { category: Category.SoapEntity, authority: Authority.Fresh, title: "creating soap entities request" },
            UpdateEntities: { category: Category.SoapEntity, authority: Authority.Update, title: "updating existing soap entity request" },
            DeleteEntity: { category: Category.SoapEntity, authority: Authority.Delete, title: "delete existing soap entity request" },
            DeleteAllEntities: { category: Category.SoapEntity, authority: Authority.BulkDelete, title: "empty the section" },
            SavePastIllness: { category: Category.PatientEntity, authority: Authority.Fresh, title: "saving past illness request" },
            SavePastMedications: { category: Category.PatientEntity, authority: Authority.Fresh, title: "saving past medications request" },
            DeletePastIllness: { category: Category.PatientEntity, authority: Authority.Delete, title: "deleting past illness request" },
            DeletePastMedications: { category: Category.PatientEntity, authority: Authority.Delete, title: "deleting past medications request" },
            PrescriptionSend: { category: Category.ThirdPartyService, authority: Authority.Fresh, title: "sending the prescription to patient" },
            DeleteSoap: { Category: Category.Soap, authority: Authority.Delete, title: "removing the soap out of existance" },
            EmptyFollowupDuration: { category: Category.Soap, authority: Authority.Update, title: "remarks and followup updation request" },
        }
    };
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], AuditLog.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 80, nullable: true }),
        __metadata("design:type", String)
    ], AuditLog.prototype, "consultation_code", void 0);
    __decorate([
        typeorm_1.Column({ type: "int", nullable: true }),
        __metadata("design:type", Number)
    ], AuditLog.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int", nullable: true }),
        __metadata("design:type", Number)
    ], AuditLog.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], AuditLog.prototype, "wp_user_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 160 }),
        __metadata("design:type", String)
    ], AuditLog.prototype, "token_used", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 255 }),
        __metadata("design:type", String)
    ], AuditLog.prototype, "user_agent", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 160 }),
        __metadata("design:type", String)
    ], AuditLog.prototype, "ip", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 20 }),
        __metadata("design:type", String)
    ], AuditLog.prototype, "log_category", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 20 }),
        __metadata("design:type", String)
    ], AuditLog.prototype, "log_authority", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 160 }),
        __metadata("design:type", String)
    ], AuditLog.prototype, "title", void 0);
    __decorate([
        typeorm_1.Column({ type: 'jsonb', "default": "{}" }),
        __metadata("design:type", Object)
    ], AuditLog.prototype, "new_content", void 0);
    __decorate([
        typeorm_1.Column({ type: "text", nullable: true }),
        __metadata("design:type", String)
    ], AuditLog.prototype, "old_content", void 0);
    __decorate([
        typeorm_1.Column({ type: 'jsonb', "default": "{}" }),
        __metadata("design:type", Object)
    ], AuditLog.prototype, "full_req", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], AuditLog.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], AuditLog.prototype, "updated_at", void 0);
    AuditLog = AuditLog_1 = __decorate([
        typeorm_1.Entity("audit_logs")
    ], AuditLog);
    return AuditLog;
}());
exports.AuditLog = AuditLog;
