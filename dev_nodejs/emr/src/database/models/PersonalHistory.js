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
var PersonalHistory = /** @class */ (function () {
    function PersonalHistory() {
    }
    PersonalHistory_1 = PersonalHistory;
    PersonalHistory.repo = function () {
        return typeorm_1.getRepository(PersonalHistory_1);
    };
    var PersonalHistory_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], PersonalHistory.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", String)
    ], PersonalHistory.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], PersonalHistory.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "100" }),
        __metadata("design:type", String)
    ], PersonalHistory.prototype, "uuid", void 0);
    __decorate([
        typeorm_1.Column({ type: "jsonb" }),
        __metadata("design:type", Object)
    ], PersonalHistory.prototype, "info", void 0);
    __decorate([
        typeorm_1.OneToOne(function (type) { return Soap_1.Soap; }, function (soap) { return soap.personal_history; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "soap_id" }),
        __metadata("design:type", Soap_1.Soap)
    ], PersonalHistory.prototype, "soap", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], PersonalHistory.prototype, "created_at", void 0);
    PersonalHistory = PersonalHistory_1 = __decorate([
        typeorm_1.Entity("personal_history")
    ], PersonalHistory);
    return PersonalHistory;
}());
exports.PersonalHistory = PersonalHistory;
