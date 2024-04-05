import { SocketService } from './services/socket.service';
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FlexLayoutModule } from "@angular/flex-layout";
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { MatMomentDateModule } from '@angular/material-moment-adapter'

import {
  MAT_LABEL_GLOBAL_OPTIONS,
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatStepperModule,
  MatTabsModule,
  MatTableModule,
  MatTooltipModule,
  MatToolbarModule, MatSlideToggleModule, MatRadioModule, MatProgressBarModule, MatBadgeModule, MatButtonToggleModule,
  MatDatepickerModule, MatNativeDateModule, MatGridListModule
} from "@angular/material";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { CanvasWhiteboardModule } from "ng2-canvas-whiteboard";
import { CanvasDrawingComponent } from "./canvas-drawing/canvas-drawing.component";
import {
  Last30DaysWithoutFollowupConsultsModal,
  NavigationBarComponent, PatientHistoryGeneratorModalComponent, PatientNotesLayoutModal,
  PrescriptionPreviewDialog, ShowPmsStaffStatsLayoutModal, SubmitPartnerAppFeedbackDialogModalComponent
} from "./navigation-bar/navigation-bar.component";
import { LayoutModule } from "@angular/cdk/layout";
import { LoginComponent } from "./login/login.component";
import { UtilityService } from "./services/utility.service";
import { RestService } from "./services/rest.service";
import { PatientListComponent } from "./patient-list/patient-list.component";
import { StorageServiceModule } from "angular-webstorage-service";
import { AuthGuard } from "./auth.guard";
import { CreatePatientComponent } from "./create-patient/create-patient.component";
import { ListComponent } from "./patient-list/list/list.component";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { SearchPipe } from "./search.pipe";
import { PatientDashboardComponent } from "./patient-dashboard/patient-dashboard.component";
import { ChiefComplaintsComponent } from "./patient-dashboard/chief-complaints/chief-complaints.component";
import { ExaminationComponent } from "./patient-dashboard/examination/examination.component";
import { VitalsComponent } from "./patient-dashboard/vitals/vitals.component";
import { ClinicalNotesComponent } from "./patient-dashboard/clinical-notes/clinical-notes.component";
import { DiagnosisComponent } from "./patient-dashboard/diagnosis/diagnosis.component";
import { MedicineComponent } from "./patient-dashboard/medicine/medicine.component";
import { InvestigationComponent } from "./patient-dashboard/investigation/investigation.component";
import { ReferralsComponent } from "./patient-dashboard/referrals/referrals.component";
import { ProceduresComponent } from "./patient-dashboard/procedures/procedures.component";
import { ResultsComponent, UploadTextReportLayout } from "./patient-dashboard/results/results.component";
import { AttachmentsComponent } from "./patient-dashboard/attachments/attachments.component";
import { SoapPreviewComponent } from "./navigation-bar/soap-preview/soap-preview.component";
import { PatientHistoryComponent } from "./navigation-bar/patient-history/patient-history.component";
import { SoapHistoryComponent } from "./navigation-bar/soap-history/soap-history.component";
import { BindDoctorsComponent } from "./bind-doctors/bind-doctors.component";
import { CustomSnackbarComponent } from "./custom-snackbar/custom-snackbar.component";
import { PatientUniqueIdComponent } from './patient-unique-id/patient-unique-id.component';
import { RemarksComponent } from './patient-dashboard/remarks/remarks.component';
import { PatientInformationComponent } from './patient-information/patient-information.component';
import { EditPatientComponent, UserLoginUpdateConflictPopup } from './edit-patient/edit-patient.component';
import { PusherService } from './services/pusher.service';
import { NotificationsComponent } from './notifications/notifications.component';
import { ClickStopPropagationDirective } from './click-stop-propagation.directive';
import { PersonalHistoryComponent } from './patient-dashboard/personal-history/personal-history.component';
import { HistoryGeneratorComponent } from './history-generator/history-generator.component';
import { GoogleChartsModule } from 'angular-google-charts';
import { TreatmentPlanComponent } from './treatment-plan/treatment-plan.component';
import { DietChartComponent } from './patient-dashboard/diet-chart/diet-chart.component';
import { VoiceLexComponent } from './voice-lex/voice-lex.component';
import { KeyValuePipe } from './key-value.pipe';
import { HttpLoggingInterceptor } from './http-logging-interceptor';
import { DocereeAdComponent } from './doceree-ad/doceree-ad.component';
import { ScheduleAppointmentComponent, AppointmentDetailsComponent } from './schedule-appointment/schedule-appointment.component';
// import { ScheduleAppointmentComponent } from './schedule-appointment/schedule-appointment.component';

@NgModule({
  declarations: [
    AppComponent,
    CanvasDrawingComponent,
    UserLoginUpdateConflictPopup,
    NavigationBarComponent,
    LoginComponent,
    PatientListComponent,
    CreatePatientComponent,
    ListComponent,
    SearchPipe,
    PatientDashboardComponent,
    ChiefComplaintsComponent,
    ExaminationComponent,
    VitalsComponent,
    ClinicalNotesComponent,
    DiagnosisComponent,
    MedicineComponent,
    InvestigationComponent,
    ReferralsComponent,
    ProceduresComponent,
    ResultsComponent,
    AttachmentsComponent,
    SoapPreviewComponent,
    PatientHistoryComponent,
    SoapHistoryComponent,
    BindDoctorsComponent,
    CustomSnackbarComponent,
    PatientUniqueIdComponent,
    RemarksComponent,
    PatientInformationComponent,
    EditPatientComponent,
    PrescriptionPreviewDialog,
    NotificationsComponent,
    ClickStopPropagationDirective,
    PersonalHistoryComponent,
    PatientHistoryGeneratorModalComponent,
    SubmitPartnerAppFeedbackDialogModalComponent,
    Last30DaysWithoutFollowupConsultsModal,
    ShowPmsStaffStatsLayoutModal,
    PatientNotesLayoutModal,
    UploadTextReportLayout,
    HistoryGeneratorComponent,
    TreatmentPlanComponent,
    DietChartComponent,
    VoiceLexComponent,
    KeyValuePipe,
    DocereeAdComponent,
    ScheduleAppointmentComponent,
    AppointmentDetailsComponent
  ],
  imports: [
    MatProgressBarModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    MatButtonModule,
    CanvasWhiteboardModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    StorageServiceModule,
    MatTabsModule,
    FormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    LayoutModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    HttpClientModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    InfiniteScrollModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatTooltipModule,
    MatTableModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatBadgeModule, MatButtonToggleModule,
    GoogleChartsModule.forRoot(),
    MatDatepickerModule, MatNativeDateModule, MatMomentDateModule,
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    MatGridListModule,
  ],
  providers: [SocketService, UtilityService, RestService, PusherService, AuthGuard, {
    provide: MAT_LABEL_GLOBAL_OPTIONS,
    useValue: { float: 'never' }
  }, {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpLoggingInterceptor,
      multi: true
    }],
  bootstrap: [AppComponent],
  entryComponents: [
    SoapPreviewComponent, CanvasDrawingComponent, CustomSnackbarComponent,
    PatientUniqueIdComponent, PrescriptionPreviewDialog,
    UserLoginUpdateConflictPopup, PatientHistoryGeneratorModalComponent,
    SubmitPartnerAppFeedbackDialogModalComponent, Last30DaysWithoutFollowupConsultsModal,
    ShowPmsStaffStatsLayoutModal, PatientNotesLayoutModal, UploadTextReportLayout,
    AppointmentDetailsComponent
  ]
})
export class AppModule {
}
