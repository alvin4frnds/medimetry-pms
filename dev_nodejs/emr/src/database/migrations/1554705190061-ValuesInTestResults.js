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
var ValuesInTestResults1554705190061 = /** @class */ (function () {
    function ValuesInTestResults1554705190061() {
    }
    ValuesInTestResults1554705190061.prototype.up = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"test_result\" ADD \"json\" jsonb DEFAULT '{}'")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"chief_complaints\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"chief_complaints\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"examinations\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"examinations\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"medications\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"medications\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"referral\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"referral\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"procedures\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"investigation\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"investigation\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"attachments\" ALTER COLUMN \"url\" DROP NOT NULL")];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"attachments\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"attachments\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"test_result\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"vitals\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"clinical_notes\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"clinical_notes\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 19:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"users\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 20:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"users\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 21:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"past_illness\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 22:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"past_illness\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 23:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"past_medications\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 24:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"past_medications\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 25:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"soaps\" ALTER COLUMN \"meta\" SET DEFAULT '{}'")];
                    case 26:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"soaps\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 27:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"soaps\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 28:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"diagnosis\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 29:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"diagnosis\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 30:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"habits\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 31:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"habits\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 32:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"terms\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 33:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"allergies\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 34:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"allergies\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 35:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"consultations_status\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 36:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"consultations_status\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 37:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"family_history\" ALTER COLUMN \"created_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 38:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"family_history\" ALTER COLUMN \"updated_at\" SET DEFAULT CURRENT_TIMESTAMP")];
                    case 39:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ValuesInTestResults1554705190061.prototype.down = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"family_history\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"family_history\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"consultations_status\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"consultations_status\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"allergies\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"allergies\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"terms\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"habits\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"habits\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"diagnosis\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"diagnosis\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"soaps\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"soaps\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"soaps\" ALTER COLUMN \"meta\" DROP DEFAULT")];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"past_medications\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"past_medications\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"past_illness\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"past_illness\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"users\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 19:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"users\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 20:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"clinical_notes\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 21:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"clinical_notes\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 22:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"vitals\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 23:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"test_result\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 24:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"attachments\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 25:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"attachments\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 26:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"attachments\" ALTER COLUMN \"url\" SET NOT NULL")];
                    case 27:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"investigation\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 28:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"investigation\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 29:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"procedures\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 30:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"referral\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 31:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"referral\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 32:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"medications\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 33:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"medications\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 34:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"examinations\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 35:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"examinations\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 36:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"chief_complaints\" ALTER COLUMN \"updated_at\" SET DEFAULT now()")];
                    case 37:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"chief_complaints\" ALTER COLUMN \"created_at\" SET DEFAULT now()")];
                    case 38:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"test_result\" DROP COLUMN \"json\"")];
                    case 39:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ValuesInTestResults1554705190061;
}());
exports.ValuesInTestResults1554705190061 = ValuesInTestResults1554705190061;
