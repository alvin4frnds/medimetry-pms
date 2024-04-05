import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { UtilityService } from "../services/utility.service";
import { RestService } from "../services/rest.service";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Observable } from "rxjs/index";
import { map } from "rxjs/internal/operators";
import { MatDialog, MatIconRegistry } from "@angular/material";
import { Constants } from "../Utilities/Constants";
import { Router } from "@angular/router";
import { Key } from 'selenium-webdriver';
import { PatientUniqueIdComponent } from '../patient-unique-id/patient-unique-id.component';
import { ScreenDetectorService } from '../services/screen-detector.service';
import {Location} from "@angular/common";

@Component({
    selector: 'app-create-patient',
    templateUrl: './create-patient.component.html',
    styleUrls: ['./create-patient.component.css']
})
export class CreatePatientComponent implements OnInit, OnDestroy, AfterViewInit {


  page_name=Constants.PAGE_NAME.CREATE_CONSULTATION;
  patientRelation=Constants.FAMILY_RELATION;
  public static readonly DEFAULT_CENTER_CODE = 'medimetry-camps-h3aFs6nysqPwmc3ugNAG6auNJP4ZupxA';

    currentUser;
    completeSearchedObject = {};
    isComponentAlreadyDestroyed = false;
    isAddressAlreadyStored = false;
    isMobileMine = true;


    // Just to set the name of the Doctor if count is 1
    public doctor = {'name': ''};


    general_settings = {
        'isSearchingPhoneNumber': false,
        'foundPatientsData': false,
        'setIconForPhoneFound': 'check',
        'patientListFound': [],
        'creatingConsultation': false
    };

    arr_bindedDoctors = [];
    arr_registrationChannels = [];
    isSearchingPhone = false;
    partialSearchResults = [];

    selectDoctorName = "";

    form_data = {
        'user_name': '',
        'user_mobile': '',
        'user_email': '',
        'user_dob': '',
        'patient_name': '',
        'patient_age': '',
        'patient_gender': '',
        'patient_relation': '',
        'chief_complaints': 'Clinical Visit at ' + new Date(),
        'center_code': '',
        'channel_name': '',
        'consult_type': 'AUDIO',
        'speciality': '',
        'doctor': '',
        'address': '',
        'patient_mobile':'',
        'country': 'india',

    };


    public genderCheckBox = [false, false];

    default_form_data = {
        'user_name': '',
        'user_mobile': '',
        'user_email': '',
        'user_dob': '',
        'patient_name': '',
        'patient_age': '',
        'patient_gender': '',
        'patient_relation': '',
        'chief_complaints': 'Clinical Visit at ' + new Date(),
        'center_code': '',
        'channel_name': '',
        'consult_type': 'AUDIO',
        'speciality': '',
        'doctor': '',
        'address': '',
        'patient_mobile':'',
        'country': 'india',
      'soapAppointmentDate': '',
    };


    isToolbarAlreadySet = false;

    public patientList = [];
    searchBegin = false;
    progressBar = false;
    showNoPatientFoundScreen = false;
    isMobile;
    isTablet;

    csvLoadings = false;
    csvLoadingMessage = "";


    constructor(public _util: UtilityService, public _rest: RestService, private screen: ScreenDetectorService,
                public dialog: MatDialog, public router: Router,
                private location: Location
                ) {
    }

