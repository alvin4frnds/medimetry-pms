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
var FamilyHistory = /** @class */ (function () {
    function FamilyHistory() {
        this.remark = "";
    }
    FamilyHistory_1 = FamilyHistory;
    FamilyHistory.repo = function () {
        return typeorm_1.getRepository(FamilyHistory_1);
    };
    var FamilyHistory_1;
    FamilyHistory.REQUEST_TYPE = "family_history";
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], FamilyHistory.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], FamilyHistory.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 50 }),
        __metadata("design:type", String)
    ], FamilyHistory.prototype, "relation", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 100 }),
        __metadata("design:type", String)
    ], FamilyHistory.prototype, "name", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 150 }),
        __metadata("design:type", String)
    ], FamilyHistory.prototype, "diagnosis", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp" }),
        __metadata("design:type", Date)
    ], FamilyHistory.prototype, "diagnosed_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", nullable: true, length: 511, "default": "" }),
        __metadata("design:type", String)
    ], FamilyHistory.prototype, "remark", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], FamilyHistory.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], FamilyHistory.prototype, "updated_at", void 0);
    FamilyHistory = FamilyHistory_1 = __decorate([
        typeorm_1.Entity("family_history")
    ], FamilyHistory);
    return FamilyHistory;
}());
exports.FamilyHistory = FamilyHistory;
