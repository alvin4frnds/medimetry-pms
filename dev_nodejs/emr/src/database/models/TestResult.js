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
var TestResult = /** @class */ (function () {
    function TestResult() {
        this.type = "text";
        this.json = JSON.parse("{}");
    }
    TestResult_1 = TestResult;
    TestResult.repo = function () {
        return typeorm_1.getRepository(TestResult_1);
    };
    var TestResult_1;
    TestResult.TYPES = {
        "TEXT": "text",
        "IMAGE": "image",
        "DOWNLOAD": "download",
        "JSON": "json",
    };
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], TestResult.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int", nullable: true }),
        __metadata("design:type", Number)
    ], TestResult.prototype, "term_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], TestResult.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], TestResult.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "100" }),
        __metadata("design:type", String)
    ], TestResult.prototype, "uuid", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 250 }),
        __metadata("design:type", String)
    ], TestResult.prototype, "test_result", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], TestResult.prototype, "remarks", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 20, "default": "text" }),
        __metadata("design:type", String)
    ], TestResult.prototype, "type", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], TestResult.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Soap_1.Soap; }, function (soap) { return soap.test_results; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "soap_id" }),
        __metadata("design:type", Soap_1.Soap)
    ], TestResult.prototype, "soap", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Term_1.Term; }, function (term) { return term.test_result; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "term_id" }),
        __metadata("design:type", Term_1.Term)
    ], TestResult.prototype, "term", void 0);
    __decorate([
        typeorm_1.Column({ type: 'jsonb', "default": "{}", "nullable": true }),
        __metadata("design:type", Object)
    ], TestResult.prototype, "json", void 0);
    TestResult = TestResult_1 = __decorate([
        typeorm_1.Entity()
    ], TestResult);
    return TestResult;
}());
exports.TestResult = TestResult;
