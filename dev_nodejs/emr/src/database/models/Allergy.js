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
var Term_1 = require("./Term");
var Allergy = /** @class */ (function () {
    function Allergy() {
        this.meta = JSON.parse("{}");
    }
    Allergy_1 = Allergy;
    Allergy.repo = function () {
        return typeorm_1.getRepository(Allergy_1);
    };
    Allergy.saveFromRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var terms, substances, reactions, k, term, k, term, allergy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        terms = [];
                        substances = request.substances.split(',').map(function (sub) { return sub.trim(); });
                        reactions = request.reactions.split(',').map(function (sub) { return sub.trim(); });
                        k = 0;
                        _a.label = 1;
                    case 1:
                        if (!(k < substances.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, Term_1.Term.createFromText(substances[k], 'allergy_substance', 0)];
                    case 2:
                        term = _a.sent();
                        terms.push(term);
                        _a.label = 3;
                    case 3:
                        k++;
                        return [3 /*break*/, 1];
                    case 4:
                        k = 0;
                        _a.label = 5;
                    case 5:
                        if (!(k < reactions.length)) return [3 /*break*/, 8];
                        return [4 /*yield*/, Term_1.Term.createFromText(reactions[k], 'allergy_reaction', 0)];
                    case 6:
                        term = _a.sent();
                        terms.push(term);
                        _a.label = 7;
                    case 7:
                        k++;
                        return [3 /*break*/, 5];
                    case 8:
                        allergy = {
                            "patient_id": request.patient_id,
                            "started_at": request.started_at,
                            "remarks": request.remarks || "",
                            "meta": JSON.parse(JSON.stringify({ terms: terms })),
                            "substances": request.substances,
                            "reactions": request.reactions,
                        };
                        return [4 /*yield*/, Allergy_1.repo().save(allergy)];
                    case 9: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    var Allergy_1;
    Allergy.REQUEST_TYPE = "allergy";
    Allergy.REQUEST_TYPE_SUBSTANCE = "allergy_substance";
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Allergy.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Allergy.prototype, "patient_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp" }),
        __metadata("design:type", Date)
    ], Allergy.prototype, "started_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 500 }),
        __metadata("design:type", String)
    ], Allergy.prototype, "remarks", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Term_1.Term; }, function (term) { return term.allergy; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "term_id" }),
        __metadata("design:type", Term_1.Term)
    ], Allergy.prototype, "terms", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Term_1.Term; }, function (term) { return term.allergySubstance; }, {
            cascade: true
        }),
        typeorm_1.JoinColumn({ name: "substance_term_id" }),
        __metadata("design:type", Term_1.Term)
    ], Allergy.prototype, "substance", void 0);
    __decorate([
        typeorm_1.Column({ type: 'jsonb', "default": "{}" }),
        __metadata("design:type", Object)
    ], Allergy.prototype, "meta", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], Allergy.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], Allergy.prototype, "updated_at", void 0);
    Allergy = Allergy_1 = __decorate([
        typeorm_1.Entity("allergies")
    ], Allergy);
    return Allergy;
}());
exports.Allergy = Allergy;
