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
var TreatmentPlanLogs_1 = require("./TreatmentPlanLogs");
var GeneratedHistory = /** @class */ (function () {
    function GeneratedHistory() {
    }
    GeneratedHistory_1 = GeneratedHistory;
    GeneratedHistory.repo = function () {
        return typeorm_1.getRepository(GeneratedHistory_1);
    };
    var GeneratedHistory_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], GeneratedHistory.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", String)
    ], GeneratedHistory.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "100" }),
        __metadata("design:type", String)
    ], GeneratedHistory.prototype, "for_name", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "32" }),
        __metadata("design:type", String)
    ], GeneratedHistory.prototype, "unique_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "100" }),
        __metadata("design:type", String)
    ], GeneratedHistory.prototype, "consultation_code", void 0);
    __decorate([
        typeorm_1.Column({ type: "jsonb" }),
        __metadata("design:type", Object)
    ], GeneratedHistory.prototype, "data", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Soap_1.Soap; }, function (soap) { return soap.generated_histories; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "soap_id" }),
        __metadata("design:type", Soap_1.Soap)
    ], GeneratedHistory.prototype, "soap", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return TreatmentPlanLogs_1.TreatmentPlanLogs; }, function (treatmentPlanLogs) { return treatmentPlanLogs.generatedHistory; }),
        __metadata("design:type", Array)
    ], GeneratedHistory.prototype, "treatmentPlanLogs", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], GeneratedHistory.prototype, "created_at", void 0);
    GeneratedHistory = GeneratedHistory_1 = __decorate([
        typeorm_1.Entity("generated_histories")
    ], GeneratedHistory);
    return GeneratedHistory;
}());
exports.GeneratedHistory = GeneratedHistory;
