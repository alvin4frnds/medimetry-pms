import {Component, OnInit} from "@angular/core";
import {SoapRowOperations} from "../../SoapRowOperations";
import {UtilityService} from "../../services/utility.service";
import {Constants} from "../../Utilities/Constants";

@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.component.html',
  styleUrls: ['./referrals.component.css']
})
export class ReferralsComponent implements OnInit, SoapRowOperations {

  page_name=Constants.PAGE_NAME.SOAP_DASHBOARD+'$Referrals';

  addNewRow(isUpdate, position, isBlankRow, event) {
    this._util.start_trace_log(this.page_name,'addNewRow()','addNewRow() function starts',{'data':{'position':position}});
    if(this._util.current_soap_model.referrals[position].remarks!==''){
    this._util.addNewRow(this._util.createNewObject('referrals'), this._util.current_soap_model.referrals, position, true, 'referrals').then(result => {

    });
  }
  this._util.end_trace_log(this.page_name,'addNewRow()','addNewRow() function end',{});

  }

  deleteRow(position) {
    this._util.deleteCurrentRow('referrals', this._util.current_soap_model.referrals, position, this._util.current_soap_model.id).then(result => {
    });
  }

  refillCurrentItem(position, object, event) {
  }

  showTermsSuggestions(term, position) {
  }

  selectSuggestion(suggestion, position) {
  }

  deleteSection() {
    this._util.deleteSection('referrals');
  }

  constructor(public _util: UtilityService) {
  }

  ngOnInit() {
  }

  addNextRow() {
    this._util.addNextRowIfNotExists('referrals',this._util.current_soap_model.referrals,this._util.createNewObject('referrals'));

  }
  sendFocusToNextElement(position: any) {
    this._util.getFocusOnNextElement([], [], position, 'ref_');
  }

}
