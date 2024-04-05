import { PrescriptionDigitalization } from './models/prescription-digitalization';
import { RestService } from '../../services/rest.service';
import * as FS from '../../../../node_modules/fuzzyset.js';
import { UtilityService } from '../../services/utility.service';

export class PMSDataRecognizer {

    private phrases: string[] = [];
    private thePhrase: string = "";
    private processed: string[] = [];
    private models = [];
    private dictionary = {};

    public static readonly STATUS_EMPTY_REQUEST = 411;
    public types: Model[] = [];

    private _rest: RestService;
    private _util: UtilityService;

    public static readonly ALTERNATIVES = {
        "vitals": ['vital'],
        "chief complains": ["chief complaints", "complains", "complaint", "complain",],
        "medicines": ["medications", "medication", "medicine",],
        "personal history": ["personal",],
        "diet chart": ["meals", "dietchart",],
        "investigations": ["tests"],
        "remarks": ["followup", "follow up", "follow-up",],
        "mobile number": ["mobile", "phone number", "phone", "mobile",],
        "UID": ["uid", "u.i.d.",],
        "center": ["centre", "central",],
        "doctor name": ["dr. name",],
        "date": [],
        "patient name": ["name"],
        "age": [],
        "gender": ["sex"],
        "BP": ["bp", "b.p.", "blood pressure",],
        "RBS": ["random sugar", "rbs", "r.b.s."],
        "FBS": ["fasting blood sugar", "FS", "fbs", "f.b.s.", "f b s",],
        "PPS": ["post parandial sugar", "parandial sugar", "after food sugar"],
        "weight": ["wait"],
        "pulse": ["pulsar", "purse"],
        "oxygen": ["oxygen saturation", "saturation"],
        "respiratory": ["respiratory rate", "respiration rate", "respiration"],
        "head": ["head circumference"],
        "BMI": ["bmi", "b.m.i.", "b m i"],
        "dietaryCompliance": ["dietary compliance", "diet compliance", "dietary", "diet"],
        "drugCompliance": ["drug compliance", "drugs compliance", "drugs", "drug"],
        "exercise": ["workout", "walking", "running"],
        "occupationText": ["job", "occupation"],
        "lifeStyle": ["life style", "life", "lifestyle"],
        "economicStatus": ["economic status", "status", "economic"],
        "drinkingHabit": ["drinking habit", 'alchol', 'alcohol', 'drinking'],
        "smokingHabit": ["smoking", "smoker", "smoke"],
        "past medications": ["past medication", "past medicines", "past medicine"],
        "past illnesses": ["past illness", "illness"],
        "past procedures": ["past procedure"],
    };

    constructor(dictionary = {}, phrases = []) {
        console.log("recognizer instance constructed: ");

        this.phrases = phrases;
        this.dictionary = dictionary;
    }

    public setServices(_rest: RestService, _util: UtilityService) {
        this._rest = _rest;
        this._util = _util;

        this.types = [new PrescriptionDigitalization(this._rest, this.dictionary),];
    }
    public clearPhrases() {
        this.phrases = [];
        return true;
    }
    public async addPhrase(text) {
        console.log("adding phrase: ", text);

        const splittedText = text.split(" ");

        if ( splittedText.indexOf("cancel") > -1) return false;
        if ( splittedText.indexOf("abort") > -1) {
            this.phrases = [];
            return false;
        }
        if ( splittedText.indexOf("proceed") > -1) {
            this.phrases.push(text.replace("proceed", ""));
            await this.understand();
            return true;
        }

        this.phrases.push(text);
        return true;
    }

    public async understand() {
        if (!this.phrases.length) return PMSDataRecognizer.STATUS_EMPTY_REQUEST;

        this.thePhrase = this.phrases.map(phrase => phrase.trim()).join(" ").replace(
            this.processed.join(" "), "");

        console.log("Starting to understand");
        let keywords = [];

        for (let i = 0; i < this.types.length; i++) {
            keywords = keywords.concat(this.types[i]['seperators']);
        }

        const breakedModelTexts = PMSDataRecognizer.breakInBetweenTexts(this.thePhrase, keywords) || [];

        for (let i = 0; i < breakedModelTexts.length; i++)
            for (let j = 0; j < this.types.length; j++)
                if (this.types[j].seperators.indexOf(breakedModelTexts[i].keyword) > -1)
                    this.models.push(JSON.parse(JSON.stringify(
                        await this.types[j].process(breakedModelTexts[i].text))));

        this._util.broadcastEvent("voiceLexDatamodelsUpdated", this.models);
    }

    public static getAlternativeKeywords(keywords: string[]) {
        let collection = [];

        keywords.forEach(keyword => {
            collection.push(keyword);

            if (PMSDataRecognizer.ALTERNATIVES[keyword] && PMSDataRecognizer.ALTERNATIVES[keyword].length)
                collection = collection.concat(PMSDataRecognizer.ALTERNATIVES[keyword]);
        });

        return collection;
    }

    public static getOrignalFromAlternative(keyword) {
        if (PMSDataRecognizer.ALTERNATIVES[keyword]) return keyword;

        for (const key in PMSDataRecognizer.ALTERNATIVES)
            if (PMSDataRecognizer.ALTERNATIVES[key].indexOf(keyword) > -1)
                return key;

        return keyword;
    }

    public static breakInBetweenTexts(text, keywords) {
        let regex = new RegExp(keywords.join("|"), "g");
        const match = text.toLowerCase().match(regex);
        let patterns: Segment[] = [];

        console.log("breakInBetweenTexts(): ", keywords, match, regex, text);
        if ( ! match.length) {
            console.error("breakInBetweenTexts no match found");
            return patterns;
        }

        match.forEach((matchedText, index) => {
            const i = text.indexOf(matchedText);

            if (!patterns.length && (i > 0)) { // first entry, but have some pre text.
                patterns.push({"keyword": "unmatched", "text": text.substring(0, i - 1), "start": 0, "end": i})
            }

            if (!patterns.length) { // first entry, make it blind
                patterns.push({
                    "keyword": matchedText,
                    "text": text.substring(matchedText.length),
                    "start": i,
                    "end": i
                });
                text = text.substring(matchedText.length);
                return;
            }

            const lastPatternIndex = patterns.length - 1;
            const lastPattern = patterns[patterns.length - 1];

            lastPattern.text = text.substring(0, i);
            lastPattern.end = i - 1;
            patterns[lastPatternIndex] = lastPattern;

            text = text.substring(i + matchedText.length);

            if (match.length === (index + 1)) { // i.e. last found match
                patterns.push({"keyword": matchedText, "text": text, "start": 0, "end": text.length});
                return;
            }

            patterns.push({"keyword": matchedText, "text": "", "start": i, "end": i});

        });

        return patterns;
    }

    public static getNumericValues(text: string) {
        return text.match(/([\d]*(?:[.]?[\d]+))/g);
    }

    public static createFuzzySet(texts: string[]) {
        return new FS(texts);
    }
}

export interface Segment {
    keyword: string;
    text: string;
    start: number;
    end: number;
}

export interface Model {
    seperators: string[];
    type: string;
    data: object;
    status: string;

    process(text: string);
}