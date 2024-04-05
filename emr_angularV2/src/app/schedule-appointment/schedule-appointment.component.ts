import { Constants } from 'src/app/Utilities/Constants';
import { RestService } from './../services/rest.service';
import { OnDestroy, NgZone } from '@angular/core';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material";
import { UtilityService } from '../services/utility.service';
import { ScreenDetectorService } from '../services/screen-detector.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Moment } from 'moment';
import * as moment from 'moment';

@Component({
  selector: 'app-schedule-appointment',
  templateUrl: './schedule-appointment.component.html',
  styleUrls: ['./schedule-appointment.component.css']
})

export class ScheduleAppointmentComponent implements OnInit, AfterViewInit, OnDestroy {
  showAppointmentDetails: boolean
  isMobile: boolean = false;

  timeslots: Timeslot[] = [];
  currentDate: Moment = moment();
  consultationsList: any[] = [];
  currentConsultation: any = null;
  reshedulingComment: string = "";
  totalWaiting: number = 0;
  todaysConfirmed: number = 0;
  toOpenConsultationCode: string = "";

  constructor(private _util: UtilityService,
    private _rest: RestService,
    private _route: Router,
    private ngZone: NgZone,
    private _screenDetector: ScreenDetectorService
    ) { }

  ngOnInit() {

    this._util.customizeSideNavOptions(false, null, null);
    this.isMobile = this._screenDetector.deviceType.isMobile;
    this._util.getDataProviders().subscribe(result => {
      if ( result.type === "appointmentDateUpdated")
        this.refreshConsultations();

      if ( result.type === "hideAppointmentDetailMenu") {
        this.openAppointmentDetails(this.currentConsultation)
      }

      if ( result.type === "openAppointmentDetailsForCode") {
        this.openAppointmentDetailsForCode(result.data);
      }
    });

    this.createTimeslots();
    this.refreshConsultations();
  }

  ngAfterViewInit() {

    this.scrollTimeslotToView(800);
  }

  ngOnDestroy() {
    // after view destroyed
  }

  public scrollTimeslotToView(timecode) {
    if ( document.getElementById("Timeslot-" + timecode) )
      document.getElementById("Timeslot-" + timecode).scrollIntoView();
  }

  public createTimeslots() {
    if ( this.timeslots.length) this.timeslots = [];

    for ( let hour = 0; hour <= 23; hour ++ ) {
      [0, 15, 30, 45].forEach(minutes => {
        this.timeslots.push(new Timeslot((hour * 100) + minutes));
      });
    }
  }

  public async refreshConsultations() {
    this.currentDate = this._util.currentDateForAppointment
      || moment(this._util.getLocalData(Constants.KEY_LAST_OPEN_APPOINTMENT_DATE));

    if ( ! this.currentDate) return false;

    this._util.saveLocalData(Constants.KEY_LAST_OPEN_APPOINTMENT_DATE, this.currentDate.toISOString());
    const response = await this._rest.getAppointmentsForDate(this.currentDate);

    if ( ! response["success"] && response["message"])
      return this._util.showSnackBar(response["message"]);

    this.totalWaiting = response["totalWaiting"];
    this.todaysConfirmed = 0;
    this.createTimeslots();

    if ( ! response["rows"].length ) {
      this.scrollTimeslotToView(800)
      return;
    }

    let firstConsultationTimecode = null;

    this.consultationsList = response["rows"].map( row => {
      const scheduleTime = new Date(row.consultationSchedule);
      const hours = scheduleTime.getHours();
      const minutes = scheduleTime.getMinutes();

      const timeCode = (hours * 100) + minutes;
      const matchingTimeslotIndex = this.findSuitableTimeslot(timeCode);

      if ( matchingTimeslotIndex === -1) return row;

      this.timeslots[matchingTimeslotIndex].consultations.push(row);
      if ( ! firstConsultationTimecode) firstConsultationTimecode = this.timeslots[matchingTimeslotIndex].timecode;

      return row;
    });

    this.todaysConfirmed = this.consultationsList.filter(row => row.consultationStatus === "confirmed").length;

    this.openAppointmentDetailsForCode(this.toOpenConsultationCode);

    if ( firstConsultationTimecode) this.scrollTimeslotToView(firstConsultationTimecode);
  }

  public findSuitableTimeslot(forTimecode) {
    const matchingTimeslots = this.timeslots.filter( timeslot => {
      return ( (timeslot.timecode <= forTimecode) && ((timeslot.timecode + 14) >= forTimecode));
    });

    return matchingTimeslots.length ? this.timeslots.indexOf(matchingTimeslots[0]) : -1;
  }

  public openAppointmentDetailsForCode(consultationCode) {
    console.log(" openAppointmentDetailsForCode: ", consultationCode, JSON.stringify(this.consultationsList));

    const filteredConsultation = this.consultationsList.filter(row => {
      return consultationCode === row["consultation_code"];
    });

    if ( filteredConsultation && filteredConsultation.length && filteredConsultation[0]) {
      this.openAppointmentDetails(filteredConsultation[0]);
      this.toOpenConsultationCode = "";
    }
    else this.toOpenConsultationCode = consultationCode;
  }

