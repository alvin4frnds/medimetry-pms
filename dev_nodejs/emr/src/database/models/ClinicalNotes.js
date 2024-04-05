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
Object.defineProperty(exports, "__esModule", { value: true });
var typeorm_1 = require("typeorm");
var Soap_1 = require("./Soap");
var ClinicalNote = /** @class */ (function () {
    function ClinicalNote() {
    }
    ClinicalNote_1 = ClinicalNote;
    ClinicalNote.repo = function () {
        return typeorm_1.getRepository(ClinicalNote_1);
    };
    ClinicalNote.createEmptyFromSoap = function (soap) {
        var note = new ClinicalNote_1;
        note.patient_id = soap.patient_id + "";
        note.doctor_id = soap.created_by;
        note.uuid = soap.uuid;
        note.soap = soap;
        note.inspection = "";
        note.palpation = "";
        note.percussion = "";
        note.quscultation = "";
        note.system_wide_examination = "";
        note.key_observation = "";
        return note;
    };
    var ClinicalNote_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], ClinicalNote.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", String)
    ], ClinicalNote.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], ClinicalNote.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "100" }),
        __metadata("design:type", String)
    ], ClinicalNote.prototype, "uuid", void 0);
    __decorate([
        typeorm_1.Column({ type: "text" }),
        __metadata("design:type", String)
    ], ClinicalNote.prototype, "inspection", void 0);
    __decorate([
        typeorm_1.Column({ type: "text" }),
        __metadata("design:type", String)
    ], ClinicalNote.prototype, "palpation", void 0);
    __decorate([
        typeorm_1.Column({ type: "text" }),
        __metadata("design:type", String)
    ], ClinicalNote.prototype, "percussion", void 0);
    __decorate([
        typeorm_1.Column({ type: "text" }),
        __metadata("design:type", String)
    ], ClinicalNote.prototype, "quscultation", void 0);
    __decorate([
        typeorm_1.Column({ type: "text" }),
        __metadata("design:type", String)
    ], ClinicalNote.prototype, "system_wide_examination", void 0);
    __decorate([
        typeorm_1.Column({ type: "text" }),
        __metadata("design:type", String)
    ], ClinicalNote.prototype, "key_observation", void 0);
    __decorate([
        typeorm_1.OneToOne(function (type) { return Soap_1.Soap; }, function (soap) { return soap.clinical_notes; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "soap_id" }),
        __metadata("design:type", Soap_1.Soap)
    ], ClinicalNote.prototype, "soap", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], ClinicalNote.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], ClinicalNote.prototype, "updated_at", void 0);
    ClinicalNote = ClinicalNote_1 = __decorate([
        typeorm_1.Entity("clinical_notes")
    ], ClinicalNote);
    return ClinicalNote;
}());
exports.ClinicalNote = ClinicalNote;
