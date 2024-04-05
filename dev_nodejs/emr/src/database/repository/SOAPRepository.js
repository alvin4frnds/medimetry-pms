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
var Soap_1 = require("../models/Soap");
var DatabaseConfiguration_1 = require("../../config/DatabaseConfiguration");
var Statics_1 = require("../../helpers/Statics");
var SOAPRepository = /** @class */ (function (_super) {
    __extends(SOAPRepository, _super);
    function SOAPRepository() {
        return _super.call(this) || this;
    }
    SOAPRepository.prototype.init = function () {
        if (this._repository)
            return this;
        this._repository = typeorm_1.getConnection().getRepository(Soap_1.Soap);
        return this;
    };
    SOAPRepository.prototype.createSoapByPostId = function (postId) {
        return __awaiter(this, void 0, void 0, function () {
            var post, pobject, consultation, patient, theValues, foundSoaps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DatabaseConfiguration_1.db.wpdb("select * from medi_posts where ID = " + postId)];
                    case 1:
                        post = (_a.sent())[0];
                        return [4 /*yield*/, DatabaseConfiguration_1.db.wpdb("select * from medi_pobject where post_id = " + postId + " order by start_date desc")];
                    case 2:
                        pobject = (_a.sent())[0];
                        return [4 /*yield*/, DatabaseConfiguration_1.db.wpdb("select * from medi_consultation where code = '" + pobject.code + "'")];
                    case 3:
                        consultation = (_a.sent())[0];
                        return [4 /*yield*/, DatabaseConfiguration_1.db.wpdb("select * from medi_patients where id = " + consultation.patient_id)];
                    case 4:
                        patient = (_a.sent())[0];
                        theValues = {
                            "soap_code": Statics_1.StaticHelpers.strRandom(32),
                            "consultation_code": pobject.code,
                            "patient_id": patient.id,
                            "meta": {},
                            "created_by": consultation.user_id,
                            "center_code": patient.center_code,
                            "uuid": patient.id + "/" + post.post_author + "/" + consultation.channel_id,
                            "created_at": new Date,
                            "updated_at": new Date,
                        };
                        return [4 /*yield*/, Soap_1.Soap.getRepo().find({ where: { consultation_code: pobject.code } })];
                    case 5:
                        foundSoaps = _a.sent();
                        if (foundSoaps.length)
                            return [2 /*return*/, foundSoaps[0]];
                        return [4 /*yield*/, this.save(theValues)];
                    case 6: 
                    // if not lets create new one
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SOAPRepository.prototype.save = function (toSave) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()._repository.save(toSave)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SOAPRepository.prototype.repo = function () {
        return this.init()._repository;
    };
    SOAPRepository = __decorate([
        typeorm_1.EntityRepository(Soap_1.Soap),
        __metadata("design:paramtypes", [])
    ], SOAPRepository);
    return SOAPRepository;
}(typeorm_1.Repository));
exports.SOAPRepository = SOAPRepository;