    ngOnInit() {
        if ( ! this._util.getLocalData(Constants.KEY_SELECTED_COUNTRY))
            this._util.saveLocalData(Constants.KEY_SELECTED_COUNTRY, 'india');

        this.form_data.country = this._util.getLocalData(Constants.KEY_SELECTED_COUNTRY);

      this._util.start_trace_log(this.page_name,'ngOnInit()','ngOnInit() function starting');
        this.patientList = [];
        this.currentUser = this._util.getLocalData(Constants.KEY_CURRENT_USER).user;
        this._util.trace_line_exection(this.page_name,'ngOnInit()','Fetching Local User from local storage',this.currentUser) ;
        this.adjustRegistrationChannel();
        if (this.currentUser.type === 'assistant') {
            this.getBindedDoctor();
        }
        this._util.getDataProviders().subscribe(row => {
            if (row.type && row.type === 'search' && row.path === '/create-patient') {
                if (!row.value) {
                    this.searchBegin = false;
                } else {
                    this.searchBegin = row.startSearch;
                    this.searchPatientByNumber(row.value);
                }
            }

            if (row.type && row.type == "newPatientWithSearchString") {
                this.router.navigate([Constants.NAVIGATION_URL.create_patient]);

                if(isNaN(row.data)) this.form_data.user_name = this.form_data.patient_name = row.data;
                else {
                    this.form_data.user_mobile = row.data;
                    this.searchPhoneNumber(row.data);
                }
            }
        });

        if (this._util.getLocalData(Constants.KEY_CURRENT_ADDRESS)) {
          this._util.debug_line_exection(this.page_name,'ngOnInit()','If Local data have address',{});
            this.isAddressAlreadyStored = true;
            this.form_data.address = this._util.getLocalData(Constants.KEY_CURRENT_ADDRESS);
            this._util.debug_line_exection(this.page_name,'ngOnInit()','Setting Address to form data address key',{'data':this.form_data.address});

          }

        this._util.end_trace_log(this.page_name,'ngOnInit()','ngOnInit() function end');

        if ( ! this.form_data.country)
            this.form_data.country = this._util.countries[0].name;
     }

     setCountry(country, event) {
         console.log("Country: ", country);

         this._util.saveLocalData(Constants.KEY_SELECTED_COUNTRY, country.name);
         this.form_data.country = country.name;
     }

     onSelectingCsv(event) {
         this.csvLoadingMessage = "Loading ...";
         var reader = new FileReader()
         var centerCode = this.form_data.center_code || ""

         reader.onload = (ev) => {
             // @ts-ignore
             this._rest.createConsultationsFromCSV(ev.target.result, centerCode)
                 .then((response) => {
                     this._util.showSnackBar(response['message']);

                     if ( response['success'])
                         alert("Your patient sheet is stored for processing, it will be processed tonight @ 3 A.M.")

                     this.csvLoadingMessage = ""
                 })
                 .catch((error) => {
                     console.error("Something went wrong: ", error)
                     this.csvLoadingMessage = ""
                 })
         }

         reader.readAsText(event.target.files[0], 'UTF-8');
     }

    searchPatientByNumber(value) {

      this._util.start_trace_log(this.page_name,'searchPatientByNumber()','searchPatientByNumber() function starting');


        this.form_data = this.default_form_data;
        this.patientList = [];
        if (value) {
            this.progressBar = true;
        }
        this.showNoPatientFoundScreen = false;
        this._rest.searchPatients({
            'searchQuery': value,
            'page': 1
        }).subscribe(row => {
            this.progressBar = false;
            // @ts-ignore
            if (row["patient"]["patients"]) {
                // @ts-ignore
                this.completeSearchedObject = row["patient"];
                // @ts-ignore
                this.patientList = row["patient"]["patients"];
                this.patientList.forEach((result) => {
                    result.date_of_birth = this._util.getTimeDifferenceInYears(result.date_of_birth);
                    result.address = row["patient"]["address"];
                });
            } else {
                this.patientList = [];
                this.showNoPatientFoundScreen = true;
                this.form_data.user_mobile = value;
                value = "";
            }

        });

        this._util.end_trace_log(this.page_name,'searchPatientByNumber()','searchPatientByNumber() function end');



    }

    ngOnDestroy(): void {
      this._util.start_trace_log(this.page_name,'ngOnDestroy()','ngOnDestroy() function starts');


        if (this.screen.deviceType.isMobile) {
            this.searchBegin = false;
            this.isComponentAlreadyDestroyed = true;
        }
        setTimeout(() => {
            if (this.isComponentAlreadyDestroyed) {
                this._util.setDataToObservabla({
                    "type": 'adjustToolbar',
                    'request_type': 'destroy',
                    'current_path': Constants.NAVIGATION_URL.create_patient
                });
            }
        }, 150);

        this.searchBegin = false;

        this._util.end_trace_log(this.page_name,'ngOnDestroy()','ngOnDestroy() function ends');

    }

