import { AfterViewInit, Component, Input, OnInit, Output, EventEmitter, NgZone } from "@angular/core";
import { UtilityService } from "../../services/utility.service";
import { RestService } from "../../services/rest.service";
import { Router } from "@angular/router";
import { Constants } from "../../Utilities/Constants";
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  page_name=Constants.PAGE_NAME.PATIENT_LIST+'$list_component';
  @Input() isProcessing:any;
    @Input() patientList: any;
    @Input() selectedIndex: any; // 0 for 'open-consultations' and 1 for 'done-consultations'
    removing = 0;
    searchTerm = '';

    backedupList = [];

    constructor(public _util: UtilityService,
                public _rest: RestService,
                private route: Router,
                public snackBar: MatSnackBar,
                private _zone: NgZone
    ) {
    }

    ngOnInit() {
      this._util.start_trace_log(this.page_name,'ngOnInit()','ngOnInit() starts',{});
        this._util.getDataProviders().subscribe(result => {
            if (result.type === 'search' && result.path === '/patient-list') {
                // console.log('Result value changed: ', result.value.length, this.searchTerm.length, this.backedupList.length);
                if (!this.searchTerm.length && !result.value.length) this.backedupList = this.patientList;
                // else if (!result.value.length && this.searchTerm.length) this.patientList = this.backedupList;
                else {
                    if (result.value.length) {
                        this.patientList = this.patientList.sort((x, y) => {
                            if (x.patient.name.toLowerCase().indexOf(this.searchTerm) === 0) return -1;
                            if (y.patient.name.toLowerCase().indexOf(this.searchTerm) === 0) return 1;

                            return 0;
                        });
                    }
                }

                if (!result.value.length) {
                    this.patientList = this.patientList.sort((x, y) => {
                        const xconsultationId = parseInt(x.consultation_id);
                        const yconsultationid = parseInt(y.consultation_id);

                        if (xconsultationId < yconsultationid) return -1;
                        if (xconsultationId > yconsultationid) return 1;

                        return 0;
                    });
                }

                this.searchTerm = result.value.toLowerCase();



            }

            if ((result.type === "updateOpenPatientsListing")
                && result.rows && result.rows.length
                && (result.index == this.selectedIndex)
            ) {
                this._zone.run(() => {
                    this.patientList = result.rows;

                    this._zone.run(() => {});

                    console.log("Zone ran successfully: ", this.patientList);
                });

            }
        });

        this._util.end_trace_log(this.page_name,'ngOnInit()','ngOnInit() ends',{});

    }



    consultationDone(consultation, position, event) {
      this._util.start_trace_log(this.page_name,'consultationDone()','consultationDone() starts',{'consultation':consultation,'position':position,'event':event});


        event.stopPropagation();
        const _this = this;

        this._rest.toggleConsultationDone(consultation.consultation_code, !!this.selectedIndex)
            .subscribe(result => {
                this.patientList.splice(position, 1);
                consultation.done = !this.selectedIndex;
                consultation.position = position;

                this._util.setDataToObservabla({
                    'type': 'addToPatientListing',
                    'data': consultation
                });

                const message = this.selectedIndex ? 'Removed from Done' : 'Marked Done';
                const doneSnackBarRef = this.snackBar.open(message, 'Undo', <MatSnackBarConfig>{duration: 2000});

                doneSnackBarRef.onAction().subscribe(() => {

                    this._rest.toggleConsultationDone(consultation.consultation_code, !this.selectedIndex)
                        .subscribe(result => {
                            consultation.done = this.selectedIndex;
                            this._util.setDataToObservabla({
                                'type': 'addToPatientListing',
                                'data': consultation
                            });

                            this._util.setDataToObservabla({
                                'type': 'removeFromPatientListing',
                                'data': consultation
                            });

                            // this.patientList.splice(position, 0, consultation);
                            this.removing = 0;
                        });

                    this.snackBar.open('Added Back', '', <MatSnackBarConfig>{duration: 2000});
                });
            });

        this.removing = consultation.id;

       this.removeIndexFromLocalConsultations(position,this.selectedIndex);

       this._util.end_trace_log(this.page_name,'consultationDone()','consultationDone() Block Ends');

    }

    redirectToDashboard(consultation,position) {
        // hide search box, event if it have value
        this._util.setDataToObservabla({
            'type': 'hideSearchLayout',
            'data': true
        });

        this._util.setHeaderPatientInfo(consultation);
        this._util.saveLocalData(Constants.KEY_CURRENT_CONSULTATION_POSITION,position);
        // const age = this._util.getTimeDifferenceInYears(consultation.patient.date_of_birth);
        // const gen = consultation.patient.gender.toString().substr(0, 1).toUpperCase();

        // this._util.setHeaderData(
        //     `${consultation.patient.name} ( ${gen}, ${age} yrs ) ` ,
        //     '../../../assets/images/patientpic.png',
        //     'UID: ' + this._util.sentizeUniqueId(consultation.user_login));
        this._util.saveLocalData(Constants.KEY_CURRENT_CONSULTATION, consultation);
        this.route.navigate([Constants.NAVIGATION_URL.dashboard]);
    }

    public newPatientWithSearchString(searchTerm) {
        this.route.navigate([Constants.NAVIGATION_URL.create_patient]).then(() => {
            this._util.setDataToObservabla({
                'type': 'newPatientWithSearchString',
                'data': searchTerm
            });
        });



        this._util.setDataToObservabla({
            'type': "hideSearchLayout",
            'data': true
        });
    }


    removeIndexFromLocalConsultations(position,selectedIndex){
      this._util.start_trace_log(this.page_name,'removeIndexFromLocalConsultations()','removeIndexFromLocalConsultations() starts',{'position':position,'selected_index':selectedIndex});
        if(selectedIndex===0){
         let getLocalConsultationObject=JSON.parse(this._util.getLocalData(Constants.KEY_CONSULTATION_LIST));
          this._util.debug_line_exection(this.page_name,'removeIndexFromLocalConsultations()','Getting Local Consultation Object to delete consultation from position ===>`{position}`',getLocalConsultationObject);
          getLocalConsultationObject.splice(position,1);
          this._util.debug_line_exection(this.page_name,'removeIndexFromLocalConsultations()','Local Consultation Object After delete consultation from position ===>`{position}`',getLocalConsultationObject);


          if(getLocalConsultationObject.length > 0){
            this._util.saveLocalData(Constants.KEY_CONSULTATION_LIST,JSON.stringify(getLocalConsultationObject));
            this._util.debug_line_exection(this.page_name,'removeIndexFromLocalConsultations()','Saving Local Consultation List',getLocalConsultationObject);
          }
          }
          this._util.end_trace_log(this.page_name,'consultationDone()','consultationDone() Block Ends');

        }
}





