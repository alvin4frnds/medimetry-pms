import { ILogging } from './../ILogging';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs/index';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { Constants } from '../Utilities/Constants';
import { MatDialog, MatDialogConfig, MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/internal/operators';
import { RestService } from './rest.service';
import { HttpClient } from '@angular/common/http';
import { CustomSnackbarComponent } from '../custom-snackbar/custom-snackbar.component';
import { PatientUniqueIdComponent } from '../patient-unique-id/patient-unique-id.component';
import { SocketService } from './socket.service';
import { ScreenDetectorService } from './screen-detector.service';
import { Moment } from 'moment';


@Injectable({
    providedIn: 'root'
})
export class UtilityService implements ILogging {


    page_name = Constants.PAGE_NAME.UTILITY_SERVICE;
    currentDateForAppointment: Moment;

    isPreviousSoapCurrentlyActivated = false;
    public header_settings = {
        'show_back_button': false,
        'show_hamburger_icon': false,
        'keep_side_nav_open': false,
        'show_info_on_inner_toolbar': false,
        'sideNavCss': '',
        'patient_specific_toolbar_menu': false,
        'show_search_cancel_icon': false,
        'dashboard_desktop_menu': false,
        'additional_desktop_menu': true,
        'show_patient_history_panel': false,
        'patient_previous_visit_layout': false,
        'mobile_show_patient_history': false,
        'mobile_show_previous_visits': false,
        'mobile_show_edit_patient': false,
        'wasMobilePatientHistoryEnabled': false,
        'showRefreshButton': false,
    };

    reset_header_settings = {
        'show_back_button': false,
        'show_hamburger_icon': false,
        'keep_side_nav_open': false,
        'show_info_on_inner_toolbar': false,
        'sideNavCss': '',
        'patient_specific_toolbar_menu': false,
        'show_search_cancel_icon': false,
        'dashboard_desktop_menu': false,
        'additional_desktop_menu': true,
        'show_patient_history_panel': false,
        'patient_previous_visit_layout': false,
        'mobile_show_patient_history': false,
        'mobile_show_previous_visits': false,
        'mobile_show_edit_patient': false,
        'wasMobilePatientHistoryEnabled': false,
        'showRefreshButton': false,
    };

    sideNavOption = {
        'initial': [{'name': 'My Patients', 'icon': 'add', 'isVisible': true}, {
            'name': 'Create Patient',
            'icon': '',
            'isVisible': true
        }],
        'patientSpecific': []
    };
    application_data = {'show_create_patient_search': false, 'showCanvas': false};
    public global_open_consultations = [];


    soap_chips = [{
        'id': 0,
        'name': 'Chief Complaints',
        'isUsed': false,
        'component': 'chief_complaints',
        'icon': 'chief_complaint',
        'isHighLighted': true,
    },
        {'id': 1, 'name': 'Vital', 'isUsed': false, 'component': 'vitals', 'icon': 'vitals', 'isHighLighted': false},
        {
            'id': 2,
            'name': 'Diagnosis',
            'isUsed': false,
            'component': 'diagnosis',
            'icon': 'diagnosis',
            'isHighLighted': false
        },
        {
            'id': 3,
            'name': 'Medication',
            'isUsed': false,
            'component': 'medication',
            'icon': 'medicine',
            'isHighLighted': false
        },
        {
            'id': 4,
            'name': 'Investigation',
            'isUsed': false,
            'component': 'investigation',
            'icon': 'investigations',
            'isHighLighted': false
        },
        {
            'id': 5,
            'name': 'Remarks',
            'isUsed': false,
            'component': 'remark-follow-up',
            'icon': 'advice',
            'isHighLighted': false
        },
        {
            'id': 6,
            'name': 'Notes',
            'isUsed': false,
            'component': 'examinations',
            'icon': 'examination',
            'isHighLighted': false
        },
        {
            'id': 7,
            'name': 'Referrals',
            'isUsed': false,
            'component': 'referrals',
            'icon': 'referral',
            'isHighLighted': false
        },
        {
            'id': 8,
            'name': 'Procedures',
            'isUsed': false,
            'component': 'procedures',
            'icon': 'procedures',
            'isHighLighted': false
        },
        {
            'id': 9,
            'name': 'Test Result',
            'isUsed': false,
            'component': 'results',
            'icon': 'results',
            'isHighLighted': false
        },
        {
            'id': 10,
            'name': 'Attachments',
            'isUsed': false,
            'component': 'attachments',
            'icon': 'attachment',
            'isHighLighted': false
        },
        {
            'id': 11,
            'name': 'Personal History',
            'isUsed': false,
            'component': 'personal_history',
            'icon': 'personal_history',
            'isHighLighted': false
        },
        {
            'id': 12,
            'name': 'Examinations',
            'isUsed': false,
            'component': 'clinical_notes',
            'icon': 'clinical_notes',
            'isHighLighted': false
        },
        {
            'id': 13,
            'name': 'Diet Chart',
            'isUsed': false,
            'component': 'diet_chart',
            'icon': 'diet_chart',
            'isHighLighted': false
        }
    ];

    meal_times = [{'hour': '0', 'day_state': 'Mid Night'}, {'hour': '1', 'day_state': 'Early Morning'}, {
        'hour': '2',
        'day_state': 'Early Morning'
    }, {'hour': '3', 'day_state': 'Early Morning'}, {'hour': '4', 'day_state': 'Early Morning'}, {
        'hour': '5',
        'day_state': 'Morning'
    }, {'hour': '6', 'day_state': 'Morning'}, {'hour': '7', 'day_state': 'Morning'}, {
        'hour': '8',
        'day_state': 'Morning'
    }, {'hour': '9', 'day_state': 'Morning'}, {'hour': '10', 'day_state': 'Morning'}, {
        'hour': '11',
        'day_state': 'Morning'
    }, {'hour': '12', 'day_state': 'After Noon'}, {'hour': '13', 'day_state': 'After Noon'}, {
        'hour': '14',
        'day_state': 'After Noon'
    }, {'hour': '15', 'day_state': 'After Noon'}, {'hour': '16', 'day_state': 'Evening'}, {
        'hour': '17',
        'day_state': 'Evening'
    }, {'hour': '18', 'day_state': 'Evening'}, {'hour': '19', 'day_state': 'Evening'}, {
        'hour': '20',
        'day_state': 'Night'
    }, {'hour': '21', 'day_state': 'Night'}, {'hour': '22', 'day_state': 'Night'}, {
        'hour': '23',
        'day_state': 'Night'
    }];

    public countries = [ ];

    public patientHistoryObject = {
        allergies: [],
        familyHistory: [],
        habits: [],
        past_illness: [],
        past_treatment: [],
        medications: [],
        past_medication_2: [],
        past_illness_2: []
    };

    public previousSoapObject = [];

    public consultationNavigationButtonSetting = {
        'isNextConsultationVisible': true,
        'isPreviousConsultationVisible': true
    };


    component_mapingWithChips = [];


    oldSoapModel = {
        'id': 0,
        'chief_complaints': [],
        'examinations': [],
        "vitals": {},
        'clinical_notes': {
            'id': 0,
            'inspection': '',
            'palpation': '',
            'percussion': '',
            'quscultation': '',
            'system_wide_examination': '',
            'key_observation': ''
        },
        'diagnosis': [],
        'results': [],
        'attachments': [],
        'medication': [],
        'investigation': [],
        "referrals": [],
        'procedures': [],
        'diet_chart': [],
        'feedbacks': [],
        'remark': '',
        'follow_up': '',
        meta: {},
        created_at: new Date,
        consultationTime: new Date,
        consultation_code: "",
        patient_id: 0,
    };


    default_soap_model = {
        'id': 0,
        'chief_complaints': [],
        'examinations': [],
        "vitals": {},
        "personal_history": {},
        'diet_chart': [],
        'clinical_notes': {
            'id': 0,
            'inspection': '',
            'palpation': '',
            'percussion': '',
            'quscultation': '',
            'system_wide_examination': '',
            'key_observation': ''
        },
        'diagnosis': [],
        'results': [],
        'attachments': [],
        'medication': [],
        'investigation': [],
        "referrals": [],
        'procedures': [],
        'feedbacks': [],
        'remark': '',
        'follow_up': '',
        meta: {},
        created_at: new Date,
        consultationTime: new Date,
        consultation_code: "",
        patient_id: 0,
    };

    notification_types = [
        {
            'name': 'Vitals from patient',
            'value': 'pms-partnerfilledvitals',
            'isIncomming': true,
        }, {
            'name': 'Assigned Consultations',
            'value': 'consultationAssign',
            'isIncomming': true,
        }, {
            'name': 'Call Request',
            'value': 'videoCallRequested',
            'isIncomming': true,
        }, {
            'name': 'Feedback from patient',
            'value': 'pms-partnerappfeedback',
            'isIncomming': true,
        }, {
            'name': 'Rx Approved',
            'value': 'pms-rxorderapproved',
            'isIncomming': true,
        }, {
            'name': 'Rx Rejected',
            'value': 'pms-rxorderrejected',
            'isIncomming': true,
        }, {
            'name': 'Rx Order',
            'value': 'pms-rxordernew',
            'isIncomming': true,
        }, {
            'name': 'Lab Order',
            'value': 'pms-labordernew',
            'isIncomming': true,
        },  {
            'name': 'Treatment Plan received',
            'value': 'pms-receivedtreatmentplan',
            'isIncomming': true,
        }, {
            'name': 'Patient FollowUp',
            'value': 'partnerapp-followup',
            'isIncomming': false,
        }, {
            'name': 'Attachments',
            'value': 'pms-partnerImageAttached',
            'isIncomming': true,
        }, {
            'name': 'Feedback reminder',
            'value': 'partnerapp-feedback',
            'isIncomming': false,
        }, {
            'name': 'Prescription Generated',
            'value': 'partnerapp-prescription',
            'isIncomming': false,
        }, {
            'name': 'Test Results',
            'value': 'partnerapp-testresults',
            'isIncomming': false,
        }

    ];


    current_soap_model = {
        'id': 0,
        'chief_complaints': [],
        'examinations': [],
        "vitals": {},
        'clinical_notes': {
            'id': 0,
            'inspection': '',
            'palpation': '',
            'percussion': '',
            'quscultation': '',
            'system_wide_examination': '',
            'key_observation': ''
        },
        'diagnosis': [],
        'results': [],
        'attachments': [],
        'medication': [],
        'investigation': [],
        "referrals": [],
        'procedures': [],
        "personal_history": {},
        'feedbacks': [],
        'diet_chart': [],
        'remark': '',
        'follow_up': '',
        meta: {},
        created_at: new Date,
        consultationTime: new Date,
        consultation_code: "",
        patient_id: 0,
    };


    public previousSoapSettings = {'previousSoapActivated': false, 'previousSoapId': 0};
    public filterByCenterCode: string = "";
    public selectedPatientTags = [];

    public navigationBackAllowed = true;


    private _rest: RestService;

    constructor(@Inject(LOCAL_STORAGE) private localStorage: WebStorageService,
                public snackBar: MatSnackBar,
                public screen_detector: ScreenDetectorService,
                private breakpointObserver: BreakpointObserver,
                public http: HttpClient, public dialog: MatDialog, private socket: SocketService) {
        this.setDataToObservabla(this.getLocalData(Constants.KEY_CURRENT_USER));
        this._rest = new RestService(http, this);


        if (this.getLocalData(Constants.KEY_SEND_LOGS_TO_SOCKET)) {
            this.connectToSocket();
        }
        if (this.getLocalData(Constants.KEY_ALL_COUNTRIES)) {
          this.countries = this.getLocalData(Constants.KEY_ALL_COUNTRIES);
        }

        setTimeout(() => {
            try {
                this.socket.onMessage().subscribe(row => {
                    if (row.success) {
                        this.saveLocalData(Constants.KEY_SEND_LOGS_TO_SOCKET, true);
                    } else {
                        this.saveLocalData(Constants.KEY_SEND_LOGS_TO_SOCKET, false);
                    }
                });
            } catch (err) {

            }
        }, 3000);

    }


    dataObserver = new BehaviorSubject<any>(false);
    dataProvider = this.dataObserver.asObservable();

    eventObserver = new BehaviorSubject({name: "intialised", value: null});
    eventProvider = this.eventObserver.asObservable();

    saveLocalData(key, value) {
        this.localStorage.set(key, value);
    }

    getLocalData(key): any {
        // Get data from local storage
        return this.localStorage.get(key) || null;
    }

    removeLocalData(key) {
        this.localStorage.remove(key);
    }

    public broadcastEvent(name, value) {
        this.eventObserver.next({
            name, value
        });
    }

    getScheduleCalendarDefaultStartAt() {
      const defaultStart = new Date();
      defaultStart.setHours(defaultStart.getHours() + 1);
      defaultStart.setMinutes(0);

      return new Date(defaultStart.getTime());
    }


    connectToSocket() {
        this.socket.connect_io();
    }

    sendMessageToSocket(type, message) {
        this.socket.send_message(type, message);
    }

    setDataToObservabla(object) {
        this.dataObserver.next(object);
    }

    getDataProviders() {
        return this.dataProvider;
    }


    customizeSideNavOptions(forceFullModification, keyToChange, valueToChange) {

        this.header_settings = this.reset_header_settings;
        let isMobile = this.screen_detector.deviceType.isMobile;
        let isTablet = this.screen_detector.deviceType.isMobile;

        let getCurrentUser = this.getLocalData(Constants.KEY_CURRENT_USER).user.type;
        /*this.isHandset$.subscribe(row => {
            isMobile = row;
        });
        this.isTablet$.subscribe(row => {
            isTablet = row;
        });*/

        if (!forceFullModification) {
            if (((isMobile) || (isTablet)) && (getCurrentUser === 'contributor')) {
                // @ts-ignore
                this.header_settings.show_hamburger_icon = false;
            } else if (!(isMobile) && !(isTablet)) {
                this.header_settings.show_hamburger_icon = false;
            } else {
                // @ts-ignore
                this.header_settings.show_hamburger_icon = true;

            }
            if ((isTablet) && (getCurrentUser === 'assistant')) {
                // @ts-ignore
                this.header_settings.keep_side_nav_open = true;
            } else if (!(isTablet) && !(isMobile)) {
                // @ts-ignore
                this.header_settings.keep_side_nav_open = true;
            } else {
                // @ts-ignore
                this.header_settings.keep_side_nav_open = false;
            }
            if ((isMobile) || (isTablet)) {
                // @ts-ignore
                this.header_settings.show_info_on_inner_toolbar = false;
            } else {
                // @ts-ignore
                this.header_settings.show_info_on_inner_toolbar = true;
            }

            if ((isMobile) || (isTablet)) {
                // @ts-ignore
                this.header_settings.patient_specific_toolbar_menu = false;
                // @ts-ignore
                this.header_settings.show_search_cancel_icon = true;
            }
        } else {
            if (keyToChange instanceof Array) {
                for (let index = 0; index < keyToChange.length; index++) {
                    this.header_settings[keyToChange[index]] = valueToChange[index];
                }
            } else {
                if (this.isThisOptionValidForPhone(keyToChange)) {
                    this.header_settings[keyToChange] = valueToChange;

                }
            }
        }
        // this.saveLocalData(Constants.KEY_HEADER_SETTINGS, this.header_settings);
        // this.setDataToObservabla({
        //   'type': 'header_setting',
        //   'data': this.getLocalData(Constants.KEY_HEADER_SETTINGS)
        // });


    }


    isThisOptionValidForPhone(key) {
        switch (key) {
            case 'show_back_button':
                return true;
                break;
        }
    }


    setHeaderData(name, pic, mobile) {

        const headerdata = {
            'name': name,
            'image': pic || '/assets/images/patientpic.png',
            'phone': mobile
        };
        this.saveLocalData(Constants.KEY_HEADER_DATA, headerdata);

        this.setDataToObservabla({
            'type': 'header_data',
            'data': headerdata
        });
    }


    createNewObject(objectType, isComplaintInitial = false,
                    showChiefComplaintsChips = false, patientId = 0, doctor_id = 0,
                    fromUnsavedBit = false, unsavedRemark = '', unsavedRelation = '') {
        const method = 'createNewObject()';
        this.start_trace_log(this.page_name, method, method + ' function starts');
        this.debug_line_exection(this.page_name, method, 'Method having initial Data', {'data': {'objectType': objectType}});
        let object = {};
        switch (objectType) {
            case 'vitals':
                object = {
                    'id': 0,
                    'vital_collected_at': 'MediMetry',
                    'vital_information': {
                        'BP(S)': '',
                        'BP(D)': '',
                        'Temp (F)': '',
                        'Weight (kg)': '',
                        'Pulse': '',
                        'Height(ft)': '',
                        'Height(in)': '',
                        'Random Sugar': ''
                    }
                };
                break;
            case 'chiefComplaints':
                object = {
                    'id': 0,
                    'complaint': '',
                    'remarks': '',
                    'processed': false,
                    'showProgressBar': false,
                    'showSuggestion': false,
                    'type': 'text',
                    'show_suggestion': showChiefComplaintsChips,
                };
                break;
            case 'examination':
                object = {
                    'id': 0,
                    'examined_organ': '',
                    'remarks': '',
                    'processed': false,
                    'showProgressBar': false,
                    'showSuggestion': false,
                };
                break;
            case 'diagnosis':
                object = {
                    'id': 0,
                    'category': 'Primary',
                    'term_id': null,
                    'term_text': '',
                    'icd_code': 0,
                    'diagnosis': '',
                    'chronic': false,
                    'status': '',
                    'remarks': '',
                    'processed': false,
                    'showProgressBar': false,
                    'showChips': false,
                    'showSuggestion': false,
                };
                break;
            case 'medications':
                object = {
                    'id': 0,
                    'drug_name': '',
                    'drug_dosage': '',
                    'drug_dosage_unit': '',
                    'frequency': '',
                    'duration': '',
                    'duration_unit': '',
                    'intake': '',
                    'remarks': '',
                    'type': 'tab',
                    'show_note': false,
                    'refill': false,
                    'processed': false,
                    'show_additional_info': false,
                    'check_morning': false,
                    'check_afternoon': false,
                    'check_evening': false,
                    'check_night': false,
                    'check_sos': false,
                    'showSuggestion': false,
                };
                break;
            case 'investigations':
                object = {
                    'id': 0,
                    'category': '',
                    'loinc_code': 0,
                    'status': '',
                    'remarks': '',
                    'term_id': 0,
                    'term_text': '',
                    'processed': false,
                    'showChips': false,
                    'showProgressBar': false,
                    'showSuggestion': false,
                    'type_radio': false,
                    'type_patho': false,
                    'isTyping': false

                };
                break;
            case 'referrals':
                object = {
                    'id': 0,
                    'referral_type': '',
                    'terms': 0,
                    'term_text': '',
                    'location': '',
                    'department': '',
                    'doctor_name': '',
                    'priority': '',
                    'referral_date': new Date(),
                    'status': '',
                    'diagnosis': '',
                    'diagnosis_term': '',
                    'meta': {},
                    'remarks': '',
                    'processed': false,
                    'showSuggestion': false,
                };
                break;
            case 'procedure':
                object = {
                    'id': 0,
                    'speciality': '',
                    'remarks': '',
                    'meta': {},
                    'status': '',
                    'term_id': 0,
                    'term_text': '',
                    'processed': false,
                    'showProgressBar': false,
                    'showSuggestion': false,
                };
                break;
            case 'results':
                object = {
                    'id': 0,
                    'test_result': '',
                    'remarks': '',
                    'type': 'text',
                    'json': {},
                    'showProgressBar': false,
                    'processed': false,
                    'showSuggestion': false,
                };
                break;
            case 'attachments':
                object = {
                    'id': 0,
                    'attachment_type': 'image/png',
                    'created_at': '',
                    'url': '',
                    'uuid': '',
                    'isDummy': true,
                    'showSuggestion': false,
                    'processing': false,
                };
                break;

            case 'family_history':
                object = {
                    'patient_id': patientId,
                    'relation': fromUnsavedBit ? unsavedRelation : '',
                    'name': '',
                    'diagnosis': '',
                    'diagnosed_at': new Date(),
                    'created_at': new Date(),
                    'updated_at': new Date(),
                    'processed': false,
                    'remark': fromUnsavedBit ? unsavedRemark : ''
                };
                break;

            case 'habits':
                object = {
                    'patient_id': patientId,
                    'habit_started_at': '',
                    'doctor_id': 0,
                    'remarks': '',
                    'created_at': new Date(),
                    'updated_at': new Date(),
                    'terms': 0,
                    'term_text': '',
                    'processed': false,
                    'suggestions': false,
                };
                break;

            case 'allergy':
                object = {
                    'patient_id': patientId,
                    'started_at': new Date(),
                    'doctor_id': doctor_id,
                    'reactions': fromUnsavedBit ? unsavedRemark : '',
                    'created_at': new Date(),
                    'updated_at': new Date(),
                    'terms': 0,
                    'substance': 0,
                    'term_name': '',
                    'substances': fromUnsavedBit ? unsavedRelation : '',
                    'processed': false,
                };
                break;
            case 'past-illness':

                object = {
                    'id': 0,
                    'patientId': patientId,
                    'remark': fromUnsavedBit ? unsavedRemark : '',
                    'processed': false
                };
                break;

            case 'past-medication':
                object = {
                    'patientId': '',
                    'remark': fromUnsavedBit ? unsavedRemark : '',
                    'processed': false
                };

                break;
            case 'past-treatment':
                object = {
                    'patient_id': patientId,
                    'doctor_id': doctor_id,
                    'uuid': '0',
                    'speciality': '',
                    'remarks': fromUnsavedBit ? unsavedRemark : '',
                    'meta': [],
                    'status': '',
                    'created_at': new Date(),
                    'soap': 1,
                    'term': 0,
                    'term_text': ''
                };
                break;
            case 'personal_history':
                object = {
                    'patient_id': patientId,
                    'doctor_id': doctor_id,
                    'uuid': '0',
                    'info': {},
                    'created_at': new Date(),
                };
                break;
            case 'clinical_notes':
                object = {
                    "id": 0,
                    "inspection": "",
                    "palpation": "",
                    "percussion": "",
                    "quscultation": "",
                    "system_wide_examination": "",
                    "key_observation": "",
                    'created_at': new Date(),
                };
                break;
            case 'diet_chart':
                object = {
                    'id': 0,
                    'meal_time': '',
                    'name': '',
                    'quantity_values': '',
                    'quantity_unit': '',
                    'weekend': 'false',
                    'same_time': false,
                    'same_day': false,
                };
                break;
        }
        this.debug_line_exection(this.page_name, method, 'Created New Object with value', {'data': {'object': object}});

        return object;
    }


    public deleteSection(section_name) {
        const method = 'deleteSection()';
        this.start_trace_log(this.page_name, method, method + ' function starts');
        if (confirm('Do you want to delete this section')) {
            for (let index = 0; index < this.component_mapingWithChips.length; index++) {
                if (this.component_mapingWithChips[index] === section_name) {
                    this.updateObjectOnChipsClick(true, section_name);
                    this.debug_line_exection(this.page_name, method, 'Found Chips matched with Section ',
                        {
                            'data': {
                                'section_name': section_name,
                                'chips_name': this.component_mapingWithChips[index]
                            }
                        });

                    this.component_mapingWithChips.splice(index, 1);
                    this.soap_chips.forEach((row) => {
                        if (row.component === section_name) {

                            row.isUsed = false;
                        }
                    });
                }
            }
            for (let position = 0; position < this.sideNavOption.patientSpecific.length; position++) {

                // @ts-ignore
                if (this.sideNavOption.patientSpecific[position].component_name === section_name) {
                    this.sideNavOption.patientSpecific.splice(position, 1);
                }
            }
            this.resetAllChips();
            this.highlightChips(true, section_name);
        }

        this.end_trace_log(this.page_name, method, method + ' function end');
    }

    public broadcastSoapModelToAllComponent(soapId) {
        let objectOfSoap = {};
        if (!soapId) {
            this.current_soap_model.chief_complaints.push(this.createNewObject('chiefComplaints', false, false, null, null));
            objectOfSoap = this.current_soap_model;
            this.soap_chips[0].isUsed = true;
            this.component_mapingWithChips.push(this.soap_chips[0].component);
        } else {

        }
    }


    public async addNewRow(objectToAdd, completeArray, position, needToSendOnServer, type, suggestion = [], isSoapIdExistsFromDialog = false): Promise<any> {
        const method = 'addNewRow()';
        this.start_trace_log(this.page_name, method, method + ' function starts');
        suggestion = [];
        let soapId: any;


        if ( this.current_soap_model.id ) soapId = this.current_soap_model.id; // rest of the gibberish code.
        else if (!this.getLocalData(Constants.KEY_PREVIOUS_SOAP_ID)) {
            if (isSoapIdExistsFromDialog) {
                soapId = this.getLocalData(Constants.KEY_SOAP_ID_FROM_DIALOG);
            } else {
                soapId = this.getLocalData(Constants.KEY_CURRENT_CONSULTATION).soap_id;
            }
        } else {
            soapId = this.getLocalData(Constants.KEY_PREVIOUS_SOAP_ID);
        }

        console.log("Current Soap model id: & localData's: ", this.current_soap_model.id, soapId);



        this.debug_line_exection(this.page_name, method, 'Current Soap Id I have', {'data': soapId});
        completeArray[position].showProgressBar = true;
        let typeDuplicate = type;
        if (typeDuplicate === 'results') {
            typeDuplicate = 'test-results';
        }
        if (needToSendOnServer) {
            this.trace_line_exection(this.page_name, method, 'Sending Data to the server',
                {
                    'data': {
                        'soapId': soapId,
                        'type': typeDuplicate,
                        'sendingObject': completeArray[position]
                    }
                });
            await this._rest.inserCurrentSoapElement(soapId, typeDuplicate, completeArray[position]).subscribe(result => {
                completeArray[position].showProgressBar = false;
                completeArray[position].processed = true;
                completeArray[position].id = result.row.id;
                completeArray[position].showSuggestion = false;


            });
        }

        this.end_trace_log(this.page_name, method, method + ' function ends');

        return completeArray;

    }


    addNextRowIfNotExists(type, completeArray, objectToAdd) {
        this.start_trace_log(this.page_name, 'addNextRowIfNotExists()', 'addNextRowIfNotExists() function starts');
        this.debug_line_exection(this.page_name, 'addNextRowIfNotExists()', 'funcation having initial data',
            {'data': {'type': type, 'completeArray': completeArray, 'objectToAdd': objectToAdd}});
        if (!this.checkIfAnyEmptyObjectExists(type, completeArray)) {
            completeArray.push(objectToAdd);
            this.debug_line_exection(this.page_name, 'addNextRowIfNotExists()', 'No Empty Object Exists',
                {'data': type});

        }

        this.end_trace_log(this.page_name, 'addNextRowIfNotExists()', 'addNextRowIfNotExists() function end');

        return completeArray;
    }


    public createSideNavOption(name, icon, component_name) {
        return {'name': name, 'icon': icon, 'component_name': component_name};
    }


    public updateObjectOnChipsClick(isRemoveRequest, section_name) {
        let sectionName = '';
        let currentSoapId = this.getLocalData(Constants.KEY_CURRENT_CONSULTATION).soap_id;
        switch (section_name) {
            case 'chief_complaints':
                isRemoveRequest ? this.current_soap_model.chief_complaints = [] : this.current_soap_model.chief_complaints.push(this.createNewObject('chiefComplaints'));
                sectionName = 'chief-complains';
                break;
            case 'examinations':
                isRemoveRequest ? this.current_soap_model.examinations = [] : this.current_soap_model.examinations.push(this.createNewObject('examination'));
                sectionName = 'examinations';
                break;
            case 'vitals':
                sectionName = 'vitals';
                isRemoveRequest ? this.current_soap_model.vitals = {} : this.current_soap_model.vitals = this.createNewObject('vitals', false, false);
                break;
            case 'personal_history':
                sectionName = 'personal-history';
                this.current_soap_model.personal_history = isRemoveRequest ? {} : this.createNewObject('personal_history');
                break;
            case 'clinical_notes':
                sectionName = 'clinical_notes';
                // @ts-ignore
                this.current_soap_model.clinical_notes = isRemoveRequest ? {} : this.createNewObject('clinical_notes');
                break;
            case 'diet_chart':
                sectionName = 'diet_chart';
                // @ts-ignore
                isRemoveRequest ? this.current_soap_model.diet_chart = [] : this.current_soap_model.diet_chart.push(this.createNewObject('diet_chart'));
                break;
            case 'diagnosis':
                isRemoveRequest ? this.current_soap_model.diagnosis = [] : this.current_soap_model.diagnosis.push(this.createNewObject('diagnosis'));
                sectionName = 'diagnosis';
                break;
            case 'medication':
                isRemoveRequest ? this.current_soap_model.medication = [] : this.current_soap_model.medication.push(this.createNewObject('medications'));
                sectionName = 'medications';
                break;
            case 'investigation':
                isRemoveRequest ? this.current_soap_model.investigation = [] : this.current_soap_model.investigation.push(this.createNewObject('investigations'));
                sectionName = 'investigations';
                break;
            case 'referrals':
                isRemoveRequest ? this.current_soap_model.referrals = [] : this.current_soap_model.referrals.push(this.createNewObject('referrals'));
                sectionName = 'referrals';
                break;
            case 'procedures':
                isRemoveRequest ? this.current_soap_model.procedures = [] : this.current_soap_model.procedures.push(this.createNewObject('procedure'));
                sectionName = 'procedures';
                break;
            case 'results':
                isRemoveRequest ? this.current_soap_model.results = [] : this.current_soap_model.results.push(this.createNewObject('results'));
                sectionName = 'test-results';
                break;
            case 'attachments':
                isRemoveRequest ? this.current_soap_model.attachments = [] : this.current_soap_model.attachments.push(this.createNewObject('attachments'));
                sectionName = 'attachments';
                break;
            case 'remark-follow-up':
                sectionName = section_name;
                break;
        }

        if (isRemoveRequest) {
            if (sectionName === 'remark-follow-up') {
                this._rest.updateRemarksAndFollowUp(currentSoapId, 'remark-follow-up', {
                    'remark': '',
                    'follow_up': ''
                }).subscribe(result => {
                    this.current_soap_model.id = result.id;
                });
            } else {
                this._rest.deleteSections(currentSoapId, sectionName).subscribe(result => {
                });
            }
        }
        //this.setDataToObservabla({'type': 'soap_model', 'data': this.current_soap_model});

    }


    public showSnackBar(message, action = '', isCustom = false, timer = 3000) {
        if (isCustom) this.snackBar.openFromComponent(CustomSnackbarComponent, <MatSnackBarConfig>{duration: timer});
        else this.snackBar.open(message, action, <MatSnackBarConfig>{duration: timer,});
    }

    getTimeDifferenceInYears(date) {
        return (new Date().getFullYear() - new Date(date).getFullYear());
    }

    leadNumberByZero(num) {
        return (num < 10 ? "0" + num : num );

    }

    processAllMeals(meals) {
        return meals.filter(meal => {
            if (meal.quantity && meal.quantity.length) {
                meal.quantity_values = meal.quantity + ' ' + meal.quantity_unit;
            }
            return meal;
        }).sort((a, b) => {
            if (!a.meal_time && b.meal_time) {
                return 1;
            } else if (a.meal_time && !b.meal_time) {
                return -1;
            } else if (!a.meal_time && !b.meal_time) {
                return 0;
            }

            if (!a.weekend && b.weekend) {
                return -1;
            } else if (a.weekend && !b.weekend) {
                return 1;
            }

            return a.meal_time - b.meal_time;
        }).map(row => {
            row.weekend = row.weekend ? "true" : "false";
            return row;
        });
    }

    getPatientUniqueNumber(address) {

        let currentDate = new Date();
        let year = currentDate.getFullYear().toString().substring(2, 4);
        let month = this.leadNumberByZero(currentDate.getMonth() + 1)
        let day = this.leadNumberByZero(currentDate.getDate());
        let hours = this.leadNumberByZero(currentDate.getHours());
        let minutes = this.leadNumberByZero(currentDate.getMinutes());
        let seconds = this.leadNumberByZero(currentDate.getSeconds());
        let time = hours + "" + minutes + "" + seconds;
        return address.substring(0, 3) + year + "" + month + "" + day + "" + time;
    }


    public removeSoapVsLocalSoap(remoteSoap, needToAddNewRow = false, forceNewRow = false) {


        const method = 'removeSoapVsLocalSoap()';
        this.start_trace_log(this.page_name, method, method + ' function starts');

        let chiefComplaintExists = false;
        this.current_soap_model.chief_complaints = remoteSoap.chief_complaints || [];
        this.current_soap_model.examinations = remoteSoap.examinations || [];
        //this.current_soap_model.vitals=remoteSoap.chief_complaints;
        this.current_soap_model.clinical_notes = remoteSoap.clinical_notes;
        this.current_soap_model.diagnosis = remoteSoap.diagnosis || [];
        this.current_soap_model.vitals = remoteSoap.vitals || {};

        this.current_soap_model.investigation = remoteSoap.investigations || [];
        // this.current_soap_model.attachments=remoteSoap.chief_complaints;
        this.current_soap_model.medication = remoteSoap.medications || [];
        this.current_soap_model.feedbacks = remoteSoap.feedbacks || [];
        this.current_soap_model.procedures = remoteSoap.procedures || [];
        this.current_soap_model.referrals = remoteSoap.referrals || [];
        this.current_soap_model.results = remoteSoap.test_results || [];
        this.current_soap_model.personal_history = remoteSoap.personal_history || [];
        this.current_soap_model.diet_chart = this.processAllMeals(remoteSoap.meals || []) || [];
        this.current_soap_model.remark = remoteSoap.remark || "";
        this.current_soap_model.meta = remoteSoap.meta || {};
        this.current_soap_model.id = remoteSoap.id;
        this.current_soap_model.follow_up = remoteSoap.follow_up || "";

        this.current_soap_model.created_at = new Date(remoteSoap.created_at);
        this.current_soap_model.consultationTime = new Date(remoteSoap.consultationTime);
        this.current_soap_model.patient_id = remoteSoap.patient_id;
        this.current_soap_model.consultation_code = remoteSoap.consultation_code;


        this.current_soap_model.attachments = remoteSoap.attachments || [];


        this.current_soap_model.chief_complaints.forEach((row) => {
            row.processed = true;
        });
        this.current_soap_model.examinations.forEach((row) => {
            row.processed = true;
        });
        this.current_soap_model.diagnosis.forEach((row) => {
            row.processed = true;
            row.showChips = false;
            try {
                row.term_text = row['term']['term_name'];
                row.term_id = row['term']['id'];
            } catch (err) {

            }
        });
        this.current_soap_model.investigation.forEach((row) => {
            row.processed = true;
            row.showChips = false;
            try {
                row.term_text = row.term.term_name;
                row.term_id = row.term.id;
            } catch (err) {

            }

            if (row.category === 'pathology') {
                row.type_patho = true;
            } else {
                row.type_radio = true;
            }
            delete row.term;

        });
        this.current_soap_model.medication.forEach((row) => {
            row.processed = true;
        });
        this.current_soap_model.referrals.forEach((row) => {
            row.processed = true;
        });

        this.current_soap_model.procedures.forEach((row) => {
            row.processed = true;
            row.term_text = row.term.term_body;
            delete row.term;

        });

        this.current_soap_model.results.forEach((row) => {
            row.processed = true;
        });

        this.current_soap_model.attachments.forEach((row) => {
            row.isDummy = false;
        });


        if (needToAddNewRow) {
            if (this.current_soap_model.chief_complaints.length > 0) {
                this.current_soap_model.chief_complaints.push(this.createNewObject('chiefComplaints'));
            }
            if (this.current_soap_model.examinations.length > 0) {
                this.current_soap_model.examinations.push(this.createNewObject('examination'));
            }
            if (this.current_soap_model.diagnosis.length > 0) {
                this.current_soap_model.diagnosis.push(this.createNewObject('diagnosis'));
            }
            if (this.current_soap_model.medication.length > 0) {
                this.current_soap_model.medication.push(this.createNewObject('medications'));
            }
            if (this.current_soap_model.referrals.length > 0) {
                this.current_soap_model.referrals.push(this.createNewObject('referrals'));
            }
            if (this.current_soap_model.procedures.length > 0) {
                this.current_soap_model.procedures.push(this.createNewObject('procedure'));
            }
            if (this.current_soap_model.results.length > 0) {
                this.current_soap_model.results.push(this.createNewObject('results'));
            }
            if (this.current_soap_model.investigation.length > 0) {
                this.current_soap_model.investigation.push(this.createNewObject('investigations'));
            }
            if (this.current_soap_model.diet_chart.length > 0) {
                this.current_soap_model.diet_chart.push(this.createNewObject('diet_chart'));
            }

            if (this.current_soap_model.attachments.length > 0) {
                this.current_soap_model.attachments.push(this.createNewObject('attachments'));
            }

            if (!this.current_soap_model.vitals || !this.current_soap_model.vitals['id']) {
                this.current_soap_model.vitals = this.createNewObject('vitals');
            }
        }

        if (forceNewRow && needToAddNewRow) {
            this.current_soap_model.medication.push(this.createNewObject('medications'));

        }

        if ((this.current_soap_model.examinations.length < 1)
            && (this.current_soap_model.diagnosis.length < 1)
            && (this.current_soap_model.medication.length < 1)
            && (this.current_soap_model.referrals.length < 1)
            && (this.current_soap_model.procedures.length < 1)

            && (this.current_soap_model.results.length < 1)
            && (this.current_soap_model.investigation.length < 1)
        ) {

            this.addNextRowIfNotExists('chief-complains', this.current_soap_model.chief_complaints, this.createNewObject('chiefComplaints'));

        }


        this.debug_line_exection(this.page_name, method, 'Processed soap from api and converted into proper structure', {'data': this.current_soap_model})
        this.end_trace_log(this.page_name, method, method + ' function ends');
    }


    getRestObject() {
        return this._rest;
    }

    selectSuggestion(section, selectedSuggestionObject, rowPosition, isFromChips = false) {

        const method = 'selectSuggestion()';
        this.start_trace_log(this.page_name, method, method + ' function starts');

        let objectToAdd = '';
        let complateArrayObjectToAdd = [];
        let section_type = '';
        switch (section) {
            case 'chief_complaints':
                objectToAdd = 'chiefComplaints';

                this.current_soap_model.chief_complaints[rowPosition].id = !this.current_soap_model.chief_complaints[rowPosition].id ? 0 : this.current_soap_model.chief_complaints[rowPosition].id;
                this.current_soap_model.chief_complaints[rowPosition].complaint = selectedSuggestionObject.term_body;
                this.current_soap_model.chief_complaints[rowPosition].showProgressBar = false;
                complateArrayObjectToAdd = this.current_soap_model.chief_complaints;
                section_type = 'chief-complains';


                this.debug_line_exection(this.page_name, method, 'selected the cheif complaint. and object made is made ', {
                    'data': {
                        'section': section_type,
                        'current_row': this.current_soap_model.chief_complaints[rowPosition],
                        'complete_array': complateArrayObjectToAdd
                    }
                });
                break;
            case 'diagnosis':
                objectToAdd = 'diagnosis';
                section_type = 'diagnosis';
                if (!isFromChips) {

                    this.current_soap_model.diagnosis[rowPosition].icd_code = selectedSuggestionObject.icd10_id;
                    this.current_soap_model.diagnosis[rowPosition].diagnosis = selectedSuggestionObject.icd10_description;
                } else {
                    this.current_soap_model.diagnosis[rowPosition].term_id = selectedSuggestionObject.id;
                    this.current_soap_model.diagnosis[rowPosition].diagnosis = selectedSuggestionObject.name;
                }
                this.current_soap_model.diagnosis[rowPosition].showChips = false;
                complateArrayObjectToAdd = this.current_soap_model.diagnosis;
                this.debug_line_exection(this.page_name, method,
                    'selected the diagnosis. and object made is',
                    {
                        'data': {
                            'section': section_type,
                            'current_row': this.current_soap_model.diagnosis[rowPosition],
                            'complete_array': complateArrayObjectToAdd,
                            'isFromChips': isFromChips
                        }
                    });

                break;
        }


        // this.addNewRow(this.createNewObject(objectToAdd), complateArrayObjectToAdd, rowPosition, true, section_type).then(result => {

        // });

        this.end_trace_log(this.page_name, method, method + ' function ends');

    }

    medicineFrequenceImporter(morning, afternoon, evening, night, sos) {
        let frequency = 0;
        if (morning) {
            frequency += 1;
        }
        if (afternoon) {
            frequency += 2;
        }
        if (evening) {
            frequency += 4;
        }
        if (night) {
            frequency += 8;
        }
        if (sos) {
            frequency += 16;
        }

        return frequency;
    }

    async deleteCurrentRow(row_type, currentComponentArray, position, soapId): Promise<any> {
        const method = 'deleteCurrentRow()';
        this.start_trace_log(this.page_name, method, method + ' function starts');
        if (currentComponentArray[position].id) {
            this.debug_line_exection(this.page_name, method, 'Deleting Current Row', {
                'data': {'soap_id': soapId, 'rowType': row_type, 'delete_id': currentComponentArray[position].id}
            });

            await this._rest.deleteSoapComponentRow(soapId, row_type, currentComponentArray[position].id).subscribe(result => {
                currentComponentArray.splice(position, 1);
            });
        } else {
            currentComponentArray.splice(position, 1);
        }

        this.start_trace_log(this.page_name, method, method + ' function end');
        return currentComponentArray;
    }


    async addHistoryObject(type, object, completeArray, skipServerCall = false): Promise<any[]> {

        const method = 'addHistoryObject()';
        this.start_trace_log(this.page_name, method, method + ' function starts');


        let index = 0;
        const objectToSend = {'type': type, 'data': object};
        this.debug_line_exection(this.page_name, method, 'function having initial data', {'data': objectToSend});
        switch (type) {
            case 'allergy':
                // this.patientHistoryObject.allergies.push(object);
                break;
            case 'family_history':
                // this.patientHistoryObject.familyHistory.push(object);
                break;
            case 'procedure':
                this.patientHistoryObject.past_treatment.push(object);
                index = this.patientHistoryObject.past_treatment.length - 1;
                break;
            case 'past-illness':
                this.patientHistoryObject.past_illness_2.push(object);
                break;
            case 'past-medication':
                this.patientHistoryObject.past_medication_2.push(object);
                break;
        }


        if (!skipServerCall) {
            this.debug_line_exection(this.page_name, method, 'sending whole data to server', {'data': objectToSend});

            await this._rest.addHistoryObject(objectToSend).subscribe(row => {

                try {
                    if (type === 'procedure') {
                        this.patientHistoryObject.past_treatment[index].id = row.data.id;
                    } else if (type === 'allergy') {
                        completeArray[index].id = row.data.id;
                    }
                } catch (e) {
                }
            });
        }
        this.end_trace_log(this.page_name, method, method + ' function end');

        return completeArray;
    }


    checkIfAnyEmptyObjectExists(type, completeArray) {

        const method = 'checkIfAnyEmptyObjectExists()';
        this.start_trace_log(this.page_name, method, method + ' function starts');
        this.debug_line_exection(this.page_name, method, 'function having data', {
            'data': {'type': type, 'completeArray': completeArray}
        });
        let isEmptyObjectExists = false;
        let keyToFind = '';
        switch (type) {
            case 'chief-complains':
                keyToFind = 'complaint';
                break;
            case 'medications':
                keyToFind = 'drug_name';
                break;
            case 'procedures':
                keyToFind = 'term_text';
                break;
            case 'examinations':
                keyToFind = 'remarks';
                break;
            case 'diagnosis':
                keyToFind = 'diagnosis';
                break;
            case 'investigations':
                keyToFind = 'term_text';
                break;
            case 'referrals':
                keyToFind = 'remarks';
                break;
            case 'test-result':
                keyToFind = 'remarks';
                break;


        }


        for (let index = 0; index < completeArray.length; index++) {
            if (completeArray[index][keyToFind] === '') {
                isEmptyObjectExists = true;
                break;
            }
        }

        this.debug_line_exection(this.page_name, method, 'is Object empty', {'data': isEmptyObjectExists});
        this.end_trace_log(this.page_name, method, method + ' function ends');

        return isEmptyObjectExists;
    }

    medicineFrequencyExtractor(number, withSos = false) {
        const daily = ('' + (number >>> 0).toString(2)).padStart(5, '0').split("").reverse().join("-");

        return withSos ? (daily.substring(0, 7) + ((number > 15) ? " SOS" : "")) : daily;
    }


    refillOrder(isRemoveRequest, completeArray, object, position, term) {
        if (isRemoveRequest) {
            completeArray.splice(position, 1);
            this.showSnackBar(term + ' Removed from Current Soap', '');
        } else {
            completeArray.push(object);
            this.showSnackBar(term + ' Added to current Soap', '');

        }
    }


    getFocusOnNextElement(suggestionArray, ChipsArray, position, id_term) {

        const method = 'getFocusOnNextElement()';
        this.start_trace_log(this.page_name, method, method + ' function starts');

        setTimeout(() => {
            try {
                suggestionArray = [];
            } catch (err) {

            }
            try {
                ChipsArray = [];
            } catch (err) {

            }

            let positionInc = position + 1;
            let id = id_term + positionInc
            this.sendFocusToElementId(id);
        }, 10);

        this.end_trace_log(this.page_name, method, method + ' function end');

    }


    sendFocusToElementId(id) {
        const method = 'getFocusOnNextsendFocusToElementIdElement()';
        this.start_trace_log(this.page_name, method, method + ' function starts');

        setTimeout(() => {
            let element = document.getElementById(id);
            element.focus();
            this.debug_line_exection(this.page_name, method, 'Sending Focus to Id ', {'data': id});
        }, 200);

        this.end_trace_log(this.page_name, method, method + ' function end');
    }

    sendCompleteDataToServer() {

        const method = 'sendCompleteDataToServer()';
        this.start_trace_log(this.page_name, method, method + ' function starts()');


        let objectToProcess = JSON.parse(JSON.stringify(this.current_soap_model));
        for (let indexOfCC = 0; indexOfCC < objectToProcess.chief_complaints.length; indexOfCC++) {
            if (objectToProcess.chief_complaints[indexOfCC].complaint === '') {
                objectToProcess.chief_complaints.splice(indexOfCC, 1);
            }
        }


        for (let indexOfexam = 0; indexOfexam < objectToProcess.examinations.length; indexOfexam++) {
            if (objectToProcess.examinations[indexOfexam].remarks === '') {
                objectToProcess.examinations.splice(indexOfexam, 1);
            }
        }


        for (let indexOfmedi = 0; indexOfmedi < objectToProcess.medication.length; indexOfmedi++) {


            if (!objectToProcess.medication[indexOfmedi].processed && objectToProcess.medication[indexOfmedi].drug_name !== '') {
                this.setDataToObservabla({
                    'type': 'processThisMedicine',
                    'data': {medicine: objectToProcess.medication[indexOfmedi], position: indexOfmedi}
                });
            }
            if (objectToProcess.medication[indexOfmedi].drug_name === '') {
                objectToProcess.medication.splice(indexOfmedi, 1);
            }

        }

        for (let indexOfdiag = 0; indexOfdiag < objectToProcess.diagnosis.length; indexOfdiag++) {
            if (objectToProcess.diagnosis[indexOfdiag].diagnosis === '') {
                objectToProcess.diagnosis.splice(indexOfdiag, 1);
            }
        }

        for (let indexOfinves = 0; indexOfinves < objectToProcess.investigation.length; indexOfinves++) {
            if (!objectToProcess.investigation[indexOfinves].processed && objectToProcess.investigation[indexOfinves].term_text !== '') {
                this.setDataToObservabla({
                    'type': 'unprocessed_investigation',
                    'data': {investigation: objectToProcess.investigation[indexOfinves], position: indexOfinves}
                });
            }
            if (objectToProcess.investigation[indexOfinves].term_text === '') {
                objectToProcess.investigation.splice(indexOfinves, 1);
            }

        }

        for (let indexOfProc = 0; indexOfProc < objectToProcess.procedures.length; indexOfProc++) {
            if (objectToProcess.procedures[indexOfProc].term_text === '') {
                objectToProcess.procedures.splice(indexOfProc, 1);
            }
        }


        for (let indexOfRef = 0; indexOfRef < objectToProcess.referrals.length; indexOfRef++) {
            if (objectToProcess.referrals[indexOfRef].remarks === '') {
                objectToProcess.referrals.splice(indexOfRef, 1);
            }
        }

        for (let index_attachment = 0; index_attachment < objectToProcess.attachments.length; index_attachment++) {
            if (objectToProcess.attachments[index_attachment].url === '') {
                objectToProcess.attachments.splice(index_attachment, 1);
            }
        }


        this.debug_line_exection(this.page_name, method, 'Complete Soap Data Processed and ready to send on server', {'data': objectToProcess});
        this.end_trace_log(this.page_name, method, method + ' function end');

        return objectToProcess;
    }


    resetAllChips() {
        this.start_trace_log(this.page_name, 'resetAllChips()', 'resetAllChips() function starts');
        for (let index = 0; index < this.soap_chips.length; index++) {
            this.soap_chips[index].isHighLighted = false;
        }
        this.end_trace_log(this.page_name, 'resetAllChips()', 'resetAllChips() function end');

    }

    highlightChips(isDeleteRequest, componentName) {
        if (isDeleteRequest) {
            let isChipHighLighted = false;
            let tempPosition = 0;
            let idOfCurrentChips = this.getIdOfCurrentComponent(componentName);
            for (let smaller = idOfCurrentChips; smaller >= 0; smaller--) {
                if (idOfCurrentChips > this.soap_chips[smaller].id && !this.soap_chips[smaller].isUsed) {
                    tempPosition = smaller;
                    isChipHighLighted = true;

                }
            }

            if (isChipHighLighted) {
                this.soap_chips[tempPosition].isHighLighted = true;
                return true;
            } else {
                this.soap_chips[idOfCurrentChips].isHighLighted = true;
                return false;
            }

        } else {
            let idOfCurrentChips = this.getIdOfCurrentComponent(componentName);
            let isChipHighLighted = false;
            for (let index = 0; index < this.soap_chips.length; index++) {
                if (this.soap_chips[index].id > idOfCurrentChips) {
                    this.soap_chips[index].isHighLighted = true;
                    isChipHighLighted = true;
                    break;
                }
            }
            if (!isChipHighLighted) {
                this.soap_chips[idOfCurrentChips].isHighLighted = true;
            }
        }
    }


    getIdOfCurrentComponent(componentName) {
        let idOfCurrentChips = 0;
        for (let index = 0; index < this.soap_chips.length; index++) {
            if (this.soap_chips[index].component === componentName) {
                idOfCurrentChips = this.soap_chips[index].id;
                break;
            }
        }


        return idOfCurrentChips;
    }


    showWizardOfInformation() {


        const dialogConfig = new MatDialogConfig();
        dialogConfig.minHeight = '100%';
        dialogConfig.minWidth = '100%';
        dialogConfig.height = '100%';
        dialogConfig.width = '100%';
        dialogConfig.maxHeight = '100%';

        dialogConfig.maxWidth = '100%';
        dialogConfig.data = {'util': this};


        const dialogRef = this.dialog.open(PatientUniqueIdComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {

        });
    }


    sentizeUniqueId(uniqueId) {
        if (!uniqueId) return "";

        uniqueId = uniqueId.toString().replace(/[-]/g, "");
        uniqueId = (uniqueId.length >= 10 ) ? uniqueId : "91" + uniqueId;
        let uid;
        const isMobile = uniqueId.length === 12;
        if (isMobile && (!! uniqueId.match(/^[0-9]/))) {
          uid = uniqueId.substr(2); // replace only first occurance
        } else {
          uid = uniqueId;
        }
        const isOnlyNumeric = !! uid.match(/^[0-9]/);

        let parts = [];
        if (isOnlyNumeric) {
            parts = [
                uid.substr(0, 4),
                uid.substr(4, 4),
                uid.substr(8, 4)
            ];
        } else {
            parts = [
                uid.substr(0, 3),
                uid.substr(3, 4),
                uid.substr(7, 4),
                uid.substr(11, 4)
            ];
        }

        uid = "";
        parts.forEach(function (part, index) {
            uid += part;

            if (parts.length === (index + 1 )) return;

            if (part && !isOnlyNumeric && (index === 0) && (part.length === 3)) uid += "-";
            else if (part && (part.length === 4)) uid += "-";
        });

        let toSend = "";
        if (isMobile)
            toSend = uniqueId.substr(0, 2)
                + "-" + uniqueId.substr(2, 4)
                + "-" + uniqueId.substr(6, 4)
                + "-" + uniqueId.substr(10);
        else toSend = "91-" + uid;

        return toSend.match(/[0-9a-zA-Z]+[0-9a-zA-Z-]+[0-9a-zA-Z]+/)[0] || "";
    }

    public processMedicine(medication, doSave = false) {
        medication.processed = true;
        medication.frequency = this.medicineFrequenceImporter(medication.check_morning,
            medication.check_afternoon, medication.check_evening,
            medication.check_night, medication.check_sos);

        medication.duration_unit = medication.duration.split(' ')[1] || medication.duration_unit;
        medication.duration = medication.duration.split(' ')[0];

        medication.drug_dosage_unit = medication.drug_dosage.split(' ')[1];
        medication.drug_dosage = medication.drug_dosage.split(' ')[0];
        medication.intake = medication.intake || "";

        return medication;
    }


    setHeaderPatientInfo(consultation) {
        if ( !consultation || !consultation['patient']) return;

        const age = this.getTimeDifferenceInYears(consultation['patient']['date_of_birth']);
        const gen = consultation['patient'].gender.toString().substr(0, 1).toUpperCase();
        const pic = consultation['patient']['profile_pic'] || '/assets/images/patientpic.png';

        this.setHeaderData(
            `${consultation['patient']['name']} ( ${gen}, ${age} yrs )`,
            pic, `UID: ${this.sentizeUniqueId(consultation['user_login'])}`
        );
    }


    add_debug_log(level_code, level_name, pagename, method_name, message, param = {}) {
        try {
            const object = {
                'level_name': level_name,
                'page_name': pagename,
                'method': method_name,
                'message': message,
                'time_stamp': new Date(),
                'function_data': param
            };
            const level_required = this.getLocalData(Constants.KEY_REQUIRED_LOG_LEVEL);
            if ((level_required > 0) && (level_required >= level_code)) {

                if (this.getLocalData(Constants.KEY_SEND_LOGS_TO_SOCKET)) {
                    const getToken = this.getLocalData(Constants.KEY_CURRENT_USER).access_token;
                    this.socket.send_message('write_log', {
                        'token': getToken,
                        client: 'emr',
                        'level': level_code,
                        'body': object
                    });
                }
            }
        } catch (err) {

        }

    }

    start_trace_log(page_name, method_name, message, params = {}) {
        message = Constants.LOG_MISC.BLOCK_START + ' ' + message;
        this.add_debug_log(Constants.LOG_LEVEL_CODE.TRACE, Constants.LOG_LEVEL_TYPE.TRACE,
            page_name, method_name, message, params);
    }

    trace_line_exection(page_name: any, method_name: any, message: any, params: any) {
        message = Constants.LOG_MISC.METHOD_LINE_EXECUTION + ' ' + message;
        this.add_debug_log(Constants.LOG_LEVEL_CODE.TRACE, Constants.LOG_LEVEL_TYPE.TRACE,
            page_name, method_name, message, params);
    }

    end_trace_log(page_name, method_name, message, params = {}) {
        message = Constants.LOG_MISC.BLOCK_END + ' ' + message;
        this.add_debug_log(Constants.LOG_LEVEL_CODE.TRACE, Constants.LOG_LEVEL_TYPE.TRACE,
            page_name, method_name, message, params);
    }

    start_info_log(page_name, method_name, message, params = {}) {
        message = Constants.LOG_MISC.BLOCK_START + ' ' + message;
        this.add_debug_log(Constants.LOG_LEVEL_CODE.INFO, Constants.LOG_LEVEL_TYPE.INFO,
            page_name, method_name, message, params);
    }

    info_line_exection(page_name: any, method_name: any, message: any, params: any) {
        message = Constants.LOG_MISC.METHOD_LINE_EXECUTION + ' ' + message;
        this.add_debug_log(Constants.LOG_LEVEL_CODE.INFO, Constants.LOG_LEVEL_TYPE.INFO,
            page_name, method_name, message, params);

    }

    end_infor_log(page_name, method_name, message, params = {}) {
        message = Constants.LOG_MISC.BLOCK_END + ' ' + message;
        this.add_debug_log(Constants.LOG_LEVEL_CODE.INFO, Constants.LOG_LEVEL_TYPE.INFO,
            page_name, method_name, message, params);

    }

    start_debug_log(page_name, method_name, message, params = {}) {
        message = Constants.LOG_MISC.BLOCK_START + ' ' + message;
        this.add_debug_log(Constants.LOG_LEVEL_CODE.DEBUG, Constants.LOG_LEVEL_TYPE.DEBUG,
            page_name, method_name, message, params);
    }

    debug_line_exection(page_name: any, method_name: any, message: any, params: any) {
        message = Constants.LOG_MISC.METHOD_LINE_EXECUTION + ' ' + message;
        this.add_debug_log(Constants.LOG_LEVEL_CODE.DEBUG, Constants.LOG_LEVEL_TYPE.DEBUG,
            page_name, method_name, message, params);
    }

    end_debug_log(page_name, method_name, message, params = {}) {
        message = Constants.LOG_MISC.BLOCK_END + ' ' + message;

        this.add_debug_log(Constants.LOG_LEVEL_CODE.DEBUG, Constants.LOG_LEVEL_TYPE.DEBUG,
            page_name, method_name, message, params);

    }


    start_warn_log(page_name, method_name, message, params = {}) {
        message = Constants.LOG_MISC.BLOCK_START + ' ' + message;
        this.add_debug_log(Constants.LOG_LEVEL_CODE.WARN, Constants.LOG_LEVEL_TYPE.WARN,
            page_name, method_name, message, params);

    }

    warn_line_exection(page_name: any, method_name: any, message: any, params: any) {
        message = Constants.LOG_MISC.METHOD_LINE_EXECUTION + ' ' + message;
        this.add_debug_log(Constants.LOG_LEVEL_CODE.WARN, Constants.LOG_LEVEL_TYPE.WARN,
            page_name, method_name, message, params);
    }

    end_warn_log(page_name, method_name, message, params = {}) {
        message = Constants.LOG_MISC.BLOCK_END + ' ' + message;

        this.add_debug_log(Constants.LOG_LEVEL_CODE.WARN, Constants.LOG_LEVEL_TYPE.WARN,
            page_name, method_name, message, params);

    }

    start_error_log(page_name, method_name, message, params = {}) {
        message = Constants.LOG_MISC.BLOCK_START + ' ' + message;

        this.add_debug_log(Constants.LOG_LEVEL_CODE.ERROR, Constants.LOG_LEVEL_TYPE.ERROR,
            page_name, method_name, message, params);

    }

    error_line_exection(page_name: any, method_name: any, message: any, params: any) {
        message = Constants.LOG_MISC.METHOD_LINE_EXECUTION + ' ' + message;
        this.add_debug_log(Constants.LOG_LEVEL_CODE.ERROR, Constants.LOG_LEVEL_TYPE.ERROR,
            page_name, method_name, message, params);
    }

    end_error_log(page_name, method_name, message, params = {}) {
        message = Constants.LOG_MISC.BLOCK_END + ' ' + message;

        this.add_debug_log(Constants.LOG_LEVEL_CODE.ERROR, Constants.LOG_LEVEL_TYPE.ERROR,
            page_name, method_name, message, params);

    }

    start_fatal_log(page_name, method_name, message, params = {}) {
        message = Constants.LOG_MISC.BLOCK_START + ' ' + message;

        this.add_debug_log(Constants.LOG_LEVEL_CODE.FATAL, Constants.LOG_LEVEL_TYPE.FATAL,
            page_name, method_name, message, params);

    }

    end_fatal_log(page_name, method_name, message, params = {}) {
        message = Constants.LOG_MISC.BLOCK_END + ' ' + message;

        this.add_debug_log(Constants.LOG_LEVEL_CODE.FATAL, Constants.LOG_LEVEL_TYPE.FATAL,
            page_name, method_name, message, params);

    }


    fatal_line_exection(page_name: any, method_name: any, message: any, params: any) {
        message = Constants.LOG_MISC.METHOD_LINE_EXECUTION + ' ' + message;
        this.add_debug_log(Constants.LOG_LEVEL_CODE.FATAL, Constants.LOG_LEVEL_TYPE.FATAL,
            page_name, method_name, message, params);
    }


    getCurrentTime() {

        let currentDate = new Date();
        let year = currentDate.getFullYear();
        let month = this.leadNumberByZero(currentDate.getMonth() + 1)
        let day = this.leadNumberByZero(currentDate.getDate());
        let hours = this.leadNumberByZero(currentDate.getHours());
        let minutes = this.leadNumberByZero(currentDate.getMinutes());
        let seconds = this.leadNumberByZero(currentDate.getSeconds());
        let time = hours + ":" + minutes + ":" + seconds;
        return year + "-" + month + "-" + day + " " + time;
    }

    public static getExtensionFromFilename(fileName) {
        return fileName.slice(fileName.lastIndexOf('.') + 1);
    }

    public static isImageType(url) {
        return ['png', 'jpeg', 'jpg', 'gif', 'bmp']
                .indexOf(UtilityService.getExtensionFromFilename(url)) > -1;
    }

    public getAttachmentHref(url) {
        return UtilityService.isImageType(url)
            ? ('/assets/show-image.html?image=' + url)
            : url;
    }

    getAttachmentThumb(url) {
        return UtilityService.isImageType(url)
            ? url
            : ('/assets/icons/file-types-png/' + UtilityService.getExtensionFromFilename(url) + '.png');
    }

    public getFirstCharOrName(name) {
        try {
            let patientName = name;
            if (name) {
                patientName = name[0].toUpperCase();
            }
            return patientName;

        } catch (error) {
            this.error_line_exection(this.page_name, 'getFirstCharOrName()', 'In Catch Block', error);
        }

    }

    public sendStaffPMSStat(type, soapId = 0) {

        soapId = soapId || this.current_soap_model.id || 0;
        console.log("sending staff stat", soapId, type);

        let metaKey = "";
        if (['staff-meds-delivered', 'staff-meds-from-market', 'staff-meds-refused'].indexOf(type) > -1) {
            if (! this.current_soap_model.medication.filter(medicine => !! medicine.id ).length)
                return alert("Needs to have alteast 1 medicine");

            metaKey = 'staff-meds-order';
        }
        if (['staff-labs-delivered', 'staff-labs-from-market', 'staff-labs-refused'].indexOf(type) > -1) {
            if (! this.current_soap_model.investigation.filter(investigation => !! investigation.id ).length)
                return alert("Needs to have alteast 1 investigation");

            metaKey = 'staff-labs-order';
        }
        if (['staff-followup-done'].indexOf(type) > -1) metaKey = type;

        // sending soapId from calls instead.
        // if (['staff-new-consultation', 'staff-followup-consultation'].indexOf(type) > -1) soapId = 0;

        // already followup on this soap, dont send so many times
        if ((metaKey === 'staff-followup-done') && this.current_soap_model.meta[metaKey]) return;

        if (metaKey && metaKey.length) {
            this.current_soap_model.meta[metaKey] = type;

            this._rest.updateMeta(soapId, this.current_soap_model.meta)
                .then(resp => {
                    console.log("UPdating meta: ", resp);

                    this.setDataToObservabla({
                        type: 'showStaffMedsOrderLayout',
                        data: false,
                    });
                });
        }

        const currentUser = this.getLocalData(Constants.KEY_CURRENT_USER);
        if (currentUser && currentUser['meta'] && currentUser['meta']['type'] && (currentUser['meta']['type'] === 'assistant')) {}
        else return "Stats will only be send for assistants.";

        this.setDataToObservabla({
            type: 'showStaffMedsOrderLoading',
            data: true,
        });

        if ([
            'staff-meds-delivered', 'staff-meds-from-market', 'staff-labs-delivered', 'staff-labs-from-market'
            ].indexOf(type) > -1) {
            this.setDataToObservabla({
                "type": "firstSendPrescription",
                "data": {
                    "type": type,
                    "soapId": soapId,
                }
            });
        } else {
            this._rest.sendStaffPMSStats(soapId, type)
                .then((resp) => {
                    if (! resp['success']) return;

                    this.setDataToObservabla({
                        type: 'showStaffMedsOrderLoading',
                        data: false,
                    });
                });
        }

        if (['staff-new-consultation', 'staff-followup-consultation'].indexOf(type) > -1)
            this.showSnackBar("Stored in PMS Stats Successfully");
    }

    public properStaffMedsStatus (keyword) {
        if (! keyword) return "";
        if (typeof keyword === 'boolean') return "Delivered";

        const status = keyword.split("-").splice(2).join(" ");

        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    public showDateLocally(date) {
        if (typeof date === "string")
            date = new Date(date);

        return this.niceTimeFormat(date) + " on " + this.niceDateFormat(date);
    }

    public niceDateFormat(date) {
        if (typeof date === "string")
            date = new Date(date);

        if (typeof date === "number")
            date = new Date(date);

        if ( date == null ) return "null";

        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return weekdays[date.getDay()] + " " + date.getDate() + " " + months[date.getMonth()] + ", " + date.getFullYear();
    }

    public niceTimeFormat(date) {

        if (typeof date === "string")
            date = new Date(date);

        return (date.getHours() > 12 ? date.getHours() - 12 : date.getHours())
            + ':' + ((date.getMinutes() < 10) ? ("0" + date.getMinutes()) : date.getMinutes())
            + ' ' + (date.getHours() >= 12 ? "PM" : "AM");
    }

    public daysOptionToDay (day, startDate = null) {
        const wordDaysMapping = {
            'Day(s)': 1,
            'Week(s)': 7,
            'Month(s)': 30,
        };

        let now = startDate ? new Date(startDate.getTime()) : new Date(this.current_soap_model.created_at);

        const parts = day.split(" ");
        if (parts.length === 1) parts.push("Day(s)");

        const days = parseInt(parts[0]) * (wordDaysMapping[parts[1]] || 1);

        now.setDate(now.getDate() + days);

        return now;
    }

    public saveAllMedicines () {
        let objectToProcess = JSON.parse( JSON.stringify( this.current_soap_model ));

        for (let indexOfmedi = 0; indexOfmedi < objectToProcess.medication.length; indexOfmedi++) {
            if (! objectToProcess.medication[indexOfmedi].processed && objectToProcess.medication[indexOfmedi].drug_name !== '') {
                this.setDataToObservabla({
                    'type': 'processThisMedicine',
                    'data': {medicine: objectToProcess.medication[indexOfmedi], position: indexOfmedi}
                });
            }
        }
    }

    public arraySearch(arr, key, value) {
        for ( let i = 0; i < arr.length; i ++)
            if (arr[i][key] === value)
                return i;

        return -1;
    }

    public timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public smartFilterRemove91(uid) {
        uid = "" + uid;

        if ([14, 17, 12].indexOf(uid.length) > -1)
            return uid.substring(2);
    }

    public serializeObjectToArray(jsonObj) {
        const arr = [];

        for ( let key in jsonObj) {
            if ( ! jsonObj.hasOwnProperty(key)) return;

            arr.push(jsonObj[key]);
        }

        return arr;
    }

    public getCountryFromMobile(mobile) {
        for (let i = 0; i < this.countries.length; i ++ ) {
            if ( mobile.indexOf(this.countries[i].code) === 0)
                return this.countries[i];
        }

        // default value
        return this.countries[0];
    }
}

