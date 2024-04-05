import {Component, Input, OnInit} from '@angular/core';
import {SoapRowOperations} from "../../SoapRowOperations";
import {UtilityService} from "../../services/utility.service";
import {Constants} from "../../Utilities/Constants";


@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css'],
})
export class DiagnosisComponent implements OnInit, SoapRowOperations {
  @Input() hideCrossButton: boolean;
  @Input() showLockUnlockEditingToggle: boolean = false;


  page_name=Constants.PAGE_NAME.SOAP_DASHBOARD+'$Diagnosis';

  diagnosisChipsSuggestion = [];
  diagnosisDropDownSuggestion = [];
  showDropDownSuggestions = false;

  addNewRow(isUpdate, position, isBlankRow, event) {
    const method='addNewRow()';
    this._util.start_trace_log(this.page_name,method,method+' function started',{'data':{'position':position}});

     setTimeout(() => {
    if(this._util.current_soap_model.diagnosis[position].diagnosis!==''){
    this._util.current_soap_model.diagnosis[position].showChips = false;
    this._util.addNewRow(this._util.createNewObject('diagnosis'), this._util.current_soap_model.diagnosis, position, true, 'diagnosis', this.diagnosisDropDownSuggestion).then(result => {
    });
    }
    }, 200);
    this._util.end_trace_log(this.page_name,method,method+' function end',{});

  }

  deleteRow(position) {
    const method='deleteRow()';
    this._util.start_trace_log(this.page_name,method,method+' function started');
    this._util.deleteCurrentRow('diagnosis', this._util.current_soap_model.diagnosis, position, this._util.current_soap_model.id).then(result => {
    });
    this._util.end_trace_log(this.page_name,method,method+' function end');
  }

  showTermsSuggestions(term, position) {
      if (term.length < 3) return;

    this._util.getRestObject().showSuggestion('icd10', term).subscribe(row => {
      if (row.terms && row.terms.length > 0) {
        this._util.current_soap_model.diagnosis[position].showChips = true;
        this.diagnosisChipsSuggestion = row.terms;
      } else {
        this.diagnosisChipsSuggestion = [];
        this._util.current_soap_model.diagnosis[position].showChips = false;
      }

      if (this.showDropDownSuggestions)
        this.diagnosisDropDownSuggestion = row.matches;
    });

  }

  selectSuggestion(suggestion, position, event, isFromChips) {
    const method='selectSuggestion()';
    this._util.start_trace_log(this.page_name,method,method+' function started',{'data':{
      'suggestion':suggestion,
      'position':position,
      'event':event,
      'isFromChips':isFromChips
    }});
    if (event.isUserInput) {
      this._util.selectSuggestion('diagnosis', suggestion, position, isFromChips);
    } else {
      this._util.selectSuggestion('diagnosis', suggestion, position, isFromChips);

    }
    this.diagnosisDropDownSuggestion = [];
    this.diagnosisChipsSuggestion=[];
    this._util.end_trace_log(this.page_name,method,method+' function end');

  }

  deleteSection() {
    this._util.deleteSection('diagnosis');
  }
  public toggleDiagnosisLock() {
    this._util.previousSoapSettings.previousSoapActivated = !this._util.previousSoapSettings.previousSoapActivated;
  }

  constructor(public _util: UtilityService) {
  }
  ngOnInit() {
  }


  refillCurrentItem(position, object, event) {

    let isRemoveRequest = false;
    let completeArray = this._util.getLocalData(Constants.KEY_CURRENT_SOAP).diagnosis;
    if (event.checked) {
      isRemoveRequest = false;
    } else {
      isRemoveRequest = true;
    }
    this._util.refillOrder(isRemoveRequest, completeArray, object, position, 'Diagnosis');
  }


  // selectSuggestion(suggestion, position) {
  //   if (suggestion.icd10_id) {
  //     this._util.current_soap_model.diagnosis[position].icd_code = suggestion.icd10_id;
  //   }
  //   this._util.current_soap_model.diagnosis[position].diagnosis = suggestion.name;
  //   this._util.current_soap_model.diagnosis[position].showChips = false;
  //   this.addNewRow(false, position, false, null);
  // }



  addNextRow() {

    this._util.addNextRowIfNotExists('diagnosis',this._util.current_soap_model.diagnosis,this._util.createNewObject('diagnosis'));

  }
  sendFocusToNextElement(position: any) {
    this._util.getFocusOnNextElement(this.diagnosisDropDownSuggestion, this.diagnosisChipsSuggestion, position, 'diag_');
    this.diagnosisDropDownSuggestion = [];
    this.diagnosisChipsSuggestion=[];
  }

}
