"use strict";
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
var ActiveStatusInConsultationsStatusTable1573714551116 = /** @class */ (function () {
    function ActiveStatusInConsultationsStatusTable1573714551116() {
    }
    ActiveStatusInConsultationsStatusTable1573714551116.prototype.up = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"consultations_status\" ADD \"active\" boolean NOT NULL DEFAULT true")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("update consultations_status set active = false where patient_id in ('48480','49254','48382','49517','48061','47294','49334','49473','49270','48940','49178','49083','49082','49081','49078','49070','49065','49041','49017','49007','48800','48642','48643','48575','48573','48577','48102','48078','48535','47871','47729','48218','48186','48082','46839','47061','46813','46736','46225','46017','46196','46334','39843','46318','46209','46213','46073','46012','46027','45600','45548','43712','45009','44965','38680','44001','44676','41637','40683','44760','43913','42771','42976','38839','44191','40060','43986','43966','38721','40690','43902','38979','43845','43855','43850')")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("UPDATE consultations_status set active = false where consultation_code in ( select consultation_code from soaps where active = false )")];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ActiveStatusInConsultationsStatusTable1573714551116.prototype.down = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"consultations_status\" DROP COLUMN \"active\"")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ActiveStatusInConsultationsStatusTable1573714551116;
}());
exports.ActiveStatusInConsultationsStatusTable1573714551116 = ActiveStatusInConsultationsStatusTable1573714551116;
