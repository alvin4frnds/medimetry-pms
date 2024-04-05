import { ScreenDetectorService } from './../../services/screen-detector.service';
import {Component, ElementRef, Inject, OnDestroy, OnInit, Input} from '@angular/core';
import {UtilityService} from '../../services/utility.service';
import {SoapRowOperations} from '../../SoapRowOperations';
import {MatDialog} from '@angular/material';
import {Router} from '@angular/router';
import {RestService} from '../../services/rest.service';
import {DOCUMENT} from '@angular/common';


@Component({
  selector: 'app-chief-complaints',
  templateUrl: './chief-complaints.component.html',
  styleUrls: ['./chief-complaints.component.css'],
})
export class ChiefComplaintsComponent implements OnInit, SoapRowOperations, OnDestroy {

page_name='Chief Complaint';

  @Input() fromDialog:any=false;

  isCurrentModeProcessing=false;

    complaintSuggestions = [];
  attachments = [];
  selectedFile: File = null;
  progressImageUpload = false;

  dataProvider;
  refillCurrentItem(position, object, event) {
  }

  ngOnDestroy(): void {
    this._util.start_trace_log(this.page_name,'ngOnDestroy()','ngOnDestroy() function starts');
    this._util.current_soap_model.chief_complaints = [];
    try{
    this.dataProvider.unsubscribe();
    this._util.trace_line_exection(this.page_name,'ngOnDestroy()','Data provider observer unsubscribed',{});

  }catch(err){
        this._util.error_line_exection(this.page_name,'ngOnDestroy()','Inside catch Block',{'data':err});
    }
    this._util.end_trace_log(this.page_name,'ngOnDestroy()','ngOnDestroy() function ends');
  }


  deleteSection() {

    this._util.deleteSection('chief_complaints');
  }

  sendFocusToNextElement(position){
    this._util.getFocusOnNextElement(this.complaintSuggestions, [], position, 'chief_');
  }
  addNextRow(){
    this._util.start_trace_log(this.page_name,'addNextRow()','addNextRow() starts');
    // this._util.debug_line_exection(this.page_name,'addNextRow()','Adding a new cheif complaint object when consultation is not created',{});
    this._util.addNextRowIfNotExists('chief-complains',this._util.current_soap_model.chief_complaints,this._util.createNewObject('chiefComplaints'));
    // this._util.start_trace_log(this.page_name,'addNextRow()','addNextRow() Ends');

  }

  addNewRow(isUpdate, position, isBlankRow, event) {
    this._util.start_trace_log(this.page_name,'addNewRow()','addNewRow() function starts');
      setTimeout(() => {


    if(this.isCurrentModeProcessing){
      this._util.debug_line_exection(this.page_name,'addNewRow()','Adding New Cheif complaint when consultation is processing',{});
      if(this._util.current_soap_model.chief_complaints[position].complaint!==''){
     // this._util.current_soap_model.chief_complaints.push(this._util.createNewObject('chiefComplaints'))
    this.addNextRow();
    }
    }else{
      this._util.debug_line_exection(this.page_name,'addNewRow()','Adding New Cheif complaint when consultation is created',{});

      if(this._util.current_soap_model.chief_complaints[position].complaint!==''){
    this._util.addNewRow(this._util.createNewObject('chiefComplaints'), this._util.current_soap_model.chief_complaints, position, true, 'chief-complains', this.complaintSuggestions,this.fromDialog).then(result => {
      this.complaintSuggestions = [];
      // this._util.getFocusOnNextElement(this.complaintSuggestions, [], position, 'chief_');
    });
  }
  }
}, 200);

this._util.end_trace_log(this.page_name,'addNewRow()','addNewRow() function ends');

}

  deleteRow(position) {
    this._util.start_trace_log(this.page_name,'deleteRow()','deleteRow() function starts',{'data':{'position':position}});
    let allowToDeleteRow=true;
    if(this._util.current_soap_model.chief_complaints[position].type==='image'){
      if(!confirm('Do you want to delete?')){
        allowToDeleteRow=false;
      }
    }
    if(allowToDeleteRow){
      this._util.debug_line_exection(this.page_name,'deleteRow()','deleting current cheif complaint row',{'data':this._util.current_soap_model.chief_complaints[position]});
    this._util.deleteCurrentRow('chief-complains', this._util.current_soap_model.chief_complaints, position, this._util.current_soap_model.id).then(result => {
    });
  }

  this._util.end_trace_log(this.page_name,'deleteRow()','deleteRow() function end',{});

  }

  showTermsSuggestions(term, position) {
    this._util.start_trace_log(this.page_name,'showTermSuggestions()','showTermSuggestions() function start',{'data':{'term':term,'position':position}});

    if (term.length < 3) return;

    this._util.getRestObject().showSuggestion('cheif-complains', term).subscribe(row => {
      this.complaintSuggestions = row.suggestions;
      if (this.complaintSuggestions.length > 0) {
        this._util.current_soap_model.chief_complaints[position].showSuggestion = true;
      } else {
        this._util.current_soap_model.chief_complaints[position].showSuggestion = false;
      }

    });

    this._util.end_trace_log(this.page_name,'showTermSuggestions()','showTermSuggestions() function ends',{});

  }

