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
var Medication_1 = require("../models/Medication");
var MedicationRepository = /** @class */ (function (_super) {
    __extends(MedicationRepository, _super);
    //_repository;
    function MedicationRepository() {
        return _super.call(this) || this;
        // this._repository=getConnection().getRepository(Medication);
    }
    MedicationRepository.prototype.getPastMedicationByPatientId = function (patientId) {
        return typeorm_1.getConnection().getRepository(Medication_1.Medication).find({ where: { patient_id: patientId } });
    };
    MedicationRepository = __decorate([
        typeorm_1.EntityRepository(Medication_1.Medication),
        __metadata("design:paramtypes", [])
    ], MedicationRepository);
    return MedicationRepository;
}(typeorm_1.Repository));
exports.MedicationRepository = MedicationRepository;
