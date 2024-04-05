import { Component, Input, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SoapRowOperations } from '../../SoapRowOperations';
import { UtilityService } from '../../services/utility.service';
import { Constants } from '../../Utilities/Constants';
import { MatSnackBar, MatTooltip } from '@angular/material';
import { forEach } from '@angular/router/src/utils/collection';
import { send } from 'q';

@Component({
    selector: 'app-medicine',
    templateUrl: './medicine.component.html',
    styleUrls: ['./medicine.component.css']
})
export class MedicineComponent implements OnInit, SoapRowOperations, OnDestroy {
    @Input() hideCrossButton: boolean;
    @Input() showLockUnlockEditingToggle: boolean = false;

    page_name = Constants.PAGE_NAME + '$Medicine';
    hidePreviousMedButton = false;
    medicineProvider = null;
    medicineSuggestion = [];
    drug_suggestions = [];
    dosage_unit_suggestion = [];
    duration_unit_suggestion = ['10 Day(s)', '1 Week(s)', '1 Month(s)'];
    checkBoxState = [false, false, false];
    showStaffMedsOrderLoading: false;
    showStaffMedsOrderLayout = false;

    lasttimestamp = 0;

    allMedicines = [];
    patientMedicinesStock = [];

    addNewRow(isUpdate, position, isBlankRow, event) {

        const method = 'addNewRow()';
        this._util.start_trace_log(this.page_name, method, method + ' function starts');
        this._util.current_soap_model.medication[position] = this._util.processMedicine(this._util.current_soap_model.medication[position]);
        this._util.debug_line_exection(this.page_name, method, 'Medicine object after processing', {'data': this._util.current_soap_model.medication[position]});
        this._util.addNewRow(this._util.createNewObject('medications'), this._util.current_soap_model.medication, position, true, 'medications').then(result => {
            this.medicineSuggestion = [];
        });
        this.addNextRow();

        this._util.end_trace_log(this.page_name, method, method + ' function end');
        if (this._util.current_soap_model.medication.length > 1) {
            this.hidePreviousMedButton = true;
        }

        this._util.sendStaffPMSStat('staff-followup-done');
    }

    // }

    deleteRow(position) {

        this._util.deleteCurrentRow('medications', this._util.current_soap_model.medication, position, this._util.current_soap_model.id).then(result => {
            if (this._util.current_soap_model.medication.length == 2) {
                this.hidePreviousMedButton = false;
            }
        });
    }

    clearMedicine(position) {

        try {
            const medication = this._util.current_soap_model.medication[position] || {};

            if (medication.id) {
                this._util.getRestObject().deleteSoapComponentRow(
                    this._util.current_soap_model.id,
                    'medications',
                    medication.id
                ).subscribe(result => {

                });
            }
        } catch (e) {
        }

        if (this._util.checkIfAnyEmptyObjectExists('medications', this._util.current_soap_model.medication)) {
            this._util.current_soap_model.medication.splice(position, 1);
        } else {
            this._util.current_soap_model.medication[position].show_additional_info = false;
            this._util.current_soap_model.medication.splice(position, 1, this._util.createNewObject('medications'));
        }
    }

    public toggleMedicationLock() {
        this._util.previousSoapSettings.previousSoapActivated = !this._util.previousSoapSettings.previousSoapActivated;
    }

    public triggerTooltip(event, salts) {
        event.stopPropagation();

        this._util.showSnackBar("Salts: " + salts, '', false, 6000);
    }

    showTermsSuggestions(term, position) {
        if (term.length >= 3)
            this._util.getRestObject().showSuggestion('medicines', term).subscribe(row => {
                if ( row.timestamp < this.lasttimestamp) return;

                this.lasttimestamp = row.timestamp;
                this.medicineSuggestion = row.matches.map(row => {
                    row["compositionText"] = row.salts.map( salt => {
                        return salt.name + ' ' + salt.dosage + salt.dosage_unit
                    }).join(" + ");

                    return row;
                });

                let position = this.medicineSuggestion.findIndex(med => med.parentName);
                if (position > -1) this.medicineSuggestion.splice(position, 0,
                    {'name': '--- SUBSTITUTES ---'});
            });

    }

    refillCurrentItem(position, object, event) {
    }

