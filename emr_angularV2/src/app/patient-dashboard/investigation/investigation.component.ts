import {Component, OnInit, OnDestroy} from "@angular/core";
import {SoapRowOperations} from "../../SoapRowOperations";
import {UtilityService} from "../../services/utility.service";
import {Constants} from "../../Utilities/Constants";

@Component({
  selector: 'app-investigation',
  templateUrl: './investigation.component.html',
  styleUrls: ['./investigation.component.css']
})
export class InvestigationComponent implements OnInit, SoapRowOperations, OnDestroy{


  page_name=Constants.PAGE_NAME.SOAP_DASHBOARD+'$Investigation';

  investigationChipsSuggestion = [];
  investigationDropDown = [];

getProvider=null;
    showStaffMedsOrderLoading: false;
    showStaffMedsOrderLayout = false;

  addNewRow(isUpdate, position, isBlankRow, event) {
    const method='addNewRow()';
    this._util.start_trace_log(this.page_name,method,method+' function starts');
    if((this._util.current_soap_model.investigation[position].category!=='') && (this._util.current_soap_model.investigation[position].term_text!=='')){
    this._util.current_soap_model.investigation[position].showChips = false;
    this._util.trace_line_exection(this.page_name,method,'Adding New investigation Row to soap',{'data':{'postion':position}});

    this._util.addNewRow(this._util.createNewObject('investigations'), this._util.current_soap_model.investigation, position, true, 'investigations').then(result => {

      this.investigationChipsSuggestion = [];
      this.investigationDropDown = [];

      this._util.addNextRowIfNotExists('investigations',this._util.current_soap_model.investigation,this._util.createNewObject('investigations'));
      this._util.getFocusOnNextElement(this.investigationDropDown, this.investigationChipsSuggestion, position, 'inves_');

    });
  }else{
    this._util.showSnackBar('Investigation name or Type is missing','');
  }

      this._util.sendStaffPMSStat('staff-followup-done');

  this._util.end_trace_log(this.page_name,method,method+' function ends');
  }

  deleteRow(position) {

    this._util.start_trace_log(this.page_name,'deleteRow()','deleteRow() function starts',{'data':{'position':position}});
    this._util.deleteCurrentRow('investigations', this._util.current_soap_model.investigation, position, this._util.current_soap_model.id).then(result => {
    });
    this._util.end_trace_log(this.page_name,'deleteRow()','deleteRow() function end',{});

  }

  showTermsSuggestions(term, position) {
    let uniqueSuggestions = [];
    this._util.getRestObject().showSuggestion('investigations', term).subscribe(row => {
      if (row.terms && row.terms.length > 0) {
        this._util.current_soap_model.investigation[position].showChips = true;
        this.investigationChipsSuggestion = row.terms;
      } else {
        this.investigationChipsSuggestion = [];
        this._util.current_soap_model.investigation[position].showChips = false;
      }


      // turning it back ON, since MED-180 Drug DB Change
      this.investigationDropDown = row.matches.filter(suggestion => {
        return uniqueSuggestions.lastIndexOf(suggestion.name.trim().toLowerCase()) > -1 ? false : (uniqueSuggestions.push(suggestion.name.trim().toLowerCase()), suggestion);
      } );
    });

  }

  refillCurrentItem(position, object, event) {
  }


  selectSuggestion(suggestion, position, event, isFromChips) {



    this._util.current_soap_model.investigation[position].category = suggestion.type;
    this._util.current_soap_model.investigation[position].loinc_code = suggestion.id;
    this._util.current_soap_model.investigation[position].term_text = suggestion.name;
    this._util.current_soap_model.investigation[position].showChips = false;
    this.setTypeToCheckbox(suggestion.type, position);

    this.addNewRow(false, position, false, null);
    this.investigationChipsSuggestion = [];
    this.investigationDropDown = [];

    //
    // if (event.isUserInput) {
    //   this._util.selectSuggestion('investigations', suggestion, position, isFromChips);
    // }
  }

  private setTypeToCheckbox(type, position) {
    if (type === 'pathology') {
      this._util.current_soap_model.investigation[position].type_patho = true;
      this._util.current_soap_model.investigation[position].type_radio = false;
    } else {
      this._util.current_soap_model.investigation[position].type_radio = true;
      this._util.current_soap_model.investigation[position].type_patho = false;
    }
  }


  selectSuggestionForInvestigation(suggestion, position) {
    this._util.current_soap_model.investigation[position].loinc_code = suggestion.code;
    this._util.current_soap_model.investigation[position].term_text = suggestion.name;
    this.investigationChipsSuggestion = [];
    this.investigationDropDown = [];
    this._util.current_soap_model.investigation[position].category = suggestion.type;
    this.setTypeToCheckbox(suggestion.type, position);
    this.addNewRow(false, position, false, null);

  }

  setTypeOfInvestigation(type, position, event) {
    this._util.current_soap_model.investigation[position].category = type;
    this.setTypeToCheckbox(type, position);
  }


  deleteSection() {
    if (this.showStaffMedsOrderLayout) {
      this.showStaffMedsOrderLayout = false;
      return;
    }

    this._util.deleteSection('investigation');
  }

  constructor(public _util: UtilityService) {
  }

  ngOnInit() {
  this.getProvider=  this._util.getDataProviders().subscribe(result => {
      if (result.type === 'unprocessed_investigation') {
          this.addNewRow(true, result.data['position'], false, null);
      }

      if (result.type === 'showStaffMedsOrderLayout') {
          this.showStaffMedsOrderLayout = result.data;
      }

      if (result.type === 'showStaffMedsOrderLoading') {
          this.showStaffMedsOrderLoading = result.data;
      }
  });
  }
  addNextRow() {

  }
  sendFocusToNextElement(position: any) {
  }
  ngOnDestroy(): void {
    try{
       this.getProvider.unsubscribe();
    }catch(err){

    }
  }
}
