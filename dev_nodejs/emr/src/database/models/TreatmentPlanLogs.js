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
var GeneratedHistory_1 = require("./GeneratedHistory");
var TreatmentPlanLogs = /** @class */ (function () {
    function TreatmentPlanLogs() {
    }
    TreatmentPlanLogs_1 = TreatmentPlanLogs;
    TreatmentPlanLogs.repo = function () {
        return typeorm_1.getRepository(TreatmentPlanLogs_1);
    };
    var TreatmentPlanLogs_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], TreatmentPlanLogs.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "511" }),
        __metadata("design:type", String)
    ], TreatmentPlanLogs.prototype, "remarks", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "100" }),
        __metadata("design:type", String)
    ], TreatmentPlanLogs.prototype, "follow_up", void 0);
    __decorate([
        typeorm_1.Column({ type: "jsonb" }),
        __metadata("design:type", Object)
    ], TreatmentPlanLogs.prototype, "data", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return GeneratedHistory_1.GeneratedHistory; }, function (generatedHistory) { return generatedHistory.treatmentPlanLogs; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "generated_history_id" }),
        __metadata("design:type", GeneratedHistory_1.GeneratedHistory)
    ], TreatmentPlanLogs.prototype, "generatedHistory", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], TreatmentPlanLogs.prototype, "created_at", void 0);
    TreatmentPlanLogs = TreatmentPlanLogs_1 = __decorate([
        typeorm_1.Entity("treatment_plan_logs")
    ], TreatmentPlanLogs);
    return TreatmentPlanLogs;
}());
exports.TreatmentPlanLogs = TreatmentPlanLogs;
