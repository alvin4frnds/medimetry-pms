import { Component, NgZone, OnInit } from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { RestService } from '../services/rest.service';
import { PMSDataRecognizer } from './recognizer/pmsdatarecognizer';
import { Constants } from '../Utilities/Constants';
import { CreatePatientComponent } from '../create-patient/create-patient.component';

@Component({
    selector: 'app-voice-lex',
    templateUrl: './voice-lex.component.html',
    styleUrls: ['./voice-lex.component.css']
})
export class VoiceLexComponent implements OnInit {

    showingLayout = false;
    status = "Ready to listen!";
    subStatus = "";
    text = "...";
    finalText = "";
    lastPhrase = "";
    fullScreen = false;

    Recognizer: any;
    GrammerList: any;
    RecognitionEvent: any;
    dataRecognizer: PMSDataRecognizer;
    recognizerPhrasesCount = 0;

    recognition: any;
    recordedContentEl: any;
    recordedTextEl: any;
    fetchedKeywords: {};
    dataModels = [];
    localData = {};

    static readonly DEFAULT_INSERT_MODEL_BUTTON_TEXT = "Start inserting";
    insertModelButtonText = '';
    insertModelButtonDisabled = false;

    public static readonly TestPhrases = [
        // "patient old mobile number 890 187 1521 UID 91def190825083947 center mahmoodpur Doctor name Abhishek date august 9 patient name premvati age 25 gender female vitals BP 162 by 21 pulse 77 height 7 feet 2 inch weight 65 complains headache, mild pain, pain & numbness of hand and feet medicines gluformin g2 OD morning for 15 days before meal, metformin 500mg OD for 10 days Before meal personal history diet 4 drug 5 exercise 2 occupation house wife lifestyle sedentary economic status can easily pay drinking never smoking never dietchart monday to friday 5:00 a.m. water 1 glass, 6:00 a.m. tea without sugar 1 cup 8:00 a.m. cow’s milk 1 glass roti 2 11:00 a.m. roti 2 chole 1 katori dahi 1 katori salad 1 plate 3:00 p.m. tea without sugar 1 cup 8:00 p.m. roti 2 aloo began sabji 1 katori salad 1 plate 9:00 p.m. cow’s milk 1 glass investigations hba1c, KFT, Urine R/M, Lipid profile, TFT test remarks come with FPS followup 10 days",
        // "new patient mobile number 6300000003 date august 12 patient name urmila age 34 gender female vitals BP 162 by 43 pulse 43 height 7 feet 2 inches weight 43 past medications BP medicines since 1 year, antibiotic since 3 years past illness BP since 4 years, prediabetic since 4 years family history mother headache, father high BP medicines gluformin g2 BD for 15 days before meal, metformin 500 OD for 10 days Before meal remarks strict follow diet regularly followup after 5 days",
        // "patient old mobile number 6300000004 UID 91def190825083947 center mahmoodpur Doctor name Abhishek date august 9 patient name premvati age 25 gender female vitals BP 162 by 21 pulse 77 height 7 feet 2 inch weight 65 complains headache, mild pain, pain & numbness of hand and feet medicines gluformin g2 OD morning for 15 days before meal, metformin 500mg OD for 10 days Before meal personal history diet 4 drug 5 exercise 2 occupation house wife lifestyle sedentary economic status can easily pay drinking never smoking never dietchart monday to friday 5:00 a.m. water 1 glass, 6:00 a.m. tea without sugar 1 cup 8:00 a.m. cow’s milk 1 glass roti 2 11:00 a.m. roti 2 chole 1 katori dahi 1 katori salad 1 plate 3:00 p.m. tea without sugar 1 cup 8:00 p.m. roti 2 aloo began sabji 1 katori salad 1 plate 9:00 p.m. cow’s milk 1 glass investigations hba1c, KFT, Urine R/M, Lipid profile, TFT test remarks come with FPS followup 17 days",
        // "patient new centre pagal name jawati gender female age 50 e chief complaints no symptomatic problems vitals BP 171 by 151 Pulsar 150 weight 92 Pulsar 150 Pulsar 150 sugar 166 medications Telma CT 40 by 12.5 MG OD for 1 month after meal remarks low salt diet follow up seven days proceed ",
        // "patient new centre gharora Dr name Abhishek date September 22 mobile number 72 17692 140 name phoolwati age 67 gender female vitals BP 120 by 60 and Pulse 74 RBS 135 weight 48 kg height 5 feet 1 inch chief complaints itching, low vision, pain in knee joint pain in legs, weakness diagnosis diabetes mellitus medicine tablet baclofen AC BB after meals in morning and evening for 10 days tablet citizen coma tablets citizen at night for 10 days, tablet calcium in afternoon for 10 days after mealsnew centre patient new to Centre gharora doctor name Abhishek date September 22 mobile number 9907 50625 name Raghunandan age 58 gender male vitals BP 160 by 110 and Pulse 72 RBS 108 weight 88 kg height 5 feet 6 inches chief complaints diagnosis hypertension asthma medicines tablet Telma 40 in morning after meal for 10 days remarks low salt diet follow up after 1 week patient new centre gharora doctor name Abhishek date September 22 mobile number 888 601 27262 name Telegram age 74 gender male vitals BP 15280 and Pulse 66 RBS 137 weight 75 kg height 5 feet 7 inches diagnosis for Hypertension chief complaints weakness medicines tablet Telma 20 MG in morning after meals for 10 days proceed",
    ];

