import { Router } from '@angular/router';
import { ScreenDetectorService } from './../services/screen-detector.service';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { Constants } from '../Utilities/Constants';
import { Observable } from 'rxjs/index';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/internal/operators';
import { RestService } from '../services/rest.service';

@Component({
    selector: 'app-patient-dashboard',
    templateUrl: './patient-dashboard.component.html',
    styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit, OnDestroy, AfterViewInit {


  page_name=Constants.PAGE_NAME.SOAP_DASHBOARD;

    numberOfLocalConsultation=0;

    isComponentAlreadyDestroyed = false;
    isEditPatientMobile = false;
    showProgressBar = false;
    isToolbarSet = false;
    dataProvider:any;


    ngOnDestroy() {
      const method='ngOnDestroy';
      this._util.start_trace_log(this.page_name,method,method+' Function Starts');
      setTimeout(()=>{


        if (!this._util.header_settings.wasMobilePatientHistoryEnabled) {
          this._util.debug_line_exection(this.page_name,method,'Destroying Current Soap',{});

            this._util.customizeSideNavOptions(true, ['patient_specific_toolbar_menu', 'show_back_button'], [false, false]);
            this._util.trace_line_exection(this.page_name,method,'Destroying Patient Specific Toolbar',{});

            this._util.header_settings.dashboard_desktop_menu = false;
            const getCurrentUser = this._util.getLocalData(Constants.KEY_CURRENT_USER).user;

            this._util.setHeaderData(getCurrentUser.name, getCurrentUser.pic || Constants.DEFAULT_PROFILE_PIC, getCurrentUser.mobile);
            this._util.trace_line_exection(this.page_name,method,'Setting Doctor Header Data',{});

            this._util.setDataToObservabla({'type': 'navList', 'emptyList': true});
            this._util.header_settings.mobile_show_previous_visits = false;
            this._util.header_settings.mobile_show_patient_history = false;
            this._util.previousSoapSettings.previousSoapActivated = false;
            this._util.isPreviousSoapCurrentlyActivated = false;
            this._util.header_settings.show_patient_history_panel = false;
            this._util.header_settings.patient_previous_visit_layout = false;
            this._util.header_settings.wasMobilePatientHistoryEnabled = false;



            this._util.trace_line_exection(this.page_name,method,'Marking Few Data Item False',
            {
              'header_settings.mobile_show_previous_visits':this._util.header_settings.mobile_show_previous_visits,
              '_util.header_settings.mobile_show_patient_history':this._util.header_settings.mobile_show_patient_history,
              '_util.previousSoapSettings.previousSoapActivated':this._util.previousSoapSettings.previousSoapActivated,
              '_util.isPreviousSoapCurrentlyActivated':this._util.isPreviousSoapCurrentlyActivated,
              '_util.header_settings.show_patient_history_panel':this._util.header_settings.show_patient_history_panel,
              '_util.header_settings.patient_previous_visit_layout':this._util.header_settings.patient_previous_visit_layout,
              '_util.header_settings.wasMobilePatientHistoryEnabled':this._util.header_settings.wasMobilePatientHistoryEnabled

            });


            this._util.saveLocalData(Constants.KEY_PREVIOUS_SOAP_ID, 0);
            this._util.trace_line_exection(this.page_name,method,'Setting Previous Soap Id == 0',
           {});


            this._util.current_soap_model = this._util.default_soap_model;
            this._util.trace_line_exection(this.page_name,method,'Setting Current soap model to default',{});

            this._util.consultationNavigationButtonSetting.isNextConsultationVisible=true;



                if (this.screen_detector.deviceType.isMobile) {
                    this.isComponentAlreadyDestroyed = true;
                }



            setTimeout(() => {
                if (this.isComponentAlreadyDestroyed) {
                    this._util.setDataToObservabla({
                        'type': 'adjustToolbar',
                        'request_type': 'destroy',
                        'current_path': Constants.NAVIGATION_URL.dashboard
                    });
                }

            }, 200);
        }
      },150);

      try{
        this.dataProvider.unsubscribe();
  }catch(err){
  }


  this._util.end_trace_log(this.page_name,method,method+' Function end');
    }

    ngAfterViewInit(): void {
      const method='ngAfterViewInit()';
      this._util.start_trace_log(this.page_name,method,method+' function starts');

        if (!this._util.header_settings.wasMobilePatientHistoryEnabled) {

                if (this.screen_detector.deviceType.isMobile) {
                    // this._util.customizeSideNavOptions(true, ['show_back_button'], [true]);
                    this.isToolbarSet = true;
                    this.isEditPatientMobile = true;
                }
            setTimeout(() => {
                if (!this.isToolbarSet) {
                    this._util.customizeSideNavOptions(false, null, null);
                    this._util.customizeSideNavOptions(true, ['patient_specific_toolbar_menu', 'dashboard_desktop_menu'], [true, true]);
                } else {
                    this._util.setDataToObservabla({
                        'type': 'adjustToolbar',
                        'request_type': 'create',
                        'current_path': Constants.NAVIGATION_URL.dashboard
                    });

                }
            }, 250);
            // this.showBackwardNavigationButton();
          }


          this._util.end_trace_log(this.page_name,method,method+' function ends');
    }

    constructor(public router:Router,public _util: UtilityService, private screen_detector: ScreenDetectorService, private _rest: RestService) {


    }

    ngOnInit() {
        const method='ngOnInit()';
      this._util.start_trace_log(this.page_name,method,method+' function starts');

       this.dataProvider= this._util.getDataProviders().subscribe(result => {

        this._util.debug_line_exection(this.page_name,method,'Receiving Broadcast',{'data':result});
        if(result.type==='navigateConsultation'){
           if(result.forward){
            this.navigateConsultation(result.forward);
          }
          }else if(result.type==='dashboard_mark_consultation_done'){
                this.markConsultationDone(this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION).consultation_code,false);

          }else if (result.type === 'scrollToComponent') {

              setTimeout(()=>{
                let el = document.getElementById(result.data);
                if (el) el.scrollIntoView({behavior: 'smooth'});

              },200);
            }
            if (result.type === 'showPreviousSoap') {
                this._util.saveLocalData(Constants.KEY_PREVIOUS_SOAP_ID, result.data.id);
                this._util.isPreviousSoapCurrentlyActivated = true;
                // this._util.saveLocalData(Constants.KEY_CURRENT_SOAP, this._util.current_soap_model);
                // @ts-ignore
                this._util.current_soap_model = {};
                this.fun_fetchExistingSoap(result.data, false);
            } else if (result.type === 'finishPreview') {
                this._util.saveLocalData(Constants.KEY_PREVIOUS_SOAP_ID, 0);
                this.createOrViewSoap(null);
            }

            if (result.type === 'showSoapFromNotifcation') {

                if ( ! result.data ) return;

                this._util.setHeaderPatientInfo(result.data);
                this._util.saveLocalData(Constants.KEY_CURRENT_CONSULTATION_POSITION, -1);
                this._util.saveLocalData(Constants.KEY_CURRENT_CONSULTATION, result.data);
                this._util.saveLocalData(Constants.KEY_PATIENT_ID, result.data.patient.id);

                this.createOrViewSoap(result.data);

                setTimeout(() => { this._util.setDataToObservabla({type: "openSoapRefreshed", data: result.data}) }, 1);
            }

            if (result.type === "updateCurrentSoapVitalsIfOpen") {
                const currentConsultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);

                if (result.data.consultation_code
                    && (result.data.consultation_code == currentConsultation.consultation_code)
                    && (currentConsultation.soap_id == this._util.current_soap_model.id)
                ) {
                    const vitalsIndex = 1;
                    this._util.soap_chips[vitalsIndex]["isUsed"] = true;
                    this._util.component_mapingWithChips.push("vitals");
                    this._util.current_soap_model.vitals = this._util.createNewObject('vitals', false, false)

                    this._util.current_soap_model.vitals = result.data.vitals;
                    // this.showComponenetBasedOnChips(0, true);
                } 
            }

            if ( result.type === "updateCurrentSoapIfOpen") {
              const currentConsultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);

              if (result.data.consultation_code
                  && (result.data.consultation_code == currentConsultation.consultation_code)
                  && (currentConsultation.soap_id == this._util.current_soap_model.id)
              ) {
                this.updateCurrentSoapWithNotificationData(result.data);
              }
            }
        });

        if (!this._util.isPreviousSoapCurrentlyActivated) {
            this.initComponents();
        }

        this._util.end_trace_log(this.page_name,method,method+' function ends');

    }


    initComponents() {

        this.createOrViewSoap(null);
        //this.processNextConsultation();
    }

    public updateCurrentSoapWithNotificationData(data) {
      console.log("Update current soap with notification information: ", data);
      if ( data["medication"] && data["medication"].length) {
        const medicationChipIndex = this.getChipIndex('medication');
        const medicationChip = this._util.soap_chips[medicationChipIndex];
        if ( ! medicationChip.isUsed) {
          this._util.soap_chips[medicationChipIndex]["isUsed"] = true;
          this._util.component_mapingWithChips.push("medication");
        }

        this._util.current_soap_model.medication = data["medication"].map( row => {
          if ( ! row["drug_name"]) return this._util.createNewObject('medications');
          return row;
        });
      }

      if ( data["observations"] && data["observations"].length) {
        const clinicalNotesChipIndex = this.getChipIndex('clinical_notes');
        const clinicalNotesChip = this._util.soap_chips[clinicalNotesChipIndex];
        if ( ! clinicalNotesChip.isUsed) {
          this._util.soap_chips[clinicalNotesChipIndex]["isUsed"] = true;
          this._util.component_mapingWithChips.push("clinical_notes");

          // @ts-ignore
          this._util.current_soap_model.clinical_notes = this._util.createNewObject('clinical_notes');
        }

        this._util.current_soap_model.clinical_notes.key_observation = data["observations"];
      }

      if ( (data["remarks"] && data["remarks"].length) || (data["followUp"] && data["followUp"].length)) {
        const remarksChipIndex = this.getChipIndex('remark-follow-up');
        const remarksChip = this._util.soap_chips[remarksChipIndex];
        if ( ! remarksChip.isUsed) {
          this._util.soap_chips[remarksChipIndex]["isUsed"] = true;
          this._util.component_mapingWithChips.push("remark-follow-up");
        }

        if ( data["remarks"] && data["remarks"].length)
          this._util.current_soap_model.remark = data["remarks"];
        if ( data["followUp"] && data["followUp"].length)
          this._util.current_soap_model.follow_up = data["followUp"];
      }

      console.log("current soap model: ", this._util.current_soap_model);
    }

    private getChipIndex(componentName) {
      return this._util.soap_chips.indexOf(
          this._util.soap_chips.filter(row => row.component == componentName)[0]
        );
    }

    public createOrViewSoap(consultationObject = null) {

      const method='createOrViewSoap()';
      this._util.start_trace_log(this.page_name,method,method+' function starts');

      this._util.debug_line_exection(this.page_name,method,'Method started with consultation object',{'data':consultationObject});


        let currentConsultationObject = null;
        if (!consultationObject) {
            currentConsultationObject = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);
            this._util.debug_line_exection(this.page_name,method,'function dont have any consultation object',
            {'data':{'currentConsultationObject':currentConsultationObject}});

        } else {
            currentConsultationObject = consultationObject;
            this._util.debug_line_exection(this.page_name,method,'function already have consultation object',
            {'data':{'currentConsultationObject':currentConsultationObject}});
          }

        if (currentConsultationObject
            && currentConsultationObject.moreVideoUrls
            && currentConsultationObject.moreVideoUrls.length)
            this._util.setDataToObservabla({
                type: "videoCallUrls",
                data: currentConsultationObject.moreVideoUrls
            });
        else this._util.setDataToObservabla({
            type: "videoCallUrls",
            data: []
        });

        if (!currentConsultationObject.soap_id) {
          this._util.trace_line_exection(this.page_name,method,'No Soap id found Creating a new one',{});
            this._util.soap_chips.forEach((result) => {
                result.isUsed = false;
            });
            this._util.trace_line_exection(this.page_name,method,'Reset All Chips',{});

            this._rest.createSoapNote({'id': currentConsultationObject.id}).subscribe(result => {
                currentConsultationObject.soap_id = result.soap.id;
                this._util.saveLocalData(Constants.KEY_CURRENT_CONSULTATION, currentConsultationObject);
                this._util.trace_line_exection(this.page_name,method,'Created Soap With Id ',{'data':{'currntConsultationObject':result}});

              });
            this._util.component_mapingWithChips = [];
            this.showComponenetBasedOnChips(0, false);
        } else {
          this._util.trace_line_exection(this.page_name,method,'Consultation with soap id ',{'data':{'soap_id':currentConsultationObject.soap_id}});

            this.showProgressBar = true;
            this._rest.getSoapById(currentConsultationObject.soap_id).subscribe(result => {
                this.showProgressBar = false;
                this.fun_fetchExistingSoap(result.soap, true);

                if (result.count)
                    this._util.setDataToObservabla({
                        type: "updateCurrentPatientsSoapCount",
                        data: parseInt(result.count),
                    })
            });
        }

        this._util.end_trace_log(this.page_name,method,method+' function end');
    }

    private fun_fetchExistingSoap(soap, needToAddNewRow) {

        const method='fun_fetchExistingSoap()';
        this._util.start_trace_log(this.page_name,method,method+' function starts');
        this._util.debug_line_exection(this.page_name,method,'Initial Values to the function',{'data':{'soap':soap,'needToAddNewRow':needToAddNewRow}});


        let getAllKeys = [];
        for (let index = 0; index < this._util.soap_chips.length; index++) {
            this._util.soap_chips[index].isUsed = false;
        }
        this._util.debug_line_exection(this.page_name,method,'Settng isUsed=false to all chips',{'data':this._util.soap_chips});

        this._util.removeSoapVsLocalSoap(soap, needToAddNewRow);

        for (let key in this._util.current_soap_model) {

            if (this._util.current_soap_model[key] && this._util.current_soap_model[key].length > 0 && key !== 'remark' && key !== 'follow_up') {

              getAllKeys.push(key);
              // @ts-ignore
            } else if (key === 'vitals' && this._util.current_soap_model.vitals && this._util.current_soap_model.vitals['id'] > 0) {
                getAllKeys.push(key);
            } else if (key === 'remark' && this._util.current_soap_model.remark && this._util.current_soap_model.remark !== '') {
                getAllKeys.push('remark-follow-up');
            } else if ((key === "personal_history") && this._util.current_soap_model.personal_history && (this._util.current_soap_model.personal_history['id'] > 0)) {
                getAllKeys.push(key);
            } else if ((key === "clinical_notes") && this._util.current_soap_model.clinical_notes && (this._util.current_soap_model.clinical_notes['id'] > 0)) {
                getAllKeys.push(key);

            } else if(key==='follow_up' && this._util.current_soap_model.follow_up && this._util.current_soap_model.follow_up!=='') {
              let isRemarksExistsBefore=false;
              for(let index=0;index<getAllKeys.length;index++){
                if(getAllKeys[index]==='remark-follow-up'){
                 isRemarksExistsBefore=true;
                  break;
                }
              }

              if(!isRemarksExistsBefore){
                getAllKeys.push('remark-follow-up');
              }

            }
        }
        //

        this._util.debug_line_exection(this.page_name,method,'pushing all sections keys according to server response',{'data':{'allKey':getAllKeys}});

        this.showComponenetBasedOnChips(0, true, getAllKeys);
        this._util.setDataToObservabla({
            "type": "updateVitalsKeys",
            "data": soap.id
        });

        this._util.end_trace_log(this.page_name,method,method+' function ends');

    }

    showComponenetBasedOnChips(position, isFromApi = false, arr_keysName = ['', '']) {
      const method='showComponenetBasedOnChips()';
      this._util.start_trace_log(this.page_name,method,method+' Funcation Starts');
      this._util.debug_line_exection(this.page_name,method,'Initials Values assign to function',{
        'data':{'position':position,
      'isFromApi':isFromApi,
    'arr_key_name':arr_keysName}});


        const chip = this._util.soap_chips[position];
      switch (chip.component) {
          case 'vitals':
              this.addVitalsFromPreviousSoap();
              break;
          default: break;
      }


        if (!isFromApi) {
          this._util.debug_line_exection(this.page_name,method,'isFrom Api == false',{});

            this._util.component_mapingWithChips.push(this._util.soap_chips[position].component);
            this._util.updateObjectOnChipsClick(false, this._util.soap_chips[position].component);
            this._util.soap_chips[position].isUsed = true;
            this.addNewNavListItem(
                true,
                this._util.soap_chips[position].name,
                this._util.soap_chips[position].component,
                this._util.soap_chips[position].icon
            );
            this._util.resetAllChips();
            this._util.highlightChips(false, this._util.soap_chips[position].component);
        } else {
          this._util.debug_line_exection(this.page_name,method,'isFrom Api == true',{});

            let keyName = '';
            this._util.component_mapingWithChips = [];
            arr_keysName.forEach((row) => {
                this._util.component_mapingWithChips.push(row);
                // @ts-ignore
                this._util.soap_chips.forEach((result) => {
                    if (result.component === row) {
                        result.isUsed = true;
                        keyName = result.component;
                    }
                });
            });
            if (keyName !== '') {
                this._util.resetAllChips();
                if (!this._util.highlightChips(true, keyName)) {
                    this._util.highlightChips(false, keyName);
                }
            }
            this.addNewNavListItem(false, 0, 0);
        }

        // to focus on next element, only if user clicked
        if (! isFromApi) {
            setTimeout(() => {

                let elementToFocus = null;
                let querySelector = '';
                switch (position) {
                    case 0: querySelector = 'input.a-chief-complaint-input-field'; break;
                    case 1: querySelector = 'input.a-vital-input-field'; break;
                    case 2: querySelector = 'input.a-diagnosis-input-field'; break;
                    case 3: querySelector = 'input.a-medicine-input-field'; break;
                    case 4: querySelector = 'input.a-investigation-input-field'; break;
                    case 5: querySelector = 'input.a-remark-input-field'; break;
                    case 6: querySelector = 'input.a-examination-input-field'; break;
                    case 7: querySelector = 'input.a-referral-input-field'; break;
                    case 8: querySelector = 'input.a-procedure-input-field'; break;
                    case 9: querySelector = 'input.a-result-input-field'; break;
                    case 11: querySelector = 'input.a-clinical-note-input-field'; break;
                    default: break;
                }

                if (querySelector.length) {
                    elementToFocus = document.querySelectorAll(querySelector).item(0);
                }

                if (elementToFocus) {
                    setTimeout(() => elementToFocus.focus(), 200);
                }
            }, 200);
        }

      this._util.end_trace_log(this.page_name,method,method+' Funcation Ends');


    }


    private addNewNavListItem(isSingle, item_name, item_component, icon = '') {
      const method='addNewNavListItem()';
      this._util.start_trace_log(this.page_name,method,method+' function starts');
        let object = {};
        if (!isSingle) {
            this._util.component_mapingWithChips.forEach((result) => {

                switch (result) {
                    case 'chief_complaints':
                        object = this._util.createSideNavOption('Chief Complaint', 'chief_complaint', 'chief_complaints');
                        break;
                    case 'examinations':
                        object = this._util.createSideNavOption('Notes', 'examination', 'examinations');
                        break;
                    case 'vitals':
                        object = this._util.createSideNavOption('Vital Signs', 'vitals', 'vitals');
                        break;
                    case 'clinical_notes':
                        object = this._util.createSideNavOption('Examinations', 'clinical_notes', 'clinical_notes');
                        break;
                    case 'diagnosis':
                        object = this._util.createSideNavOption('Diagnosis', 'diagnosis', 'diagnosis');
                        break;
                    case 'medication':
                        object = this._util.createSideNavOption('Medicines', 'medicine', 'medication');
                        break;
                    case 'investigation':
                        object = this._util.createSideNavOption('Investigations', 'investigations', 'investigation');
                        break;
                    case 'referrals':
                        object = this._util.createSideNavOption('Referrals', 'referral', 'referrals');
                        break;
                    case 'procedures':
                        object = this._util.createSideNavOption('Procedures', 'procedures', 'procedures');
                        break;
                    case 'results':
                        object = this._util.createSideNavOption('Results', 'results', 'results');
                        break;
                    case 'attachments':
                        object = this._util.createSideNavOption('Attachments', 'attachment', 'attachments');
                        break;
                    case 'remark-follow-up':
                        object = this._util.createSideNavOption('Remarks', 'advice', 'remark-follow-up');
                        break;
                    case 'personal_history':
                        object = this._util.createSideNavOption('Personal History', 'personal_history', 'personal_history');
                        break;

                }
                this._util.debug_line_exection(this.page_name,method,'making side nav item from soap api ',
                {'data':object});

                this._util.setDataToObservabla({'type': 'navList', 'data': object});
            });

        } else {
            object = this._util.createSideNavOption(item_name, icon, item_component);
            this._util.debug_line_exection(this.page_name,method,'making side nav from chips click',{'data':object});
            this._util.setDataToObservabla({'type': 'navList', 'data': object});
        }

        this._util.end_trace_log(this.page_name,method,method+' function end');

    }
    private addVitalsFromPreviousSoap() {
        const soap = this._util.current_soap_model.id;
        this._rest.getPreviousSoapVitals(soap)
            .subscribe( resp => {
                if (! resp.success) return;

                ['Weight (kg)', 'Height(ft)', 'Height(in)'].forEach( key => {
                    this._util.current_soap_model.vitals['vital_information'][key] = resp.vitals['vital_information'][key];
                });
            });
    }

    public markConsultationDone(consultation_code,isDone){
      this._util.showSnackBar('Please Wait..','',false,2000);

    this._util.getRestObject().toggleConsultationDone(consultation_code,isDone).subscribe(result=>{
      if(result['success']===1){
        this._util.showSnackBar('Consultation marked as done.','',false,4000);
        // this.router.navigate([Constants.NAVIGATION_URL.patientList]);
      }
    });

    }


    public navigateConsultation(isForwardNext){
      const method='navigateConsultation()';
      this._util.start_trace_log(this.page_name,method,method+' Function starts');
      let getAllSavedConsultations=null;

      try{
        getAllSavedConsultations=JSON.parse(this._util.getLocalData(Constants.KEY_CONSULTATION_LIST));
        this._util.debug_line_exection(this.page_name,method,'Saved Consultations in local storage',{'data':getAllSavedConsultations});
        let objectPosition=this.getIndexOfCurrentConsultationObject(getAllSavedConsultations);
        // Delete current position of index
        // Code can break if location = 0
        // Need to test
        // getAllSavedConsultations.splice(objectPosition,1);

        // if(!isForwardNext){
        //   if(objectPosition){
        //     objectPosition--;
        //       this._util.consultationNavigationButtonSetting.isNextConsultationVisible=true;
        //   }
        //   else{
        //     this.showBackwardNavigationButton();
        //   }
        // }else{
          // objectPosition++;

            let get_current_consultation_code=this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION).consultation_code;

           this.markConsultationDone(get_current_consultation_code,false);
           this._util.debug_line_exection(this.page_name,method,'Deleting Consultation from position',{'data':objectPosition});

           getAllSavedConsultations.splice(objectPosition,1);

         this._util.saveLocalData(Constants.KEY_CONSULTATION_LIST,JSON.stringify(getAllSavedConsultations));
         if(objectPosition>= this.numberOfLocalConsultation-2){
            //let currentConsultationPage=this._util.getLocalData(Constants.KEY_CURRENT_PAGE_NO);
            //currentConsultationPage++;

            this._util.debug_line_exection(this.page_name,method,'This is last consultation, initiating request to fetch next consultations',{});

            this._util.consultationNavigationButtonSetting.isNextConsultationVisible=false;
            this._util.getRestObject().getOpenConsultations(1).subscribe(result=>{


              result['rows']=result['rows'].filter((row)=>{
               return row.soap_id!==this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION).soap_id;
              });

              if(result['rows'].length > 0)
                {

                  this._util.debug_line_exection(this.page_name,method,'Found more consultations. Saving it to local storage',{'data':result['rows']});

                  getAllSavedConsultations.push(...result['rows']);
                  this._util.saveLocalData(Constants.KEY_CONSULTATION_LIST,JSON.stringify(getAllSavedConsultations));
                  this._util.consultationNavigationButtonSetting.isNextConsultationVisible=true;
                }
                else {
                  this._util.debug_line_exection(this.page_name,method,'No More consultations found. Hide the Next consultation button',{});

                  this._util.consultationNavigationButtonSetting.isNextConsultationVisible=false;

                }
            });
          // }
          this._util.saveLocalData(Constants.KEY_CURRENT_CONSULTATION_POSITION,objectPosition);
          this._util.trace_line_exection(this.page_name,method,'Current Position of the consultation',{'data':objectPosition});
        }


        this._util.saveLocalData(Constants.KEY_CURRENT_CONSULTATION,getAllSavedConsultations[objectPosition]);
        this._util.setHeaderPatientInfo(this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION));
        this.createOrViewSoap(null);

    }catch(err){
        this._util.error_line_exection(this.page_name,method,'Inside Catch Block',err);
    }
    this._util.end_trace_log(this.page_name,method,method+' function ends');
  }



    getIndexOfCurrentConsultationObject(objectList){
      const method='getIndexOfCurrentConsultationObject()';
      this._util.start_trace_log(this.page_name,method,method+' function starts');
      let currentPositionOfConsultation=0;

      this.numberOfLocalConsultation=objectList.length;
      this._util.debug_line_exection(this.page_name,method,' No of local consultations',{'data':this.numberOfLocalConsultation});

      let currentConsultationObject=this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);
      this._util.debug_line_exection(this.page_name,method,' No of local consultations',{'data':this.numberOfLocalConsultation});

      for(let index=0;index<objectList.length;index++){
          if(objectList[index]['consultation_code']===currentConsultationObject['consultation_code']){
              currentPositionOfConsultation=index;
              break;
          }
      }
      this._util.debug_line_exection(this.page_name,method,'found consultation at position',{'data':currentPositionOfConsultation});

      this._util.end_trace_log(this.page_name,method,method+' function end');

      return currentPositionOfConsultation;
    }


    showBackwardNavigationButton(){
      if(!this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION_POSITION)){
        this._util.consultationNavigationButtonSetting.isPreviousConsultationVisible=false;
      }else{
        this._util.consultationNavigationButtonSetting.isPreviousConsultationVisible=true;

      }
    }
    removeConsultationFromLocal(position){

       }
}