  selectSuggestion(suggestion, position, event) {
    const method_name='selectSuggestion()';
    this._util.start_trace_log(this.page_name,method_name,method_name+' Function started',{'data':{'suggestion':suggestion,'position':position,'event':event}});
    if (event.isUserInput) {

      if(this.isCurrentModeProcessing){
        this._util.trace_line_exection(this.page_name,method_name,'Selected suggestion while consultation is processing',{});

        this._util.current_soap_model.chief_complaints[position].id = 0;
        this._util.current_soap_model.chief_complaints[position].complaint = suggestion.term_body;
        this._util.current_soap_model.chief_complaints[position].showProgressBar = false;
        this._util.start_debug_log(this.page_name,method_name,'current cheif complaint object while consultation is created',{'data':this._util.current_soap_model.chief_complaints['position']});
        this.addNewRow(null, null, null, null);
        this._util.trace_line_exection(this.page_name,method_name,'Add new row after selecting consultation from suggestion',{});

        this._util.getFocusOnNextElement(this.complaintSuggestions, [], position, 'chief_');
        this._util.trace_line_exection(this.page_name,method_name,'sending focus to next element',{'data':{'element_id':'chief_'+position}});

      }
        else{
          this._util.trace_line_exection(this.page_name,method_name,'Selected suggestion when consultation was created',{});

          this._util.debug_line_exection(this.page_name,method_name,'Selected suggestion when consultation was created',{'data':suggestion,'position':position,'event':event});
          this._util.selectSuggestion('chief_complaints', suggestion, position);
      }
    }
    this.complaintSuggestions = [];
    this._util.end_trace_log(this.page_name,method_name,method_name+' functio ends');
  }

  constructor(public screen:ScreenDetectorService,public _util: UtilityService, public dialog: MatDialog,
              public route: Router, public _rest: RestService,
              private el: ElementRef, @Inject(DOCUMENT) document) {

  }

  ngOnInit() {

    const method_name='ngOnInit()';

    if(!this.fromDialog){
      this._util.start_trace_log(this.page_name,method_name,'Chief complaint open from patient Listing',{'open_from_dialog':this.fromDialog});
      this._util.debug_line_exection(this.page_name,method_name,'Setting Soap Id to chief complaint section',{'soap_id':this._util.current_soap_model.id});

    }else{
      this._util.start_trace_log(this.page_name,method_name,'Chief complaint open from information wizard',{'open_from_dialog':this.fromDialog});
      this._util.current_soap_model.chief_complaints.push(this._util.createNewObject('chiefComplaints'));
      this._util.debug_line_exection(this.page_name,method_name,'Pushing new blank object to the chief complaint',{'current_chief_complaint_array':this._util.current_soap_model.chief_complaints});

    }


this.dataProvider=this._util.getDataProviders().subscribe(result=>  {
      if  (result.type  === 'consultation_state') {
        if  (result.data  === 'processing') {
          this.isCurrentModeProcessing  = true;

        } else if (result.data  === 'done')  {

          this.isCurrentModeProcessing  = false;
         this.sendUnProcessedRequestOnServer();
        }
      }
});


this._util.end_trace_log(this.page_name,method_name,'ngOnInit () Function ends');
  }


  openTouchPad() {
    this._util.application_data.showCanvas = true;
    this._util.header_settings.wasMobilePatientHistoryEnabled = true;
  }


  onFileSelect(event, position) {
    this.selectedFile = <File>event.target.files[0];
    this.onUploadFile(position);
  }

  onUploadFile(position) {
    let itemIndex=0;
    const fd = new FormData();
    fd.append('file', this.selectedFile, this.selectedFile.name);
    this.progressImageUpload = true;
    this._rest.createAttachment(this._util.current_soap_model.id, 'attachment', fd).subscribe(result => {
      this._util.current_soap_model.chief_complaints.push({
        'id': 0,
        'complaint': result.row.url,
        'remarks': '',
        'processed': false,
        'showProgressBar': true,
        'type': 'image',
      });

      this.progressImageUpload = false;
      let itemIndex=this._util.current_soap_model.chief_complaints.length-1;
      this._rest.inserCurrentSoapElement(this._util.current_soap_model.id, 'chief-complains', {
        'id': 0,
        'complaint': result.row.url,
        'remarks': '',
        'processed': false,
        'showProgressBar': false,
        'type': 'image',
      }).subscribe(result => {
            this._util.current_soap_model.chief_complaints[itemIndex].id=result.row.id;
      });
    });

  }


  sendUnProcessedRequestOnServer(){
    const method_name='sendUnProcessedRequestOnServer()';
    this._util.start_trace_log(this.page_name,method_name,method_name+' function starts');

    for(let index=0;index<this._util.current_soap_model.chief_complaints.length;index++){

      if(this._util.current_soap_model.chief_complaints[index].complaint!=='' && !this._util.current_soap_model.chief_complaints[index].processed){

        this.addNewRow(false,index,false,null);
      }
    }
    this._util.end_trace_log(this.page_name,method_name,method_name+' function end');
  }




}
