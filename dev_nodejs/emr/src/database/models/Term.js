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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var typeorm_1 = require("typeorm");
var Allergy_1 = require("./Allergy");
var Diagnosis_1 = require("./Diagnosis");
var Procedure_1 = require("./Procedure");
var Habit_1 = require("./Habit");
var Investigation_1 = require("./Investigation");
var TestResult_1 = require("./TestResult");
var Term = /** @class */ (function () {
    function Term() {
        this.meta = JSON.parse("{}");
    }
    Term_1 = Term;
    Term.createFromText = function (text, type, doctor_id) {
        return __awaiter(this, void 0, void 0, function () {
            var term;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Term_1.repo().findOne({
                            where: {
                                doctor_id: doctor_id,
                                term_type: type,
                                term_name: text,
                                term_body: text,
                            }
                        })];
                    case 1:
                        term = _a.sent();
                        if (!!term)
                            return [2 /*return*/, term];
                        return [4 /*yield*/, Term_1.repo().save({
                                "doctor_id": doctor_id,
                                "term_type": type,
                                "term_name": text,
                                "term_body": text,
                                "meta": {}
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Term.repo = function () {
        return typeorm_1.getRepository(Term_1);
    };
    var Term_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Term.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Term.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 150 }),
        __metadata("design:type", String)
    ], Term.prototype, "term_type", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 150 }),
        __metadata("design:type", String)
    ], Term.prototype, "term_name", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], Term.prototype, "term_body", void 0);
    __decorate([
        typeorm_1.Column({ type: "jsonb" }),
        __metadata("design:type", Object)
    ], Term.prototype, "meta", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], Term.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Allergy_1.Allergy; }, function (allergy) { return allergy.terms; }),
        __metadata("design:type", Allergy_1.Allergy)
    ], Term.prototype, "allergy", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Allergy_1.Allergy; }, function (allergy) { return allergy.substance; }),
        __metadata("design:type", Allergy_1.Allergy)
    ], Term.prototype, "allergySubstance", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Diagnosis_1.Diagnosis; }, function (diagnosis) { return diagnosis.term; }),
        __metadata("design:type", Diagnosis_1.Diagnosis)
    ], Term.prototype, "diagnosis", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Procedure_1.Procedure; }, function (procedure) { return procedure.term; }),
        __metadata("design:type", Procedure_1.Procedure)
    ], Term.prototype, "procedure", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return TestResult_1.TestResult; }, function (test_result) { return test_result.term; }),
        __metadata("design:type", TestResult_1.TestResult)
    ], Term.prototype, "test_result", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Investigation_1.Investigation; }, function (investigation) { return investigation.term; }),
        __metadata("design:type", Investigation_1.Investigation)
    ], Term.prototype, "investigation", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Habit_1.Habit; }, function (habit) { return habit.terms; }),
        __metadata("design:type", Habit_1.Habit)
    ], Term.prototype, "habit", void 0);
    Term = Term_1 = __decorate([
        typeorm_1.Entity("terms"),
        typeorm_1.Unique(['term_type', 'term_name', 'doctor_id'])
    ], Term);
    return Term;
}());
exports.Term = Term;
