import { Model, PMSDataRecognizer } from '../pmsdatarecognizer';
import { RestService } from '../../../services/rest.service';

export class PrescriptionDigitalization implements Model {

	public seperators: string[] = ["new patient", "old patient", "patient new", "patient old"];
	public type = "prescription-digitalization";
	public data = {
	    "type": this.type,
        "mobile": "",
        "UID": "",
        "center": "",
        "doctor": 0,
        "date": new Date,
        "name": "",
        "age": 1,
        "gender": "male",
        "vitals": PrescriptionDigitalization.emptyVitalsObject(),
        "chiefComplains": [],
        "diagnosis": [],
        "medications": [],
        "personalHistory": PrescriptionDigitalization.emptyPersonalHistoryObject(),
        "dietChart": {
            "weekend": false,
            "meals": [],
        },
        "investigations": [],
        "remarks": {
            "remark": "",
            "duration": 1,
            "durationUnit": DurationUnit.Week,
        },
        "pastMedications": [],
        "pastIllness": [],
        "pastProcedures": [],
        "familyHistory": [],
        "allergies": [],
	};
	public status: "Not processed yet";

	private dictionary = {};
    private _rest: RestService;

	public components = ["vitals", "past medications", "past illnesses", "past procedures", "family history", "allergies",
        "chief complains", "diagnosis", "medicines", "personal history", "diet chart", "investigations", "remarks", ];
	public patientSubComponents = ["mobile number", "UID", "center", "doctor name", "date", "patient name", "age", "gender"];
    public personalHistorySubComponents = ["dietaryCompliance", "drugCompliance", "exercise", "occupationText", "lifeStyle", "economicStatus", "drinkingHabit", "smokingHabit"];

    private static readonly SeperatorRegEx = /,|comma|coma/g;
    private static readonly MedFrequencyKeywords = ['morning', 'afternoon', 'evening', 'night',
        'sos', 's.o.s.',
        'od', 'bd', 'td', 'qd'];
    public static readonly BloodRelations = ['father', 'mother', 'grandfather', 'grandmother',
        'brother', 'sister', 'uncle', 'aunt',
        'husband', 'wife', 'son', 'daughter'];
    private static readonly DurationKeywords = [
        'days', 'months', 'month', 'day', 'weeks', 'week'];
    private static readonly TimestampRegEx = /(\d{1,2}[:]?\d{2} [apmAMP.]+)/g;

	constructor (_rest: RestService, dictionary) {

		this.dictionary = dictionary;
        this._rest = _rest;

        console.log("Constructed prescription digitalization: ", this.dictionary);
	}

	public async process(text: string) {
        if ( ! text.length) return;

        this.clearImportantFields();
		let breakedComponents = PMSDataRecognizer.breakInBetweenTexts(text, PMSDataRecognizer.getAlternativeKeywords(this.components))
            .map(component => {
                component.keyword = PMSDataRecognizer.getOrignalFromAlternative(component.keyword);
                return component;
            });

		// post component sanitizers, special instructions for overriding or mismatch
        breakedComponents = PrescriptionDigitalization.sanitizePastMedications(breakedComponents);

		for ( let i = 0; i < breakedComponents.length; i ++ ) {
            const breakedComponent = breakedComponents[i];

            console.log("Switching types: ", breakedComponent.keyword, PMSDataRecognizer.getOrignalFromAlternative(breakedComponent.keyword));

            switch (breakedComponent.keyword) {
                case "unmatched":
                    await this.identifyPatientDataComponent(breakedComponent.text.toLowerCase());
                    break;
                case "vitals":
                    await this.identifyVitalComponent(breakedComponent.text.toLowerCase());
                    break;
                case "chief complains":
                    await this.identifyChiefComplains(breakedComponent.text.toLowerCase());
                    break;
                case "diagnosis":
                    await this.identifyDiagnosis(breakedComponent.text.toLowerCase());
                    break;
                case "medicines":
                    await this.identifyMedications(breakedComponent.text.toLowerCase());
                    break;
                case "personal history":
                    await this.identifyPersonalHisotory(breakedComponent.text.toLowerCase());
                    break;
                case "diet chart":
                    await this.identifyDietChart(breakedComponent.text.toLowerCase());
                    break;
                case "investigations":
                    await this.identityInvestigations(breakedComponent.text.toLowerCase());
                    break;
                case "remarks":
                    await this.identifyRemarks(breakedComponent.text.toLowerCase());
                    break;
                case "past medications":
                    await this.identifyPastMedications(breakedComponent.text.toLowerCase());
                    break;
                case "past illnesses": break;
                    await this.identifyPastIllnesses(breakedComponent.text.toLowerCase());
                    break;
                case "past procedures":
                    await this.identifyPastProcedures(breakedComponent.text.toLowerCase());
                    break;
                case "family history":
                    await this.identifyFamilyHistory(breakedComponent.text.toLowerCase());
                    break;
                case "allergies":
                    await this.identifyAllergies(breakedComponent.text.toLowerCase());
                    break;

                default: break;
            }
        }

        console.log(" process done: ", JSON.stringify(this.data));
		return this.data;
	}

