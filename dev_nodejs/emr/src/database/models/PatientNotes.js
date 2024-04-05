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
var PatientNotes = /** @class */ (function () {
    function PatientNotes() {
        this.consultation_code = null;
    }
    PatientNotes_1 = PatientNotes;
    PatientNotes.repo = function () {
        return typeorm_1.getRepository(PatientNotes_1);
    };
    var PatientNotes_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], PatientNotes.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 120 }),
        __metadata("design:type", String)
    ], PatientNotes.prototype, "writer", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", String)
    ], PatientNotes.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 40, nullable: true }),
        __metadata("design:type", String)
    ], PatientNotes.prototype, "consultation_code", void 0);
    __decorate([
        typeorm_1.Column({ type: "text" }),
        __metadata("design:type", String)
    ], PatientNotes.prototype, "text", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], PatientNotes.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], PatientNotes.prototype, "updated_at", void 0);
    PatientNotes = PatientNotes_1 = __decorate([
        typeorm_1.Entity("patient_notes")
    ], PatientNotes);
    return PatientNotes;
}());
exports.PatientNotes = PatientNotes;
