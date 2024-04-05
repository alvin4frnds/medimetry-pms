import { AfterViewInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { SoapRowOperations } from '../../SoapRowOperations';
import { UtilityService } from '../../services/utility.service';
import { Constants } from '../../Utilities/Constants';
import { RestService } from '../../services/rest.service';

@Component({
    selector: 'app-vitals',
    templateUrl: './vitals.component.html',
    styleUrls: ['./vitals.component.css']
})
export class VitalsComponent implements OnInit, SoapRowOperations, OnDestroy, AfterViewInit {

    page_name = Constants.PAGE_NAME.SOAP_DASHBOARD + '$Vitals';

//dummy variable for ngModel of select new vital just for filter.
    new_vital: any;
    btn_addNewVital_enable = true;
    btn_reset_enable = false;
    arr_height_feet = [];
    arr_height_inch = [];

    local_vital_keys = [];
    available_vitals = ['Fasting Sugar', 'Post Prandial Sugar', 'Oxygen Saturation', 'Respiratory  Rate', 'Head Circumference', 'BMI'];
    rest_available_vitals = ['Fasting Sugar', 'Post Prandial Sugar', 'Oxygen Saturation', 'Respiratory  Rate', 'Head Circumference', 'BMI'];
    blackListedFromUpdate = ['Height(ft)', 'Height(in)', 'BP(D)', 'BP(S)'];

    @Input() fromDialog: any = false;
    dataProvider: any;
    isCurrentModeProcessing = false;


    saveVital() {

        if (!this.isCurrentModeProcessing) {
            this._util.start_trace_log(this.page_name, 'saveVital()', 'saveVital() function started');
            this._util.debug_line_exection(this.page_name, 'saveVital()', 'saveVital() function started', {'data': this._util.current_soap_model.vitals});
            this._util.getRestObject().inserCurrentSoapElement(this._util.current_soap_model.id, 'vitals', this._util.current_soap_model.vitals)
                .subscribe(result => {
                    // @ts-ignore
                    this._util.current_soap_model.vitals.id = result.row.id;
                });
            this._util.end_trace_log(this.page_name, 'saveVital()', 'saveVital() function end');
        }

        this.checkVitalsAddTag(['Fasting Sugar', 'Post Prandial Sugar', 'Random Sugar'], 'Sugar');
        this.checkVitalsAddTag(['BP(S)'], 'B.P.');
    }

    addNewRow(isUpdate, position, isBlankRow, event) {
    }

    deleteRow(position) {
    }

    showTermsSuggestions(term, position) {
    }

    refillCurrentItem(position, object, event) {
    }

    selectSuggestion(suggestion, position) {
    }

    sendFocusToNextElement(position: any) {
    }

    checkVitalsAddTag (vitalKeys, tag) {
        const currentConsultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);
        const TAG_CHRONIC = 'Chronic';

        vitalKeys.forEach(key => {
            if (
                this._util.current_soap_model.vitals
                && this._util.current_soap_model.vitals['vital_information']
                && this._util.current_soap_model.vitals['vital_information'][key]
                && (parseInt(this._util.current_soap_model.vitals['vital_information'][key]) < 150)
                && currentConsultation && currentConsultation['patient']
                && (
                    currentConsultation['patient']['meta']
                    && currentConsultation['patient']['meta']['tags']
                    && currentConsultation['patient']['meta']['addedTag']
                    && currentConsultation['patient']['meta']['tags']['indexOf']
                    && (currentConsultation['patient']['meta']['tags'].indexOf(tag) > -1)
                )
            ) {
                const meta = currentConsultation['patient']['meta'] || {};
                let tags = meta['tags'] || [];
                
                tags.splice(tags.indexOf(tag), 1);
                if ( ( tags.length === 1 ) && (tags.indexOf(TAG_CHRONIC) > -1))
                    tags.splice(tags.indexOf(TAG_CHRONIC), 1);

                meta['tags'] = tags;
                meta['addedTag'] = false;
                currentConsultation['patient']['meta'] = meta;

                this._util.saveLocalData(Constants.KEY_CURRENT_CONSULTATION, currentConsultation);
                const TAGS_REMOVAL_FAILED_WARNING = "Something went wrong while updating tags, you might have to remove them manually.";

                this._rest.getPatientDetail(currentConsultation['patient']['id'], currentConsultation['consultation_code'])
                    .subscribe((resp) => {
                        if ( ! resp.success) return alert(TAGS_REMOVAL_FAILED_WARNING);

                        const mediPatient = resp['mediPatient'];

                        mediPatient['meta']['tags'] = tags;

                        const toUpdate = {
                            name: mediPatient.name,
                            gender: mediPatient.gender,
                            mobile : mediPatient.mobile_number,
                            center: mediPatient.center_code,
                            meta: mediPatient.meta || {},
                        };

                        this._rest.updatePatientsDetails(currentConsultation['patient']['id'], toUpdate)
                            .subscribe(resp => {
                                if (! resp.success) return alert(TAGS_REMOVAL_FAILED_WARNING);
                            });
                    });
            }

            if (this._util.current_soap_model.vitals
                && this._util.current_soap_model.vitals['vital_information']
                && this._util.current_soap_model.vitals['vital_information'][key]
                && (parseInt(this._util.current_soap_model.vitals['vital_information'][key]) >= 150)
                && currentConsultation && currentConsultation['patient']
                && !(
                    currentConsultation['patient']['meta']
                    && currentConsultation['patient']['meta']['tags']
                    && currentConsultation['patient']['meta']['tags']['indexOf']
                    && (currentConsultation['patient']['meta']['tags'].indexOf(tag) > -1)
                )
            ) {
                this._rest.addPatientTag(currentConsultation['patient']['id'], tag).then(() => {});
                this._rest.addPatientTag(currentConsultation['patient']['id'], TAG_CHRONIC).then(() => {});

                const meta = currentConsultation['patient']['meta'] || {};
                const tags = [];
                for ( let i in (meta['tags'] || [])) tags.push(meta['tags'][i]);
                    tags.push(tag);
                
                meta['tags'] = tags;
                meta['addedTag'] = true;
                currentConsultation['patient']['meta'] = meta;

                this._util.saveLocalData(Constants.KEY_CURRENT_CONSULTATION, currentConsultation);
            }
        });
    }


    deleteSection() {
        this._util.deleteSection('vitals');
    }

    constructor(public _util: UtilityService,
                public _rest: RestService) {
        for (let index = 1; index < 8; index++) {
            this.arr_height_feet.push(index);
        }
        for (let index = 1; index < 12; index++) {
            this.arr_height_inch.push(index);
        }


    }


    focusToNextField(position) {
        this._util.start_trace_log(this.page_name, 'focusToNextField()', 'focusToNextField() function starts', {'data': {'position': position}});
        this._util.getFocusOnNextElement([], [], position, 'vital_');
        this._util.end_trace_log(this.page_name, 'focusToNextField()', 'focusToNextField() function starts', {});

    }

    sendFocusAfterLength(event, fieldId, length) {
        if (event.keyCode && ([9, 16].indexOf(event.keyCode) > -1)) return;

        if (event.target.value.length >= length) { // 9 is for 'Tab' button
            this.focusToNextField(fieldId);
        }
    }

    sendFocusToBpD(event) {
        if (event.keyCode && ([9, 16].indexOf(event.keyCode) > -1)) return;

        if (event.target.value.length === 3) { // 9 is for 'Tab' button
            this.focusToNextField(0);
        }
    }

    updateVitalsKeys() {
        for (let key in this._util.current_soap_model.vitals['vital_information'])
            if (this.blackListedFromUpdate.indexOf(key) === -1)
                this.local_vital_keys.push(key);

        this.local_vital_keys = this.local_vital_keys.filter((value, index, self) => self.indexOf(value) === index);
    }

    ngOnInit() {
        this._util.start_trace_log(this.page_name, 'ngOnInit()', 'ngOnInit() Function Starts');
        if (this.fromDialog) {
            this._util.debug_line_exection(this.page_name, 'ngOnInit()', 'Vital Component Initialized from Information wizard', {});
            this._util.current_soap_model.vitals = this._util.createNewObject('vitals', false, false);
        }

        this.dataProvider = this._util.getDataProviders().subscribe(result => {
            if (result.type === 'consultation_state') {
                if (result.data === 'processing') {
                    this.isCurrentModeProcessing = true;

                } else if (result.data === 'done') {
                    this.isCurrentModeProcessing = false;
                    if (this.checkIfVitalsExists()) {
                        this.saveVital();
                    }
                }
            }

            if (result.type === "updateVitalsKeys") {
                this.updateVitalsKeys();
            }
        });

        this.updateVitalsKeys();
        this.removeExistingVitalsFromLocal();
        this._util.start_trace_log(this.page_name, 'ngOnInit()', 'ngOnInit() Function end');
    }

    ngOnDestroy(): void {
        this._util.start_trace_log(this.page_name, 'ngOnDestroy()', 'ngOnDestroy() function starts');
        this._util.current_soap_model.vitals = this._util.createNewObject('vitals', false, false);
        this._util.debug_line_exection(this.page_name, 'ngOnDestroy()', 'setting vitals as default', {'data': this._util.current_soap_model.vitals});
        try {
            this._util.trace_line_exection(this.page_name, 'ngOnDestroy()', 'Unsubscribing data provider observable', {});
            this.dataProvider.unsubscribe();
        } catch (error) {
            this._util.error_line_exection(this.page_name, 'ngOnDestroy()', 'Inside Catch block', {'data': error});
        }

        this._util.end_trace_log(this.page_name, 'ngOnDestroy()', 'ngOnDestroy() function ends');

    }

    bringFocusToInput(event) {
        try {
            event.srcElement.parentNode.parentNode.getElementsByClassName('a-vital-input-field')[0].focus();
        } catch (e) {
        }
    }


    checkIfVitalsExists() {
        let isValueFilled = false;
        if (this._util.current_soap_model.vitals['vital_information']) {
            Object.keys(this._util.current_soap_model.vitals['vital_information']).forEach(key => {
                if (this._util.current_soap_model.vitals['vital_information'][key] !== '') {
                    isValueFilled = true;
                }
            });

        }

        return isValueFilled;
    }


    addNewVitalField() {

        const method = 'addNewVitalField()';
        //this._util.start_trace_log(this.page_name,method,method+' function starts');


        this.local_vital_keys.push('blank_vital_field');
        // this._util.debug_line_exection(this.page_name,method,method+' pushing blank key in vital field',{'data':this.local_vital_keys});
        this.btn_addNewVital_enable = false;
        this.removeExistingVitalsFromLocal();

        this.new_vital = '';
        try {
            this._util.sendFocusToElementId('blank_box');
        } catch (err) {
        }
        this._util.end_trace_log(this.page_name, 'addNewVitalField()', 'addNewVitalField() function end');


        if (this.available_vitals.length < 2) {
            this.btn_addNewVital_enable = false;

        }
    }

    onNewVitalSelected(vital) {
        const method = 'onNewVitalSelected()';
        this._util.start_trace_log(this.page_name, method, method + ' function started');

        this.btn_reset_enable = true;

        if (this.available_vitals.length < 2) {
            this.btn_addNewVital_enable = false;
        } else {
            this.btn_addNewVital_enable = true;

        }
        for (let index = 0; index < this.local_vital_keys.length; index++) {
            if (this.local_vital_keys[index] === 'blank_vital_field') {
                this.local_vital_keys.splice(index, 1);
                this._util.debug_line_exection(this.page_name, method, 'Removed blank_vital_field key from position ' + index, {'data': {'local_vital_keys': this.local_vital_keys}});
                break;
            }
        }
        this.local_vital_keys.push(vital);
        this._util.debug_line_exection(this.page_name, method, 'pushing vitals into local vitals array', {
            'data': {
                'vitals': vital,
                'array': this.local_vital_keys
            }
        });

        this._util.current_soap_model.vitals['vital_information'][vital] = '';
        this._util.end_trace_log(this.page_name, method, method + ' function end');

    }


    ngAfterViewInit(): void {

    }


    removeExistingVitalsFromLocal() {

        for (let index = 0; index < this.local_vital_keys.length; index++) {
            for (let inner_index = 0; inner_index < this.available_vitals.length; inner_index++) {
                if (this.local_vital_keys[index] === this.available_vitals[inner_index]) {
                    this.available_vitals.splice(inner_index, 1);
                    // this.rest_available_vitals.splice(inner_index,1);
                }
            }
        }
    }


    resetFields() {
        const method = 'resetField()';
        this._util.start_trace_log(this.page_name, method, method + ' function started');
        this.available_vitals = JSON.parse(JSON.stringify(this.rest_available_vitals));
        this._util.debug_line_exection(this.page_name, method, 'Available vitals reset to default', {'data': this.available_vitals});

        let object = JSON.parse(JSON.stringify(this.local_vital_keys));
        this._util.debug_line_exection(this.page_name, method, 'Available Local Vital Keys', {'data': this.local_vital_keys});

        this.local_vital_keys = this.local_vital_keys.filter((row) => {
            if (this.available_vitals.indexOf(row) === -1) {
                return true;
            } else {
                this._util.debug_line_exection(this.page_name, method, 'Filtering out data from local_vital_array', {'data': row});
                delete this._util.current_soap_model.vitals['vital_information'][row];
                this._util.debug_line_exection(this.page_name, method, 'removed key from main current soap vital section too', {'data': row});
                return false;
            }
        });
        this.saveVital();
        this.btn_addNewVital_enable = true;
        this._util.start_trace_log(this.page_name, method, method + ' function end');
    }

    addNextRow() {
    }

}