    constructor(private _util: UtilityService,
                private _rest: RestService,
                private _ngZone: NgZone) {
        this.Recognizer = window['SpeechRecognition'] || window['webkitSpeechRecognition'] || window['mozSpeechRecognition'];
        this.GrammerList = window['SpeechGrammarList'] || window['webkitSpeechGrammarList'] || window['mozSpeechGrammarList'];
        this.RecognitionEvent = window['SpeechRecognitionEvent'] || window['SpeechRecognitionEvent'] || window['mozSpeechRecognitionEvent'];
    }

    ngOnInit() {
        console.log("ngOnInit: voice-lex.component.ts");

        this.feedLocalData();
        this.insertModelButtonText = VoiceLexComponent.DEFAULT_INSERT_MODEL_BUTTON_TEXT;

        this._util.eventProvider.subscribe(event => {
            if (event.name === "toggleVoiceLexLayout") {
                this.showingLayout = !this.showingLayout;

                // TODO: Uncomment this, for the code to work
                this.toggleListening();
            }

            if ( event.name === "voiceLexDatamodelsUpdated") {
                this.dataModels = event.value;

                console.log("Data models, updated", this.dataModels);
            }
        });

        this.recordedContentEl = document.querySelector("#recorded");
        this.recordedTextEl = document.querySelector("#recorded-text");

        this._rest.fetchFreshGrammer()
            .then(async resp => {
                console.log("Fetched Grammer: ", resp);

                if (!resp['success']) return;
                delete resp['success'], resp['message'];

                const grammers = this.recognitionListFromGrammer(resp);
                if (this.recognition && grammers) this.recognition.grammers = grammers;

                this.dataRecognizer = new PMSDataRecognizer(this.fetchedKeywords, []);
                this.dataRecognizer.setServices(this._rest, this._util);

                // TODO: remove, For testing purposes only
                /* await VoiceLexComponent.TestPhrases
                    .forEach(async phrase => await this.dataRecognizer
                        .addPhrase(phrase));
                await this.dataRecognizer.understand(); */
            });
    }

    public resetListening() {
        this.stopListening();

        setTimeout(() => {
            this.startListening();
        }, 300);
    }

    public async startUnderstandingAndClear() {
        await this.dataRecognizer.understand();
        this.resetListening();
        this.finalText = "";
    }

