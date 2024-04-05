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
var ConsultationStatus = /** @class */ (function () {
    function ConsultationStatus() {
        this.patient_id = null;
        this.active = true;
        this.meta = JSON.parse("{}");
    }
    ConsultationStatus_1 = ConsultationStatus;
    ConsultationStatus.repo = function () { return typeorm_1.getRepository(ConsultationStatus_1); };
    var ConsultationStatus_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], ConsultationStatus.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Number)
    ], ConsultationStatus.prototype, "consultation_id", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", Number)
    ], ConsultationStatus.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ nullable: true }),
        __metadata("design:type", Number)
    ], ConsultationStatus.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 255, default: "", nullable: true }),
        __metadata("design:type", String)
    ], ConsultationStatus.prototype, "center_code", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 40, unique: true }),
        __metadata("design:type", String)
    ], ConsultationStatus.prototype, "consultation_code", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp" }),
        __metadata("design:type", Date)
    ], ConsultationStatus.prototype, "consultation_modified", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 40 }),
        __metadata("design:type", String)
    ], ConsultationStatus.prototype, "consultation_status", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Boolean)
    ], ConsultationStatus.prototype, "done", void 0);
    __decorate([
        typeorm_1.Column({ default: true }),
        __metadata("design:type", Boolean)
    ], ConsultationStatus.prototype, "active", void 0);
    __decorate([
        typeorm_1.Column({ type: "jsonb" }),
        __metadata("design:type", Object)
    ], ConsultationStatus.prototype, "meta", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], ConsultationStatus.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], ConsultationStatus.prototype, "updated_at", void 0);
    ConsultationStatus = ConsultationStatus_1 = __decorate([
        typeorm_1.Entity("consultations_status")
    ], ConsultationStatus);
    return ConsultationStatus;
}());
exports.ConsultationStatus = ConsultationStatus;