    ngAfterViewInit(): void {
      this._util.start_trace_log(this.page_name,'ngAfterViewInit()','ngAfterViewInit() function starts');


        if (this.screen.deviceType.isMobile) {
            this.isToolbarAlreadySet = true;
        }
        setTimeout(() => {
            if (!this.isToolbarAlreadySet) {
                this._util.customizeSideNavOptions(false, null, null);
            } else {
                this._util.setDataToObservabla({
                    "type": 'adjustToolbar',
                    'request_type': 'create',
                    'current_path': Constants.NAVIGATION_URL.create_patient
                });

            }
        }, 250);


        this._util.end_trace_log(this.page_name,'ngAfterViewInit()','ngAfterViewInit() function end');

    }




    setFormDataToSearchedPatient(event, patientObject, isFormValue = false) {

      this._util.start_trace_log(this.page_name,'setFormDataToSearchedPatient()','setFormDataToSearchedPatient() function starts');



        let event_duplicate = event;
        if (!event) {
            event_duplicate = {'isUserInput': true};
        }



        if (event_duplicate.isUserInput) {
            this.searchBegin = false;
            this.showNoPatientFoundScreen = false;

            let completeObject = !isFormValue ? this.completeSearchedObject : this.general_settings.patientListFound;

            let userCountry = this._util.getCountryFromMobile(completeObject['mobile']);

            this.form_data = {
                // @ts-ignore
                'user_name': completeObject['name'],
                // @ts-ignore
                'user_mobile': completeObject['mobile'],
                // @ts-ignore
                'user_email': completeObject['email'],
                'user_dob': '',
                'patient_name': patientObject.name,
                'patient_age': patientObject.date_of_birth ? this._util.getTimeDifferenceInYears(patientObject.date_of_birth) : patientObject.date_of_birth,
                'patient_gender': patientObject.gender,
                'patient_relation': patientObject.relation,
                'chief_complaints': 'Clinical Visit at ' + new Date(),
                'center_code': patientObject.center_code,
                'channel_name': patientObject.channel_name,
                'consult_type': 'AUDIO',
                'speciality': '',
                'doctor': '',
                'address': this.form_data.address?this.form_data.address:'',
                'patient_mobile': patientObject.mobile_number?patientObject.mobile_number:"",
                'country': userCountry.name,
            };



            if  (this.form_data.address === '') {
              if  (patientObject && patientObject['address']  ) {
                this.form_data.address  = patientObject['address'];
              }
            }

            if (patientObject.gender === 'male') {
                this.changeGender({'checked': true}, 0);
            } else if (patientObject.gender === 'female') {
                this.changeGender({'checked': true}, 1);

            }
        }

        this._util.end_trace_log(this.page_name,'setFormDataToSearchedPatient()','setFormDataToSearchedPatient() function ends');


    }