    public removeThisModel(index) {
        if ( confirm ('are you sure? this can\'t be reverted back.'))
            this.dataModels.splice(index, 1);
    }

    public async useAboveModels() {
        console.log("Using the said models: ", this.dataModels);
        this.insertModelButtonDisabled = true;
        this.insertModelButtonText = "Inserting ...";

        const removeFromListing = [];

        for ( let i = 0; i < this.dataModels.length; i ++ ) {
            let model = JSON.parse(JSON.stringify(this.dataModels[i]));

            const success = await this.savePrescriptionsToDB(model);
            await this._util.timeout(2000);

            if ( success) removeFromListing.push(i);
        }

        removeFromListing.reverse().forEach(index => {
            this.dataModels.splice(index, 1);
        });

        if ( removeFromListing.length) this.dataRecognizer.clearPhrases();

        this.insertModelButtonDisabled = false;
        this.insertModelButtonText = VoiceLexComponent.DEFAULT_INSERT_MODEL_BUTTON_TEXT;
    }

    public chooseThisAlternatePhrase(phrase) {
        const lastIndexOfLastPhrase = this.text.lastIndexOf(this.lastPhrase);

        this.text = this.text.substring(0, lastIndexOfLastPhrase) + "" + phrase;
        this.lastPhrase = phrase;
    }

    private toggleListening() {
        if (this.showingLayout) this.startListening();
        else this.stopListening();
    }

    public startListening() {
        this.recognition = new this.Recognizer;
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        const grammers = this.recognitionListFromGrammer();
        // if (grammers) this.recognition.grammars = grammers;

        this.recognition.maxAlternatives = 3;
        this.recognition.lang = "en-IN";
        this.recognizerPhrasesCount = 0;

        this.recognition.onend = () => {
            this.stopListening()
        };
        this.recognition.onresult = (event) => {
            this._ngZone.run(() => {
                this.onRecogniserResult(event);
            });
        };

        console.log("the recognizer: ", this.recognition);
        this.recognition.start();
        this._util.broadcastEvent("toggleVoiceLexListeningState", true);
        this.status = "Listening ...";
        this.text = "";
    }

    public stopListening() {
        if (this.recognition) this.recognition.stop();
        this.recognition = null;

        this.status = "Listening over";
        this._util.broadcastEvent("toggleVoiceLexListeningState", false);
        setTimeout(() => {
            this.status = "Ready to listen!";
        }, 100);
    }

