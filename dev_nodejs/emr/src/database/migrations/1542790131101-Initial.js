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
var Initial1542790131101 = /** @class */ (function () {
    function Initial1542790131101() {
    }
    Initial1542790131101.prototype.up = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"chief_complaints\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"uuid\" character varying(100) NOT NULL, \"doctor_id\" integer NOT NULL, \"complaint\" character varying(500) NOT NULL, \"remarks\" character varying(500) NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"soap_id\" integer, CONSTRAINT \"PK_995c2cc93cddb3437d960f01af9\" PRIMARY KEY (\"id\"))")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"examinations\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"uuid\" character varying NOT NULL, \"doctor_id\" integer NOT NULL, \"examined_by\" character varying(100) NOT NULL, \"examined_organ\" character varying(250) NOT NULL, \"examined_place\" character varying(500) NOT NULL, \"remarks\" character varying(500) NOT NULL, \"examined_date\" TIMESTAMP NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"soap_id\" integer, CONSTRAINT \"PK_969acedbcda4db2b2c8159eadd9\" PRIMARY KEY (\"id\"))")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"medications\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"doctor_id\" integer NOT NULL, \"uuid\" character varying(100) NOT NULL, \"drug_name\" character varying(255), \"drug_dosage\" character varying(150) NOT NULL, \"drug_dosage_unit\" character varying(100) NOT NULL, \"frequency\" integer NOT NULL, \"duration\" integer NOT NULL, \"duration_unit\" character varying(50) NOT NULL, \"intake\" character varying(100) NOT NULL, \"remarks\" character varying(500) NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"soap_id\" integer, CONSTRAINT \"PK_e967cbc3dbdae00dcbc779e631c\" PRIMARY KEY (\"id\"))")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"referral\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"doctor_id\" integer NOT NULL, \"uuid\" character varying(100) NOT NULL, \"referral_type\" character varying(100) NOT NULL, \"procedure\" character varying(255), \"procedure_term_id\" integer, \"location\" character varying(200), \"department\" character varying(200), \"doctor_name\" character varying(150) NOT NULL, \"priority\" character varying(100) NOT NULL, \"referral_date\" TIMESTAMP NOT NULL, \"status\" character varying(500), \"diagnosis_term\" character varying(500), \"diagnosis_term_id\" integer, \"meta\" jsonb NOT NULL, \"remarks\" character varying(500) NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"soap_id\" integer, CONSTRAINT \"PK_ae3fc80798333f0463506f26db4\" PRIMARY KEY (\"id\"))")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"procedures\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"doctor_id\" integer NOT NULL, \"term_id\" integer, \"uuid\" character varying(100) NOT NULL, \"speciality\" character varying(100) NOT NULL, \"remarks\" character varying(500) NOT NULL, \"meta\" jsonb NOT NULL, \"status\" character varying(250) NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"soapId\" integer, CONSTRAINT \"PK_441114424849217b59879cc8e36\" PRIMARY KEY (\"id\"))")];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"investigation\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"doctor_id\" integer NOT NULL, \"uuid\" character varying(100) NOT NULL, \"term_id\" integer, \"category\" character varying(100) NOT NULL, \"loinc_code\" character varying(50) NOT NULL, \"status\" character varying(500) NOT NULL, \"remarks\" character varying(500) NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"soap_id\" integer, CONSTRAINT \"PK_f1347e7c04caa9dde8dc5e8db50\" PRIMARY KEY (\"id\"))")];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"attachments\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"doctor_id\" integer NOT NULL, \"uuid\" character varying(100) NOT NULL, \"attachment_type\" character varying(50) NOT NULL, \"url\" character varying(80) NOT NULL, \"meta\" jsonb NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"soap_id\" integer, CONSTRAINT \"PK_a2cbc9096696f09e0c24414ead8\" PRIMARY KEY (\"id\"))")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"test_result\" (\"id\" SERIAL NOT NULL, \"term_id\" integer, \"patient_id\" integer NOT NULL, \"doctor_id\" integer NOT NULL, \"uuid\" character varying(100) NOT NULL, \"test_result\" character varying(250) NOT NULL, \"remarks\" character varying(500) NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"soap_id\" integer, CONSTRAINT \"PK_2d527c124a34d306e3332196086\" PRIMARY KEY (\"id\"))")];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"vitals\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"doctor_id\" integer NOT NULL, \"uuid\" character varying(100) NOT NULL, \"vital_collected_at\" character varying(500), \"vital_information\" jsonb NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"soap_id\" integer, CONSTRAINT \"REL_2ab997146200ab38123aa29e5d\" UNIQUE (\"soap_id\"), CONSTRAINT \"PK_a99c12d0bc47c059fa3add31bbc\" PRIMARY KEY (\"id\"))")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"clinical_notes\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"doctor_id\" integer NOT NULL, \"uuid\" character varying(100) NOT NULL, \"inspection\" text NOT NULL, \"palpation\" text NOT NULL, \"percussion\" text NOT NULL, \"quscultation\" text NOT NULL, \"system_wide_examination\" text NOT NULL, \"key_observation\" text NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"soap_id\" integer, CONSTRAINT \"REL_c3ff5e91c34668f73a688aa6cb\" UNIQUE (\"soap_id\"), CONSTRAINT \"PK_1671ec1df5275b56911dc60a961\" PRIMARY KEY (\"id\"))")];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"soaps\" (\"id\" SERIAL NOT NULL, \"soap_code\" character varying(80) NOT NULL, \"consultation_code\" character varying(70) NOT NULL, \"patient_id\" integer NOT NULL, \"created_by\" integer NOT NULL, \"center_code\" character varying NOT NULL, \"meta\" jsonb NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"uuid\" character varying(100) NOT NULL, CONSTRAINT \"PK_0db87e9c5e204a972d83b1a6802\" PRIMARY KEY (\"id\"))")];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE INDEX \"IDX_2b410e6c85279e34ae74fb79f5\" ON \"public\".\"soaps\"(\"uuid\") ")];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"diagnosis\" (\"id\" SERIAL NOT NULL, \"uuid\" character varying(100) NOT NULL, \"patient_id\" integer NOT NULL, \"doctor_id\" integer NOT NULL, \"category\" character varying(500) NOT NULL, \"diagnosis\" character varying(500), \"icd_code\" character varying(50), \"chronic\" boolean NOT NULL, \"status\" character varying(500) NOT NULL, \"remarks\" character varying(500) NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"soap_id\" integer, \"term_id\" integer, CONSTRAINT \"PK_f237ddf35a728e9d5e3b739d5ac\" PRIMARY KEY (\"id\"))")];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"habits\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"habit_started_at\" TIMESTAMP NOT NULL, \"doctor_id\" integer NOT NULL, \"remarks\" character varying(500) NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"term_id\" integer, CONSTRAINT \"PK_948ca537f586cefa455b345138f\" PRIMARY KEY (\"id\"))")];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"terms\" (\"id\" SERIAL NOT NULL, \"doctor_id\" integer NOT NULL, \"term_type\" character varying(150) NOT NULL, \"term_name\" character varying(150) NOT NULL, \"term_body\" character varying(500) NOT NULL, \"meta\" jsonb NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT \"UQ_ae6b48f33ac85bf5779be30fbbf\" UNIQUE (\"term_type\", \"term_name\"), CONSTRAINT \"PK_986941048d3309f8045a81d6a18\" PRIMARY KEY (\"id\"))")];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"allergies\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"started_at\" TIMESTAMP NOT NULL, \"remarks\" character varying(500) NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"term_id\" integer, \"substance_term_id\" integer, CONSTRAINT \"PK_39866bc6d913ee4875c7e82d2ff\" PRIMARY KEY (\"id\"))")];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"consultations_status\" (\"id\" SERIAL NOT NULL, \"consultation_id\" integer NOT NULL, \"doctor_id\" integer, \"consultation_code\" character varying(40) NOT NULL, \"consultation_modified\" TIMESTAMP NOT NULL, \"consultation_status\" character varying(40) NOT NULL, \"done\" boolean NOT NULL, \"meta\" jsonb NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT \"PK_b80622d4c7c9eb93e3617133b8d\" PRIMARY KEY (\"id\"))")];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"family_history\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"relation\" character varying(50) NOT NULL, \"name\" character varying(100) NOT NULL, \"diagnosis\" character varying(150) NOT NULL, \"diagnosed_at\" TIMESTAMP NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT \"PK_ed46e0c5bc791e83cb9250ec37c\" PRIMARY KEY (\"id\"))")];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"notifications\" (\"id\" SERIAL NOT NULL, \"patient_id\" integer NOT NULL, \"notification_title\" character varying(150) NOT NULL, \"notification_body\" character varying(500) NOT NULL, \"consultation_code\" character varying(500) NOT NULL, \"haveRead\" boolean NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"meta\" jsonb NOT NULL, \"priority\" character varying(100) NOT NULL, CONSTRAINT \"PK_c859ce2d9f0bbdc9a803eed7aec\" PRIMARY KEY (\"id\"))")];
                    case 19:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"public\".\"users\" (\"id\" SERIAL NOT NULL, \"access_token\" character varying(150) NOT NULL, \"refresh_token\" character varying(80) NOT NULL, \"user_id\" integer NOT NULL, \"user_type\" character varying(20) NOT NULL, \"encrypted\" character varying(40) NOT NULL, \"name\" character varying(80) NOT NULL, \"mobile\" character varying(80) NOT NULL, \"email\" character varying(80) NOT NULL, \"referral\" character varying(10) NOT NULL, \"pic\" character varying(255) NOT NULL, \"meta\" jsonb NOT NULL, \"created_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \"updated_at\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT \"PK_a6cc71bedf15a41a5f5ee8aea97\" PRIMARY KEY (\"id\"))")];
                    case 20:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"chief_complaints\" ADD CONSTRAINT \"FK_770f71a3f80f934169af0878dd1\" FOREIGN KEY (\"soap_id\") REFERENCES \"public\".\"soaps\"(\"id\")")];
                    case 21:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"examinations\" ADD CONSTRAINT \"FK_c3857af70b4f7c8e59be07e33ff\" FOREIGN KEY (\"soap_id\") REFERENCES \"public\".\"soaps\"(\"id\")")];
                    case 22:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"medications\" ADD CONSTRAINT \"FK_501365290731ceb4ae6a55682e5\" FOREIGN KEY (\"soap_id\") REFERENCES \"public\".\"soaps\"(\"id\")")];
                    case 23:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"referral\" ADD CONSTRAINT \"FK_233ede7919bd29ac36dded88dc6\" FOREIGN KEY (\"soap_id\") REFERENCES \"public\".\"soaps\"(\"id\")")];
                    case 24:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"procedures\" ADD CONSTRAINT \"FK_83a52ddd61ef614724c88f42c54\" FOREIGN KEY (\"soapId\") REFERENCES \"public\".\"soaps\"(\"id\")")];
                    case 25:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"procedures\" ADD CONSTRAINT \"FK_6564783a2f4d280a329469420d5\" FOREIGN KEY (\"term_id\") REFERENCES \"public\".\"terms\"(\"id\")")];
                    case 26:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"investigation\" ADD CONSTRAINT \"FK_8e4d8bceda722cb29d5a4e68d61\" FOREIGN KEY (\"soap_id\") REFERENCES \"public\".\"soaps\"(\"id\")")];
                    case 27:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"investigation\" ADD CONSTRAINT \"FK_bb9abf93b5aef376ad9d1591b15\" FOREIGN KEY (\"term_id\") REFERENCES \"public\".\"terms\"(\"id\")")];
                    case 28:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"attachments\" ADD CONSTRAINT \"FK_fe6987bc6d61db5e3c101692fd8\" FOREIGN KEY (\"soap_id\") REFERENCES \"public\".\"soaps\"(\"id\")")];
                    case 29:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"test_result\" ADD CONSTRAINT \"FK_30ec56397c28be91e8abd456017\" FOREIGN KEY (\"soap_id\") REFERENCES \"public\".\"soaps\"(\"id\")")];
                    case 30:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"test_result\" ADD CONSTRAINT \"FK_3e4de4038ebedf5866c1223306e\" FOREIGN KEY (\"term_id\") REFERENCES \"public\".\"terms\"(\"id\")")];
                    case 31:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"vitals\" ADD CONSTRAINT \"FK_2ab997146200ab38123aa29e5d0\" FOREIGN KEY (\"soap_id\") REFERENCES \"public\".\"soaps\"(\"id\")")];
                    case 32:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"clinical_notes\" ADD CONSTRAINT \"FK_c3ff5e91c34668f73a688aa6cb2\" FOREIGN KEY (\"soap_id\") REFERENCES \"public\".\"soaps\"(\"id\")")];
                    case 33:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"diagnosis\" ADD CONSTRAINT \"FK_4e0c13e2bf9226bcbbfad949ff9\" FOREIGN KEY (\"soap_id\") REFERENCES \"public\".\"soaps\"(\"id\")")];
                    case 34:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"diagnosis\" ADD CONSTRAINT \"FK_ddb62bee865ed611fcb865ab246\" FOREIGN KEY (\"term_id\") REFERENCES \"public\".\"terms\"(\"id\")")];
                    case 35:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"habits\" ADD CONSTRAINT \"FK_0a3faa7d163147e21830697749e\" FOREIGN KEY (\"term_id\") REFERENCES \"public\".\"terms\"(\"id\")")];
                    case 36:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"allergies\" ADD CONSTRAINT \"FK_1e6a3f705bd4d4a8a6036d1b112\" FOREIGN KEY (\"term_id\") REFERENCES \"public\".\"terms\"(\"id\")")];
                    case 37:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"allergies\" ADD CONSTRAINT \"FK_f1ad1bb4b8fded7e0d6d907405a\" FOREIGN KEY (\"substance_term_id\") REFERENCES \"public\".\"terms\"(\"id\")")];
                    case 38:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Initial1542790131101.prototype.down = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"allergies\" DROP CONSTRAINT \"FK_f1ad1bb4b8fded7e0d6d907405a\"")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"allergies\" DROP CONSTRAINT \"FK_1e6a3f705bd4d4a8a6036d1b112\"")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"habits\" DROP CONSTRAINT \"FK_0a3faa7d163147e21830697749e\"")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"diagnosis\" DROP CONSTRAINT \"FK_ddb62bee865ed611fcb865ab246\"")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"diagnosis\" DROP CONSTRAINT \"FK_4e0c13e2bf9226bcbbfad949ff9\"")];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"clinical_notes\" DROP CONSTRAINT \"FK_c3ff5e91c34668f73a688aa6cb2\"")];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"vitals\" DROP CONSTRAINT \"FK_2ab997146200ab38123aa29e5d0\"")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"test_result\" DROP CONSTRAINT \"FK_3e4de4038ebedf5866c1223306e\"")];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"test_result\" DROP CONSTRAINT \"FK_30ec56397c28be91e8abd456017\"")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"attachments\" DROP CONSTRAINT \"FK_fe6987bc6d61db5e3c101692fd8\"")];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"investigation\" DROP CONSTRAINT \"FK_bb9abf93b5aef376ad9d1591b15\"")];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"investigation\" DROP CONSTRAINT \"FK_8e4d8bceda722cb29d5a4e68d61\"")];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"procedures\" DROP CONSTRAINT \"FK_6564783a2f4d280a329469420d5\"")];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"procedures\" DROP CONSTRAINT \"FK_83a52ddd61ef614724c88f42c54\"")];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"referral\" DROP CONSTRAINT \"FK_233ede7919bd29ac36dded88dc6\"")];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"medications\" DROP CONSTRAINT \"FK_501365290731ceb4ae6a55682e5\"")];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"examinations\" DROP CONSTRAINT \"FK_c3857af70b4f7c8e59be07e33ff\"")];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"public\".\"chief_complaints\" DROP CONSTRAINT \"FK_770f71a3f80f934169af0878dd1\"")];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"users\"")];
                    case 19:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"notifications\"")];
                    case 20:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"family_history\"")];
                    case 21:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"consultations_status\"")];
                    case 22:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"allergies\"")];
                    case 23:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"terms\"")];
                    case 24:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"habits\"")];
                    case 25:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"diagnosis\"")];
                    case 26:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP INDEX \"public\".\"IDX_2b410e6c85279e34ae74fb79f5\"")];
                    case 27:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"soaps\"")];
                    case 28:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"clinical_notes\"")];
                    case 29:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"vitals\"")];
                    case 30:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"test_result\"")];
                    case 31:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"attachments\"")];
                    case 32:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"investigation\"")];
                    case 33:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"procedures\"")];
                    case 34:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"referral\"")];
                    case 35:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"medications\"")];
                    case 36:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"examinations\"")];
                    case 37:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"public\".\"chief_complaints\"")];
                    case 38:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Initial1542790131101;
}());
exports.Initial1542790131101 = Initial1542790131101;