	private async identifyAllergies(text) {
	    const allergies = text
            .split(PrescriptionDigitalization.SeperatorRegEx)
            .map(row => row.trim());

	    const allergiesObjects = [];
        const allergySubstances = this.dictionary['PMSTerms']['allergy_substance'] || [];
        // const allergySubstanceFuzzySet = PMSDataRecognizer.createFuzzySet(allergySubstances);

        allergies.forEach(allergy => {
            const substances = [];

            allergy.split(" ").forEach(word => {
                if (allergySubstances.indexOf(word) > -1)
                    substances.push(word);
            });

            allergiesObjects.push({
                substances: substances,
                text: allergy,
            });
        });

        this.data.allergies = allergiesObjects;
    }

	private async identifyFamilyHistory(text) {
        const histories = text.replace(/[^\w\s]/g,'')
            .split(PrescriptionDigitalization.SeperatorRegEx)
            .map(row => row.trim());

        const historyObjects = [];

        histories.forEach(history => {
            let relation = "";
            history.split(" ").forEach(word => {
                if (PrescriptionDigitalization.BloodRelations.indexOf(word) > -1)
                    relation = word;
            });

            if (relation) historyObjects.push({
                relation: relation,
                text: history,
            });
        });

        this.data.familyHistory = historyObjects;
    }

	private async identifyPastMedications(text) {
        this.data.pastMedications = text
            .split(PrescriptionDigitalization.SeperatorRegEx)
            .map(row => row.trim());
    }

    private async identifyPastIllnesses (text) {
        this.data.pastIllness = text
            .split(PrescriptionDigitalization.SeperatorRegEx)
            .map(row => row.trim());
    }

    private async identifyPastProcedures (text) {
        this.data.pastProcedures = text
            .split(PrescriptionDigitalization.SeperatorRegEx)
            .map(row => row.trim());
    }

	private async identifyRemarks(text) {

        const durationMatched = text.match(
            PrescriptionDigitalization.regexpFromKeywords(
                PrescriptionDigitalization.DurationKeywords));

        if ( ! durationMatched) {
            this.data.remarks.remark = text.trim();
            return;
        }

        const duration = text.match(
            new RegExp('([0-9 ]+)(?:' + PrescriptionDigitalization.DurationKeywords.join('|') + ')'),
            'g');

        if ( duration && durationMatched[0]) {
            this.data.remarks.duration = parseInt(duration[0].trim()) || PrescriptionDigitalization.getNumericValue(text);
            this.data.remarks.durationUnit = PrescriptionDigitalization.getDurationUnitFromKeyword(durationMatched[0]);
            return;
        }
    }