    private onRecogniserResult(event) {
        console.log("Received result of recording: ", event.results, this.text);

        this.text = "";
        if (typeof(event.results) == 'undefined') {
            this.recognition.onend = null;
            this.recognition.stop();

            alert("not supported");

            return;
        }

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                if ( this.dataRecognizer.addPhrase(event.results[i][0].transcript) ) {
                    this.finalText += event.results[i][0].transcript;
                    this.recognizerPhrasesCount++;
                }
            } else {
                this.text += event.results[i][0].transcript;
            }
        }

        setTimeout(() => {
            if ( ! this.recordedTextEl) this.recordedTextEl = document.querySelector("#recorded-text");

            // this.recordedContentEl.scrollTop = this.recordedContentEl.scrollHeight
                // - this.recordedContentEl.clientHeight;
            this.recordedTextEl.scrollTop = this.recordedTextEl.scrollHeight
                - this.recordedTextEl.clientHeight;
        }, 200);
    }

    private recognitionListFromGrammer(grammer = null) {
        if (grammer) this.fetchedKeywords = grammer;
        if (!this.fetchedKeywords) return;

        let speechGrammerList = null;

        try {
            speechGrammerList = new this.GrammerList();
        } catch(error) {
            console.error("Found error: while initiating GrammerList: ", this.GrammerList);
            return;
        }

        if ( ! speechGrammerList) return null;

        const types = "PMSKeywords, medications, patientTags, centers, channels, staff, colors".split(", ");
        types.forEach(type => {
            const jsgf = `#JSGF V1.0; grammar ${type}; public <${type}> = ${this.fetchedKeywords[type].join(' | ')} ;`;
            speechGrammerList.addFromString(jsgf, 2);
        });

        return speechGrammerList;
    }
    private feedLocalData() {
        const currentUser = this._util.getLocalData(Constants.KEY_CURRENT_USER);
        if ( ! ( currentUser && currentUser['meta'])) return;

        const centers = [];
        const doctors = [];

        if ( currentUser['meta'] && currentUser['meta']['doctors'])
            currentUser['meta']['doctors'].forEach(doctor => doctors.push(doctor));

        const centersObject = currentUser['meta']['user']['centers'];
        for ( let channelName in centersObject)
            centersObject[channelName].forEach(center => {
                center['channel'] = channelName;
                centers.push(center);
            });

        this.localData = {centers, doctors};
    }

    private async savePrescriptionsToDB(object) {
        const theDate = new Date(object.date);
        const birday = new Date(theDate.getTime());
        birday.setFullYear(birday.getFullYear() - object.age);

        let center = this.fetchedKeywords['centers'].filter( center => {
            return center.code === object.center;
        })[0] || null;

        if ( ! center) { // center have some value, but not a valid value
             center = this.fetchedKeywords['centers'].filter ( center => {
                 return center.code == CreatePatientComponent.DEFAULT_CENTER_CODE
             })[0];
        }

        if ( ! center ) {
            alert("Please specify center for the patient."); 
            return false;
        }
        const channel = this.fetchedKeywords['channels'].filter (channel => {
            return parseInt(channel.id) === parseInt(center.channel_id);
        })[0] || null;

         const resp = await this._rest.createConsultation({
             user_name: object.name,
             user_email: object.mobile + "@camps.medimetry.com",
             user_dob: birday,
             user_mobile: this._util.smartFilterRemove91(object.UID) || this._util.getPatientUniqueNumber(center.address),

             patient_name: object.name,
             patient_age: object.age,
             patient_gender: object.gender,
             patient_mobile: object.mobile,

             center_code: center.code,
             channel_name: channel.name,
             doctor: object.doctor,
             chief_complaints: 'Clinical Visit at ' + theDate,

             soap_date: theDate,
         }).toPromise();

         if ( ! resp['success']) {
             alert("Something went wrong while creating soap: " + resp['message']);
             return false;
         }

         const soapId = resp['soap']['id'], consultationCode = resp['code'], patientId = resp['soap']['patient_id'];

         console.log("resp creating consultation: ", soapId, consultationCode, patientId);
         const vitalsObject = this._util.createNewObject('vitals');
         vitalsObject['vital_information'] = this.mappingVitalsToOrignalKeys(object.vitals);
         await this._rest.inserCurrentSoapElement(soapId, 'vitals', this.mappingVitalsToOrignalKeys(vitalsObject))
             .toPromise();

         await object.chiefComplains.forEach ( async complain => {
             if ( ! complain.text) return;

             const complainObject = this._util.createNewObject('chiefComplaints');
             complainObject['complaint'] = complain.text;

             await this._rest.inserCurrentSoapElement(soapId, 'chief-complains', complainObject)
                 .toPromise();
         });

         await object.medications.forEach( async medication => {
             if ( ! medication.name) return;

             const medicationObject = this._util.createNewObject('medications');

             medicationObject['drug_name'] = medication.name;
             medicationObject['frequency'] = this._util.medicineFrequenceImporter(
                 medication.frequency.morning, medication.frequency.afternoon, medication.frequency.evening,
                 medication.frequency.night, medication.frequency.sos);
             medicationObject['duration'] = medication.duration;
             medicationObject['duration_unit'] = medication.durationUnit;
             medicationObject['intake'] = (medication.meal === "before") ? "Before Meal" : "After Meal";
             medicationObject['remarks'] = medication.notes;
             medicationObject['type'] = medication.type;

             await this._rest.inserCurrentSoapElement(soapId, 'medications', medicationObject)
                 .toPromise();
         });

         const personalHistoryObject = this._util.createNewObject('personal_history');
         personalHistoryObject['info'] = object.personalHistory;
         await this._rest.inserCurrentSoapElement(soapId, 'personal-history', personalHistoryObject)
                 .toPromise();

         await object.dietChart.meals.forEach( async meal => {
             if ( ! meal.name) return;

             const dietChartObject = this._util.createNewObject('diet_chart');
             dietChartObject['meal_time'] = meal.time;
             dietChartObject['name'] = meal.name;
             dietChartObject['quantity_values'] = meal.quantity;
             dietChartObject['quantity_unit'] = meal.quantityUnit;
             dietChartObject['weekend'] = object.dietChart.weekend;

             await this._rest.inserCurrentSoapElement(soapId, 'meals', dietChartObject)
                 .toPromise();
         });

         await object.investigations.forEach ( async investigation => {
             if ( ! investigation.name) return;

             const investigationObject = this._util.createNewObject('investigations');
             investigationObject['category'] = investigation.type;
             investigationObject['term_text'] = investigation.name;

             await this._rest.inserCurrentSoapElement(soapId, 'investigations', investigationObject)
                 .toPromise();
         });

         await this._rest.updateRemarksAndFollowUp(soapId, 'remark-follow-up', {
             remark: object.remarks.remark,
             follow_up: object.remarks.duration + " " + object.remarks.durationUnit,
         }).toPromise();

         await object.pastMedications.forEach(async pastMedication => {
             if ( ! pastMedication) return;

             await this._rest.savePastMedication({
                  "patientId": patientId,
                  "processed": false,
                  "remark": pastMedication,
              }).toPromise();
         });

         await object.pastIllness.forEach(async row => {
             if ( ! row) return;

             await this._rest.savePastIllness({
                  "id": 0,
                  "patientId": patientId,
                  "processed": false,
                  "remark": row,
             }).toPromise();
         });

         await object.pastProcedures.forEach(async row => {
             if ( ! row) return;

             const pastTreatmentObject = this._util.createNewObject('past-treatment');
             pastTreatmentObject['patient_id'] = patientId;
             pastTreatmentObject['term_text'] = row;

             await this._rest.addHistoryObject({
                  "type": "procedure",
                  "data": pastTreatmentObject,
             }).toPromise();
         });

         await object.familyHistory.forEach(async row => {
             if ( ! row.text) return;

             const familyHistoryObject = this._util.createNewObject('family_history');
             familyHistoryObject['patient_id'] = patientId;
             familyHistoryObject['relation'] = row.relation;
             familyHistoryObject['remark'] = row.text;

             await this._rest.addHistoryObject({
                 "type": "family_history",
                 "data": familyHistoryObject,
             });
         });

         await object.allergies.forEach(async row => {
             if ( ! row.text) return;

             const allergyObject = this._util.createNewObject('allergy');
             allergyObject['patient_id'] = patientId;
             allergyObject['reactions'] = row.text;
             allergyObject['substances'] = row.substances;

             await this._rest.addHistoryObject({
                 "type": "allergy",
                 "data": allergyObject,
             });
         });
         

         return true;
    }

    private mappingVitalsToOrignalKeys(object) {
        const keys = {
            "BPS": "BP(S)", "BPD": "BP(D)", 
            "heightFt": "Height(ft)", "heightIn": "Height(in)",
            "pulse": "Pulse", "weight": "Weight (kg)",
        };

        for ( let key in keys) 
            if ( object[key]) {
                object[keys[key]] = object[key];
                delete object[key];
            } 

        return object;
    }

}
