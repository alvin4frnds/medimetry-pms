import {
    Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, Inject,
    NgZone
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UtilityService } from '../services/utility.service';
import { Router } from '@angular/router';
import { Constants } from '../Utilities/Constants';
import { Location } from '@angular/common';
import {
    MatDialog, MatIconRegistry, MatSidenav, MAT_DIALOG_DATA, MatDialogRef, MatSnackBar,
    MatSnackBarConfig, MatDatepickerModule, MatCalendar, MatCalendarCellCssClasses,
} from '@angular/material';
import { RestService } from '../services/rest.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MediaObserver } from '@angular/flex-layout';
import { ScreenDetectorService } from '../services/screen-detector.service';
import { PusherService } from '../services/pusher.service';
import { CallRecorderService } from '../call-recorder.service';
import { FormControl } from '@angular/forms';
import { Moment } from 'moment';
import * as moment from 'moment';

@Component({
    selector: 'app-navigation-bar',
    templateUrl: './navigation-bar.component.html',
    styleUrls: ['./navigation-bar.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class NavigationBarComponent implements OnInit, AfterViewInit {

    @ViewChild('aPatientSearchInput') searchInputField: ElementRef;
    @ViewChild('appointmentsCalendar') appointmentsCalendar: MatCalendar<Moment>;

    consultationNavigationButtonSetting = { 'isNextConsultationVisible': true, 'isPreviousConsultationVisible': true };
    showPastVisitProgressBar = false;
    currentlyEditingPatientDetails = {};
    isDoctorOnline = false;

    isMobile = false;
    isEditPatientMobile = false;
    isTablet = false;
    getCurrentUser: any;
    header_settings = {};
    completeObjectForHistory = {};
    patientNavList = [];
    searchedPatientList = [];
    progress_consult_again = false;
    micListening = false;

    current_user_type: any;
    searchTerm = '';
    showBackButton = false;
    hideSearchBar = true;
    sideNavStyle = {};
    shouldShowPatientNotesIcons = false;

    videoCallButtonDisable = false;
    videoCallUrls = [];

    header_menu_data = { 'image': '', 'name': '', 'phone': '' };
    user = {};
    notificationsCount = 0;

    save = {
        showText: false,
        text: 'saving ...',
        showLoader: false
    };
    prescriptionButtion = {
        showText: false,
        text: 'loading',
        showLoader: false
    };
    currentPatientsSoapCount = "";
    unfollowedUpSoapCount = "";

    allCenterAddresses: ChannelCenterMenuItem[] = [];
    allPatientTags = [];
    isTestingApp = false;

    showCalender: boolean = false;
    selectedDate: Moment;
    highlightedDates: string[] = [];
    highlightingPatientDates: boolean = false;

    @ViewChild('drawer') leftSideNav: MatSidenav;
    @ViewChild('right') rightSideNav: MatSidenav;

    daysSelected: any[] = [];
    event: any;

    constructor(public screen_detector: ScreenDetectorService,
        public _util: UtilityService,
        private _route: Router,
        private _rest: RestService,
        private location: Location,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private matIconRegistry: MatIconRegistry,
        public media: MediaObserver,
        public _pusher: PusherService,
        public _recorder: CallRecorderService,
        private domSanitizer: DomSanitizer) {
        this.createRequiredSvgIcons();
    }

    ngAfterViewInit(): void {

        setTimeout(() => {
            if (!this.screen_detector.deviceType.isMobile) {
                this.leftSideNav.opened = true;
                this.rightSideNav.opened = true;

            } else {
                this.isEditPatientMobile = true;
            }
        }, 100);

        this.current_user_type = this._util.getLocalData(Constants.KEY_CURRENT_USER) ? this._util.getLocalData(Constants.KEY_CURRENT_USER)['meta']['user']['type'] : false;

        this._pusher.requestPermission();
        this._pusher.connectToPusher();

        setTimeout(() => {
            this._util.notification_types.map(n => n.value).forEach(type => {
                this._pusher.channel.bind(type, data => {
                    console.log("received new notification of type: ", type, data);

                    if (['consultationAssign', 'videoCallRequested'].indexOf(type) > -1)
                        this._util.setDataToObservabla({
                            type: "refreshPatientList",
                            data
                        });

                    this._util.setDataToObservabla({
                        type: "refreshNotificationsListing",
                        data
                    });

                    if (data["type"]
                        && (data.type === "pms-partnerfilledvitals")
                        && data["meta"]
                        && data["meta"]["vitals"]
                    ) {
                        this._util.setDataToObservabla({
                            'type': 'updateCurrentSoapVitalsIfOpen',
                            'data': {
                                "consultation_code": data.consultation_code,
                                "vitals": data["meta"]["vitals"]
                            }
                        });
                    }

                    if (data["type"]
                        && (data.type === "pms-receivedtreatmentplan")
                        && data["meta"]
                        && data["meta"]["historyUid"]
                    ) {
                        this._util.setDataToObservabla({
                            'type': 'updateCurrentSoapIfOpen',
                            'data': {
                                "consultation_code": data.consultation_code,
                                "medication"       : data["meta"]["medication"],
                                "observations"     : data["meta"]["observations"],
                                "followUp"         : data["meta"]["followUp"],
                                "remarks"          : data["meta"]["remarks"]
                            }
                        });
                    }

                    data["isSticky"] = type === "videoCallRequested";

                    this._pusher.generateNotification(data);
                });
            });

        }, 2000);

        // TODO: Remove before commit.
        /* setTimeout(() => {
            this.patientHistoryGeneratorModal(true);
        }, 4000); */
    }


    ngOnInit(): void {
        this._util.getDataProviders().subscribe(result => {
            if (result.type === "hideRightSidebar"
                && this.rightSideNav.opened
                && this.isEditPatientMobile
            ) { this.rightSideNav.toggle(); }

            if (result.type === "updateCurrentPatientsSoapCount") {
                this.currentPatientsSoapCount = (result.data > 1) ? result.data : "";
            }

            if (result.type === "updateUnFollowupedCountBadge") {
                this.unfollowedUpSoapCount = (result.data > 1) ? result.data : "";
            }

            if (result.type === "updateNotificationsCountBadge") {
                this.notificationsCount = result.data;
            }

            if (result.type === "videoCallUrls") {
                this.videoCallUrls = result.data;
            }

            if (result.type === 'closeEditPatientLayout') {
                this._util.header_settings['mobile_show_edit_patient'] = false;
            }

            if (result.type === 'hideSearchLayout') {
                this.hideSearchBar = true;
            }

            if (result.type === 'adjustToolbar') {
                // @ts-ignore
                this.adjustNavigationMenuAccordingToScreen(result.request_type, result.current_path);
            }

            if ( result.type === "highlightCalendarDatesForPatient") {
                this.highlightCalendarDatesForPatient(result.data);
                this.highlightingPatientDates = true;
            }

            if ( (result.type === "clearHighlightCalendarDatesForPatient") && this.highlightingPatientDates) {
                this.highlightCalendarDates(this.selectedDate.clone());
                this.highlightingPatientDates = false;
                this._util.showSnackBar("Showing calendar for all patients");
            }

            if (result.type === 'toggleVoiceLexListening') {
                this.micListening = result.data;
            } else if (result.type === 'navList') {
                if (result.emptyList) {
                    this.patientNavList = [];
                } else {
                    if (!this.checkIfNavListItemExists(result.data.component_name)) {
                        this.patientNavList.push(result.data);
                    }
                }
                this._util.sideNavOption.patientSpecific = this.patientNavList;
            }

            if (result.type === 'header_setting') {
                this.header_settings = this._util.getLocalData(Constants.KEY_HEADER_SETTINGS);
            }

            if ( result.type === "appointment-date-updated") {
                this.selectedDate = result.data;
                this.appointmentsCalendar.activeDate = this.selectedDate;
                this.appointmentsCalendar.selected = this.selectedDate;
                this.appointmentsCalendar._goToDateInView(this.selectedDate, 'month');
            }

            if ( result.type === "open-calendar-for-date") {
                if ( this.showCalender ) return;

                this.highlightCalendarDates(result.data);
                this.openCalender();
            }

            if ( result.type === "select-calendar-date") {
                this.selectCalendarDate(result.data);
            }

            if (result.type === 'firstSendPrescription') {
                this.sendPrescription('sendPrescription', result.data['soapId'])
                    .then(() => {
                        this._rest.sendStaffPMSStats(result.data['soapId'], result.data['type'])
                            .then((resp) => {
                                if (!resp['success']) return;

                                this._util.setDataToObservabla({
                                    type: 'showStaffMedsOrderLoading',
                                    data: false,
                                });
                            });
                    });
            }

            if (result.type === 'header_data') {
                this.header_menu_data = result.data;
            }

        });

        this._util.eventProvider.subscribe(event => {
            if (event.name === "toggleVoiceLexListeningState") {
                this.micListening = event.value;
            }
        });

        this.header_settings = this._util.getLocalData(Constants.KEY_HEADER_SETTINGS);
        this.user = this._util.getLocalData(Constants.KEY_CURRENT_USER).user;
        if (this.user['channels'] && this.user['channels'].length) {
            const haveMultipleChannel = this.user['channels'].length > 1;

            this.user['channels'].forEach(channel => {
                this.user['centers'][channel].forEach(center => {
                    this.allCenterAddresses.push({
                        label: center.name,
                        subLabel: haveMultipleChannel ? channel : "",
                        code: center.code,
                    });
                });
            });

            this.allCenterAddresses = this.allCenterAddresses.sort((a, b) => {
                if (a.label.toLocaleLowerCase() < b.label.toLocaleLowerCase()) return -1;
                if (a.label.toLocaleLowerCase() > b.label.toLocaleLowerCase()) return 1;
                return 0;
            });
        }
        this.getCurrentUser = this.user['type'];

        if (this.getCurrentUser === "contributor")
            this._rest.getDoctorAvailability().subscribe(row => {
                this.isDoctorOnline = row.available && row.available === '1';
            });

        setTimeout(() => {
            if (this.screen_detector.deviceType.isMobile) {
                this._util.header_settings.show_info_on_inner_toolbar = false;
            }
        }, 500);

        if (this._util.getLocalData(Constants.KEY_CURRENT_ENVIRONMENT) === "TESTING") {
            this.isTestingApp = true;
        }

        this.allPatientTags = (this._util.getLocalData(Constants.KEY_PATIENT_TAGS) || "")
            .split(",").map(str => str.trim());

        this._route.setUpLocationChangeListener();
        this._route.events.subscribe(data => {
            if (data['url']) this.shouldShowPatientNotesIcons =
                data['url'] &&
                (data['url'].indexOf(Constants.NAVIGATION_URL.dashboard) > -1);
        });

        this.header_menu_data = this._util.getLocalData(Constants.KEY_HEADER_DATA);

        this.periodicUpdateCurrentUserSettings();
        if ( window.location.href.indexOf('appointment') > -1)
            this.openCalender();
    }

    //========= Calender=========
    openCalender() {
        this.showCalender = !this.showCalender
        /* DEPRECATING THIS IN FAVOR OF FOLLOWING */
        // if ( this.showCalender && ! this.selectedDate) {
        //     this.selectedDate = moment();
        //     this.highlightCalendarDates(this.selectedDate);
        // }

        if (this.showCalender) {
          this.selectedDate ? this.highlightCalendarDates(this.selectedDate) : this.highlightCalendarDates(moment());
          this.selectedDate = this.selectedDate ? null : this.selectedDate;
        }
    }

    getAppointmentDates() {
        // this.highlightedDates = ["2020-06-21"];

        return (date: Moment): MatCalendarCellCssClasses => {
            const today = date.format('YYYY-MM-DD');

            return this.highlightedDates.indexOf(today) > -1 ? 'special-date' : null;
        };
    }

    highlightCalendarDatesForPatient(patient) {
        this._rest.getConsultationsDateForMonth(this.selectedDate.clone(), patient)
            .then( response => {
                if ( ! response["success"]) {
                    this._util.showSnackBar("No appointments found for this patient this month");
                    return;
                } else {
                    this._util.showSnackBar("Appointments for this patient");
                }

                this.highlightedDates = response["dates"];
                this.appointmentsCalendar.updateTodaysDate();
            });
    }

    highlightCalendarDates(date: Moment) {
        this._rest.getConsultationsDateForMonth(date.clone())
            .then( response => {
                if ( ! response["success"]) return;

                this.highlightedDates = response["dates"];
                this.appointmentsCalendar.updateTodaysDate();
            });
    }

    selectedAppointmentCalendarMonth(date: Moment) {
        this.highlightCalendarDates(date);
        this._util.setDataToObservabla({ type: "hideAppointmentDetailMenu" });
    }

    selectCalendarDate(newDate) {
        console.log("newDate: ", newDate);
        // if (!newDate && (window.location.pathname.indexOf("schedule") === -1))
        //     newDate = moment();

        if ( ! newDate) return;

        this.selectedDate = newDate;
        this._util.currentDateForAppointment = this.selectedDate;
        this._util.setDataToObservabla({ type: 'appointmentDateUpdated' });

        this._route.navigate([Constants.NAVIGATION_URL.schedule_Appointment]);
        this._util.setDataToObservabla({ type: "hideAppointmentDetailMenu" });
    }

    isSelected = (event: any) => {
        const date =
            event.getFullYear() +
            "-" +
            ("00" + (event.getMonth() + 1)).slice(-2) +
            "-" +
            ("00" + event.getDate()).slice(-2);
        return this.daysSelected.find(x => x == date) ? "selected" : null;
        this._route.navigate([Constants.NAVIGATION_URL.schedule_Appointment]);
    };

    select(event: any, calendar: any) {
        const date =
            event.getFullYear() +
            "-" +
            ("00" + (event.getMonth() + 1)).slice(-2) +
            "-" +
            ("00" + event.getDate()).slice(-2);
        const index = this.daysSelected.findIndex(x => x == date);
        if (index < 0) this.daysSelected.push(date);
        else this.daysSelected.splice(index, 1);

        calendar.updateTodaysDate();
        this._route.navigate([Constants.NAVIGATION_URL.schedule_Appointment]);
    }
    //========= Calender Ends=========

    navigationToRoute(number) {
        this.previewSoap();

        switch (number) {
            case 0:
                this._route.navigate([Constants.NAVIGATION_URL.patientList]);
                this._util.header_settings.mobile_show_patient_history = false;
                this._util.header_settings.wasMobilePatientHistoryEnabled = false;
                this._util.header_settings.mobile_show_edit_patient = false;
                this._util.header_settings.mobile_show_previous_visits = false;

                this._util.setHeaderData(this.user['name'], this.user['profile_pic'], this.user['mobile']);
                break;
            case 1:
                this._route.navigate([Constants.NAVIGATION_URL.create_patient]);
                break;
            case 2:
                this._route.navigate([Constants.NAVIGATION_URL.myDoctors]);
                break;
        }
        if (this.screen_detector.deviceType.isMobile) {
            this.leftSideNav.close();
        }
    }

    sendDataToChildComponents(action) {
        switch (action) {
            case 'create_patient_search':
                this._util.application_data.show_create_patient_search = !this._util.application_data.show_create_patient_search;
                this._util.setDataToObservabla(this._util.application_data);
                break;
        }
    }

    toggleSearchBar() {
        this.startSearching('');
        this.setChannelCenterForFiltering('');
        this.clearSelectedPatientsTags();

        // following functionality is for mobile only
        if (!this.screen_detector.deviceType.isMobile) return;

        this.hideSearchBar = !this.hideSearchBar;

        // after toggling, add delayed focus on element, if we are not-hiding
        // focus the input field
        if (!this.hideSearchBar) {
            // this.searchInputField.nativeElement.focus();
            setTimeout(() => this.searchInputField.nativeElement.focus(), 360);
        }


        return this.hideSearchBar;
    }

    startSearching(value) {
        this._util.setDataToObservabla({
            'type': 'search',
            'path': this._route.url,
            'value': '' + value,
            'startSearch': true
        });
        if (!value) {
            this.searchTerm = '';
            this.searchedPatientList = [];
            this._util.setDataToObservabla({
                'type': 'refreshPatientList'
            });
        }

        this._rest.searchPatientByName(value, this._util.filterByCenterCode, this._util.selectedPatientTags).subscribe(resp => {
            let patients = [];
            (resp['patients'] || []).forEach(user => patients = patients.concat(user['patients']));

            patients = patients.filter(patient => this.user['channels'].indexOf(patient.channel_name) > -1);

            if (resp.success) {
                this.searchedPatientList = patients;
            }
            return;
        });
    }

    hideIfEmpty(string) {
        if ((this.media.isActive('xs') || this.media.isActive('sm')) && !string.length) {
            this.toggleSearchBar();
        }
    }

    backToPreviousActivity() {
        this.location.back();
        this.hideSearchBar = true;
    }

    viewSelectedPatientsConsultations(patientId) {
        this._rest.getPatientsConsltations(patientId).subscribe(resp => {
            if (!resp['success']) {
                return;
            }

            this._util.setDataToObservabla({
                'type': 'showPatientConsultations',
                'rows': resp['rows']
            });

            // ofcourse this will always be true, just to make sure that remaining functionality doesn't stops
            this._util.getRestObject()
                .fetchPreviousSoap({
                    'except': 0,
                    'patientId': patientId, 'page': 1
                })
                .subscribe(row => {
                    if (row.soaps && row.soaps.length) {
                        this._util.previousSoapObject = row.soaps;
                    }
                });


            if (this._route.url.indexOf("patient-dashboard") > -1) {
                this._util.setDataToObservabla({
                    'type': 'showSoapFromNotifcation',
                    'data': resp['rows'][0],
                });
            }
        });
    }

    async requestPayment() {
        var currentConsultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION) || {};
        var consultationCode = currentConsultation["consultation_code"] || "";

        if (!consultationCode) return alert("Invalid consultation code");

        var resp = await this._rest.requestPayment(consultationCode);

        if (resp["success"]) return this._util.showSnackBar(resp["message"]);
        else return alert(resp["message"]);
    }

    previewSoap(isMarkConsultationDone = false) {
        // const dialogConfig = new MatDialogConfig();
        // dialogConfig.minHeight = '95%';
        // dialogConfig.minWidth = '95%';
        // this.dialog.open(SoapPreviewComponent, dialogConfig);
        // this._util.showSnackBar('Saving Current Soap', '', false);

        this.save = {
            text: 'saving ...',
            showText: true,
            showLoader: true
        };

        let soapId = this._util.current_soap_model.id || (this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION) || {})['soap_id'];
        if (!soapId) return;

        let objectToSendOnServer = this._util.sendCompleteDataToServer();
        this._util.getRestObject().updateCurrentSoap(soapId, objectToSendOnServer).subscribe(result => {
            // this._util.showSnackBar('Soap Saved', '', false);
            this.save = {
                text: 'Saved',
                showText: true,
                showLoader: false
            };

            setTimeout(() => {
                this.save = {
                    text: 'saved !',
                    showText: false,
                    showLoader: false
                };
            }, 4000);
            if (isMarkConsultationDone) {
                this.markConsultationDone(true);
            }
        });
    }

    toggleHistory() {
        this._util.header_settings.show_patient_history_panel = !this._util.header_settings.show_patient_history_panel;
        this._util.header_settings.patient_previous_visit_layout = false;
        this._util.header_settings.mobile_show_edit_patient = false;
        if (this._util.header_settings.show_patient_history_panel) {
            this.getHistoryOfPatient();

        }

    }

    togglePreviousVisitsOfPatient() {
        this.getPreviousSoapList();

        this._util.header_settings.show_patient_history_panel = false;

        this._util.header_settings.mobile_show_edit_patient = false;
        this._util.header_settings.patient_previous_visit_layout = !this._util.header_settings.patient_previous_visit_layout;
    }

    toggleHistoryForMobile() {

        this._util.header_settings.mobile_show_patient_history = !this._util.header_settings.mobile_show_patient_history;
        this._util.header_settings.wasMobilePatientHistoryEnabled = this._util.header_settings.mobile_show_patient_history;
        this._util.header_settings.mobile_show_previous_visits = false;
        this._util.header_settings.mobile_show_edit_patient = false;
        if (this._util.header_settings.mobile_show_patient_history) {
            this.getHistoryOfPatient();

        }
    }

    togglePreviousVisitForMobile() {
        this.getPreviousSoapList();
        this._util.header_settings.mobile_show_previous_visits = !this._util.header_settings.mobile_show_previous_visits;
        this._util.header_settings.mobile_show_patient_history = false;
        this._util.header_settings.mobile_show_edit_patient = false;
        this._util.header_settings.wasMobilePatientHistoryEnabled = this._util.header_settings.mobile_show_previous_visits;
    }

    logoutCurrentUser() {
        this._util.saveLocalData(Constants.KEY_CURRENT_USER, null);
        this._route.navigate([Constants.NAVIGATION_URL.login]);
        this._util.setDataToObservabla({ 'type': 'logout' });
        location.reload();
    }

    moveToListing() {
        if (this.screen_detector.deviceType.isMobile) {
            this.leftSideNav.toggle();
        }
    }

    scrollToComponent(item) {

        this._util.setDataToObservabla({ 'type': 'scrollToComponent', 'data': item.component_name });
        if (this.screen_detector.deviceType.isMobile) {
            this.leftSideNav.close();
        }
    }

    getHistoryOfPatient() {

        let consultationObject = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);

        this._util.setDataToObservabla({ type: "refreshHistory", data: consultationObject });
        return;

    }

    getPreviousSoapList() {
        let patientId = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION).patient.id;

        this.showPastVisitProgressBar = true;
        // let soapId = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION).soap_id;
        this._rest.fetchPreviousSoap({ 'except': 0, 'patientId': patientId, 'page': 1 }).subscribe(row => {
            this._util.previousSoapObject = row.soaps.map(soap => {
                soap['timestamp'] = new Date(soap['created_at']).getTime();
                return soap;
            }).sort((a, b) => {
                if (a.timestamp === b.timestamp) return 0;
                return (a.timestamp < b.timestamp) ? 1 : -1;
            });
            this.showPastVisitProgressBar = false;
        });
    }

    private returnToCurrentState() {
        this._util.previousSoapSettings.previousSoapActivated = false;
        this._util.isPreviousSoapCurrentlyActivated = false;
        this._util.previousSoapSettings.previousSoapId = 0;
        this._util.header_settings.wasMobilePatientHistoryEnabled = false;
        this._util.setDataToObservabla({ 'type': 'navList', 'emptyList': true });
        this._util.setDataToObservabla({ 'type': 'finishPreview' });
        //
        // this._util.current_soap_model = this._util.oldSoapModel;
        //


    }

    markConsultationDone(isPopupEnable = false) {
        this._util.setDataToObservabla({ 'type': 'dashboard_mark_consultation_done', 'pop_up_require': isPopupEnable });
    }

    checkIfNavListItemExists(component) {
        let isExists = false;
        for (let index = 0; index < this.patientNavList.length; index++) {
            if (this.patientNavList[index].component_name === component) {
                isExists = true;
                break;
            }
        }
        return isExists;
    }

    createRequiredSvgIcons() {
        this.matIconRegistry.addSvgIcon(
            'chief_complaint',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/chiefcomplains.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'examination',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/examinations.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'attachment',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/attachments.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'diagnosis',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/diagnosis.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'clinical_notes',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/clinical-notes.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'investigations',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/investigations.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'medicine',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/medication.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'results',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/results.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'procedures',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/procedures.svg')
        );

        this.matIconRegistry.addSvgIcon(
            'referral',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/referrals.svg')
        );

        this.matIconRegistry.addSvgIcon(
            'vitals',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/vitals.svg')
        );

        this.matIconRegistry.addSvgIcon(
            'diet_chart',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/diet-chart.svg')
        );

        this.matIconRegistry.addSvgIcon(
            'advice',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/meeting.svg')
        );

        this.matIconRegistry.addSvgIcon(
            'personal_history',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/cheers.svg')
        );

        this.matIconRegistry.addSvgIcon('calendar', '/assets/images/calendar.svg');
        this.matIconRegistry.addSvgIcon('notebook', '/assets/images/notebook.svg');
    }

    adjustNavigationMenuAccordingToScreen(requestType, currentPath) {
        if (requestType === 'destroy') {
            if (currentPath === Constants.NAVIGATION_URL.create_patient) {
                this.customizeSideNavOptions(true, ['show_back_button', 'show_info_on_inner_toolbar', 'show_hamburger_icon'], [false, false, false]);
            } else if (currentPath === Constants.NAVIGATION_URL.patientList) {
                this.customizeSideNavOptions(true, ['show_back_button', 'show_info_on_inner_toolbar', 'show_hamburger_icon', 'doctor_specific_menu_list', 'patient_specific_toolbar_menu'], [false, false, false, false, false]);
            } else if (currentPath === Constants.NAVIGATION_URL.dashboard) {
                this.customizeSideNavOptions(true, ['show_back_button', 'show_info_on_inner_toolbar', 'show_hamburger_icon', 'doctor_specific_menu_list', 'patient_specific_toolbar_menu'], [false, false, false, true, false]);
            }
        } else if (requestType === 'create') {
            if (currentPath === Constants.NAVIGATION_URL.create_patient) {
                this.customizeSideNavOptions(true, ['show_back_button', 'show_info_on_inner_toolbar', 'show_hamburger_icon'], [true, false, false]);
            } else if (currentPath === Constants.NAVIGATION_URL.patientList) {
                this.customizeSideNavOptions(true, ['show_back_button', 'show_info_on_inner_toolbar', 'show_hamburger_icon', 'doctor_specific_menu_list', 'patient_specific_toolbar_menu'], [false, false, false, true, false]);
            } else if (currentPath === Constants.NAVIGATION_URL.dashboard) {
                this.customizeSideNavOptions(true, ['show_back_button', 'show_info_on_inner_toolbar', 'show_hamburger_icon', 'doctor_specific_menu_list', 'patient_specific_toolbar_menu'], [false, false, true, false, true]);
            }
        }
    }

    customizeSideNavOptions(forceFullModification, keyToChange, valueToChange) {

        this._util.header_settings = this._util.reset_header_settings;
        let isMobile = this.screen_detector.deviceType.isMobile;


        let getCurrentUser = this._util.getLocalData(Constants.KEY_CURRENT_USER).user.type;


        if (!forceFullModification) {
            if ((isMobile) && (getCurrentUser === 'contributor')) {
                // @ts-ignore
                this._util.header_settings.show_hamburger_icon = false;
            } else if (!isMobile) {
                this._util.header_settings.show_hamburger_icon = false;
            } else {
                // @ts-ignore
                this._util.header_settings.show_hamburger_icon = true;

            }
            if (getCurrentUser === 'assistant') {
                // @ts-ignore
                this._util.header_settings.keep_side_nav_open = true;
            } else if (!isMobile) {
                // @ts-ignore
                this._util.header_settings.keep_side_nav_open = true;
            } else {
                // @ts-ignore
                this._util.header_settings.keep_side_nav_open = false;
            }
            if (isMobile) {
                // @ts-ignore
                this._util.header_settings.show_info_on_inner_toolbar = false;
            } else {
                // @ts-ignore
                this._util.header_settings.show_info_on_inner_toolbar = true;
            }

            if (isMobile) {
                // @ts-ignore
                this._util.header_settings.patient_specific_toolbar_menu = false;
                // @ts-ignore
                this._util.header_settings.show_search_cancel_icon = true;
            }
        } else {
            if (keyToChange instanceof Array) {
                for (let index = 0; index < keyToChange.length; index++) {
                    this._util.header_settings[keyToChange[index]] = valueToChange[index];

                }

            } else {
                if (this._util.isThisOptionValidForPhone(keyToChange)) {
                    this._util.header_settings[keyToChange] = valueToChange;
                }
            }
        }
        // this.saveLocalData(Constants.KEY_HEADER_SETTINGS, this.header_settings);
        // this.setDataToObservabla({
        //   'type': 'header_setting',
        //   'data': this.getLocalData(Constants.KEY_HEADER_SETTINGS)
        // });


    }

    toggleAvailability() {
        let isOnline = 0;
        if (this.isDoctorOnline) {
            isOnline = 0;
        } else {
            isOnline = 1;
        }

        this._rest.setDoctorAvailability({ 'available': isOnline }).subscribe(row => {
            this.isDoctorOnline = row.available === '1' ? true : false;
        });

    }

    refreshConsultations() {
        this._util.setDataToObservabla({ 'type': 'refreshPatientList' });
        this._util.setDataToObservabla({ 'type': 'refreshNotificationsListing' });
    }

    navigateConsultation(isForward) {
        this._util.setDataToObservabla({ 'type': 'navigateConsultation', 'forward': isForward });

    }

    openPatientEditingPanel(panelData) {
        const currentConsultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);

        if (currentConsultation.user_login === panelData.phone.split('-').join('').replace('UID: ', '')) {
            this.currentlyEditingPatientDetails = currentConsultation.patient;
            this._util.header_settings.mobile_show_edit_patient = !this._util.header_settings.mobile_show_edit_patient;
            this._util.header_settings.mobile_show_patient_history = false;
            this._util.header_settings.mobile_show_previous_visits = false;
            this._util.header_settings.patient_previous_visit_layout = false;
            this._util.header_settings.show_patient_history_panel = false;
        }
    }

    public copyLinkToClipBoard() {

        let selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = this.videoCallUrlWithOptions(this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION)['videoCallUrl']);
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
        this._util.showSnackBar('Copied to clipboard', '');
    }

    previewPrescription() {
        let soapId = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION).soap_id;
        if (this.isEditPatientMobile) {
            this.save = {
                text: 'Loading',
                showText: true,
                showLoader: true
            };
        } else {
            this.prescriptionButtion = {
                text: 'Loading',
                showText: true,
                showLoader: true
            };
        }

        this._rest.getPrescriptionPreview(soapId).subscribe(resp => {
            if (this.isEditPatientMobile) {
                this.save = {
                    text: 'Loading',
                    showText: false,
                    showLoader: false
                };
            } else {
                this.prescriptionButtion = {
                    text: 'Loading',
                    showText: false,
                    showLoader: false
                };
            }
            //noinspection TypeScriptValidateTypes
            const dialogRef = this.dialog.open(PrescriptionPreviewDialog, {
                width: this.isEditPatientMobile ? '90vw' : '50vw',
                maxWidth: this.isEditPatientMobile ? '90vw' : '50vw',
                height: 'fit-content',
                maxHeight: '90vh',
                data: resp
            });

            dialogRef.afterClosed().subscribe(result => {
                this.sendPrescription(result, soapId);
            });
        });
    }

    public async sendPrescription(result, soapId) {
        let apiParams: any = false;
        switch (result) {
            case 'sendPrescription':
                apiParams = {
                    closeConsult: 0
                };
                break;
            case 'sendPrescriptionAndCloseConsultation':
                apiParams = {
                    closeConsult: 1
                };
                break;
            default:
                break;
        }

        if (apiParams === false) return;
        if (this.isEditPatientMobile) {
            this.save = {
                text: 'Sending ...',
                showText: true,
                showLoader: true
            };
        } else {
            this.prescriptionButtion = {
                text: 'Sending ...',
                showText: true,
                showLoader: true
            };
        }

        await this._rest.sendPrescription(soapId, apiParams).then(resp => {
            let imageUrl = "";
            if (resp['success'] && resp['resp'] && resp['resp'].url && resp['resp'].url.length) {
                imageUrl = resp['resp'].url;
            }

            // adding this image to attachments section:
            if (imageUrl && imageUrl.length) {

                this._rest.addCustomTypeOfAttachment(soapId, imageUrl).subscribe(resp => {
                    const attachmentObject = resp.row;

                    if (!this._util.current_soap_model.attachments.length) {
                        this._util.current_soap_model.attachments.push(this._util.createNewObject('attachments'));
                    }
                    this._util.soap_chips.forEach(element => {


                        if (element['component'] === 'attachments' && !element['isUsed']) {
                            element['isUsed'] = true;
                            this._util.component_mapingWithChips.push(element['component']);

                        }

                    });

                    let position = this._util.current_soap_model.attachments.length - 1;
                    this._util.current_soap_model.attachments[position].url = attachmentObject['url'];
                    this._util.current_soap_model.attachments[position].id = attachmentObject['id'];
                    this._util.current_soap_model.attachments[position].processing = false;
                    this._util.current_soap_model.attachments[position].isDummy = false;
                    this._util.current_soap_model.attachments.push(this._util.createNewObject('attachments'));

                });
            }

            this.snackBar.open(resp['message'], '', <MatSnackBarConfig>{
                'duration': 3000
            });


            if (this.isEditPatientMobile) {
                this.save = {
                    text: 'Sent',
                    showText: false,
                    showLoader: false
                };
            } else {
                this.prescriptionButtion = {
                    text: 'Sent',
                    showText: false,
                    showLoader: false
                };
            }
        });
    }

    public sendLinkViaSms() {

        let current_consultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);
        let videoCallUrl = this.videoCallUrlWithOptions(current_consultation['videoCallUrl']);

        let object = { "mobile": current_consultation['doctor']['user_login'], "smstext": "Hey doctor, here is the link for the consultation : " + videoCallUrl };
        this._rest.sendSmsToDoctor(object).subscribe(result => {
            if (result.success) {
                this._util.showSnackBar("Sms sent to doctor", "");
            } else {
                this._util.showSnackBar("Something went wrong", "");
            }

        });

    }

    public isSingleVideoCallLink() {
        // now since we have chat url integrated, this will always return false;
        return false;

        return (this.current_user_type === 'contributor') && (!this.videoCallUrls.length);
    }

    private videoCallUrlWithOptions(callUrl) {
        callUrl = callUrl || this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION)['videoCallUrl'];

        // for meet.medimetry call urls, we dont need any other data
        return callUrl;

        const current_consultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);

        const options = {
            localPersonName: current_consultation.doctor.display_name,
            remotePersonName: current_consultation.patient.name,
            starTime: this._util.getCurrentTime(),
            consultationCode: current_consultation.consultation_code,
        };

        return callUrl + "?options=" + encodeURI(JSON.stringify(options));
    }

    public openChatInterfaceInNewTab() {
        // TODO: implement
        const currentConsultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);
        let chatUrl = currentConsultation.chatInterfaceUrl;

        const currentLoggedIntUser = this._util.getLocalData(Constants.KEY_CURRENT_USER);
        chatUrl = chatUrl.replace(":token", currentLoggedIntUser.access_token);

        window.open(chatUrl, "_blank");
    }

    public openInNewTab(callUrl) {
        let win = window.open(this.videoCallUrlWithOptions(callUrl), '_blank');

        /*
         * This bit will disable following menus in header
         * 1. Complete menu of video call,
         * 2. Next consultation button.
         * */

        /*
         * Deprecating in favor of MED-62, to make this webview work in iOS
         *
        const popupTick = setInterval(() => {
            if (win.closed) {
                clearInterval(popupTick);
                this.videoCallButtonDisable = false;

                // this._recorder.startRecording(current_consultation['consultation_id'] || '');
            }
        }, 100);
         */

        // we will also send a POST api to doc.medimetry saying that call is started from PMS doctor end.
        const current_consultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);
        const consultation_code = current_consultation["consultation_code"];

        this._rest.initiatePhoneCall(consultation_code)
            .then((response) => {
                console.log("Response from initiatePhoneCall API: ", response);
            });
    }

    createConsultationForPatient(date) {
        date = date || null;

        let consultationObject = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);
        const drname = consultationObject.doctor.display_name;

        let text = "Would you like to create a new consultation";
        if (date) {
            text = "Would you like to create a new consultation for date: " + date;
        } else {
            date = new Date();
        }

        if (confirm(text)) {
            this.progress_consult_again = true;
            let patientData = {
                "user_name": "",
                "user_mobile": consultationObject['user_login'].substring(2, consultationObject['user_login'].length),
                "user_email": "",
                "user_dob": "",
                "patient_name": consultationObject.patient.name,
                "patient_age": this._util.getTimeDifferenceInYears(consultationObject['patient']['date_of_birth']),
                "patient_gender": consultationObject['patient']['gender'],
                "patient_relation": consultationObject['patient']['relation'],
                "chief_complaints": "Online consult with " + drname + " at " + this._util.showDateLocally(date),
                "center_code": consultationObject['patient']['center_code'],
                "channel_name": "MediMetry Camps",
                "consult_type": "AUDIO",
                "speciality": "Family Physician",
                "doctor": consultationObject['doctor']['ID'],
                "address": "",
                "soap_date": date,
            };


            this._rest.createConsultation(patientData).subscribe(result => {
                if (result.success) {
                    this.progress_consult_again = false;
                    this._util.showSnackBar("Consultation Created, Redirecting to Consultation listing", "");
                    this.navigationToRoute(0);


                    this._util.sendStaffPMSStat("staff-followup-consultation", result.soap.id);

                    this.highlightCalendarDates(this.selectedDate.clone());
                }

            });
        }
    }

    createConsultationForPatientWithDate($event) {
        event.stopPropagation();

        if ($event && $event.value) this.createConsultationForPatient($event.value);
        // alert("Here i will ask for date");
    }

    public patientHistoryGeneratorModal(isVisible) {
        const currentConsultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);

        //noinspection TypeScriptValidateTypes
        const dialogRef = this.dialog.open(PatientHistoryGeneratorModalComponent, {
            width: this.isEditPatientMobile ? '90vw' : '70vw',
            maxWidth: this.isEditPatientMobile ? '90vw' : '70vw',
            height: 'fit-content',
            maxHeight: '90vh',
            data: {
                patientId: (currentConsultation && currentConsultation['patient'] && currentConsultation['patient'].id)
                    ? currentConsultation['patient'].id
                    : ""
            },
            disableClose: false,
        });

        dialogRef.afterClosed().subscribe(result => {
            switch (result) {
                default:
                    break;
            }
        });
    }

    public unlockThisSoap() {
        this._util.previousSoapSettings.previousSoapActivated = false;
    }

    public openSubmitPartnerappFeedbackModal(isVisible) {
        const currentConsultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);

        //noinspection TypeScriptValidateTypes
        const dialogRef = this.dialog.open(SubmitPartnerAppFeedbackDialogModalComponent, {
            width: this.isEditPatientMobile ? '90vw' : '60vw',
            minWidth: this.isEditPatientMobile ? '90vw' : '60vw',
            maxWidth: this.isEditPatientMobile ? '90vw' : '60vw',
            height: 'fit-content',
            maxHeight: '90vh',
            data: {
                code: currentConsultation['consultation_code']
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result || (!result.feedback && !result.rating)) return;

            if (result.feedback && !result.rating)
                return this._util.showSnackBar("Rating is mandatory");

            this._rest.submitPartnerAppFeedback(currentConsultation['consultation_code'], result.rating, result.feedback)
                .then(resp => {
                    return this._util.showSnackBar(resp['message']);
                });
        });
    }

    public openNoFollowupSoapsListing() {
        //noinspection TypeScriptValidateTypes
        this.dialog.open(Last30DaysWithoutFollowupConsultsModal, {
            width: this.isEditPatientMobile ? '90vw' : '60vw',
            minWidth: this.isEditPatientMobile ? '90vw' : '60vw',
            maxWidth: this.isEditPatientMobile ? '90vw' : '60vw',
            height: 'fit-content',
            maxHeight: '90vh'
        });
    }

    public setChannelCenterForFiltering(code) {
        this._util.filterByCenterCode = code || "";
        this._util.setDataToObservabla({ 'type': 'refreshPatientList' });
    }

    public toggleListeningButton() {
        return this._util.broadcastEvent("toggleVoiceLexLayout", true);
    }

    public selectUnselectPatientTag(event, tag) {
        if (event.checked) {
            this._util.selectedPatientTags.push(tag);
            this._util.selectedPatientTags = this._util.selectedPatientTags
                .filter((value, index, self) => self.indexOf(value) === index);
        } else {
            const indexOfMeta = this._util.selectedPatientTags.indexOf(tag);
            if (indexOfMeta > -1) this._util.selectedPatientTags.splice(indexOfMeta, 1);
        }

        this._util.setDataToObservabla({ 'type': 'refreshPatientList' });
    }

    public clearSelectedPatientsTags() {
        this._util.selectedPatientTags = [];
        this._util.setDataToObservabla({ 'type': 'refreshPatientList' });
    }

    public showPmsStaffStats() {
        //noinspection TypeScriptValidateTypes
        this.dialog.open(ShowPmsStaffStatsLayoutModal, {
            width: this.isEditPatientMobile ? '90vw' : '60vw',
            minWidth: this.isEditPatientMobile ? '90vw' : '60vw',
            maxWidth: this.isEditPatientMobile ? '90vw' : '60vw',
            height: 'fit-content',
            maxHeight: '90vh'
        });
    }

    public openNotesLayout(event) {
        event.stopPropagation();

        //noinspection TypeScriptValidateTypes
        this.dialog.open(PatientNotesLayoutModal, {
            width: this.isEditPatientMobile ? '90vw' : '60vw',
            minWidth: this.isEditPatientMobile ? '90vw' : '60vw',
            maxWidth: this.isEditPatientMobile ? '90vw' : '60vw',
            height: 'fit-content',
            maxHeight: '90vh'
        });
    }

    public addNewPatientNotePrompt(event) {
        event.stopPropagation();

        const patientId = this._util.current_soap_model.patient_id;
        if (!patientId) return;

        const text = prompt("Write the text for note you want to add?");
        if (!text.length) return;

        this._rest.createPatientNote(patientId, text)
            .then(resp => alert(resp['message']));
    }

    public periodicUpdateCurrentUserSettings() {

        let lastUpdatedTimestamp = this._util.getLocalData(Constants.KEY_CURRENT_USER_LAST_UPDATED);

        const shouldBeUpdated = (new Date);
        shouldBeUpdated.setDate(shouldBeUpdated.getDate() - 1);

        if (lastUpdatedTimestamp
            && (shouldBeUpdated.getTime() < parseInt(lastUpdatedTimestamp))) return;

        const refreshToken = (this._util.getLocalData(Constants.KEY_CURRENT_USER) || {})['refresh_token'];
        if (!refreshToken) return; // in any case user is not logged in.

        this._rest.getUserByToken({ "token": refreshToken })
            .subscribe(result => {
                if (!result.success) return alert("Something went wrong while updating PMS prefs.");

                this._util.saveLocalData(Constants.KEY_CURRENT_USER, result);
                this._util.saveLocalData(Constants.KEY_CURRENT_USER_LAST_UPDATED, (new Date).getTime() + "");
                this._util.saveLocalData(Constants.KEY_ALL_COUNTRIES, result.user.countries);
                if (this._util.getLocalData(Constants.KEY_ALL_COUNTRIES)) {
                  this._util.countries = this._util.getLocalData(Constants.KEY_ALL_COUNTRIES);
                }
            });
    }
}

