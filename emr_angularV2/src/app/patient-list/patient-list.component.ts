import { ScreenDetectorService } from './../services/screen-detector.service';
import { AfterViewInit, Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RestService } from '../services/rest.service';
import { UtilityService } from '../services/utility.service';
import { Constants } from '../Utilities/Constants';
import { Observable } from 'rxjs/index';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/internal/operators';
import {PusherService} from '../services/pusher.service';

@Component({
    selector: 'app-patient-list',
    templateUrl: './patient-list.component.html',
    styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit, OnDestroy {

  pageName=Constants.PAGE_NAME.PATIENT_LIST;
    listRefreshSubscriber: any;
    soapId=[];
    showProgressBar = false;
    server_response = {"done": [], 'open': [], 'available': []};
    pageOpen = 1;
    isToolbarAlreadySet = false;
    pageDone = 1;
    isRequestSentBefore = false;
    @ViewChild('tabGroups') tabGroups;


    constructor ( private _rest: RestService,
                 public _util: UtilityService,
                 private screen_detector: ScreenDetectorService,
                 private zone: NgZone )
    { }


    ngOnInit() {

      this._util.start_trace_log(this.pageName,'ngOnInit','ngOnInit Method Started');

        const getCurrentUser = this._util.getLocalData(Constants.KEY_CURRENT_USER).user;
        this._util.debug_line_exection(this.pageName,'ngOnInit','Getting user from local storage',getCurrentUser);

        let currentImage = getCurrentUser['pic'] || '/assets/images/patientpic.png';
        this._util.setHeaderData(getCurrentUser['name'], currentImage, getCurrentUser['mobile']);

        this._util.debug_line_exection(this.pageName,'ngOnInit','Getting user from local storage',[getCurrentUser['name'], currentImage, getCurrentUser['mobile']]);

        if (this.screen_detector.deviceType.isMobile) {
            // this._util.customizeSideNavOptions(true, ['show_back_button'], [true]);
            this._util.trace_line_exection(this.pageName,'ngOnInit','Detecting Screen Type ==> Mobile',{});
            this.isToolbarAlreadySet = true;
        }
        setTimeout(() => {
            if (!this.isToolbarAlreadySet) {
              this._util.debug_line_exection(this.pageName,'ngOnInit','Setting up toolbar for desktop',{});
                this._util.customizeSideNavOptions(false, null, null);
            } else {
              this._util.debug_line_exection(this.pageName,'ngOnInit','Setting up toolbar for mobile',{});

              this._util.setDataToObservabla({
                    'type': 'adjustToolbar',
                    'request_type': 'create',
                    'current_path': Constants.NAVIGATION_URL.patientList
                });

            }
        }, 250);


        this.listRefreshSubscriber = this._util.getDataProviders().subscribe(row => {
            if (row.type === 'refreshPatientList') {
              this._util.trace_line_exection(this.pageName,'ngOnInit','Refreshing Patient List',{});

              this.refreshPatientListing();
            } else if (row.type === "showPatientConsultations") {
                // console.log("trying to show these consultations: ", row.rows);

                this.zone.run(() => {
                    this.pageOpen = 1;
                    this.server_response.open = row.rows;
                    this.tabGroups.selectedIndex = 0;

                    this._util.setDataToObservabla({
                        type: "updateOpenPatientsListing",
                        rows: this.server_response.open,
                        index: 0,
                    });
                });
            }
        });


        this.fetchConsultations(true, true, this.pageOpen, this.pageDone);
        this._util.customizeSideNavOptions(false, null, null);
        // this._util.customizeSideNavOptions(true, ['doctor_specific_menu_list'], true);

        this._util.getDataProviders().subscribe(result => {
            if (result.type === 'addToPatientListing') {
              this._util.debug_line_exection(this.pageName,'ngOnInit','Adding item to patient list',result.data);

                this.addToPatientListing(result.data);
            }

            if (result.type === 'removeFromPatientListing') {
              this._util.debug_line_exection(this.pageName,'ngOnInit','Removing item to patient list',result.data);
              this.removeFromPatientListing(result.data);
            }
        });

        setTimeout(() => {
            this._util.header_settings.showRefreshButton = true;
        }, 100);


        this._util.end_trace_log(this.pageName,'ngOnInit','ngOnInit Method End');


    }

    ngOnDestroy(): void {
      this._util.start_trace_log(this.pageName,'ngOnDestroy','ngOnDestroy Method Started');



        this.listRefreshSubscriber.unsubscribe();
        this._util.info_line_exection(this.pageName,'ngOnDestroy','Unsubscribing List Refresh Observer',{});

        this._util.header_settings.showRefreshButton = false;
        this._util.info_line_exection(this.pageName,'ngOnDestroy','Setting header refersh button = false',{});

        if (this.screen_detector.deviceType.isMobile) {
            this.isRequestSentBefore = true;
        }


        setTimeout(() => {

            if (this.isRequestSentBefore) {
                this._util.setDataToObservabla({
                    'type': 'adjustToolbar',
                    'request_type': 'destroy',
                    'current_path': Constants.NAVIGATION_URL.patientList
                });
                this._util.info_line_exection(this.pageName,'ngOnDestroy','Sent Broadcast to remove Patient list header',{});
              }
        }, 150);

        this._util.end_trace_log(this.pageName,'ngOnDestroy','ngOnDestroy Method Ends');
    }


    onScrollMore() {
      this._util.start_trace_log(this.pageName,'onScrollMore()','onScrollMore() Method Started');

        if (this.tabGroups.selectedIndex === 0) {
            this.pageOpen++;
            this.fetchConsultations(true, false, this.pageOpen, this.pageDone);
        } else {
            this.pageDone++;
            this.fetchConsultations(false, true, this.pageOpen, this.pageDone);
        }
        this._util.end_trace_log(this.pageName,'onScrollMore()','onScrollMore() Method End');
      }


    fetchConsultations(fetchOpenConsultations, fetchDoneConsultations, pageOpen, pageClose) {

      this._util.start_trace_log(this.pageName,'fetchConsultations()','fetchConsultations() Method Starts',{'open_consultation_array':fetchOpenConsultations,'close_consultation_array':fetchDoneConsultations,'page_number_open':pageOpen,'page_number_close':pageClose});
      this.showProgressBar = true;
      if (fetchOpenConsultations) {

          this._util.saveLocalData(Constants.KEY_CURRENT_PAGE_NO,pageOpen);
          this._util.debug_line_exection(this.pageName,'fetchConsultations()','Fetching Open Consultations',{"pageNo":pageOpen});
            this._rest.getOpenConsultations(pageOpen, this._util.filterByCenterCode, this._util.selectedPatientTags).subscribe(openConsultation => {
                this.showProgressBar = false;
                this._util.debug_line_exection(this.pageName,'fetchConsultations()$getOpenConsultation()','Got Open Consultation List as API Response',openConsultation);

                this.server_response.open.push(
                    ...openConsultation.rows.sort((x, y) => {
                        const xconsultationId = parseInt(x.consultation_id);
                        const yconsultationid = parseInt(y.consultation_id);

                        if (xconsultationId < yconsultationid) return -1;
                        if (xconsultationId > yconsultationid) return 1;

                        return 0;
                    })
                );
                // this._util.global_open_consultations=this.server_response.open;
               this._util.saveLocalData(Constants.KEY_CONSULTATION_LIST,JSON.stringify(this.server_response.open));
              });
        }

        if (fetchDoneConsultations) {
          this._util.debug_line_exection(this.pageName,'fetchConsultations()','Fetching Done Consultations',{"pageNo":pageClose});

          this._rest.getDoneConsultations(pageClose, this._util.filterByCenterCode, this._util.selectedPatientTags).subscribe(doneConsultations => {
              this._util.debug_line_exection(this.pageName,'fetchConsultations()$getOpenConsultation()','Get Open Consultation List as API Response',doneConsultations);

                this.showProgressBar = false;
                this.server_response.done.push(... doneConsultations.rows);

            });
        }

        this._util.end_trace_log(this.pageName,'fetchConsultations()','fetchConsultations() Method Ends',{'open_consultation_array':fetchOpenConsultations,'close_consultation_array':fetchDoneConsultations,'page_number_open':pageOpen,'page_number_close':pageClose});

    }


    showSideNavButtonIfAssistant() {

        return this._util.getLocalData(Constants.KEY_CURRENT_USER).user.type === 'assistant' ? true : false;

    }

    addToPatientListing(consultation) {
      this._util.start_trace_log(this.pageName,'addToPatientListing()','addToPatientListing() Method Starts',{});

        if (consultation.done) {
            this.server_response.done.splice(0, 0, consultation);
        } else {
            this.server_response.open.splice(0, 0, consultation);
            this.addConsultationToLocalStorage(consultation);
        }
        this._util.start_trace_log(this.pageName,
          'addToPatientListing()',
          'addToPatientListing() Method Ends',
          {});

      }

    addConsultationToLocalStorage(consultation){
      try{
      this._util.start_trace_log(this.pageName,'addConsultationToLocalStorage()','addConsultationToLocalStorage() Method Starts',consultation);
      let getLocalConsultationObject=JSON.parse(this._util.getLocalData(Constants.KEY_CONSULTATION_LIST));
      this._util.debug_line_exection(this.pageName,'addConsultationToLocalStorage()','Fetching Local Consultation Object',getLocalConsultationObject);

      this._util.debug_line_exection(this.pageName,'addConsultationToLocalStorage()','Adding Consultation to 0 position',consultation);

      getLocalConsultationObject.splice(0,0,consultation);
      this._util.saveLocalData(Constants.KEY_CONSULTATION_LIST,JSON.stringify(getLocalConsultationObject));
      this._util.debug_line_exection(this.pageName,'addConsultationToLocalStorage()','Saving consultation object to local storage',getLocalConsultationObject);

      this._util.end_trace_log(this.pageName,
        'addConsultationToLocalStorage()',
        'addConsultationToLocalStorage() Method Ends',consultation);

      }catch(err){
            this._util.error_line_exection(this.pageName,'addConsultationToLocalStorage()','Inside the catch block',err);
      }
      }

    removeFromPatientListing(consultation) {
      this._util.start_trace_log(this.pageName,'removeFromPatientListing()','removeFromPatientListing() Method Starts',consultation);

        if (consultation.done) {
          this._util.start_debug_log(this.pageName,'removeFromPatientListing()','Starting Removing item process from open consultation list',{'open_consultation':this.server_response.open,'removing_id':consultation.id});
          this.server_response.open = this.server_response.open.filter(row => consultation.id !== row.id);
          this._util.start_debug_log(this.pageName,'removeFromPatientListing()','Starting Removing item process from open consultation list',{'open_consultation':this.server_response.open});

        } else {
          this._util.start_debug_log(this.pageName,'removeFromPatientListing()','Starting Removing item process from done consultation list',{'done_consultation':this.server_response.done,'removing_id':consultation.id});
          this.server_response.done = this.server_response.done.filter(row => consultation.id !== row.id);
          this._util.start_debug_log(this.pageName,'removeFromPatientListing()','Starting Removing item process from done consultation list',{'done_consultation':this.server_response.open});

        }
        this._util.end_trace_log(this.pageName,
          'removeFromPatientListing()',
          'removeFromPatientListing() Method Ends',consultation);


  }


    refreshPatientListing(){
        this.server_response.open = [];
        this.server_response.done = [];
        this.server_response.available = [];
        this.pageOpen=1;
        this.pageDone=1;
        this.fetchConsultations(true, true, this.pageOpen, this.pageDone);
    }


}