    searchPhoneNumber(phoneNumber) {

      this._util.start_trace_log(this.page_name,'searchPhoneNumber()','searchPhoneNumber() function starts',{'data':phoneNumber});

        this.general_settings.foundPatientsData = false;
        this.partialSearchResults = [];
        this.general_settings.patientListFound = [];

        let phoneString = String(phoneNumber).length;
        if (phoneString > 9) {
            this.general_settings.isSearchingPhoneNumber = true;
            this._rest.searchAssignedPatients({'searchQuery': phoneNumber, 'page': 1}).subscribe(result => {
                this.general_settings.isSearchingPhoneNumber = false;
                this.general_settings.patientListFound = result['patient'];
                if (result["patient"]) {
                    this.form_data.user_name = result["patient"]["name"];
                    if ( result['patient']['address'] ) {
                      this.form_data.address=result['patient']['address'];
                      this.form_data.center_code = result['patient']['patients'][0]['center_code'];

                      let channel = this.arr_registrationChannels.filter( channel => channel.code === this.form_data.center_code)[0] || {};
                      if ( channel['code']) this.setChannelInformation(channel, {isUserInput: true});
                    }
                    if (result['patient']["mobile"] && (result['patient']["mobile"].length === 12)){
                      this.form_data.patient_mobile = result['patient']["mobile"].substr(2);
                      // Else will protect the unique id made only from name being cutting down.
                      // Eg: Ahm20200412202020 -> 0412202020
                    } else {
                      if (result['patient']['mobile'])
                        this.form_data.patient_mobile = result['patient']['mobile'];
                    }

                    // else{
                    //   this.form_data.address='';
                    // }
                }

                try {
                    if (this.general_settings.patientListFound["patients"])
                        this.general_settings.foundPatientsData = true;
                } catch(e) {

                }
            });
        }
        else if (phoneString < 9) {
          if (phoneString > 0) {
            this._rest.searchAssignedPatients({'searchQuery': phoneNumber, 'page': 1})
              .subscribe( result => {
                if (result["success"] && result["patients"]){
                  this.partialSearchResults = result["patients"].filter( patient => {
                    return patient["patients"] && patient["patients"].length;
                  });
                  for (let i = 0; i < this.partialSearchResults.length; i++) {
                    for (let j = 0; j < this.partialSearchResults.length; j++) {
                      if (this.partialSearchResults[i]['mobile'] === this.partialSearchResults[j]['mobile']) {
                        this.partialSearchResults.splice(j, 1);
                      }
                    }
                  }
                }
              });
          } else {
            this.partialSearchResults = [];
          }
        }

        this._util.end_trace_log(this.page_name,'searchPhoneNumber()','searchPhoneNumber() function ends',{});

    }

