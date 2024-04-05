import { UtilityService } from "./../services/utility.service";
import { Component, OnInit, OnDestroy } from "@angular/core";

@Component({
  selector: "app-patient-information",
  templateUrl: "./patient-information.component.html",
  styleUrls: ["./patient-information.component.css"]
})
export class PatientInformationComponent implements OnInit, OnDestroy {
  provider: any;
  isConsultationProcessing = false;
  consultationInformation:any={'patient_name':'','patient_age':'','user_mobile':'','patient_gender':''};
  constructor(public _util: UtilityService) {}

  ngOnInit() {
    this.provider = this._util.getDataProviders().subscribe(result => {
      if (result.type === "consultation_state" ) {
        if(result.data==='processing'){
          this.isConsultationProcessing=true;

        }else if(result.data==='done'){
              this.isConsultationProcessing=false;
        }
      }else if(result.type==='patient_information'){
            this.consultationInformation=result.consultation_information;
      }
      });
  }

  ngOnDestroy(): void {
    try {
      this.provider.unsubscribe();
    } catch (err) {}
  }
}
