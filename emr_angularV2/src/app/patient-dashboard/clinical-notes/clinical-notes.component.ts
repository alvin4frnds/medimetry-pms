import {Component, OnInit} from "@angular/core";
import {SoapRowOperations} from "../../SoapRowOperations";
import {UtilityService} from "../../services/utility.service";
import { Constants } from '../../Utilities/Constants';
import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-clinical-notes',
  templateUrl: './clinical-notes.component.html',
  styleUrls: ['./clinical-notes.component.css']
})
export class ClinicalNotesComponent implements OnInit, SoapRowOperations {

    public id: number;

    constructor(public _util: UtilityService,
        private _rest: RestService) {
    }

  addNextRow() {

  }
  sendFocusToNextElement(position: any) {

  }


  addNewRow(isUpdate, position, isBlankRow, event) {
  }

  deleteRow(position) {
  }

  showTermsSuggestions(term, position) {
  }
  refillCurrentItem(position, object,event) {
  }
  selectSuggestion(suggestion, position) {
  }

  updateValues() {

      this._rest.inserCurrentSoapElement(this._util.current_soap_model.id, "clinical-notes", this._util.current_soap_model.clinical_notes)
          .subscribe(resp => {

              if (resp.row && resp.row['id']) {
                  this.id = resp.row['id'];
                  this._util.current_soap_model.clinical_notes.id = this.id;

              }
          });
  }

  deleteSection() {
    this._util.deleteSection('clinical_notes');
  }

  ngOnInit() {

      if (this._util.current_soap_model.clinical_notes && this._util.current_soap_model.clinical_notes['id'])
          this.id = this._util.current_soap_model.clinical_notes.id;
  }

}
