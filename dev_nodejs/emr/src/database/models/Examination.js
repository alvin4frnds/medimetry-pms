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
var Examination = /** @class */ (function () {
    function Examination() {
        this.examined_by = "";
        this.examined_place = "";
        this.examined_date = new Date;
    }
    Examination_1 = Examination;
    Examination.repo = function () {
        return typeorm_1.getRepository(Examination_1);
    };
    Examination.getFilteredOrgans = function (search) {
        if (search === void 0) { search = ""; }
        var foundOrgans = [
            "pharynx", "larynx", "heart", "bicep", "tricep", "shoulder", "artries", "muscles",
            "kidneys", "skelton", "intestine", "brain", "lymph nodes", "lungs", "spleen",
            "bone marrow", "stomach", "veins", "pancreas", "urinary bladder"
        ];
        if (!search.length)
            return foundOrgans.slice(0, 15);
        return foundOrgans.filter(function (organ) {
            return organ.indexOf(search) > -1;
        });
    };
    var Examination_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Examination.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Examination.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar" }),
        __metadata("design:type", String)
    ], Examination.prototype, "uuid", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Examination.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 100 }),
        __metadata("design:type", String)
    ], Examination.prototype, "examined_by", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 250 }),
        __metadata("design:type", String)
    ], Examination.prototype, "examined_organ", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], Examination.prototype, "examined_place", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], Examination.prototype, "remarks", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp" }),
        __metadata("design:type", Date)
    ], Examination.prototype, "examined_date", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Soap_1.Soap; }, function (soap) { return soap.examinations; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "soap_id" }),
        __metadata("design:type", Soap_1.Soap)
    ], Examination.prototype, "soap", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], Examination.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], Examination.prototype, "updated_at", void 0);
    Examination = Examination_1 = __decorate([
        typeorm_1.Entity("examinations")
    ], Examination);
    return Examination;
}());
exports.Examination = Examination;