    selectSuggestion(suggestion, position) {
        const method = 'selectSuggestion()';
        this._util.start_trace_log(this.page_name, method, method + ' function starts', {
            'data': {
                'suggestion': suggestion,
                'position': position
            }
        });
        this._util.current_soap_model.medication[position].show_additional_info = true;
        this._util.current_soap_model.medication[position].drug_name = suggestion.name;
        this._util.current_soap_model.medication[position].drug_dosage =
            (suggestion.dosage ? suggestion.dosage + ' ' : '')
            + suggestion.dosage_unit;
        this._util.current_soap_model.medication[position].drug_dosage_unit = suggestion.dosage_unit;
        this._util.current_soap_model.medication[position].duration =
            (suggestion.duration ? suggestion.duration + ' ' : '')
            + suggestion.duration_unit;
        this._util.current_soap_model.medication[position].duration_unit = suggestion.duration_unit;
        this._util.current_soap_model.medication[position].intake = suggestion.meal;
        this._util.current_soap_model.medication[position].type = suggestion.type || 'tab';
        this._util.current_soap_model.medication[position].remarks = suggestion.instructions !== 'null' ? suggestion.instructions : "";

        this._util.current_soap_model.medication[position] = this.fillMedicineFrequency(this._util.current_soap_model.medication[position], suggestion.frequency);
        this._util.debug_line_exection(this.page_name, method, 'Selected object after processing', {'data': this._util.current_soap_model.medication[position]});
        this._util.end_trace_log(this.page_name, method, method + ' function end');
    }

    fillMedicineFrequency(medicine, frequency) {
        const method = 'fillMedicineFrequency()';
        this._util.start_trace_log(this.page_name, method, method + ' function starts');
        this._util.debug_line_exection(this.page_name, method, method + ' function starts with values', {
            'data': {
                'medicine': medicine,
                'frequency': frequency
            }
        });

        const _frequency = this._util.medicineFrequencyExtractor(frequency).split('-');

        medicine.check_morning = _frequency[0] === '1';
        medicine.check_afternoon = _frequency[1] === '1';
        medicine.check_evening = _frequency[2] === '1';
        medicine.check_night = _frequency[3] === '1';
        medicine.check_sos = _frequency[4] === '1';

        this._util.debug_line_exection(this.page_name, method, 'Medicine after processing frequency', {'data': medicine});

        this._util.end_trace_log(this.page_name, method, method + ' function ends');


        return medicine;
    }


    deleteSection() {
        if (this.showStaffMedsOrderLayout) {
            this.showStaffMedsOrderLayout = false;
            return;
        }

        this._util.deleteSection('medication');
    }

    constructor(public _util: UtilityService, _snackBar: MatSnackBar) {
    }

    ngOnInit() {
        this._util.start_trace_log(this.page_name, 'ngOnInit()', 'ngOnInit() function starts');
        if (this._util.current_soap_model.medication.length > 1) {
            this.hidePreviousMedButton = true;
        }
        this.medicineProvider = this._util.getDataProviders().subscribe(result => {
            if (!result) return;

            if (result.type === 'processThisMedicine') {
                this._util.debug_line_exection(this.page_name, 'ngOnInit()', 'add unsaved medicine while saving soap', {'data': result});

                this.addNewRow(true, result.data['position'], false, null);
            }

            if (result.type === 'showStaffMedsOrderLayout') {
                this.showStaffMedsOrderLayout = result.data;
            }

            if (result.type === 'showStaffMedsOrderLoading') {
                this.showStaffMedsOrderLoading = result.data;
            }

            if (result.type === 'updateVitalsKeys') {
                this.fetchPatientMedicinesStock();
            }
        });

        this.fetchPatientMedicinesStock();

        this._util.end_trace_log(this.page_name, 'ngOnInit()', 'ngOnInit() function end');
    }

    continuePreviousMedication() {

        if (!confirm("Are you sure you want to copy medicine from previous soap?")) return;

        this._util.getRestObject().getpreviousSoapMedication(this._util.current_soap_model.id).subscribe(result => {
            if (result.success) {
                this._util.current_soap_model.medication = result.rows;
            } else {
                return this._util.showSnackBar('there is no previous medications', '');
            }

            this._util.current_soap_model.medication.map((med, index) => {
                med = this.fillMedicineFrequency(med, parseInt(med.frequency));
                med = this._util.processMedicine(med, false);

                med.id = 0;
                this.addNewRow(false, index, false, null);
                return med;
            });

            console.log("here i am");

            this.fetchPatientMedicinesStock().then(() => {});
        });

    }