	private async identityInvestigations(text) {
        let investigations: Investigation[] = [];

        let pathologyLabs = [], radiologyLabs = [];
        this.dictionary['investigations'].forEach(investigation => {
            if ( investigation.type === LabType.Pathology) pathologyLabs.push(investigation.name.trim());
            if ( investigation.type === LabType.Radiology) radiologyLabs.push(investigation.name.trim());
        });

        const labFuzzySet = PMSDataRecognizer.createFuzzySet(pathologyLabs.concat(radiologyLabs));

        text.split(PrescriptionDigitalization.SeperatorRegEx)
            .map(test => test.trim())
            .forEach( test => {
                const match = PrescriptionDigitalization.matchToFuzzy(labFuzzySet, test);
                let type: LabType = LabType.Unknown;

                if ( pathologyLabs.indexOf(match.text) > -1) type = LabType.Pathology;
                if ( radiologyLabs.indexOf(match.text) > -1) type = LabType.Radiology;

                investigations.push({
                    "name": match.text,
                    "alternatives": match.alternatives,
                    "match": match.match,
                    "type": type,
                });
            });

        this.data.investigations = investigations;
    }

	private async identifyDietChart(text) {
        let meals: Meal[] = [];
        const mealSeperators = ["plate", "glass", "mug", "cup", "piece", "table spoon", "pack", "katori", "bowl"];
        const mealSeperatorRegex = PrescriptionDigitalization.regexpFromKeywords(mealSeperators);

        const isWeekendMatch = text.match(PrescriptionDigitalization.regexpFromKeywords([
            'weekend', 'saturday', 'sunday', 'holiday', 'party'
        ]));
        this.data.dietChart.weekend = !!(isWeekendMatch && isWeekendMatch.length);

        const timestamps = text.match(PrescriptionDigitalization.TimestampRegEx);
        if ( timestamps === null) return;
        if (!timestamps || !timestamps.length) return;

        text = text.substring(text.indexOf(timestamps[0]));
        let chunks = text.split(PrescriptionDigitalization.TimestampRegEx);

        let timestamp = timestamps[0];

        for ( let i = 0; i < chunks.length; i ++) {
            const chunk = chunks[i].trim();
            if ( ! chunk.length) continue;
            if (!! chunk.match(PrescriptionDigitalization.TimestampRegEx)) {
                timestamp = chunk;
                continue;
            }

            const rows = chunk.split(PrescriptionDigitalization.SeperatorRegEx);
            let finalRows = [];
            rows.forEach(row => {
                const mealSeperatorMatchs = row.match(mealSeperatorRegex);

                if ( mealSeperatorMatchs && (mealSeperatorMatchs.length )) {
                    mealSeperatorMatchs.forEach(match => {
                        let endIndex = row.indexOf(match) + match.length + 1;
                        let catchPhrase = row.substring(0, endIndex);

                        const nonUnitMatches = catchPhrase.match(/\d+/g);
                        if ( nonUnitMatches && nonUnitMatches.length > 1) {

                            for ( let k = 0; k < nonUnitMatches.length - 1; k ++) {
                                const quantityIndex = catchPhrase.indexOf(nonUnitMatches[k]);

                                let endIndex2 = quantityIndex + nonUnitMatches[k].length + 1;
                                let catchPhrase2 = catchPhrase.substring(0, endIndex2);

                                finalRows.push(catchPhrase2);
                                catchPhrase = catchPhrase.substring(endIndex2);
                            }

                            finalRows.push(catchPhrase);
                            row = row.substring(endIndex);

                            return;
                        }

                        row = row.substring(endIndex);
                        finalRows.push(catchPhrase);
                    });
                }

                finalRows.push(row);
            });

            finalRows = finalRows.filter(row => !!row.length);

            let hour = parseInt(PMSDataRecognizer.getNumericValues(timestamp)[0]);
            if ( timestamp.indexOf("p") > -1) hour += 12;

            finalRows.forEach(row => {
                const number = (row.match(/\d+/g) || [])[0] || 1;
                const numberIndex = row.indexOf(number);

                meals.push({
                    "name": row.substr(0, numberIndex - 1).trim(),
                    "time": hour,
                    "quantity": parseInt(number),
                    "quantityUnit": row.substr(numberIndex + 1).trim(),
                });
            });
        }

        this.data.dietChart.meals = meals;
        return;
    }

