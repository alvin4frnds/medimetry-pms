import {AfterViewInit, Component, OnDestroy, OnInit} from "@angular/core";
import {RestService} from "../services/rest.service";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {Observable} from "rxjs/index";
import {map} from "rxjs/internal/operators";
import {UtilityService} from "../services/utility.service";
import {Constants} from "../Utilities/Constants";
import { ScreenDetectorService } from '../services/screen-detector.service';

@Component({
  selector: 'app-bind-doctors',
  templateUrl: './bind-doctors.component.html',
  styleUrls: ['./bind-doctors.component.css']
})
export class BindDoctorsComponent implements OnInit, AfterViewInit, OnDestroy {

  isComponentAlreadyDestroyed = false;
  showProgressBar = false;
  doctor_data = [];
  selected_doctor = [];
  saveButtonText = 'Save';
  isToolbarAlreadySet = false;


  constructor(private _rest: RestService, public _util: UtilityService,public screen:ScreenDetectorService) {
  }

  ngOnInit() {
  }

  getBindedDoctors() {
    this.showProgressBar = true;
    this._rest.getBindedDoctors().subscribe(result => {
      this.doctor_data = result.doctorData;
      this.selected_doctor = result.assitantVsDoctors;
      this.doctor_data.forEach((row) => {
        this.selected_doctor.forEach((doc) => {
          if (parseInt(row.id) === doc) {
            row.isSelected = true;
          }

        });
      });
      this.showProgressBar = false;

    });

  }

  updateDoctorBinding() {
    this.selected_doctor = [];
    this.doctor_data.forEach((row) => {
      if (row.isSelected) {
        this.selected_doctor.push(row.id);
      }
    });

    if (this.selected_doctor.length !== 0) {
      this.saveButtonText = 'Updating...';
      this._rest.updateBindedDoctors({'doctors': this.selected_doctor}).subscribe((result) => {
        if (result.success) {
          this.saveButtonText = 'Updated..';
          setTimeout(() => {
            this.saveButtonText = 'Save';
          }, 2000);
        }
      });
    } else {
      this.saveButtonText = 'No Doctor Selected..';
      setTimeout(() => {
        this.saveButtonText = 'Save';
      }, 2000);

    }
  }


  ngOnDestroy(): void {
      if (this.screen.deviceType.isMobile) {
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


  }

  ngAfterViewInit(): void {
      if (this.screen.deviceType.isMobile) {
        // this._util.customizeSideNavOptions(true, ['show_back_button'], [true]);
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

    this.getBindedDoctors();
  }
}