@Component({
    templateUrl: 'prescription-preview-dialog.html',
})
export class PrescriptionPreviewDialog implements AfterViewInit {
    @ViewChild('htmlSection') htmlSection;

    showingMedicine = false;
    shouldShowRxPriceButton = true;

    constructor(
        public dialogRef: MatDialogRef<PrescriptionPreviewDialog>,
        public _util: UtilityService,
        @Inject(MAT_DIALOG_DATA) public data) {
        this.showingMedicine = false;
    }

    cancel(): void {
        this.dialogRef.close();
    }
    sendPrescription(): void {
        this.dialogRef.close('sendPrescription');
    }
    sendPrescriptionAndCloseConsultation(): void {
        this.dialogRef.close('sendPrescriptionAndCloseConsultation');
    }
    togglePrescriptionCostView(): void {
        this.showingMedicine = !this.showingMedicine;
    }

    ngAfterViewInit() {
        this.htmlSection.nativeElement.innerHTML = this.data.html.replace("* {\n            font-size: 14px;\n        }", "#html-section * {\n            font-size: 14px;\n        }");
        const priceShouldShowSettings = this._util.getLocalData(Constants.KEY_SHOULD_SHOW_PRICES_IN_RX);
        console.log("priceShouldShowSettings: ", priceShouldShowSettings);
        if ( (priceShouldShowSettings === null) || (priceShouldShowSettings === false) )
            this.shouldShowRxPriceButton = false;
    }
}

