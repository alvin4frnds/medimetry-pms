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
var GeneratedHistoryTables1554984534709 = /** @class */ (function () {
    function GeneratedHistoryTables1554984534709() {
    }
    GeneratedHistoryTables1554984534709.prototype.up = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"treatment_plan_logs\" (\"id\" SERIAL NOT NULL, \"remarks\" character varying(511) NOT NULL, \"follow_up\" character varying(100) NOT NULL, \"data\" jsonb NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"generated_history_id\" integer, CONSTRAINT \"PK_cb3fcb15b1b65d80df52b76f1b8\" PRIMARY KEY (\"id\"))")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"generated_histories\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"for_name\" character varying(100) NOT NULL, \"unique_id\" character varying(32) NOT NULL, \"consultation_code\" character varying(100) NOT NULL, \"data\" jsonb NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"soap_id\" integer, CONSTRAINT \"PK_6d31f1134d35dfd4c668902c853\" PRIMARY KEY (\"id\"))")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"treatment_plan_logs\" ADD CONSTRAINT \"FK_b4101237bed51a73ab9c0739fa0\" FOREIGN KEY (\"generated_history_id\") REFERENCES \"public\".\"generated_histories\"(\"id\")")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"generated_histories\" ADD CONSTRAINT \"FK_aed5f416efd1592b1feaff6b81e\" FOREIGN KEY (\"soap_id\") REFERENCES \"public\".\"soaps\"(\"id\")")];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GeneratedHistoryTables1554984534709.prototype.down = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"generated_histories\" DROP CONSTRAINT \"FK_aed5f416efd1592b1feaff6b81e\"")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"treatment_plan_logs\" DROP CONSTRAINT \"FK_b4101237bed51a73ab9c0739fa0\"")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"generated_histories\"")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"treatment_plan_logs\"")];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return GeneratedHistoryTables1554984534709;
}());
exports.GeneratedHistoryTables1554984534709 = GeneratedHistoryTables1554984534709;
