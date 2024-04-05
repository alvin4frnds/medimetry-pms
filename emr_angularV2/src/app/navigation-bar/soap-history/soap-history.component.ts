import { Component, Input, OnInit } from "@angular/core";
import { UtilityService } from "../../services/utility.service";
import { HistoryInterface } from "../../HistoryInterface";
import { Constants } from 'src/app/Utilities/Constants';
import { RestService } from '../../services/rest.service';

@Component({
  selector: "app-soap-history",
  templateUrl: "./soap-history.component.html",
  styleUrls: ["./soap-history.component.css"]
})
export class SoapHistoryComponent implements OnInit, HistoryInterface {
  pageNo: any = 1;
  @Input() data: any;

  addHistoryObject(type, event) {}

  deleteHistoryObject() {}

  constructor(public _util: UtilityService, public _rest: RestService) {}

  ngOnInit() {
    
  }

  openSpecificSoap(soap) {
    this._util.previousSoapSettings.previousSoapId = soap.id;
    this._util.previousSoapSettings.previousSoapActivated = true;
    this._util.setDataToObservabla({ type: "navList", emptyList: true });
    this._util.setDataToObservabla({ type: "showPreviousSoap", data: soap });
    this._util.header_settings.mobile_show_previous_visits = false;
    this._util.showSnackBar(
      "This is preview mode only. Except Test Results,Only test results are allowed to add in this mode",
      "",
      false,
      6000
    );
  }

  onScrollMore() {
      this.getMoreSoap();
  }

  getMoreSoap(){
    this.pageNo++;


    let patientId = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION).patient.id;

    // For now
    this._util.getRestObject().fetchPreviousSoap({'except': 0, 'patientId': patientId, 'page': this.pageNo}).subscribe(row => {
      if(row.soaps.length){
        this._util.previousSoapObject.push(...row.soaps);
      }
    });
  }

    removeSoapFromListing(soapId) {
      if (! confirm("Are you sure you want to remove this soap?")) return;

        console.log("Removing tis soap: ", soapId);

        this._rest.deactivateSoap(soapId).then((resp) => {
            this._util.showSnackBar(resp['message'], "", false, 3000);
        })
    }
}