@Component({
    templateUrl: 'patient-history-generator-preview-dialog.html',
})
export class PatientHistoryGeneratorModalComponent implements AfterViewInit {

    constructor(
        public dialogRef: MatDialogRef<PatientHistoryGeneratorModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data) {
    }

    cancel(): void {
        this.dialogRef.close();
    }

    ngAfterViewInit() {

    }
}

@Component({
    templateUrl: 'submit-partner-app-feedback-dialog.html'
})
export class SubmitPartnerAppFeedbackDialogModalComponent implements AfterViewInit {
    rating = 0;
    feedback = "";

    constructor(
        public dialogRef: MatDialogRef<SubmitPartnerAppFeedbackDialogModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data) {

        this.dialogRef.disableClose = false;
    }

    cancel() {
        this.dialogRef.close();
    }

    submitFeedback() {
        this.dialogRef.close({
            rating: this.rating,
            feedback: this.feedback
        });
    }

    selectRating(rat) {
        this.rating = rat;
    }

    ngAfterViewInit() {

    }
}

@Component({
    templateUrl: 'last-30-day-without-followup-consults.html'
})
export class Last30DaysWithoutFollowupConsultsModal implements AfterViewInit {
    consultations;
    page = 1;
    loading = true;
    haveMorePages = true;
    model = {
        followup: "today",
        priority: "Green",
        centers: [],
        time: new Date,
        page: 1,
    }