    bindDosageTermWithSuggestion(term) {
        this._util.start_trace_log(this.page_name, 'bindDosageTermWithSuggestion()', 'bindDosageTermWithSuggestion() function starts');
        const dosageUnit = ['mg', 'g', 'mL', 'drop', '%', 'IU', 'unit', 'microg', 'L', 'mmol'];
        term = term.split(' ')[0];
        this.dosage_unit_suggestion = dosageUnit.map(unit => term + ' ' + unit);
        this._util.debug_line_exection(this.page_name, 'bindDosageTermWithSuggestion()', 'dosage unit suggestion array', {'data': this.dosage_unit_suggestion});
        this._util.end_trace_log(this.page_name, 'bindDosageTermWithSuggestion()', 'bindDosageTermWithSuggestion() function end');
    }


    bindDurationWithSuggestion(term) {

        this._util.start_trace_log(this.page_name, 'bindDurationWithSuggestion()', 'bindDurationWithSuggestion() function starts', {'data': term});

        const durationUnit = ['Day(s)', 'Week(s)', 'Month(s)'];
        term = term.split(' ')[0];
        this._util.start_trace_log(this.page_name, 'bindDurationWithSuggestion()', 'bindDurationWithSuggestion() function end');

        return this.duration_unit_suggestion = durationUnit.map(unit => term + ' ' + unit);
    }


    bindMedicineIntake(number, position, event) {
        if (event.checked) {
            if (number === 0) {
                this._util.current_soap_model.medication[position].intake = 'Before Meal';
                this.checkBoxState[0] = true;
                this.checkBoxState[1] = false;
                this.checkBoxState[2] = false;
            } else if (number === 1) {
                this.checkBoxState[0] = false;
                this.checkBoxState[1] = true;
                this.checkBoxState[2] = false;
                this._util.current_soap_model.medication[position].intake = 'After Meal';
            } else if (number === 2) {
                this.checkBoxState[0] = false;
                this.checkBoxState[1] = false;
                this.checkBoxState[2] = true;


                this._util.current_soap_model.medication[position].intake = '';
            }

        } else {
            this._util.current_soap_model.medication[position].intake = '';
            this.checkBoxState[0] = false;
            this.checkBoxState[1] = false;
            this.checkBoxState[2] = false;
        }
    }


    showExtraOptions(position) {
        this._util.current_soap_model.medication[position].show_additional_info = true;

        this.beginMedicineEditing(this._util.current_soap_model.medication[position]);
        //this.medicineSuggestion = [];
    }


    addNextRow() {
        this._util.addNextRowIfNotExists('medications', this._util.current_soap_model.medication, this._util.createNewObject('medications'));
    }

    sendFocusToNextElement(position: any) {
        this._util.getFocusOnNextElement(this.medicineSuggestion, [], position, 'medi_');
    }

    beginMedicineEditing(medicine) {
        if (this._util.previousSoapSettings.previousSoapActivated)
            return;

        medicine.drug_dosage = ((((medicine.drug_dosage.split()[0]) + " ") || '') + (medicine.drug_dosage_unit || '')).trim();

        medicine.duration = ((((medicine.duration.split()[0]) + " ") || '') + (!medicine.duration.split(' ')[1] ? medicine.duration_unit : '')).trim();

        medicine = this.fillMedicineFrequency(medicine, medicine.frequency);
        // medicine.check_sos = parseInt(medicine.frequency) > 16;

        if (!this._util.previousSoapSettings.previousSoapActivated) {
            medicine.processed = false;
            medicine.show_additional_info = true;
        }
    }

    ngOnDestroy(): void {

        this._util.start_trace_log(this.page_name, 'ngOnDestroy()', 'ngOnDestroy() function starts');
        try {
            this._util.debug_line_exection(this.page_name, 'ngOnDestroy()', 'ngOnDestroy() function starts', {});
            this.medicineProvider.unsubscribe();
        } catch (error) {
            this._util.error_line_exection(this.page_name, 'ngOnDestroy()', 'Inside Catch Block ', {'data': error});
        }

        this._util.end_trace_log(this.page_name, 'ngOnDestroy()', 'ngOnDestroy() function end');
    }

    showStaffMedsOrder(alreadyHaveValue) {
        this.showStaffMedsOrderLayout = true;

        this.allMedicines = this._util.current_soap_model.medication
            .filter( med => !! med.drug_name)
            .map( med => {
                 med.checked = alreadyHaveValue || !med.remaining;
                 return med;
            });

        this._util.saveAllMedicines();
    }