  createConsultationForPatientWithDate(event) {
      if (event && event.value) this.default_form_data.soapAppointmentDate = event.value;
  }
    createConsultation() {
      const method_name='createConsultation()';
      this._util.start_trace_log(this.page_name,'createConsultation()','createConsultation() function starts');

        if(this.form_data.doctor ===''){
            const assistant = this._util.getLocalData(Constants.KEY_CURRENT_USER);

              if ( assistant.meta.type === "assistant"){

                     this.form_data.doctor = assistant.meta.doctors[0].doctor_id;
                     this.selectDoctorName = assistant.meta.doctors[0].doctor_name;
              } else if (assistant.meta.user.type === 'contributor') {
                     this.selectDoctorName = assistant.meta.user.name;
              }
        }

        // changing the chief_complaints
        this.form_data.chief_complaints = "Online consult with " + this.selectDoctorName + " at " + this._util.showDateLocally(new Date);

        // this.form_data.doctor === '' ? this.form_data.doctor = this._util.getLocalData(Constants.KEY_CURRENT_USER).user.id : this.form_data.doctor;
        this.form_data.user_name === '' ? this.form_data.user_name = this.form_data.patient_name : this.form_data.user_name;
        this.form_data.channel_name === '' ? this.form_data.channel_name = '' : this.form_data.channel_name = this.form_data.channel_name;
        this.form_data.center_code === '' ? this.form_data.center_code = CreatePatientComponent.DEFAULT_CENTER_CODE : this.form_data.center_code = this.form_data.center_code;

        let maybeUID = this.form_data.patient_mobile.trim().replace(/-/g, "");
        if ( [17].indexOf(maybeUID.length) > -1) maybeUID = maybeUID.replace("91", ""); // if user added '91' in front

        if ( this.form_data.channel_name.toLowerCase() === "medimetry camps")
            this.form_data.user_mobile = (maybeUID.length === 15)
                ? maybeUID : this._util.getPatientUniqueNumber(this.form_data.address);
        else this.form_data.user_mobile = maybeUID;

        if (this.form_data.speciality === '') {
            if (this._util.getLocalData(Constants.KEY_CURRENT_USER).user.specialties instanceof Array) {
                this.form_data.speciality = this._util.getLocalData(Constants.KEY_CURRENT_USER).user.specialties[0];
            } else {
                this.form_data.speciality = this._util.getLocalData(Constants.KEY_CURRENT_USER).user.specialties;
            }
        }

        this.form_data.patient_relation===''  ? this.form_data.patient_relation='self'  : this.form_data.patient_relation = this.form_data.patient_relation;

        if (! this.form_data.user_name) this.form_data.user_name = this.form_data.patient_name;

          this._util.setDataToObservabla({'type':'patient_information','consultation_information':this.form_data});



        this.general_settings.creatingConsultation = true;
        this._util.trace_line_exection(this.page_name,method_name,'Opening Wizard',{});

        this._util.showWizardOfInformation();
        this._util.trace_line_exection(this.page_name,method_name,'Broadcasted consultation state ==> processing',{});

        this._util.setDataToObservabla({'type': 'consultation_state', 'data': 'processing'});

        this._util.debug_line_exection(this.page_name,'createConsultion()','patient form data for creating consultation',{'data':this.form_data});
        this._util.trace_line_exection(this.page_name,'createConsultation()','sending form data to the server',{});
        this.form_data["soap_date"] = this.default_form_data.soapAppointmentDate === '' ?  new Date() : this.default_form_data.soapAppointmentDate;

        this._rest.createConsultation(this.form_data).subscribe(result => {
            this.general_settings.creatingConsultation = false;

            if (result.success) {
                this._util.sendStaffPMSStat("staff-new-consultation", result.soap.id);

                this._util.showSnackBar('Consultation Created', '', false);
                this._util.removeSoapVsLocalSoap(result.soap, true);


                this._util.trace_line_exection(this.page_name,'createConsultation()','got response from server for consultation created',{'data':result});

                this._util.saveLocalData(Constants.KEY_SOAP_ID_FROM_DIALOG, result.soap.id);

                this._util.trace_line_exection(this.page_name,'createConsultation()','storing current soap id in the local storage for wizard',{'soap_id':result.soap.id});


                this._util.saveLocalData(Constants.KEY_PATIENT_ID, result.patientId);
                this._util.trace_line_exection(this.page_name,'createConsultation()','storing current patient id',{'patient_id':result.patientId});


                 this._util.setDataToObservabla({'type':'patient_information','consultation_information':this.form_data});
                this.form_data = this.default_form_data;
                this.router.navigate([Constants.NAVIGATION_URL.patientList]);
                this._util.setDataToObservabla({'type': 'consultation_state', 'data': 'done'});

                // this.sentizeUniqueId(this.form_data.user_mobile);
            } else {
              this._util.error_line_exection(this.page_name,method_name,'Error while creating consultation',result);
                this._util.showSnackBar('Error Occured While Creating Consultation', '', false);
            }
        });

        this._util.saveLocalData(Constants.KEY_CURRENT_CHANNEL_CENTER_ID, this.form_data.center_code);
        this._util.trace_line_exection(this.page_name,'createConsultation()','storing current center channel id',{'center_code':this.form_data.center_code});
        this._util.end_trace_log(this.page_name,'createConsultation()','createConsultation() function end');


      }


    getBindedDoctor() {


        this._rest.getBindedDoctors().subscribe((result) => {
            //this.arr_bindedDoctors = result.doctorData;
            for (let index = 0; index < result.doctorData.length; index++) {
                for (let ind = 0; ind < result.assitantVsDoctors.length; ind++) {
                    if (result.doctorData[index].id == result.assitantVsDoctors[ind]) {
                        this.arr_bindedDoctors.push(result.doctorData[index]);
                    }
                }
            }
            if (this.arr_bindedDoctors.length < 2) {
                this.setDoctorId(this.arr_bindedDoctors[0], null, true);
                this.doctor.name = this.arr_bindedDoctors[0].name;
            }

        });
    }


    setDoctorId(doctor, event, bypassEventCheck = false) {
        if ((event && event.isUserInput) || bypassEventCheck) {
            this.selectDoctorName = doctor.name;

            this.form_data.doctor = doctor.id;
            this.form_data.speciality = doctor.specialty;
        }
    }