    centersFormControl = new FormControl();
    centersList = [];
    currentUser;

    constructor(
        public dialogRef: MatDialogRef<Last30DaysWithoutFollowupConsultsModal>,
        public _util: UtilityService,
        public _rest: RestService,
        private _route: Router,
        private ngZone: NgZone,
        @Inject(MAT_DIALOG_DATA) public data) {

        this.dialogRef.disableClose = false;
        this.consultations = [];

        this.currentUser = this._util.getLocalData(Constants.KEY_CURRENT_USER);
        let selectedCenters = [];

        // something is not right, with logged in users
        if (!this.currentUser['user'] || !this.currentUser['user']['channels'].length || !this.currentUser['user']['centers']) return;
        if (this.currentUser['meta'] && this.currentUser['meta']['meta'] && this.currentUser['meta']['meta']['centers'] && this.currentUser['meta']['meta']['centers'].length)
            selectedCenters = this.currentUser['meta']['meta']['centers'];

        this.currentUser['user'].channels.forEach(channel => {
            this.currentUser['user'].centers[channel].forEach(center => {
                let selected = false;
                if (!selectedCenters.length) selected = true; // if no center is selected for the assistant.
                if (selectedCenters.length && (selectedCenters.indexOf(center.code) > -1)) selected = true; // if center is binded and , not present in the list.

                this.centersList.push({
                    name: center.name,
                    code: center.code,
                    selected: selected,
                });
            });
        });
    }

