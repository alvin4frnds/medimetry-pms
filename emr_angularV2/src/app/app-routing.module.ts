import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { PatientListComponent } from "./patient-list/patient-list.component";
import { Constants } from "./Utilities/Constants";
import { AuthGuard } from "./auth.guard";
import { CreatePatientComponent } from "./create-patient/create-patient.component";
import { PatientDashboardComponent } from "./patient-dashboard/patient-dashboard.component";
import { BindDoctorsComponent } from "./bind-doctors/bind-doctors.component";
import { TreatmentPlanComponent } from './treatment-plan/treatment-plan.component';
import { ScheduleAppointmentComponent } from './schedule-appointment/schedule-appointment.component';

const routes: Routes = [
  { path: Constants.NAVIGATION_URL.treatmentPlan, component: TreatmentPlanComponent },
  { path: '', component: LoginComponent, canActivate: [AuthGuard] },
  { path: Constants.NAVIGATION_URL.login, component: LoginComponent },
  { path: Constants.NAVIGATION_URL.patientList, component: PatientListComponent },
  { path: Constants.NAVIGATION_URL.create_patient, component: CreatePatientComponent },
  { path: Constants.NAVIGATION_URL.dashboard, component: PatientDashboardComponent },
  { path: Constants.NAVIGATION_URL.myDoctors, component: BindDoctorsComponent },
  { path: Constants.NAVIGATION_URL.schedule_Appointment, component: ScheduleAppointmentComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