	private async identifyPersonalHisotory(text) {
        const breakedSubComps = PMSDataRecognizer.breakInBetweenTexts(text,
            PMSDataRecognizer.getAlternativeKeywords(this.personalHistorySubComponents));

        for ( let i = 0; i < breakedSubComps.length; i ++ ) {
            const compName = PMSDataRecognizer.getOrignalFromAlternative(breakedSubComps[i].keyword);

            switch (compName) {
                case "dietaryCompliance":
                case "drugCompliance":
                case "exercise":
                case "economicStatus":
                case "drinkingHabit":
                case "smokingHabit":
                    this.data.personalHistory[compName] = PrescriptionDigitalization.getNumericValue(breakedSubComps[i].text);
                    break;
                case "occupationText":
                    this.data.personalHistory.occupationText = breakedSubComps[i].text.trim();
                    break;
                case "lifeStyle":
                    const firstChar = breakedSubComps[i].text.trim().substr(0, 1);
                    if ( firstChar === "s") this.data.personalHistory.lifeStyle = "sedentary";
                    else if ( firstChar === "a") this.data.personalHistory.lifeStyle = "active";
                    else this.data.personalHistory.lifeStyle = "moderate";
                    break;
            }
        }

        return;
    }

    private async identifyDiagnosis(text) {
        const diagnosisFuzzySet = PMSDataRecognizer.createFuzzySet(this.dictionary['PMSTerms']['diagnosis']);

        let diagnosisText = text.split(PrescriptionDigitalization.SeperatorRegEx)
            .forEach(diagnosis => {
                this.data.diagnosis.push(
                    PrescriptionDigitalization.matchToFuzzy(diagnosisFuzzySet, diagnosis));
            });
    }

    private async identifyMedications(text) {
        const medications: MedInternal[] = [];
        const medicationFuzzySet = PMSDataRecognizer.createFuzzySet(this.dictionary['medications']);

        let medsText = text.split(PrescriptionDigitalization.regexpFromKeywords([',', 'coma', 'comma', 'tablet', 'capsule']));

        for ( let i = 0; i < medsText.length; i ++) {
            const medText = medsText[i].trim();
            const med = medText.split(" ");
            let usedIndexes = [];
            let object = PrescriptionDigitalization.emptyMedObject();

            let matchs = medText.match(PrescriptionDigitalization.regexpFromKeywords([
                'breakfast', 'lunch', 'dinner', 'meals', 'food', 'meal']));

            if ( matchs )
                matchs.forEach(match => {
                    const index = med.indexOf(match);

                    if ( [med[index - 1], med[index + 1] ].indexOf("before") > -1) {
                        usedIndexes = usedIndexes.concat([index, ([med[index - 1],
                            med[index + 1]].indexOf("before") ? (index + 1) : (index - 1))]);
                        object.meal = MedMealState.Before;
                    }
                    if ( [med[index - 1], med[index + 1] ].indexOf("after") > -1) {
                        usedIndexes = usedIndexes.concat([index, ([med[index - 1],
                            med[index + 1]].indexOf("after") ? (index + 1) : (index - 1))]);
                        object.meal = MedMealState.After;
                    }

                    switch (match) {
                        case 'breakfast': object.frequency.morning = true; break;
                        case 'lunch': object.frequency.afternoon = true; break;
                        case 'dinner': object.frequency.night = true; break;
                        default: break;
                    }
                });

            object.frequency = PrescriptionDigitalization.extractMedFrequency(medText, object.frequency);

            matchs = medText.match(PrescriptionDigitalization.regexpFromKeywords(PrescriptionDigitalization.DurationKeywords));
            if ( matchs )
                matchs.forEach(match => {
                    const index = med.indexOf(match);
                    let duration = 0;

                    if( index < -1) return;

                    if (! isNaN(parseInt(med[index - 1]))) {
                        duration = parseInt(med[index - 1]);
                        usedIndexes = usedIndexes.concat([index, index + 1])
                    } else if (! isNaN(parseInt(med[index + 1]))) {
                        duration = parseInt(med[index + 1]);
                        usedIndexes = usedIndexes.concat([index, index + 1])
                    }

                    if ( duration ) object.duration = duration;

                    object.durationUnit = PrescriptionDigitalization.getDurationUnitFromKeyword(match);
                });

            PrescriptionDigitalization.MedFrequencyKeywords.forEach(keyword => {
                if (med.indexOf(keyword) > -1) usedIndexes.push(med.indexOf(keyword));
            });

            const medName = med.slice(0, Math.min(... usedIndexes)).join(" ");
            const medNameFuzzyMatch = PrescriptionDigitalization.matchToFuzzy(medicationFuzzySet, medName);

            object.name = medNameFuzzyMatch.text;
            object.alternatives = medNameFuzzyMatch.alternatives;
            object.match = medNameFuzzyMatch.match;

            object.notes = med.slice(Math.max(... usedIndexes) + 1).join(" ");

            if ( object.name ) medications.push(object);
        }

        this.data.medications = medications;

	    return null;
    }