    cancel() {
        this.dialogRef.close();
    }

    ngAfterViewInit() {
        this.refreshListing();
    }

    refreshListing() {
        this.loading = true;

        this.model.centers = this.centersList.filter(center => center.selected)
            .map(center => center.code);

        this._rest.getFollowupsListing(this.model)
            .then(resp => {
                this.loading = false;

                if (resp['rows'] && resp['rows'].length) { }
                else return this.haveMorePages = false;

                if (this.model.page === 1) this.consultations = resp['rows'];
                else this.consultations = this.consultations.concat(resp['rows']);

                if (this.consultations.length < 8) this.onScrollMore();
            });
    }

    markNotificationDone(consultation) {
        this._rest.markDone(consultation.notification.id)
            .subscribe(resp => {
                this.consultations = this.consultations.filter(row => row.consultation_code != consultation.consultation_code);
            });
    }

    addEmptyFUP(consultation) {
        consultation['addedEmptyFUP'] = true;

        this._rest.addEmptyFUP(consultation['soap_id'])
            .then((resp) => {
                this._util.showSnackBar(resp['message'], "", false, 3000);
            });
    }

    removeThisSoap(consultation) {
        if (!confirm("Are you sure? you want to remove this soap from PMS."))
            return;

        consultation['removedThisSoap'] = true;

        this._rest.deactivateSoap(consultation['soap_id'])
            .then((resp) => {
                this._util.showSnackBar(resp['message'], "", false, 3000);
            });
    }

