import { Constants } from './../../Utilities/Constants';
import { Component, OnInit } from '@angular/core';
import { SoapRowOperations } from 'src/app/SoapRowOperations';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
    selector: 'app-remarks',
    templateUrl: './remarks.component.html',
    styleUrls: ['./remarks.component.css']
})
export class RemarksComponent implements OnInit, SoapRowOperations {

    page_name = Constants.PAGE_NAME.SOAP_DASHBOARD + '$Remarks';

    durationSuggestion = [];


    updateFollowUp() {
        this._util.start_trace_log(this.page_name, 'updateFollowUp()', 'updateFollowUp() function starts');
        this._util.current_soap_model.follow_up += " Day(s)";
        this._util.debug_line_exection(this.page_name, 'updateFollowUp()', 'Adding Days to followups', {'data': this._util.current_soap_model.follow_up});
        this.addNewRow(false, 0, false, null);

        this._util.end_trace_log(this.page_name, 'updateFollowUp()', 'updateFollowUp() function end');
    }


    deleteElement(position) {

        if (position === 0) {
            this._util.current_soap_model.remark = '';
        } else if (position === 1) {
            this._util.current_soap_model.follow_up = '';
        }
        this.addNewRow(false, 0, false, null);
    }

    addNewRow(isUpdate: any, position: any, isBlankRow: any, event: any) {
        this._util.start_trace_log(this.page_name, 'addNewRow()', 'addNewRow() function started');

        if (!this._util.current_soap_model.remark && !this._util.current_soap_model.follow_up)
            return;

        if (!this._util.current_soap_model.id) return;

        if (this._util.current_soap_model.follow_up && (this._util.current_soap_model.follow_up.split(" ").length != 2))
            return;

        this._util.getRestObject().updateRemarksAndFollowUp(this._util.current_soap_model.id, 'remark-follow-up', {
            'remark': this._util.current_soap_model.remark,
            'follow_up': this._util.current_soap_model.follow_up
        }).subscribe(result => {
        });


        this._util.end_trace_log(this.page_name, 'addNewRow()', 'addNewRow() function end');

    }

    deleteRow(position: any) {
    }

    showTermsSuggestions(term: any, position: any) {
    }

    selectSuggestion(suggestion: any, position: any, event: any, isDiagnosisFromChips: any) {
    }

    deleteSection() {

        this._util.current_soap_model.remark = '';
        this._util.current_soap_model.follow_up = '';
        this._util.deleteSection('remark-follow-up');

    }

    refillCurrentItem(position: any, object: any, event: any) {
    }

    constructor(public _util: UtilityService) {
    }

    ngOnInit() {
    }


    bindDurationWithSuggestion(term) {
        const durationUnit = ['Day(s)', 'Week(s)', 'Month(s)'];

        this.durationSuggestion = durationUnit.map(unit => {
            const day = parseInt(term.split(" ")[0]) || 1;
            const date = day + " " + unit;

            return {
                value: date,
                label: date + " i.e. " + this.predictFollowupDate(date)
            }
        });
    }

    predictFollowupDate(term) {
        return this._util.niceDateFormat(this._util.daysOptionToDay(term));
    }

    addNextRow() {
        throw new Error("Method not implemented.");
    }

    sendFocusToNextElement(position: any) {
        throw new Error("Method not implemented.");
    }

}
