import {Component, OnInit} from "@angular/core";
import {SoapRowOperations} from "../../SoapRowOperations";
import {UtilityService} from "../../services/utility.service";
import {Constants} from "../../Utilities/Constants";

@Component({
  selector: 'app-examination',
  templateUrl: './examination.component.html',
  styleUrls: ['./examination.component.css']
})
export class ExaminationComponent implements OnInit, SoapRowOperations {

  addNewRow(isUpdate, position, isBlankRow) {
    if(this._util.current_soap_model.examinations[position].remarks!==''){
    this._util.addNewRow(this._util.createNewObject('examination'), this._util.current_soap_model.examinations, position, true, 'examinations').then(result => {

    });
  }
  }

  deleteRow(position) {
    this._util.deleteCurrentRow('examinations', this._util.current_soap_model.examinations, position, this._util.current_soap_model.id).then(result => {
    });
  }

  showTermsSuggestions(term, position) {

  }

  refillCurrentItem(position, object, event) {
  }

  selectSuggestion(suggestion, position) {
  }

  deleteSection() {
    this._util.deleteSection('examinations');
  }

  constructor(public _util: UtilityService) {
  }

  ngOnInit() {
  }

  addNextRow() {
    this._util.addNextRowIfNotExists('examinations',this._util.current_soap_model.examinations,this._util.createNewObject('examination'));

  }
  sendFocusToNextElement(position: any) {
    this._util.getFocusOnNextElement([], [], position, 'exam_');
  }


}