    onScrollMore() {
        if (!this.haveMorePages) return;

        this.model.page += 1;
        this.refreshListing();
    }

    priorityChanged() {
        this.model.page = 1;
        this.haveMorePages = true;
        this.consultations = [];

        this.refreshListing();
    }

    followupChanged() {
        this.model.page = 1;
        this.haveMorePages = true;
        this.consultations = [];

        this.refreshListing();
    }

    redirectToDashboard(consultation) {
        this.cancel();

        this.ngZone.run(() => this._route.navigate([Constants.NAVIGATION_URL.dashboard])).then();

        this._util.setDataToObservabla({
            'type': 'showSoapFromNotifcation',
            'data': consultation,
        });
    }
}

@Component({
    templateUrl: 'show-pms-staff-stats-layout.html'
})
export class ShowPmsStaffStatsLayoutModal implements AfterViewInit {
    loading = true;
    dataSource: PMSStaffStat[] = [];
    displayedColumns: String[] = [
        "label",
        "thisMonth",
        "lastMonth",
        "total"
    ];
    thisMonthText: String = "";
    lastMonthText: String = "";

    constructor(
        public dialogRef: MatDialogRef<ShowPmsStaffStatsLayoutModal>,
        public _util: UtilityService,
        public _rest: RestService,
        @Inject(MAT_DIALOG_DATA) public data) {

        this.dialogRef.disableClose = false;
    }

