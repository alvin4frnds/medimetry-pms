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
var Medication = /** @class */ (function () {
    function Medication() {
        this.drug_dosage = "";
        this.drug_dosage_unit = "";
        this.frequency = "";
        this.duration = "";
        this.duration_unit = "";
        this.intake = "";
        this.remarks = "";
        this.type = null;
    }
    Medication_1 = Medication;
    Medication.repo = function () {
        return typeorm_1.getRepository(Medication_1);
    };
    var Medication_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Medication.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Medication.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Medication.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "100" }),
        __metadata("design:type", String)
    ], Medication.prototype, "uuid", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 255, nullable: true }),
        __metadata("design:type", String)
    ], Medication.prototype, "drug_name", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 150 }),
        __metadata("design:type", String)
    ], Medication.prototype, "drug_dosage", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 100 }),
        __metadata("design:type", String)
    ], Medication.prototype, "drug_dosage_unit", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 100, nullable: true }),
        __metadata("design:type", String)
    ], Medication.prototype, "frequency", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 100, nullable: true }),
        __metadata("design:type", String)
    ], Medication.prototype, "duration", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 50 }),
        __metadata("design:type", String)
    ], Medication.prototype, "duration_unit", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 100 }),
        __metadata("design:type", String)
    ], Medication.prototype, "intake", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], Medication.prototype, "remarks", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 100, nullable: true }),
        __metadata("design:type", String)
    ], Medication.prototype, "type", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], Medication.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], Medication.prototype, "updated_at", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Soap_1.Soap; }, function (soap) { return soap.medications; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "soap_id" }),
        __metadata("design:type", Soap_1.Soap)
    ], Medication.prototype, "soap", void 0);
    Medication = Medication_1 = __decorate([
        typeorm_1.Entity("medications")
    ], Medication);
    return Medication;
}());
exports.Medication = Medication;
