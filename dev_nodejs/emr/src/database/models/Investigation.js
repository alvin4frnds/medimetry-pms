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
var Investigation = /** @class */ (function () {
    function Investigation() {
    }
    Investigation_1 = Investigation;
    Investigation.repo = function () {
        return typeorm_1.getRepository(Investigation_1);
    };
    var Investigation_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Investigation.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Investigation.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Investigation.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "100" }),
        __metadata("design:type", String)
    ], Investigation.prototype, "uuid", void 0);
    __decorate([
        typeorm_1.Column({ type: "int", nullable: true }),
        __metadata("design:type", Number)
    ], Investigation.prototype, "term_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 100 }),
        __metadata("design:type", String)
    ], Investigation.prototype, "category", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 50 }),
        __metadata("design:type", String)
    ], Investigation.prototype, "loinc_code", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], Investigation.prototype, "status", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], Investigation.prototype, "remarks", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], Investigation.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], Investigation.prototype, "updated_at", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Soap_1.Soap; }, function (soap) { return soap.investigations; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "soap_id" }),
        __metadata("design:type", Soap_1.Soap)
    ], Investigation.prototype, "soap", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Term_1.Term; }, function (term) { return term.investigation; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "term_id" }),
        __metadata("design:type", Term_1.Term)
    ], Investigation.prototype, "term", void 0);
    Investigation = Investigation_1 = __decorate([
        typeorm_1.Entity("investigation")
    ], Investigation);
    return Investigation;
}());
exports.Investigation = Investigation;