    cancel() {
        this.dialogRef.close();
    }

    ngAfterViewInit() {
        const currentUser = this._util.getLocalData(Constants.KEY_CURRENT_USER);

        if (currentUser && currentUser['meta'] && (currentUser['meta']['type'] == 'assistant')) { }
        else return this.cancel();

        const staffId = currentUser['meta']['id'];
        this._rest.getPMSStaffStats(staffId).then(resp => {
            if (!resp['success'] && resp['message']) return alert(resp['message']);

            if (resp['meta'] && resp['meta']['pmsStats'])
                this.processStats(resp['meta']['pmsStats']);

            this.loading = false;
        });
    }

    processStats(stats) {
        const keys = {
            'new-consultation': "New Consultation Created",
            'followup-consultation': "Repeat Consultations Created",
            'followup-done': "Followed up to Patient",
            'lab-orders': "Lab orders served",
            'lab-orders-price': "served Lab orders Price ( in Rs )",
            'meds-orders': "Medication Orders Served ( by us )",
            'meds-orders-price': "Medication orders Price",
            'orders': "Total orders",
            'orders-price': "Total Orders Price",
            'orders-from-medimetry': "Total orders served",
            'orders-from-medimetry-price': "Total Orders served Price",
            'orders-from-market': "Total Orders From market",
            'orders-from-market-price': "Total Orders from market Price",
            'orders-refused': "Declined orders"
        };

        this.dataSource = [];
        for (const key in keys) {
            this.dataSource.push({
                label: keys[key],
                thisMonth: (stats['this-month'] && stats['this-month'][key]) ? (stats['this-month'][key] + "") : "",
                lastMonth: (stats['last-month'] && stats['last-month'][key]) ? (stats['last-month'][key] + "") : "",
                total: (stats['total'] && stats['total'][key]) ? (stats['total'][key] + "") : ""
            });
        }

        this.thisMonthText = "This month" + ((stats['this-month'] && stats['this-month']['month']) ? (" ( " + stats['this-month']['month'] + " ) ") : "");
        this.lastMonthText = "Last month" + ((stats['last-month'] && stats['last-month']['month']) ? (" ( " + stats['last-month']['month'] + " ) ") : "");
    }


}