    sendStaffPMSStat(type) {
        this._util.saveAllMedicines();

        let removingMedicines = [];
        let sendingMedicines = this.allMedicines
            .filter(med => med.checked)
            .map(med => {
                const duration = med.duration + " " + med.duration_unit;
                const now = new Date;
                const endDate = this._util.daysOptionToDay(duration, now);

                const startDate = new Date(now.getTime());
                startDate.setHours(8, 0, 0, 0);
                startDate.setDate(startDate.getDate() + 1);

                const diffInDays = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                const obj = {
                    frequency: med.frequency,
                    duration: duration,
                    deliveredOn: now,
                    startedOn: startDate,
                    shouldEndOn: endDate,
                    name: med.drug_name,
                    perDay: (this._util.medicineFrequencyExtractor(med.frequency).match(/1/g) || []).length,
                    forDays: diffInDays,
                    consultationCode: this._util.current_soap_model.consultation_code,
                    type: med.type,
                };

                const resp = this.calculateRemainingTablets(obj);
                obj['remaining'] = resp['remaining'];

                return obj;
            });

        if (type === "staff-meds-refused") {
            // in case of refusing, not sending any medication

            removingMedicines = sendingMedicines;
            sendingMedicines = [];
        }

        const currentConsultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);
        const patient = currentConsultation['patient'];
        const meta = patient['meta'] || {};

        let medicinesStock = [];
        let temp = [];
        for ( let key in (meta['medicinesStock'] || {})) {
            const obj = meta['medicinesStock'][key];
            const resp = this.calculateRemainingTablets(obj);
            obj['remaining'] = resp['remaining'];

            if (resp['remaining'] > 0) medicinesStock.push(obj);
        }

        // add new medicines, to existing one's 
        // here
        let commonInBoth = medicinesStock.filter(tempRow => {
            return sendingMedicines.filter(row => row['name'] === tempRow['name']).length;
        });

        commonInBoth.forEach(row => {
            const medStock = medicinesStock.filter(stock => stock['name'] === row['name'])[0];
            const sendingMed = sendingMedicines.filter(stock => stock['name'] === row['name'])[0];

            if ( ! medStock || ! sendingMed) return;

            if ( medStock['frequency'] === sendingMed['frequency']) {
                // @ts-ignore
                sendingMed['forDays'] = (parseFloat(sendingMed['forDays']) + parseFloat(medStock['forDays'])) + "";
            } else {
                const resp = this.calculateRemainingTablets(medStock);

                sendingMed['leftOver'] = resp['remaining'];
            }

            sendingMed['startedOn'] = new Date();

            temp.push(sendingMed);
        });

        temp = temp.concat(medicinesStock.filter(medStock => {
            return temp.map( row => row['name']).indexOf(medStock['name']) === -1;
        }));

        temp = temp.concat(sendingMedicines.filter(sendingStock => {
            return temp.map( row => row['name']).indexOf(sendingStock['name']) === -1;
        }));

        temp = temp.map(row => {
            const resp = this.calculateRemainingTablets(row);
            row['remaining'] = resp['remaining'];

            return row;
        });

        removingMedicines.forEach(removingRow => {
            const tempRowIndex = this._util.arraySearch(temp, 'name', removingRow['name']);

            if ((tempRowIndex > -1) && (temp[tempRowIndex]['remaining'] >= removingRow['remaining'])) {
                temp[tempRowIndex]['remaining'] = temp[tempRowIndex]['remaining'] - removingRow['remaining'];
            }
        });

        temp = temp.filter(row => row['remaining']);

        meta['medicinesStock'] = temp;
        patient['meta'] = meta;

        // just for safe keeping: its not required in real scenario
        patient['mobile'] = patient['mobile_number'];

        currentConsultation['patient'] = patient;
        this._util.saveLocalData(Constants.KEY_CURRENT_CONSULTATION, currentConsultation);

        this._util.getRestObject().updatePatientsDetails(patient.id, patient)
            .subscribe(resp => {
                if (resp.success) {
                    this._util.showSnackBar("Patient Stock Updated Successfully !");

                    this.fetchPatientMedicinesStock().then(() => {});
                }
            });

