#!/usr/bin/env node
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
var DatabaseConfiguration_1 = require("../config/DatabaseConfiguration");
var Config_1 = require("../config/Config");
var Term_js_1 = require("../database/models/Term.js");
var Allergy_1 = require("../database/models/Allergy");
var FixAllergiesTable = /** @class */ (function () {
    function FixAllergiesTable() {
        this._db = DatabaseConfiguration_1.db;
        this._config = Config_1.config;
    }
    FixAllergiesTable.prototype.handle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1, allergiesCount, i, allergies, j, allergy, terms, substances, reactions, k, term, k, term;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Starting ...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        console.info("Creating Column 'meta'");
                        return [4 /*yield*/, Allergy_1.Allergy.repo().query("ALTER TABLE \"public\".\"allergies\" ADD COLUMN \"meta\" jsonb NOT NULL default '{}';")];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.info("Column 'meta' already exists");
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, Allergy_1.Allergy.repo().createQueryBuilder("allergies")
                            .select("COUNT(*)", "count")
                            .getRawOne()];
                    case 5:
                        allergiesCount = (_a.sent()).count;
                        i = 0;
                        _a.label = 6;
                    case 6:
                        if (!(i < allergiesCount)) return [3 /*break*/, 21];
                        return [4 /*yield*/, Allergy_1.Allergy.repo().find({
                                order: { id: 'ASC' },
                                relations: ["substance"],
                                skip: i,
                                take: 100,
                            })];
                    case 7:
                        allergies = _a.sent();
                        j = 0;
                        _a.label = 8;
                    case 8:
                        if (!(j < allergies.length)) return [3 /*break*/, 19];
                        allergy = allergies[j];
                        if (!allergy || !allergy["substance"])
                            return [3 /*break*/, 18];
                        terms = [], substances = allergy.substance.term_body.split(',').map(function (sub) { return sub.trim(); });
                        reactions = allergy.remarks.split(',').map(function (sub) { return sub.trim(); });
                        k = 0;
                        _a.label = 9;
                    case 9:
                        if (!(k < substances.length)) return [3 /*break*/, 12];
                        return [4 /*yield*/, Term_js_1.Term.createFromText(substances[k], 'allergy_substance', 0)];
                    case 10:
                        term = _a.sent();
                        terms.push(term);
                        _a.label = 11;
                    case 11:
                        k++;
                        return [3 /*break*/, 9];
                    case 12:
                        k = 0;
                        _a.label = 13;
                    case 13:
                        if (!(k < reactions.length)) return [3 /*break*/, 16];
                        return [4 /*yield*/, Term_js_1.Term.createFromText(reactions[k], 'allergy_reaction', 0)];
                    case 14:
                        term = _a.sent();
                        terms.push(term);
                        _a.label = 15;
                    case 15:
                        k++;
                        return [3 /*break*/, 13];
                    case 16:
                        allergy.meta = JSON.parse(JSON.stringify({ terms: terms }));
                        allergy["term_id"] = null;
                        allergy["substance_term_id"] = null;
                        return [4 /*yield*/, Allergy_1.Allergy.repo().save(allergy)];
                    case 17:
                        _a.sent();
                        _a.label = 18;
                    case 18:
                        j++;
                        return [3 /*break*/, 8];
                    case 19:
                        console.log("Processed: ", allergies.length);
                        _a.label = 20;
                    case 20:
                        i += 100;
                        return [3 /*break*/, 6];
                    case 21:
                        try {
                            // console.info("Droping extra columns");
                            // await Allergy.repo().query(`ALTER TABLE "public"."allergies" DROP COLUMN "substance_term_id"`);
                            // await Allergy.repo().query(`ALTER TABLE "public"."allergies" DROP COLUMN "term_id"`);
                        }
                        catch (e) { }
                        console.log('!! End !!');
                        process.exit(0);
                        return [2 /*return*/];
                }
            });
        });
    };
    return FixAllergiesTable;
}());
exports.FixAllergiesTable = FixAllergiesTable;
var obj = new FixAllergiesTable();
setTimeout(function () {
    obj.handle();
}, 2000);
