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
var Vitals = /** @class */ (function () {
    function Vitals() {
    }
    Vitals_1 = Vitals;
    Vitals.repo = function () {
        return typeorm_1.getRepository(Vitals_1);
    };
    var Vitals_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Vitals.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", String)
    ], Vitals.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Vitals.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "100" }),
        __metadata("design:type", String)
    ], Vitals.prototype, "uuid", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500, nullable: true }),
        __metadata("design:type", String)
    ], Vitals.prototype, "vital_collected_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "jsonb" }),
        __metadata("design:type", Object)
    ], Vitals.prototype, "vital_information", void 0);
    __decorate([
        typeorm_1.OneToOne(function (type) { return Soap_1.Soap; }, function (soap) { return soap.vitals; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "soap_id" }),
        __metadata("design:type", Soap_1.Soap)
    ], Vitals.prototype, "soap", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], Vitals.prototype, "created_at", void 0);
    Vitals = Vitals_1 = __decorate([
        typeorm_1.Entity("vitals")
    ], Vitals);
    return Vitals;
}());
exports.Vitals = Vitals;