  public openAppointmentDetails(consultation) {
    // this variable is required
    if ( ! consultation) return;

    if ( this.currentConsultation &&
        (this.currentConsultation.consultation_code === consultation.consultation_code)) {

          this.showAppointmentDetails = false;
          this.currentConsultation = null;

          return;

    } else this.showAppointmentDetails = true;

    if ( consultation.patient.meta.tags && consultation.patient.meta.tags[0]) {
      consultation.patient.meta.tags = Object.values(consultation.patient.meta.tags);
    }

    this.currentConsultation = { ... consultation};
  }

  public previousDay() {
    this.currentDate.subtract(1, 'day');
    this._util.currentDateForAppointment = this.currentDate;

    this._util.setDataToObservabla({
      type: "appointment-date-updated",
      data: this.currentDate,
    });

    this.refreshConsultations();
    this.clearHighlightCalendarDatesForPatient();
    this.openAppointmentDetails(this.currentConsultation);
  }

  public nextDay() {
    this.currentDate.add(1, 'day');
    this._util.currentDateForAppointment = this.currentDate;

    this._util.setDataToObservabla({
      type: "appointment-date-updated",
      data: this.currentDate,
    });

    this.refreshConsultations();
    this.clearHighlightCalendarDatesForPatient();
    this.openAppointmentDetails(this.currentConsultation);
  }

  public clearHighlightCalendarDatesForPatient() {
    this._util.setDataToObservabla({ type: "clearHighlightCalendarDatesForPatient" });
  }

  public highlightThisPatientConsultations(consultation) {
    this._util.setDataToObservabla({
      type: "highlightCalendarDatesForPatient",
      data: consultation.patient.id
    });
  }

  public getStatusLabel(name) {

    const statusMapping = {
      "queued": "Waiting",
      "confirmed": "Appointment confirmed",
      "done": "Completed",
      "regreted": "Cancelled",
    }

    if ( statusMapping[name]) return statusMapping[name];
    else return "Not found";
  }

  private async updateStatus(consultationCode, status, timestamp: any = null, comment: any = "") {
    const resp = await this._rest.updateAppointmentStatus(consultationCode, status, timestamp || null, comment || "");

    if ( ! resp["success"]) return this._util.showSnackBar(resp["message"]);

    this._util.showSnackBar("Updated successfully");
    this.reshedulingComment = "";
    this.showAppointmentDetails = false;

    await this.refreshConsultations();
  }

  public async acceptConsultation() {
    console.log("acceptConsultation: ", this.currentConsultation.consultation_code);

    await this.updateStatus(this.currentConsultation.consultation_code, "confirmed");
  }

  public async regretConsultation() {
    console.log("regretConsultation: ", this.currentConsultation.consultation_code);

    await this.updateStatus(this.currentConsultation.consultation_code, "regreted");
  }

  public async resheduleConsult($event) {
    event.stopPropagation();

    if ($event && $event.value)
      console.log("rescheduleConsult Value: ", $event.value, this.currentConsultation.consultation_code);

    const scheduleTime = Math.floor($event.value.getTime() / 1000);
    const currentTime = Math.floor(new Date().getTime() / 1000);

    if ( currentTime > scheduleTime) return this._util.showSnackBar("Cannot rescedule a consultation to past.");

    await this.updateStatus(this.currentConsultation.consultation_code, "confirmed", scheduleTime);
  }

  public openConsultationInSoap(consultation) {
    this.ngZone.run(() => this._route.navigate([Constants.NAVIGATION_URL.dashboard])).then();

    this._util.setDataToObservabla({
      'type': 'showSoapFromNotifcation',
      'data': consultation,
    });
  }

  close() {
    document.getElementById("side").style.width = "100%";
  }


}

// **************************************************
// ***** APPOINTMENT DETAILS COMPONENT ************
// **************************************************
@Component({
  selector: 'app-appointment-details',
  templateUrl: './appointment-details.component.html',
  styleUrls: ['./schedule-appointment.component.css']
})
export class AppointmentDetailsComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<AppointmentDetailsComponent>) { }
  ngOnInit() {
  }
}

class Timeslot {
  public startTime: string;
  public endTime: string;
  public timecode: number;
  public consultations: any[] = [];

  public constructor(timecode) {
    let hour = Math.floor(timecode / 100);
    let minutes = timecode % 100;

    if ( hour < 13) this.startTime = hour + ":" + this.appendZero(minutes);
    else this.startTime = (hour - 12) + ":" + this.appendZero(minutes);

    this.startTime = this.startTime + (( hour < 12) ? " AM" : " PM");

    minutes = minutes + 15;

    if( minutes > 60) {
      minutes = minutes - 60;
      hour = hour + 1;
    }

    if ( hour < 13) this.endTime = hour + ":" + this.appendZero(minutes);
    else this.endTime = (hour - 12) + ":" + this.appendZero(minutes);

    this.endTime = this.endTime + (( hour < 12) ? " AM" : " PM");

    this.timecode = timecode;
  }

  public appendZero(minutes) {
    return minutes < 10 ? "0" + minutes : "" + minutes;
  }
}
