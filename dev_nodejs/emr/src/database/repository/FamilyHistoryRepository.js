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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var typeorm_1 = require("typeorm");
var FamilyHistory_1 = require("../models/FamilyHistory");
var FamilyHistoryRepository = /** @class */ (function (_super) {
    __extends(FamilyHistoryRepository, _super);
    //_repository;
    function FamilyHistoryRepository() {
        return _super.call(this) || this;
        //this._repository=getConnection().getRepository(FamilyHistory);
    }
    FamilyHistoryRepository.prototype.getFamilyHistoryByPatientId = function (patientId) {
        return typeorm_1.getConnection().getRepository(FamilyHistory_1.FamilyHistory).find({ where: { patient_id: patientId } });
    };
    FamilyHistoryRepository.prototype.saveHistory = function (history) {
        return typeorm_1.getConnection().getRepository(FamilyHistory_1.FamilyHistory).save(history);
    };
    FamilyHistoryRepository.prototype.deleteHistory = function (id) {
        return typeorm_1.getConnection().getRepository(FamilyHistory_1.FamilyHistory).delete({ id: id });
    };
    FamilyHistoryRepository = __decorate([
        typeorm_1.EntityRepository(FamilyHistory_1.FamilyHistory),
        __metadata("design:paramtypes", [])
    ], FamilyHistoryRepository);
    return FamilyHistoryRepository;
}(typeorm_1.Repository));
exports.FamilyHistoryRepository = FamilyHistoryRepository;
