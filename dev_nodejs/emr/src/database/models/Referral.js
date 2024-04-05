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
var Referral = /** @class */ (function () {
    function Referral() {
        this.referral_type = "";
        this.procedure = "";
        this.location = "";
        this.department = "";
        this.doctor_name = "";
        this.priority = "";
        this.referral_date = new Date;
        this.meta = JSON.parse("{}");
        this.remarks = "";
    }
    Referral_1 = Referral;
    Referral.repo = function () {
        return typeorm_1.getRepository(Referral_1);
    };
    var Referral_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Referral.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Referral.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Referral.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "100" }),
        __metadata("design:type", String)
    ], Referral.prototype, "uuid", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 100 }),
        __metadata("design:type", String)
    ], Referral.prototype, "referral_type", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 255, nullable: true }),
        __metadata("design:type", String)
    ], Referral.prototype, "procedure", void 0);
    __decorate([
        typeorm_1.Column({ type: "int", nullable: true }),
        __metadata("design:type", Number)
    ], Referral.prototype, "procedure_term_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 200, nullable: true }),
        __metadata("design:type", String)
    ], Referral.prototype, "location", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 200, nullable: true }),
        __metadata("design:type", String)
    ], Referral.prototype, "department", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 150 }),
        __metadata("design:type", String)
    ], Referral.prototype, "doctor_name", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 100 }),
        __metadata("design:type", String)
    ], Referral.prototype, "priority", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp" }),
        __metadata("design:type", Date)
    ], Referral.prototype, "referral_date", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500, nullable: true }),
        __metadata("design:type", String)
    ], Referral.prototype, "status", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500, nullable: true }),
        __metadata("design:type", String)
    ], Referral.prototype, "diagnosis_term", void 0);
    __decorate([
        typeorm_1.Column({ type: "int", nullable: true }),
        __metadata("design:type", Number)
    ], Referral.prototype, "diagnosis_term_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "jsonb" }),
        __metadata("design:type", Object)
    ], Referral.prototype, "meta", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], Referral.prototype, "remarks", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], Referral.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], Referral.prototype, "updated_at", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Soap_1.Soap; }, function (emr_soap) { return emr_soap.referrals; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "soap_id" }),
        __metadata("design:type", Soap_1.Soap)
    ], Referral.prototype, "soap", void 0);
    Referral = Referral_1 = __decorate([
        typeorm_1.Entity("referral")
    ], Referral);
    return Referral;
}());
exports.Referral = Referral;