    private async identifyChiefComplains(text) {
        const chiefComplainsSet = PMSDataRecognizer.createFuzzySet(this.dictionary['PMSTerms']['chief-complains']);

        const complains = text.split(PrescriptionDigitalization.SeperatorRegEx);
        complains.forEach(complain => {
            this.data.chiefComplains.push(
                PrescriptionDigitalization.matchToFuzzy(chiefComplainsSet, complain));
        });
    }

	private async identifyVitalComponent(text) {
        const breakedComponents = PMSDataRecognizer.breakInBetweenTexts(text, PMSDataRecognizer.getAlternativeKeywords([
            'BP', 'pulse', 'height', 'weight',
            'RBS', "FBS", "PPS", "oxygen",
            "respiratory", "head", "BMI"]));

        const singleValued = {
            'pulse': "Pulse", 'weight': 'Weight (kg)',
            'RBS': 'Random Sugar', 'FBS': 'Fasting Sugar',
            'PPS': 'Post Prandial Sugar', 'oxygen': 'Oxygen Saturation',
            'respiratory': 'Respiratory Rate', 'head': 'Head Circumference',
            'BMI': 'BMI'};

        breakedComponents.forEach(component => {
            if ( ! component.text.trim().length) return;
            const keyword = PMSDataRecognizer.getOrignalFromAlternative(component.keyword);

            if ( singleValued[keyword])
                this.data.vitals[singleValued[keyword]]
                    = PMSDataRecognizer.getNumericValues(component.text)[0] ||"";

            const values = PMSDataRecognizer.getNumericValues(component.text);
            if ( keyword === "BP") {
                this.data.vitals['BPS'] = values[0];
                this.data.vitals['BPD'] = values[1];

            } else if (keyword === 'height') {
                this.data.vitals['heightFt'] = values[0];
                this.data.vitals['heightIn'] = values[1];
            }
        });

        // delete this.data.vitals['BPD'], this.data.vitals['BPS'], this.data.vitals['heightFt'], this.data.vitals['heightIn'];
        // delete this.data.vitals['pulse'], this.data.vitals['heightFt'], this.data.vitals['heightIn'], this.data.vitals['weight'];
        // delete this.data.vitals['randomSugar'];
    }

