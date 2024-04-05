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
var Attachment = /** @class */ (function () {
    function Attachment() {
        this.soap_section_type = "general";
        this.meta = JSON.parse("{}");
    }
    Attachment_1 = Attachment;
    Attachment.repo = function () {
        return typeorm_1.getRepository(Attachment_1);
    };
    var Attachment_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Attachment.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Attachment.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Attachment.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "100" }),
        __metadata("design:type", String)
    ], Attachment.prototype, "uuid", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 100 }),
        __metadata("design:type", String)
    ], Attachment.prototype, "attachment_type", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 50, "default": "general" }),
        __metadata("design:type", String)
    ], Attachment.prototype, "soap_section_type", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 255, nullable: true }),
        __metadata("design:type", String)
    ], Attachment.prototype, "url", void 0);
    __decorate([
        typeorm_1.Column({ type: "jsonb" }),
        __metadata("design:type", Object)
    ], Attachment.prototype, "meta", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Soap_1.Soap; }, function (soap) { return soap.attachments; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "soap_id" }),
        __metadata("design:type", Soap_1.Soap)
    ], Attachment.prototype, "soap", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], Attachment.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], Attachment.prototype, "updated_at", void 0);
    Attachment = Attachment_1 = __decorate([
        typeorm_1.Entity("attachments")
    ], Attachment);
    return Attachment;
}());
exports.Attachment = Attachment;
