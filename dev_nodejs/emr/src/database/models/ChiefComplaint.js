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
var ChiefComplaint = /** @class */ (function () {
    function ChiefComplaint() {
        this.type = "text";
    }
    ChiefComplaint_1 = ChiefComplaint;
    ChiefComplaint.repo = function () {
        return typeorm_1.getRepository(ChiefComplaint_1);
    };
    var ChiefComplaint_1;
    ChiefComplaint.TYPES = {
        "TEXT": "text",
        "IMAGE": "image",
        "DOWNLOAD": "download",
    };
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], ChiefComplaint.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int", }),
        __metadata("design:type", Number)
    ], ChiefComplaint.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "100" }),
        __metadata("design:type", String)
    ], ChiefComplaint.prototype, "uuid", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], ChiefComplaint.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], ChiefComplaint.prototype, "complaint", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], ChiefComplaint.prototype, "remarks", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 20, "default": "text" }),
        __metadata("design:type", String)
    ], ChiefComplaint.prototype, "type", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Soap_1.Soap; }, function (soap) { return soap.chief_complaints; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "soap_id" }),
        __metadata("design:type", Soap_1.Soap)
    ], ChiefComplaint.prototype, "soap", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], ChiefComplaint.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], ChiefComplaint.prototype, "updated_at", void 0);
    ChiefComplaint = ChiefComplaint_1 = __decorate([
        typeorm_1.Entity("chief_complaints")
    ], ChiefComplaint);
    return ChiefComplaint;
}());
exports.ChiefComplaint = ChiefComplaint;
