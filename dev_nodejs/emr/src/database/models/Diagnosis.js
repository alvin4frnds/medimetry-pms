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
var Term_1 = require("./Term");
var Diagnosis = /** @class */ (function () {
    function Diagnosis() {
    }
    Diagnosis_1 = Diagnosis;
    Diagnosis.repo = function () {
        return typeorm_1.getRepository(Diagnosis_1);
    };
    var Diagnosis_1;
    Diagnosis.REQUST_TYPE = "diagnosis";
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Diagnosis.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "100" }),
        __metadata("design:type", String)
    ], Diagnosis.prototype, "uuid", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Diagnosis.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Diagnosis.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], Diagnosis.prototype, "category", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 50, nullable: true }),
        __metadata("design:type", String)
    ], Diagnosis.prototype, "icd_code", void 0);
    __decorate([
        typeorm_1.Column({ type: "boolean" }),
        __metadata("design:type", Boolean)
    ], Diagnosis.prototype, "chronic", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], Diagnosis.prototype, "status", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], Diagnosis.prototype, "remarks", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Soap_1.Soap; }),
        typeorm_1.JoinColumn({ name: "soap_id" }),
        __metadata("design:type", Soap_1.Soap)
    ], Diagnosis.prototype, "soap", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Term_1.Term; }, function (term) { return term.diagnosis; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "term_id" }),
        __metadata("design:type", Term_1.Term)
    ], Diagnosis.prototype, "term", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], Diagnosis.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], Diagnosis.prototype, "updated_at", void 0);
    Diagnosis = Diagnosis_1 = __decorate([
        typeorm_1.Entity("diagnosis")
    ], Diagnosis);
    return Diagnosis;
}());
exports.Diagnosis = Diagnosis;