    setChannelInformation(channel, event) {
        if (event.isUserInput) {
            this.form_data.channel_name = channel.channel_name;
            this.form_data.center_code = channel.code;

            // if adddress is not filled, and center is selected then. chagne addres
            if (!this.form_data.address || !this.form_data.address.length) {
                this.form_data.address = channel.name.toLowerCase();
                this.saveAddressForFutureUsage()
            }
        }
        this._util.saveLocalData(Constants.KEY_CURRENT_CHANNEL_CENTER_ID, this.form_data.center_code);
    }


    adjustRegistrationChannel() {

        for (let key in this.currentUser.centers) {
            for (let inner_arr = 0; inner_arr < this.currentUser.centers[key].length; inner_arr++) {
                this.currentUser.centers[key][inner_arr].channel_name = key;
                this.arr_registrationChannels.push(this.currentUser.centers[key][inner_arr]);

            }
        }

        if (this.arr_registrationChannels.length === 1) {
            this.setChannelInformation(this.arr_registrationChannels[0], {isUserInput: true});
        } else if (this.arr_registrationChannels.length > 1) {
            const previousCenterCode = this._util.getLocalData(Constants.KEY_CURRENT_CHANNEL_CENTER_ID);
            const matchedChannel = this.arr_registrationChannels.filter(center => {

                return center.code === previousCenterCode;
            });
            if (matchedChannel.length) {
                this.setChannelInformation(matchedChannel[0], {isUserInput: true});

            }

        }
    }


    saveAddressForFutureUsage() {

        this._util.start_trace_log(this.page_name,'saveAddressForFutureUsage()','saveAddressForFutureUsage() function Starts');
        this.isAddressAlreadyStored = true;
        this._util.saveLocalData(Constants.KEY_CURRENT_ADDRESS, this.form_data.address);
        this._util.debug_line_exection(this.page_name,'saveAddressForFutureUsage()','Saving address for future usage',{'date':this.form_data.address});
        this._util.end_trace_log(this.page_name,'saveAddressForFutureUsage()','saveAddressForFutureUsage() function end');

      }

    deleteSavedAddress() {
      this._util.start_trace_log(this.page_name,'deleteSavedAddress()','deleteSavedAddress() function starts',{});
      this._util.debug_line_exection(this.page_name,'deleteSavedAddress()','Deleting current address '+this.form_data.address,{});
        this.form_data.address = "";
        this.isAddressAlreadyStored = false;
        this._util.saveLocalData(Constants.KEY_CURRENT_ADDRESS, null);
        this._util.end_trace_log(this.page_name,'deleteSavedAddress()','Funcation End');

      }

    changeGender(event, position) {
        if (event.checked) {
            switch (position) {
                case 0:
                    this.genderCheckBox[0] = true;
                    this.genderCheckBox[1] = false;
                    this.form_data.patient_gender = "male";
                    break;
                case 1:
                    this.genderCheckBox[0] = false;
                    this.genderCheckBox[1] = true;
                    this.form_data.patient_gender = "female";
                    break;
            }
        }

    }


    openUniqueIdDialog(uniqueId) {
      this._util.start_trace_log(this.page_name,'openUniqueIdDialog()','openUniqueIdDialog() function starts',{'unique_id':uniqueId});

        //noinspection TypeScriptValidateTypes
        const dialogRef = this.dialog.open(PatientUniqueIdComponent, {
            'width': '80%',
            data: {'uniqueId': uniqueId + ""}
        });
        dialogRef.afterClosed().subscribe(result => {
            setTimeout(() => {
                this.form_data = this.default_form_data;
                this.router.navigate([Constants.NAVIGATION_URL.patientList]);
            }, 500);

        });

        this._util.end_trace_log(this.page_name,'openUniqueIdDialog()','openUniqueIdDialog() function end');

      }



    navigateBack(){
      this.location.back();
    }
}