	private async identifyPatientDataComponent(text) {
		console.log("patient's data components: ", text);

		const easyReplacements = {
			"centinela": "center nangla",
		};

		for ( const key in easyReplacements)
			text = text.replace(new RegExp(key, "g"), easyReplacements[key]);

		let subComponents = {};
        PMSDataRecognizer.breakInBetweenTexts(text.trim(), PMSDataRecognizer.getAlternativeKeywords(this.patientSubComponents))
            .forEach(component => {
                subComponents[PMSDataRecognizer.getOrignalFromAlternative(component["keyword"])] = component["text"].trim();
            });

        let foundPatient = null;
        if (subComponents['mobile number'] && subComponents['patient name']) {
            subComponents['mobile number'] = subComponents['mobile number'].replace(/[\s-]/g, "");

            const resp = await this._rest.searchPatient(subComponents["mobile number"]);

            console.log("Resp: ", resp['patients'], resp['patients'].length, resp['patients'] && resp['patients'].length);
            if ( resp['patients'] && resp['patients'].length ) {

                if ( resp['patient']['patients'].length === 1) foundPatient = resp['patient']['patients'][0];
                else resp['patients'].forEach(individualPatient => {
                    individualPatient['patients'].forEach(familyMembers => {
                        if (familyMembers['name'] === subComponents['patient name'])
                            foundPatient = familyMembers;
                    });
                });

            } else this.data.mobile = subComponents['mobile number'];
        }

        if ( subComponents["UID"]) {
            subComponents["UID"] = subComponents["UID"].replace(/[\s-]/g, "");

            const resp = await this._rest.searchPatient(subComponents["UID"]);
            if ( resp['patients'] && (resp['patients'].length === 1) && resp['patients'][0]['patients']) {

                if ( resp['patients'][0]['patients'].length === 1) foundPatient = resp['patients'][0]['patients'][0];
                else resp['patients'][0]['patients'].forEach(row => {
                    if (row['name'] === subComponents["patient name"])
                        foundPatient = row;
                });
            }
        }

        if ( subComponents['age']) this.data.age = parseInt(subComponents['age']);
        if ( subComponents['center']) { // search center name
            console.log("Recevied center name: ", subComponents['center']);

            const centerFuzzySet = PMSDataRecognizer.createFuzzySet(
                this.dictionary['centers'].map(row => row['name'])
            );

            const match = PrescriptionDigitalization.matchToFuzzy(centerFuzzySet, subComponents['center']);
            console.log("Matched center name: ", JSON.parse(JSON.stringify(match)));
            this.dictionary['centers'].forEach(row => {
                if (row['name'] === match.text)
                    this.data.center = row['code'];
            });
        }

        if ( subComponents['doctor name'])
            if (this.dictionary['doctors'] && (this.dictionary['doctors'].length === 1))
                this.data.doctor = this.dictionary['doctors'][0]['doctor_id'];
            else this.dictionary['doctors'].forEach(row => {
                if (row['doctor_name'].indexOf(subComponents['doctor name']) > -1)
                    this.data.doctor = row['doctor_id'];
            });

        if ( subComponents['gender'])
            this.data.gender = subComponents['gender'].toLowerCase().substr(0, 1) === "f"
                ? "female" : "male";

        if ( subComponents['patient name'])
            this.data.name = (subComponents['patient name'] || "").trim();

        if ( subComponents['date']) {
            const today = new Date(subComponents['date']);
            if ( today) {
                this.data.date.setDate(today.getDate());
                this.data.date.setMonth(today.getMonth());
            }
        }

        if (foundPatient) this.setPatientData(foundPatient);
	}

	private clearImportantFields() {
	    this.data.mobile = "";
	    this.data.name = "";
	    this.data.age = 0;
	    this.data.gender = "";
	    this.data.UID = "";
        this.data.vitals = PrescriptionDigitalization.emptyVitalsObject();
        this.data.chiefComplains = [];
        this.data.diagnosis = [];
        this.data.medications = [];
        this.data.personalHistory = PrescriptionDigitalization.emptyPersonalHistoryObject();
        this.data.dietChart = {
            weekend: false,
            meals: [],
        };
        this.data.investigations = [];
        this.data.remarks = {
            remark: "",
            duration: 1,
            durationUnit: DurationUnit.Week,
        };
        this.data.pastMedications = [];
        this.data.pastIllness = [];
        this.data.pastProcedures = [];
        this.data.allergies = [];
        this.data.familyHistory = [];
    }
	private setPatientData(row) {
        console.log("Setting the patient: ", row, !!row['mobile'], );

        this.data.age = new Date().getFullYear() - new Date(row['date_of_birth']).getFullYear();
        this.data.name = row['name'];
        this.data.gender = row['gender'];
        this.data.mobile = row['mobile'] ? (row['mobile'] || "").substr((row['mobile'] || "").length - 10) : this.data.mobile;
        this.data.UID = row['UID'];
        this.data.center = row['center_code'];
    }