        return this._util.sendStaffPMSStat(type);
    }

    async fetchPatientMedicinesStock() {
        const currentConsultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);
        const patient = currentConsultation['patient'];
        const meta = patient['meta'] || {};

        const temp = [];
        for ( let key in (meta['medicinesStock'] || {}))
            temp.push(meta['medicinesStock'][key]);

        this.patientMedicinesStock = temp
            .map(stockRow => {
                const resp = this.calculateRemainingTablets(stockRow);
                stockRow['remaining'] = resp['remaining'];
                stockRow['reasoning'] = resp['reasoning'];

                return stockRow;
            });

        this._util.current_soap_model.medication = this._util.current_soap_model.medication.map(medication => {
            let stockRow = this.patientMedicinesStock.filter(row => medication['drug_name'] === row['name'])[0] || {};

            medication['remaining'] = stockRow['remaining'];
            medication['reasoning'] = stockRow['reasoning'];

            return medication;
        });

        console.log("After processing medicines stock: ", this.patientMedicinesStock, this._util.current_soap_model.medication);
    }

    public calculateRemainingTablets(row) {
        if (row.type && (['tablet', 'cap', 'inj'].indexOf(row.type) === -1))
            return { remaining: 0, reasoning: "Only tablets, & capsules are supported.", };

        if (! row['name']) return {
            remaining: 0, reasoning: "",
        };

        const start = new Date(row['startedOn']);
        let end = new Date(); // calculate for current time, not ideal // row['shouldEndOn']);

        if (end.getTime() > (new Date(row['shouldEndOn'])).getTime())
            end = new Date(row['shouldEndOn']);

        const today = MedicineComponent.getDays(new Date);
        const startDays = MedicineComponent.getDays(start);
        const endDays = MedicineComponent.getDays(end);

        const leftOvers = row['leftOver'] || 0;
        let totalTablets = (row['perDay'] * row['forDays']) + leftOvers;
        let consumedTablets = 0;

        if (! totalTablets) return {
            remaining: 0,
            reasoning: "Invalid frequency or duration",
        };

        // if we just sent the medicines, will start countdown from tomorrow
        if (startDays > today) return {
            remaining: totalTablets,
            reasoning: "Countdown will start from tomorrow",
        };

        // if meds are freshly sent, countdown will start from tomorrow
        if (endDays < startDays) return {
            remaining: totalTablets - consumedTablets,
            reasoning: "Meds not started yet",
        };

        const hourLookup = [ 9, 15, 18, 21, 22 ];

        const extractedFrequency = this._util.medicineFrequencyExtractor(row['frequency']).split("-");

        consumedTablets = consumedTablets + extractedFrequency.filter((val, index) => {
                if (val === "0") return false;

                if (val !== "1") return false; // impossible scenario but still, just for peace of mind

                return hourLookup[index] <= end.getHours();
            }).length;

        if (endDays === startDays) return {
            remaining: totalTablets - consumedTablets,
            reasoning: "Started today, may / not consumed much",
        };

        consumedTablets = consumedTablets + extractedFrequency.filter((val, index) => {
                if (val === "0") return false;

                if (val !== "1") return false; // impossible scenario but still, just for peace of mind

                return hourLookup[index] >= start.getHours();
            }).length;

        if (endDays === (startDays + 1))  return {
            remaining: totalTablets - consumedTablets,
            reasoning: "Ending tomorrow, you might want to talk to patient",
        };

        // last scenario, it started way before
        for ( let i = startDays + 1; i < endDays; i ++) {
            consumedTablets = consumedTablets + parseFloat(row['perDay']);
        }

        const remaining = totalTablets - consumedTablets;
        const daysRemaining = Math.floor(Math.abs(remaining) / row['perDay']);

        // handle -ve 's
        if (remaining < 0) return {
            remaining: 0,
            reasoning: "Went out of stock " + daysRemaining + " days ago"
        }; else return {
            remaining: remaining,
            reasoning: daysRemaining + " day's stock remaining",
        };
    }

    public static getDays( date ) {
        return Math.ceil(date.getTime() / (1000 * 60 * 60 * 24));
    }

    public getFreshMedicationRow(old, remaining = 0) {
        const resp = this.calculateRemainingTablets(old);

        old['endedOn'] = new Date();
        old['remaining'] = remaining || resp['remaining'];

        if (old['remaining'])
            this._util.getRestObject()
                .updateMedicineStock(old['consultationCode'], old)
                .then(() => { console.log("Old medicine stock updated successfully."); });

        old['startedOn'] = old['endedOn'];
        delete old['endedOn'];

        return old;
    }
}
