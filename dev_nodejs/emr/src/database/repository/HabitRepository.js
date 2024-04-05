"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var typeorm_1 = require("typeorm");
var Habit_1 = require("../models/Habit");
var PatientHabitRepository = /** @class */ (function (_super) {
    __extends(PatientHabitRepository, _super);
    function PatientHabitRepository() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // _repository;
    // constructor() {
    //     super();
    //     this._repository=getConnection().getRepository(Habit);
    // }
    PatientHabitRepository.prototype.getHabitsByPatientId = function (patientId) {
        return typeorm_1.getConnection().getRepository(Habit_1.Habit).find({ relations: ["terms"], where: { patient_id: patientId } });
    };
    PatientHabitRepository.prototype.saveHabits = function (habit) {
        return typeorm_1.getConnection().getRepository(Habit_1.Habit).save(habit);
    };
    PatientHabitRepository.prototype.saveAllHabits = function (habits) {
        return typeorm_1.getConnection().createQueryBuilder().insert().into(Habit_1.Habit).values(habits).execute();
    };
    PatientHabitRepository.prototype.deleteHabits = function (id) {
        return typeorm_1.getConnection().getRepository(Habit_1.Habit).delete({ id: id });
    };
    PatientHabitRepository = __decorate([
        typeorm_1.EntityRepository(Habit_1.Habit)
    ], PatientHabitRepository);
    return PatientHabitRepository;
}(typeorm_1.Repository));
exports.PatientHabitRepository = PatientHabitRepository;
