import {Component, OnInit} from "@angular/core";
import {SoapRowOperations} from "../../SoapRowOperations";
import {UtilityService} from "../../services/utility.service";
import {Constants} from "../../Utilities/Constants";

@Component({
  selector: 'app-procedures',
  templateUrl: './procedures.component.html',
  styleUrls: ['./procedures.component.css']
})
export class ProceduresComponent implements OnInit, SoapRowOperations {

page_name=Constants.PAGE_NAME.SOAP_DASHBOARD+'$Procedure';
    public procedureSuggestion = [];
  addNewRow(isUpdate, position, isBlankRow, event) {
    this._util.start_trace_log(this.page_name,'addNewRow()','addNewRow() function starts');
      if(this._util.current_soap_model.procedures[position].term_text!==''){
      this._util.addNewRow(this._util.createNewObject('procedure'), this._util.current_soap_model.procedures, position, true, 'procedures').then(result=>{
      });
    }
    this._util.end_trace_log(this.page_name,'addNewRow()','addNewRow() function end');
  }

  deleteRow(position) {
    this._util.deleteCurrentRow(
        'procedures',
        this._util.current_soap_model.procedures,
        position,
        this._util.current_soap_model.id
    ).then(result => {
    });
  }

  refillCurrentItem(position, object,event) {
  }

  deleteSection() {
    this._util.deleteSection('procedures');
  }

  constructor(public _util: UtilityService) {
  }

  ngOnInit() {
  }

  addNextRow() {
    this._util.addNextRowIfNotExists('procedures',this._util.current_soap_model.procedures,this._util.createNewObject('procedure'));

  }
  sendFocusToNextElement(position: any) {
    this._util.getFocusOnNextElement([], [], position, 'proc_');
  }

    /**
     * Gets the search text from inputbox, makes an ajax request to fetch similar terms
     * then udpates the suggestions array.
     *
     * @param searchQuery
     * @param position
     */
    showTermsSuggestions(searchQuery, position) {

        this._util.start_trace_log(this.page_name,'showTermsSuggestions()','showTermsSuggestions() function start',{'data':{'term':searchQuery,'position':position}});
        this._util.getRestObject().getTermsSuggestions({
            "type": "procedures",
            "term": searchQuery
        }).subscribe(row => {
            this.procedureSuggestion = row.data;
            this._util.current_soap_model.procedures[position].showSuggestion = this.procedureSuggestion.length > 0;
        });

        this._util.end_trace_log(this.page_name,'showTermsSuggestions()','showTermsSuggestions() function ends',{});
    }

    /**
     * when user selects any suggestion, from dropdown,
     * selected suggestion's text should be updated in the original input field
     *
     * @param suggestion
     * @param position
     * @param event
     */
    selectSuggestion(suggestion, position, event) {
        this._util.current_soap_model.procedures[position].term_text = suggestion.term_text;
        this._util.current_soap_model.procedures[position].term_id = suggestion.id;
        this.procedureSuggestion = [];
        this._util.current_soap_model.procedures[position].showSuggestion = this.procedureSuggestion.length > 0;
    }

}
