import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RestService } from '../services/rest.service';
import { UtilityService } from '../services/utility.service';
import { MatSnackBar } from '@angular/material';
import { Constants } from '../Utilities/Constants';

@Component({
    selector: 'app-treatment-plan',
    templateUrl: './treatment-plan.component.html',
    styleUrls: ['./treatment-plan.component.css']
})
export class TreatmentPlanComponent implements OnInit, AfterViewInit {
    page_name=Constants.PAGE_NAME.SOAP_DASHBOARD;
    public showTheDialogButton: boolean = true;
    public generatedHistory: any;
    public loading: boolean = true;
    public saving: boolean = false;

    public errorMessage = "";
    public followUp = "";
    public remarks = "";
    public observations = "";
    public followUpOptions: string[] = ["1 Day(s)", "1 Week(s)", "1 Month(s)"];

    constructor(private _router: Router,
                private _rest: RestService,
                private _snackBar: MatSnackBar,
                private _util: UtilityService) {
    }

    ngOnInit() {

        this.getGeneratedHistory().then(() => {
            this.loading = false;
        });
    }

    ngAfterViewInit(): void {
        // document.body.style.overflowX = "scroll";

        document.querySelector("meta[name=viewport]")['content'] = "width=device-width, initial-scale=.5, maximum-scale=12.0, minimum-scale=.25, user-scalable=yes";
    }

    private async getGeneratedHistory() {
        const generatedHistoryUniqueId = window.location.search.replace("?", "").replace("=", "");
        if (generatedHistoryUniqueId && generatedHistoryUniqueId.length) {
            const resp = await this._rest.viewGeneratedHistory(generatedHistoryUniqueId);
            if (!resp['success']) {
                this.errorMessage = resp['message'];
                return this._snackBar.open(resp['message']);
            }

            if (resp['consultation'])
                this._util.saveLocalData(Constants.KEY_CURRENT_CONSULTATION, resp['consultation']);

            if (resp['row'] && resp['row']['soap']) {
                const soap = resp['row']['soap'];

                this._util.removeSoapVsLocalSoap(soap, true, true);
                this._util.previousSoapSettings.previousSoapActivated = true;
            }

            if ( resp["row"] && resp["row"]["data"] && resp["row"]["data"]["callInvitation"]) {
                resp["row"]["data"]["callInvitation"]["localized"] = this.getCallInvitationMessage(resp["row"]["data"]["callInvitation"]);
            }

            if (resp['access_token'] && resp['access_token'].length && !this._util.getLocalData(Constants.KEY_CURRENT_USER))
                this._util.saveLocalData(Constants.KEY_CURRENT_USER, {access_token: resp['access_token']});

            this.generatedHistory = resp['row'];
        }
    }

    public updateFollowupOptions() {
        let value = (this.followUp + "").split(" ")[0] || "1";

        let unit = value.match(/[a-zA-Z]/);
        let strUnit = (unit && unit[0]) ? unit[0] : "";

        let intValue = parseInt(value);
        intValue = isNaN(intValue) ? 1 : intValue;

        switch (strUnit) {
            case 'd': this.followUp = intValue + " Day(s)"; break;
            case 'w': this.followUp = intValue + " Week(s)"; break;
            case 'm': this.followUp = intValue + " Month(s)"; break;
            default: break;
        }

        this.followUpOptions = [
            (intValue + " Day(s)"),
            (intValue + " Week(s)"),
            (intValue + " Month(s)"),
        ];
    }

  private addNewNavListItem(isSingle, item_name, item_component, icon = '') {
    const method='addNewNavListItem()';
    this._util.start_trace_log(this.page_name,method,method+' function starts');
    let object = {};
    if (!isSingle) {
      this._util.component_mapingWithChips.forEach((result) => {

        switch (result) {
          case 'diagnosis':
            object = this._util.createSideNavOption('Diagnosis', 'diagnosis', 'diagnosis');
            break;
        }
        this._util.debug_line_exection(this.page_name,method,'making side nav item from soap api ',
          {'data':object});

        this._util.setDataToObservabla({'type': 'navList', 'data': object});
      });

    } else {
      object = this._util.createSideNavOption(item_name, icon, item_component);
      this._util.debug_line_exection(this.page_name,method,'making side nav from chips click',{'data':object});
      this._util.setDataToObservabla({'type': 'navList', 'data': object});
    }

    this._util.end_trace_log(this.page_name,method,method+' function end');

  }

    showDiagnosisComponenet(isFromApi = false, arr_keysName = ['', '']) {
      const method='showDiagnosisComponenet()';
      this._util.start_trace_log(this.page_name,method,method+' Funcation Starts');
      this._util.debug_line_exection(this.page_name,method,'Initials Values assign to function',{
        'data': {'isFromApi': isFromApi,
          'arr_key_name': arr_keysName}});


      if (!isFromApi) {
        this._util.debug_line_exection(this.page_name,method,'isFrom Api == false',{});

        this._util.component_mapingWithChips.push(this._util.soap_chips[2].component);
        this._util.updateObjectOnChipsClick(false, this._util.soap_chips[2].component);
        this._util.soap_chips[2].isUsed = true;
        this.addNewNavListItem(
          true,
          this._util.soap_chips[2].name,
          this._util.soap_chips[2].component,
          this._util.soap_chips[2].icon
        );
        this._util.resetAllChips();
        this._util.highlightChips(false, this._util.soap_chips[2].component);
      } else {
        this._util.debug_line_exection(this.page_name,method,'isFrom Api == true',{});

        let keyName = '';
        this._util.component_mapingWithChips = [];
        arr_keysName.forEach((row) => {
          this._util.component_mapingWithChips.push(row);
          // @ts-ignore
          this._util.soap_chips.forEach((result) => {
            if (result.component === row) {
              result.isUsed = true;
              keyName = result.component;
            }
          });
        });
        if (keyName !== '') {
          this._util.resetAllChips();
          if (!this._util.highlightChips(true, keyName)) {
            this._util.highlightChips(false, keyName);
          }
        }
        this.addNewNavListItem(false, 0, 0);
      }
      if (! isFromApi) {
        setTimeout(() => {
          let elementToFocus = null;
          elementToFocus = document.querySelectorAll('input.a-diagnosis-input-field').item(0);
          if (elementToFocus) {
            setTimeout(() => elementToFocus.focus(), 200);
          }
        }, 200);
      }
      this.showTheDialogButton = !this.showTheDialogButton;
    }

    public getCallInvitationMessage(invitationObject) {
        const time = this._util.showDateLocally(invitationObject["time"]);

        return invitationObject["message"].replace(":time", time);
    }

    public savePlan(generateRx = false) {
        this.saving = true;

        this._util.previousSoapSettings.previousSoapActivated = true;

        this._util.saveAllMedicines();

        this._rest.saveTreatmentPlan(
            this.generatedHistory.unique_id,
            this.remarks || "",
            this.followUp || "",
            this.observations || "",
            {
                medication: this._util.current_soap_model.medication,
                diagnosis: this._util.current_soap_model.diagnosis,
                generateRx,
                observations: this.observations,
                remarks: this.remarks,
                followUp: this.followUp,
                historyUid: this.generatedHistory.unique_id,
            }
        ).then(resp => {
            this._snackBar.open(resp['message']);
            this.saving = false;
        });
    }
}
