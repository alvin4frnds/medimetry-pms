import { Component, OnInit, Input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { RestService } from '../services/rest.service';
import {FormControl} from '@angular/forms';
import { Constants } from '../Utilities/Constants';
import { ScreenDetectorService } from '../services/screen-detector.service';
import {
    MatAutocomplete,
    MatAutocompleteSelectedEvent, MatChipInputEvent, MatDialog, MatDialogRef, MatSnackBar,
    MatSnackBarConfig
} from '@angular/material';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs/index';
import {map, startWith} from 'rxjs/operators';

@Component({
    selector: 'app-edit-patient',
    templateUrl: './edit-patient.component.html',
    styleUrls: ['./edit-patient.component.css']
})
export class EditPatientComponent implements OnInit, AfterViewInit {
    @Input() data: any;
    details: any;
    updateButtonTitle = "Update Patient Details";
    removeButtonTitle = "Remove This Patient";

    public availableCenters = [];
    public filteredCenters = [];
    public enteredCenterName = "";
    public selectedCenterCode = "";
    public meta = {
        haveCard: false,
        customText: "",
        tags: [],
    };

    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredPatientTags: Observable<string[]>;
    allPatientTags: string[] = [];

    public chipsOptions = {
        visible: true,
        selectable: true,
        removable: true,
        addOnBlur: false,

        patienTagCtrl: new FormControl(),
    };

    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    constructor(private _util: UtilityService,
                private _rest: RestService,
                public dialog: MatDialog,
                private snackBar: MatSnackBar,
                private screen_detector: ScreenDetectorService) {

        this.filteredPatientTags = this.chipsOptions.patienTagCtrl.valueChanges.pipe(
            startWith(null),
            map((tag: string | null) => tag ? this._filter(tag) : this.allPatientTags.slice()));
    }

    ngOnInit() {
         this.openPatient();

         this._util.getDataProviders().subscribe(result => {
            if ( result.type === "openSoapRefreshed") {
                if ( !result.data || !result.data.patient) return;

                this.data = result.data.patient;
                this.openPatient();
            } 
        });
    }

    openPatient() {
        const consultationCode = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION).consultation_code || "";

        this._rest.getPatientDetail(this.data.id, consultationCode).subscribe((response) => {
            this.details = response;

            this.data.uid = this.details.mediUser.user_login.substr(2);
            this.data.mobile_number = (this.details.mediPatient.mobile_number || "").substr(2);
            if (this.data.uid.length > 10) this.data.uid = "";

            if (this.details['center'] && this.details['center']['name']) {
                this.selectedCenterCode = this.details['center']['code'];
                this.enteredCenterName = this.details['center']['name'];
            }

            this.data.uidPlaceholder = this._util.sentizeUniqueId(this.details.mediUser.user_login).substr(3);
            if (this.details && this.details.mediPatient && this.details.mediPatient.meta)
                for ( let key in this.details.mediPatient.meta)
                    if ( key === "tags") this.meta[key] = this._util.serializeObjectToArray(this.details.mediPatient.meta[key]);
                    else this.meta[key] = this.details.mediPatient.meta[key];

            const localUserData = this._util.getLocalData(Constants.KEY_CURRENT_USER);
            if (localUserData && localUserData['user']
                && localUserData['user']['centers']
                && localUserData['user']['centers'][this.details.channel.name]
                && localUserData['user']['centers'][this.details.channel.name].length
            ) this.availableCenters = localUserData['user']['centers'][this.details.channel.name];
        });

        this.data.age = this._util.getTimeDifferenceInYears(this.data.date_of_birth);
        this.data.uidHelperText = "";

        this.allPatientTags = (this._util.getLocalData(Constants.KEY_PATIENT_TAGS) || "")
            .split(",").map( str => str.trim() );
    }

    updatePatient() {
        this.filterCenters(this.enteredCenterName);
        if (this.filteredCenters.length === 1) {
            this.selectedCenterCode = this.filteredCenters[0].code;
        }

        const toUpdate = {
            name: this.data.name,
            age: this.data.age,
            gender: this.data.gender,
            mobile : this.data.mobile_number,
            center: this.selectedCenterCode,
            meta: this.meta || {},
        };

        let headerData = this._util.getLocalData(Constants.KEY_HEADER_DATA);
        let currentConsultation = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);

        const gen = this.data.gender.toString().substr(0, 1).toUpperCase();

        headerData.name = `${this.data.name} ( ${gen}, ${this.data.age} yrs ) `;

        // the local data can still be accessed from multiple points
        currentConsultation.patient.name = currentConsultation.name = this.data.name;
        currentConsultation.patient.age = toUpdate.age;
        currentConsultation.patient.gender = toUpdate.gender;
        currentConsultation.patient.mobile_number = toUpdate.mobile;
        currentConsultation.patient.center = toUpdate.center;
        currentConsultation.patient.meta = toUpdate.meta;
        currentConsultation.patient.mobile = toUpdate.mobile;

        this.updateButtonTitle = "Updating ...";

        this._rest.updatePatientsDetails(this.data.id, toUpdate)
            .subscribe(resp => {
                if (resp.success) {
                    this.updateButtonTitle = "Updated Successfully";

                    this.ngOnInit();
                }
            });

        setTimeout(function () {
            this.updateButtonTitle = "Update Patient Details";
        }.bind(this), 3000);

        this._util.setHeaderData(headerData.name, headerData.image, headerData.phone);
        this._util.saveLocalData(Constants.KEY_CURRENT_CONSULTATION, currentConsultation);
    }

    closeEditPatientLayout() {
        this._util.setDataToObservabla({
            type: 'closeEditPatientLayout'
        });
    }

    ngAfterViewInit(): void {
    }

    selectCenter(center) {
        this.enteredCenterName = center.name;
        this.selectedCenterCode = center.code;
    }

    filterCenters(query) {
        query = query.toLowerCase();

        this.filteredCenters = this.availableCenters.filter( center => {
            return center.name.toLowerCase().indexOf(query) > -1;
        });
    }

    deletePatient() {
        if (! confirm("Are you sure? there is currently no UI to revert it back."))
            return;

        this.removeButtonTitle = "Removing patient ...";

        this._rest.removePatientFromListing(this.data.id)
            .subscribe(resp => {
                this.removeButtonTitle = resp.success ? "Removed Successfully" : "Something went wrong";
            });
    }

    haveCardStatusChanged() {
        if (this.meta.haveCard) {
            this.meta.tags.push("Card-holder");
            this.meta.tags = this.meta.tags.filter((value, index, self) => self.indexOf(value) === index);
        } else {
            const indexOfMeta = this.meta.tags.indexOf("Card-holder");
            if (indexOfMeta > -1)
                this.meta.tags.splice(indexOfMeta, 1);
        }
    }

    /**
     * Patients tags related functions
     * */

    add(event: MatChipInputEvent): void {
        // Add fruit only when MatAutocomplete is not open
        // To make sure this does not conflict with OptionSelected Event
        if (!this.matAutocomplete.isOpen) {
            const input = event.input;
            const value = event.value;

            // Add our fruit
            if ((value || '').trim()) {
                this.meta.tags.push(value.trim());
            }

            // Reset the input value
            if (input) {
                input.value = '';
            }

            this.chipsOptions.patienTagCtrl.setValue(null);
        }
    }

    remove(fruit: string): void {
        const index = this.meta.tags.indexOf(fruit);

        if (index >= 0) {
            this.meta.tags.splice(index, 1);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.meta.tags.push(event.option.viewValue);
        // this.tagInput.nativeElement.value = '';
        document.getElementById('patient-tag-input-field')['value'] = "";
        this.chipsOptions.patienTagCtrl.setValue(null);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.allPatientTags.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
    }
}

@Component({
    selector: 'user-login-update-conflict-popup',
    templateUrl: 'user-login-update-conflict-popup.html',
})
export class UserLoginUpdateConflictPopup {

    constructor(
        public dialogRef: MatDialogRef<UserLoginUpdateConflictPopup>,
    ) {}

    cancel(): void {
        this.dialogRef.close(false);
    }

    resolveConflict(result) {
        this.dialogRef.close(result);
    }
}