@Component({
    templateUrl: 'patients-notes-layout.html'
})
export class PatientNotesLayoutModal implements AfterViewInit {
    loading = true;
    patientId: number = 0;
    notes: PatientNote[] = [];
    text: string = "";
    noteId: number = 0;

    constructor(
        public dialogRef: MatDialogRef<PatientNotesLayoutModal>,
        public _util: UtilityService,
        public _rest: RestService,
        @Inject(MAT_DIALOG_DATA) public data) {

        this.dialogRef.disableClose = false;
    }

    cancel() {
        this.dialogRef.close();
    }

    ngAfterViewInit() {
        if (this._util.current_soap_model.patient_id)
            this.patientId = this._util.current_soap_model.patient_id;

        if (this.patientId === 0) return this.cancel();

        this.fetchPatientNotes();
    }

    doNothing() { }
    startEditing(note) {
        this.noteId = note.id;
        this.text = note.text;
    }

    addNote() {
        if (!this.text.length) return;

        if (this.noteId) {
            this.saveNote({
                id: this.noteId,
                text: this.text,
                patient_id: this.patientId
            });

            this.text = ""; this.noteId = 0;
            return;
        }

        this._rest.createPatientNote(this.patientId, this.text)
            .then(resp => {
                this._util.showSnackBar(resp['message']);

                this.fetchPatientNotes();
                this.text = "";
            });
    }
    private saveNote(note: PatientNote) {
        this._rest.updatePatientNote(note.id, note.text)
            .then(resp => {
                if (resp['message']) this._util.showSnackBar(resp['message']);

                this.fetchPatientNotes();
            });
    }
    private deleteNote(note: PatientNote) {
        if (!confirm("Are you sure? it is not reversible")) return;

        this._rest.deletePatientNote(note.id)
            .then(resp => {
                if (!resp['success'] && resp['message'])
                    return this._util.showSnackBar(resp['message']);

                this.fetchPatientNotes();
            });
    }
    private fetchPatientNotes() {
        this.loading = true;

        this._rest.fetchPatientNotes(this.patientId)
            .then(resp => {
                this.loading = false;

                if (!resp['success'] && resp['message']) {
                    alert(resp['message']);
                    return this.cancel();
                }

                this.notes = resp['notes'];
            });
    }
}

interface ChannelCenterMenuItem {
    label: string;
    subLabel: string;
    code: string;
}

interface PMSStaffStat {
    label: string;
    thisMonth: string;
    lastMonth: string;
    total: string;
}

interface PatientNote {
    id: number;
    text: string;
    patient_id: number;
}