    private static sanitizePastMedications(components) {
        console.log("afterSanitizingPastMedications: ", components);

        let componentKeywords = [];
        components.forEach(component => componentKeywords.push(component.keyword));

        const CONST_PAST_MEDICATION = "past medications";
        const CONST_MEDICINE = "medicines";

        if ( (componentKeywords.indexOf(CONST_PAST_MEDICATION) > -1)
            && (componentKeywords.indexOf(CONST_MEDICINE) > -1)
            && (components.filter(component => ((component.keyword == CONST_MEDICINE) && (component.text.indexOf("since") > -1)))).length
        ) {}
        else return components;

        let pastMedicationText = "", pastMedFilled = false, pastMedIndex = null;

        for ( let i = 0; i < components.length; i ++) {
            const component = components[i];

            if ( component.keyword === CONST_PAST_MEDICATION) {
                pastMedicationText = pastMedicationText + " " + component.text.trim();

                if ( pastMedFilled) components[i]['text'] = "";
                if ( ! pastMedFilled) {
                    pastMedFilled = true;
                    pastMedIndex = i;
                }
            }

            if ((component.keyword === CONST_MEDICINE) && (component.text.indexOf("since") > -1)) {
                pastMedicationText = pastMedicationText + " medicines " + component.text.trim();
                components[i]['text'] = "";
            }
        }

        if ( pastMedIndex !== null) components[pastMedIndex]['text'] = pastMedicationText;
        components = components.filter(component => !!component.text.length);

        return components;
    }
    private static emptyVitalsObject() {
        return {
            "BPS": "",
            "BPD": "",
            "heightFt": "",
            "heightIn": "",
            "pulse": "",
            "weight": "",
            "randomSugar": "",
            "BMI": "",
            "Pulse": "",
            "Weight (kg)": "",
        };
    }
    private static getDurationUnitFromKeyword(keyword) {
        switch (keyword) {
            case "day":
            case "days":
                return DurationUnit.Day;
                break;
            case "month":
            case "months":
                return DurationUnit.Month;
                break;
            case "week":
            case "weeks":
                return DurationUnit.Week;
                break;
        }

        return DurationUnit.Day;
    }
    private static emptyPersonalHistoryObject() {
        return {
            "exercise": "",
            "lifeStyle": "",
            "smokingHabit": "",
            "drinkingHabit": "",
            "drugCompliance": "",
            "economicStatus": "",
            "occupationText": "",
            "dietaryCompliance": ""
        };
    }
    private static emptyMedObject() {
        return {
            id: 0,
            name: "",
            match: 0,
            alternatives: [],
            duration: 1,
            durationUnit: DurationUnit.Week,
            frequency: {
                morning: false,
                afternoon: false,
                evening: false,
                night: false,
                sos: false,
            },
            meal: MedMealState.Undefined,
            type: MedType.Tablet,
            notes: "",
        }
    }
    private static matchToFuzzy(set, query) {
        const searchResult = set.get(query);
        if ( ! searchResult) return {
            text: query,
            match: 0,
            alternatives: [],
        };

        // the fuzzy set result library uses that
        let bestValue = 1, bestResult = query, alternatives = [];

        for ( let i = 0; i < searchResult.length; i ++) {
            if ( bestValue === 1) {
                bestValue = searchResult[i][0];
                bestResult = searchResult[i][1];
            } else if (bestValue === searchResult[i][0]) {
                alternatives.push(searchResult[i][1]);
            }
        }

        return {
            text: bestResult,
            match: bestValue,
            alternatives: alternatives,
        };
    }
    private static regexpFromKeywords(keywords) {
        return new RegExp(keywords.join("|"), "g");
    }
    private static getTrueBits(obj) {
	    let keys = [];
	    for ( let key in obj) if ( obj.hasOwnProperty(key) && obj[key]) keys.push(key);

        return keys;
    }
    private static extractMedFrequency (medText, frequency = null) {
        const matches = medText.match(PrescriptionDigitalization.regexpFromKeywords(
            PrescriptionDigitalization.MedFrequencyKeywords));

        if ( ! frequency ) frequency = PrescriptionDigitalization.emptyMedObject().frequency;
        if ( ! matches ) return frequency;

        matches.forEach(match => {
            const trueBits = PrescriptionDigitalization.getTrueBits(frequency);

            switch (match) {
                case 'morning': frequency.morning = true; break;
                case 'afternoon': frequency.afternoon = true; break;
                case 'evening': frequency.evening = true; break;
                case 'night': frequency.night = true; break;

                case 's.o.s.':
                case 'sos': frequency.sos = true; break;

                case 'od':
                    if ( PrescriptionDigitalization.getTrueBits(frequency).length < 1 )
                        frequency.morning = true;
                    break;

                case 'bd':
                    if ( trueBits.length < 1 ) {
                        frequency.morning = true;
                        frequency.night = true;
                    } else if(trueBits.length < 2) {
                        if ( frequency.morning) frequency.night = true;
                        else frequency.morning = true;
                    }
                    break;

                case 'td':
                    if ( trueBits.length < 1 ) {
                        frequency.morning = true;
                        frequency.afternoon = true;
                        frequency.night = true;
                    } else if(trueBits.length < 2) {
                        if (! frequency.evening) frequency.night = true;
                        frequency.morning = true;
                        frequency.afternoon = true;
                    } else if ( trueBits.length < 3) {
                        if ( ! frequency.morning) frequency.morning = true;
                        else if ( ! frequency.afternoon) frequency.afternoon = true;
                        else frequency.night = true;
                    }
                    break;
                case 'qd':
                    frequency.morning = true;
                    frequency.afternoon = true;
                    frequency.evening = true;
                    frequency.night = true;
                    break;
            }
        });

        return frequency;
    }
    private static getNumericValue(option) {
        option = option.trim();

        const values = {
            0: ['zero',],
            1: ["one", "cannot pay", "poor", "lower class", "lower", "never"],
            2: ["two", "occational", 'to'],
            3: ["three", "can pay with negotiation", "negotiations", "negotiation", "medium", "middle", "mild"],
            4: ["four", "regular", ],
            5: ["five", "can easily pay", "can pay", "easily", "rich", "heavy", "chain"],
            6: ["six"],
            7: ["seven"],
            8: ["eight"],
            9: ["nine"],
            10: ["ten"],
            11: ["eleven"],
            12: ["twelve"],
            13: ["thirteen"],
            14: ["forteen"],
            15: ["fifteen"],
        };

        for ( let key in values) {
            if (values[key].indexOf(option) > -1) return key;

            for ( let i = 0; i < values[key].length; i ++) {
                if (option.toLowerCase().indexOf(values[key][i]) > -1)
                    return key;
            }
        }

        if ( ! isNaN(parseInt(option))) return option;

        return 0;
    }
}

