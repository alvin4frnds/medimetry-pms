"use strict";
import { Examination } from '../database/models/Examination';
import { Vitals } from '../database/models/Vital';
import { Diagnosis } from '../database/models/Diagnosis';
import { Medication } from '../database/models/Medication';
import { Investigation } from '../database/models/Investigation';
import { Referral } from '../database/models/Referral';
import { Procedure } from '../database/models/Procedure';
import { TestResult } from '../database/models/TestResult';
import { ChiefComplaint } from '../database/models/ChiefComplaint';
import { Attachment } from '../database/models/Attachment';
import { ClinicalNote } from '../database/models/ClinicalNotes';
import { Term } from '../database/models/Term';
const PHPUnserialize = require('php-unserialize');

export class StaticHelpers {


    public static readonly URL_COMPONENETS_TO_CLASS_MAPPING = {
        "examinations": Examination,
        "vitals": Vitals,
        "diagnosis": Diagnosis,
        "medications": Medication,
        "investigations": Investigation,
        "referrals": Referral,
        "procedures": Procedure,
        "test-results": TestResult,
        "chief-complains": ChiefComplaint,
        "attachments": Attachment,
        "clinical-notes": ClinicalNote,
    };


    public static strRandom(length) {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    public static twoDigits(d) {
        if (0 <= d && d < 10) return "0" + d.toString();
        if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
        return d.toString();
    }

    /**
     * …and then create the method to output the date string as desired.
     * Some people hate using prototypes this way, but if you are going
     * to apply this to more than one Date object, having it as a prototype
     * makes sense.
     **/
    public static toMysql(dateTimeObj) {
        return dateTimeObj.getFullYear() + "-" +
            StaticHelpers.twoDigits(1 + dateTimeObj.getMonth()) + "-" +
            StaticHelpers.twoDigits(dateTimeObj.getDate()) + " " +
            StaticHelpers.twoDigits(dateTimeObj.getHours()) + ":" +
            StaticHelpers.twoDigits(dateTimeObj.getMinutes()) + ":" +
            StaticHelpers.twoDigits(dateTimeObj.getSeconds());

    }

    public static mysqlToDateObject(dateString) {
        // Split timestamp into [ Y, M, D, h, m, s ]
        const t = dateString.split(/[- :]/);

        // Apply each element to the Date function
        return new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
    }

    public static getColumnFromJsonObj(obj, colname) {
        let column = [];
        StaticHelpers.onlyUnique(obj)
            .forEach(result => {
                column.push(result[colname]);
            });

        return column;
    }

    public static arrayToCommaSeperatedString(arr) {
        return arr.map(id => {
            return "'" + id + "'";
        }).join(", ");
    }

    public static onlyUnique(arr) {
        return arr.filter((elem, index, self) => self.indexOf(elem) === index);
    }

    public static dateStamp() {
        const d = new Date;
        return d.getFullYear() + "-"
            + StaticHelpers.twoDigits(d.getMonth() + 1) + "-"
            + StaticHelpers.twoDigits(d.getDate());
    }

    public static stringify(json) {
        const cache = new Set();
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
    }

    public static arrayToMappedObject(arr, column) {
        let temp = {};
        arr.forEach(row => {
            temp[row[column]] = row;
        });

        return temp;
    }

    public static async bindTerms(arrayOfObject, foreignKey = "term_id", foreignObjKey = "term", addtionalTermTextKey = "term_text") {
        const termIds = StaticHelpers.getColumnFromJsonObj(arrayOfObject, foreignKey).join(",");

        if (!termIds) return [];
        const terms = await Term.repo().query(`select * from terms where "id" in (${termIds})`);

        for (let i = 0; i < arrayOfObject.length; i++) {
            arrayOfObject[i][foreignObjKey] = terms.filter(term => term["id"] == arrayOfObject[i][foreignKey])[0] || {};
            arrayOfObject[i][addtionalTermTextKey] = arrayOfObject[i][foreignObjKey]["term_body"] || "";
        }

        return arrayOfObject;
    }

    public static doNothingOnError(err) {
        return console.error("Found Error: ", err);
    }


    public static showVideoCallIndicator(consultationDate) {

        const minute = 15;
        if (!consultationDate) return false;
        let oldDate = new Date(consultationDate).getTime();
        let current_date = this.toLocalTime();

        let diff_minute = Math.round((current_date - oldDate) / 60000);


        //15 number is adjustable we can adjust it according to the requirement
        return (diff_minute) <= minute;
    }

    public static extractMedicationFrequency(number, withSos = false) {
        const daily = ('' + (number >>> 0).toString(2)).padStart(5, '0').split("").reverse().join("-");

        return withSos ? (daily.substring(0, 7) + ((number > 15) ? " SOS" : "")) : daily;
    }

    public static toLocalTime(datetime = null) {
        datetime = datetime || new Date();
        datetime.setHours(datetime.getHours() + 5);
        datetime.setMinutes(datetime.getMinutes() + 30);
        return datetime.getTime();
    }

    public static unserialize(string) {
        if (typeof string != 'string') return string;

        string = string.replace(/O:8:"stdClass"/g, 'a');
        return PHPUnserialize.unserialize(string);
    }

    public static daysDurationToMySqlDate(str: String = "", now: Date = null) {
        const wordDaysMapping = {
            'Day(s)': 1,
            'Week(s)': 7,
            'Month(s)': 30,
        };

        now = new Date(now);
        if (!str.length) return now;

        const parts = str.split(" ");
        if (parts.length === 1) parts.push("Day(s)");

        const days = parseInt(parts[0]) * (wordDaysMapping[parts[1]] || 1);

        now.setDate(now.getDate() + days);
        return now;
    }

    public static gmtToIst (str) {
        const date = new Date(str);
        const istDate = new Date( date.getTime() + (5.5 * 60 * 60 * 1000) );

        return StaticHelpers.toMysql(istDate);
    }

    public static arrayUnique(array: any[]) {
        return array.filter((value, index, array) => array.indexOf(value) === index);
    }

    public static ucfirst(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    public static arraySearch(arr, key, value) {
        for ( let i = 0; i < arr.length; i ++) 
            if (arr[i][key] === value)
                return i;

        return -1;
    }

    public static removePrefixFromTypeormRawResults(resultsArray) {
        return resultsArray.map(row => {
            let newRow = {};

            for ( let key in row ) {
                newRow[key.replace("row_", "")] = row[key];
            }

            return newRow;
        });
    }
}