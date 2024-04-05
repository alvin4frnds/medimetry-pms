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
var Term_1 = require("../models/Term");
var TermsRepository = /** @class */ (function (_super) {
    __extends(TermsRepository, _super);
    function TermsRepository() {
        return _super.call(this) || this;
        //   this._repository = ;
    }
    TermsRepository.prototype.getTerms = function (type, term) {
        return typeorm_1.getConnection("default").getRepository(Term_1.Term)
            .createQueryBuilder("terms")
            .where("term_type = :type and term_name ilike :term", {
            type: type,
            term: "%" + term + "%",
        })
            .getMany();
    };
    TermsRepository.prototype.saveTerm = function (termData) {
        return __awaiter(this, void 0, void 0, function () {
            var term;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.object = {
                            "doctor_id": termData.data.doctor_id,
                            "term_type": termData.type,
                            "term_name": termData.data.term_text,
                            "term_body": termData.data.term_text,
                            "meta": [],
                            "created_at": new Date
                        };
                        return [4 /*yield*/, this.checkIfTermAlreadyExists({
                                term_type: this.object.term_type,
                                term_name: this.object.term_body
                            })];
                    case 1:
                        term = _a.sent();
                        if (!term) {
                            return [2 /*return*/, typeorm_1.getConnection("default").getRepository(Term_1.Term).save(this.object)];
                        }
                        else {
                            return [2 /*return*/, term];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    TermsRepository.prototype.syncTerms = function (terms) {
        return __awaiter(this, void 0, void 0, function () {
            var term_name, term_type;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        term_name = [], term_type = [];
                        terms.forEach(function (row) {
                            term_name.push(row.term_name);
                            term_type.push(row.term_type);
                        });
                        return [4 /*yield*/, typeorm_1.getConnection().createQueryBuilder().insert()
                                .into(Term_1.Term)
                                .values(terms)
                                .onConflict("(term_type,term_name) DO NOTHING").execute()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, typeorm_1.getConnection("default").getRepository(Term_1.Term).find({ term_type: typeorm_1.In(term_type), term_name: typeorm_1.In(term_name) })];
                }
            });
        });
    };
    TermsRepository.prototype.checkIfTermAlreadyExists = function (condition) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, typeorm_1.getConnection().getRepository(Term_1.Term).findOne({ where: condition })];
            });
        });
    };
    TermsRepository = __decorate([
        typeorm_1.EntityRepository(Term_1.Term),
        __metadata("design:paramtypes", [])
    ], TermsRepository);
    return TermsRepository;
}(typeorm_1.Repository));
exports.TermsRepository = TermsRepository;
