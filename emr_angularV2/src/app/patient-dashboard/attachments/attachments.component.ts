import {Component, OnInit} from "@angular/core";
import {SoapRowOperations} from "../../SoapRowOperations";
import {UtilityService} from "../../services/utility.service";
import {Constants} from "../../Utilities/Constants";

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit, SoapRowOperations {


  addNextRow() {
  }
  sendFocusToNextElement(position: any) {
  }

  selectedFile;
  progressImageUpload = false;

  addNewRow(isUpdate, position, isBlankRow, event) {
  }

  deleteRow(position) {
    if(confirm('Do you want to delete?')){
    this._util.deleteCurrentRow('attachments', this._util.current_soap_model.attachments, position, this._util.current_soap_model.id).then(result => {
    });
  }
  }
  refillCurrentItem(position, object,event) {
  }

  showTermsSuggestions(term, position) {
  }

  selectSuggestion(suggestion, position) {
  }

  deleteSection() {
    this._util.deleteSection('attachments');
  }


  constructor(public _util: UtilityService) {
  }

  ngOnInit() {
  }


  onFileSelect(event, position) {
    this.selectedFile = <File>event.target.files[0];
    this.onUploadFile(position);
  }

  onUploadFile(position) {

    const fd = new FormData();
    fd.append('file', this.selectedFile, this.selectedFile.name);
    this.progressImageUpload = true;
    this._util.current_soap_model.attachments[position].processing=true;
    this._util.getRestObject().createAttachment(this._util.current_soap_model.id, 'attachment', fd).subscribe(result => {
      this._util.current_soap_model.attachments[position].url=result.row.url;
      this._util.current_soap_model.attachments[position].id=result.row.id;
      this._util.current_soap_model.attachments[position].processing=false;

      this._util.current_soap_model.attachments[position].isDummy=false;

      this._util.current_soap_model.attachments.push(this._util.createNewObject('attachments'));



    });

  }
}
