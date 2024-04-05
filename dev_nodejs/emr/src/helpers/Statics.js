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
var Examination_1 = require("../database/models/Examination");
var Vital_1 = require("../database/models/Vital");
var Diagnosis_1 = require("../database/models/Diagnosis");
var Medication_1 = require("../database/models/Medication");
var Investigation_1 = require("../database/models/Investigation");
var Referral_1 = require("../database/models/Referral");
var Procedure_1 = require("../database/models/Procedure");
var TestResult_1 = require("../database/models/TestResult");
var ChiefComplaint_1 = require("../database/models/ChiefComplaint");
var Attachment_1 = require("../database/models/Attachment");
var ClinicalNotes_1 = require("../database/models/ClinicalNotes");
var Term_1 = require("../database/models/Term");
var PHPUnserialize = require('php-unserialize');
var StaticHelpers = /** @class */ (function () {
    function StaticHelpers() {
    }
    StaticHelpers.strRandom = function (length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
    StaticHelpers.twoDigits = function (d) {
        if (0 <= d && d < 10)
            return "0" + d.toString();
        if (-10 < d && d < 0)
            return "-0" + (-1 * d).toString();
        return d.toString();
    };
    /**
     * …and then create the method to output the date string as desired.
     * Some people hate using prototypes this way, but if you are going
     * to apply this to more than one Date object, having it as a prototype
     * makes sense.
     **/
    StaticHelpers.toMysql = function (dateTimeObj) {
        return dateTimeObj.getFullYear() + "-" +
            StaticHelpers.twoDigits(1 + dateTimeObj.getMonth()) + "-" +
            StaticHelpers.twoDigits(dateTimeObj.getDate()) + " " +
            StaticHelpers.twoDigits(dateTimeObj.getHours()) + ":" +
            StaticHelpers.twoDigits(dateTimeObj.getMinutes()) + ":" +
            StaticHelpers.twoDigits(dateTimeObj.getSeconds());
    };
    StaticHelpers.mysqlToDateObject = function (dateString) {
        // Split timestamp into [ Y, M, D, h, m, s ]
        var t = dateString.split(/[- :]/);
        // Apply each element to the Date function
        return new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
    };
    StaticHelpers.getColumnFromJsonObj = function (obj, colname) {
        var column = [];
        StaticHelpers.onlyUnique(obj)
            .forEach(function (result) {
            column.push(result[colname]);
        });
        return column;
    };
    StaticHelpers.arrayToCommaSeperatedString = function (arr) {
        return arr.map(function (id) {
            return "'" + id + "'";
        }).join(", ");
    };
    StaticHelpers.onlyUnique = function (arr) {
        return arr.filter(function (elem, index, self) { return self.indexOf(elem) === index; });
    };
    StaticHelpers.dateStamp = function () {
        var d = new Date;
        return d.getFullYear() + "-"
            + StaticHelpers.twoDigits(d.getMonth() + 1) + "-"
            + StaticHelpers.twoDigits(d.getDate());
    };
    StaticHelpers.stringify = function (json) {
        var cache = new Set();
        return JSON.stringify(json, function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.has(value)) {
                    // Circular reference found
                    try {
                        // If this value does not reference a parent it can be deduped
                        return JSON.parse(JSON.stringify(value));
                    }
                    catch (err) {
                        // discard key if value cannot be deduped
                        return;
                    }
                }
                // Store value in our set
                cache.add(value);
            }
            return value;
        });
    };
    StaticHelpers.arrayToMappedObject = function (arr, column) {
        var temp = {};
        arr.forEach(function (row) {
            temp[row[column]] = row;
        });
        return temp;
    };
    StaticHelpers.bindTerms = function (arrayOfObject, foreignKey, foreignObjKey, addtionalTermTextKey) {
        if (foreignKey === void 0) { foreignKey = "term_id"; }
        if (foreignObjKey === void 0) { foreignObjKey = "term"; }
        if (addtionalTermTextKey === void 0) { addtionalTermTextKey = "term_text"; }
        return __awaiter(this, void 0, void 0, function () {
            var termIds, terms, _loop_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        termIds = StaticHelpers.getColumnFromJsonObj(arrayOfObject, foreignKey).join(",");
                        if (!termIds)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, Term_1.Term.repo().query("select * from terms where \"id\" in (" + termIds + ")")];
                    case 1:
                        terms = _a.sent();
                        _loop_1 = function (i) {
                            arrayOfObject[i][foreignObjKey] = terms.filter(function (term) { return term["id"] == arrayOfObject[i][foreignKey]; })[0] || {};
                            arrayOfObject[i][addtionalTermTextKey] = arrayOfObject[i][foreignObjKey]["term_body"] || "";
                        };
                        for (i = 0; i < arrayOfObject.length; i++) {
                            _loop_1(i);
                        }
                        return [2 /*return*/, arrayOfObject];
                }
            });
        });
    };
    StaticHelpers.doNothingOnError = function (err) {
        return console.error("Found Error: ", err);
    };
    StaticHelpers.showVideoCallIndicator = function (consultationDate) {
        var minute = 15;
        if (!consultationDate)
            return false;
        var oldDate = new Date(consultationDate).getTime();
        var current_date = this.toLocalTime();
        var diff_minute = Math.round((current_date - oldDate) / 60000);
        //15 number is adjustable we can adjust it according to the requirement
        return (diff_minute) <= minute;
    };
    StaticHelpers.extractMedicationFrequency = function (number, withSos) {
        if (withSos === void 0) { withSos = false; }
        var daily = ('' + (number >>> 0).toString(2)).padStart(5, '0').split("").reverse().join("-");
        return withSos ? (daily.substring(0, 7) + ((number > 15) ? " SOS" : "")) : daily;
    };
    StaticHelpers.toLocalTime = function (datetime) {
        if (datetime === void 0) { datetime = null; }
        datetime = datetime || new Date();
        datetime.setHours(datetime.getHours() + 5);
        datetime.setMinutes(datetime.getMinutes() + 30);
        return datetime.getTime();
    };
    StaticHelpers.unserialize = function (string) {
        if (typeof string != 'string')
            return string;
        string = string.replace(/O:8:"stdClass"/g, 'a');
        return PHPUnserialize.unserialize(string);
    };
    StaticHelpers.daysDurationToMySqlDate = function (str, now) {
        if (str === void 0) { str = ""; }
        if (now === void 0) { now = null; }
        var wordDaysMapping = {
            'Day(s)': 1,
            'Week(s)': 7,
            'Month(s)': 30,
        };
        now = new Date(now);
        if (!str.length)
            return now;
        var parts = str.split(" ");
        if (parts.length === 1)
            parts.push("Day(s)");
        var days = parseInt(parts[0]) * (wordDaysMapping[parts[1]] || 1);
        now.setDate(now.getDate() + days);
        return now;
    };
    StaticHelpers.gmtToIst = function (str) {
        var date = new Date(str);
        var istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
        return StaticHelpers.toMysql(istDate);
    };
    StaticHelpers.arrayUnique = function (array) {
        return array.filter(function (value, index, array) { return array.indexOf(value) === index; });
    };
    StaticHelpers.ucfirst = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    StaticHelpers.arraySearch = function (arr, key, value) {
        for (var i = 0; i < arr.length; i++)
            if (arr[i][key] === value)
                return i;
        return -1;
    };
    StaticHelpers.removePrefixFromTypeormRawResults = function (resultsArray) {
        return resultsArray.map(function (row) {
            var newRow = {};
            for (var key in row) {
                newRow[key.replace("row_", "")] = row[key];
            }
            return newRow;
        });
    };
    StaticHelpers.URL_COMPONENETS_TO_CLASS_MAPPING = {
        "examinations": Examination_1.Examination,
        "vitals": Vital_1.Vitals,
        "diagnosis": Diagnosis_1.Diagnosis,
        "medications": Medication_1.Medication,
        "investigations": Investigation_1.Investigation,
        "referrals": Referral_1.Referral,
        "procedures": Procedure_1.Procedure,
        "test-results": TestResult_1.TestResult,
        "chief-complains": ChiefComplaint_1.ChiefComplaint,
        "attachments": Attachment_1.Attachment,
        "clinical-notes": ClinicalNotes_1.ClinicalNote,
    };
    return StaticHelpers;
}());
exports.StaticHelpers = StaticHelpers;
