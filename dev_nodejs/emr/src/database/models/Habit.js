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
var Term_1 = require("./Term");
var Habit = /** @class */ (function () {
    function Habit() {
    }
    Habit_1 = Habit;
    Habit.repo = function () {
        return typeorm_1.getRepository(Habit_1);
    };
    var Habit_1;
    Habit.REQUEST_TYPE = "habit";
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Habit.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Number)
    ], Habit.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Date)
    ], Habit.prototype, "habit_started_at", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Number)
    ], Habit.prototype, "doctor_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], Habit.prototype, "remarks", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Term_1.Term; }, function (term) { return term.habit; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "term_id" }),
        __metadata("design:type", Term_1.Term)
    ], Habit.prototype, "terms", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], Habit.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], Habit.prototype, "updated_at", void 0);
    Habit = Habit_1 = __decorate([
        typeorm_1.Entity("habits")
    ], Habit);
    return Habit;
}());
exports.Habit = Habit;