interface Investigation {
    name: string,
    alternatives: string[],
    type: LabType,
    match: number,
}

interface Meal {
    name: string,
    time: number,
    quantity: number,
    quantityUnit: string,
}

interface MedInternal {
    id: number,
    name: string,
    match: number,
    alternatives: string[],
    duration: number,
    durationUnit: DurationUnit,
    frequency: MedFrequency,
    meal: MedMealState,
    type: MedType,
    notes: string,
}

enum DurationUnit {
    Day = "Day(s)",
    Week = "Week(s)",
    Month = "Month(s)",
}

enum MedMealState {
    Before = 'before',
    After = 'after',
    Undefined = '',
}

enum LabType {
    Radiology = 'radiology',
    Pathology = 'pathology',
    Unknown   = '',
}

enum MedType {
    Tablet = 'tablet',
    Capsule = 'cap',
    Syrup = 'syp',
    Inhaler = 'inhaler',
    Cream = 'cream',
    EarDrop = 'ear drop',
    EarOintment = 'ear ointment',
    EyeDrop = 'eye drops',
    EyeOintment = 'eyes ointment',
    Injection = 'inj',
    Mixture = 'mixture',
    Ointment = 'ointment',
    Pessary = 'pess',
    Powder = 'powder',
}

interface MedFrequency {
    morning: boolean,
    afternoon: boolean,
    evening: boolean,
    night: boolean,
    sos: boolean,
}