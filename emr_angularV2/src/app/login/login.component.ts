import { Component, NgZone, OnInit } from '@angular/core';
import { RestService } from '../services/rest.service';
import { UtilityService } from '../services/utility.service';
import { Constants } from '../Utilities/Constants';
import { Router } from '@angular/router';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  pageName=Constants.PAGE_NAME.LOGIN;


    showProgressBar = false;

    constructor(public restApi: RestService,
                private _ngZone: NgZone,
                public _util: UtilityService,
                private router: Router,

    ) {
        window['getUserByToken'] = {component: this, zone: _ngZone};
    }

    ngOnInit() {


      this._util.start_trace_log(this.pageName,'ngOnInit','Initial Method called and page loaded',{});


        this.restApi.getLoginSdkPath().subscribe(result => {
            this._util.trace_line_exection(this.pageName,'ngOnInit -> getLogin Sdk Page','Got result of get Login Sdk Path',result);
            if (result.shadowSave) {
                this.getUserDetailsFromToken({token: {refresh_token: result.token}});
            } else {
                this.loadScript(result.url + 'sdk/oauth-client.js');
            }
            this._util.saveLocalData(Constants.KEY_PUSHER_DETAILS,{'pusher_app_id':result['pusher_app_id'],
            'pusher_cluster':result['pusher_cluster'],
             "pusher_key":result['pusher_key'],
             'pusher_secret':result['pusher_secret']
            });
            this._util.saveLocalData(Constants.KEY_CURRENT_ENVIRONMENT,result['app_environment']);
            this._util.saveLocalData(Constants.KEY_SHOULD_SHOW_PRICES_IN_RX, result['hideRxPricingInfo'] || false );
            this._util.saveLocalData(Constants.KEY_APP_NAME, result["appName"] || "PMS Medimetry");

          this._util.saveLocalData(Constants.KEY_REQUIRED_LOG_LEVEL,  result['logLevelInt']);
            this._util.saveLocalData(Constants.KEY_PATIENT_TAGS, result['patientTags']);
          if  (this._util.getLocalData(Constants.KEY_REQUIRED_LOG_LEVEL)  > 0)  {
                this._util.connectToSocket();
          }
        });


        this._util.end_trace_log(Constants.PAGE_NAME.LOGIN,'ngOnInit','Method Block End',{});

        setTimeout(() => {
            this.checkAndOpenConsultation();
        }, 100)
      }

    public checkAndOpenConsultation() {
        if ( window.location.search && window.location.search.length &&
            (window.location.search.indexOf("code") > -1) &&
            (window.location.search.indexOf("token") > -1)
        ) {}
        else return;

        const query = {};
        window.location.search.substr(1).split("&").forEach( row => {
            const keyvalue = row.split("=");
            query[keyvalue[0]] = keyvalue[1];
        });

        this.showProgressBar = true;

        console.log("checkAndOpenConsultation: ", query);
        this.restApi.getUserByToken({'token': query["token"]}).subscribe(result => {
             console.log("result: ", result);
             this._util.saveLocalData(Constants.KEY_CURRENT_USER, result);
            this._util.saveLocalData(Constants.KEY_CURRENT_USER_LAST_UPDATED, (new Date).getTime() + "");
            this._util.saveLocalData(Constants.KEY_ALL_COUNTRIES, result.user.countries);
            if (this._util.getLocalData(Constants.KEY_ALL_COUNTRIES)) {
              this._util.countries = this._util.getLocalData(Constants.KEY_ALL_COUNTRIES);
            }
            let image = result.user.pic ? result.user.pic : '../../../assets/images/patientpic.png';
            // this._util.application_data.showCanvas = true;
            this._util.setHeaderData(result.user.name, image, result.user.mobile);
            this._util.customizeSideNavOptions(false, null, null);
            this._util.sendMessageToSocket('authentication',result.access_token);
            this._util.navigationBackAllowed = false;
            this.router.navigate([Constants.NAVIGATION_URL.patientList]);

            this._util.setDataToObservabla({
                "type": "loginDone"
            })

            setTimeout(() => {
                this.restApi.getConsultationListByCode(query["code"])
                  .subscribe(resp => {
                    if (resp.success && resp.rows && resp.rows.length) {
                      const consultation = resp.rows[0];

                      //noinspection JSIgnoredPromiseFromCall
                      console.log("consultation: ", consultation);
                      this._ngZone.run(() => this.router.navigate([Constants.NAVIGATION_URL.dashboard])).then();

                      this._util.setDataToObservabla({
                        'type': 'showSoapFromNotifcation',
                        'data': consultation,
                      });
                    }
                });
            }, 1);
        });
    }

    public loadScript(url) {

        let node = document.createElement('script');
        node.src = url;
        node.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(node);
    }

    outSideCalledFunction(data) {
        window['getUserByToken'].zone.run(() => {
            this.getUserDetailsFromToken(data);
        });
    }


    getUserDetailsFromToken(data) {
      this._util.start_trace_log(this.pageName,'getUserDetailsFromToken','funcation Started',{});


        this.showProgressBar = true;
        this._util.trace_line_exection(this.pageName,'getUserDetailsFromToken',' Fetching user details by token',data.token.refresh_token);
        this.restApi.getUserByToken({'token': data.token.refresh_token}).subscribe(result => {
            this.showProgressBar = false;

            //Logs Start
            this._util.trace_line_exection(this.pageName,'getUserDetailsFromToken','Got response from getUserByToken Api',result);
            this._util.info_line_exection(this.pageName,'getUserDetailsFromToken','Saving Result in local storage',result);
            this._util.saveLocalData(Constants.KEY_CURRENT_USER, result);
            this._util.saveLocalData(Constants.KEY_CURRENT_USER_LAST_UPDATED, (new Date).getTime() + "");
            this._util.saveLocalData(Constants.KEY_ALL_COUNTRIES, result.user.countries);
            if (this._util.getLocalData(Constants.KEY_ALL_COUNTRIES)) {
              this._util.countries = this._util.getLocalData(Constants.KEY_ALL_COUNTRIES);
            }


            this._util.trace_line_exection(this.pageName,'getUserDetailsFromToken','Got response from getUserByToken Api',result);
            this._util.info_line_exection(this.pageName,'getUserDetailsFromToken','Broadcasting Data in key loginDone',result);


            this._util.setDataToObservabla({
                'type': 'loginDone',
                'data': this._util.getLocalData(Constants.KEY_CURRENT_USER)
            });


            let image = result.user.pic ? result.user.pic : '../../../assets/images/patientpic.png';
            this._util.setHeaderData(result.user.name, image, result.user.mobile);
            this._util.trace_line_exection(this.pageName,'getUserDetailsFromToken','Saved current user navigation header setting',{'name':result.user.name,'image':'image','mobile':result.user.mobile});

            this._util.customizeSideNavOptions(false, null, null);


            this._util.sendMessageToSocket('authentication',result.access_token);



            this._util.info_line_exection(this.pageName,'getUserDetailsFromToken','Navigating to Patient Listing page',{});
            this._util.end_trace_log(this.pageName,'getUserDetailsFromToken','Function End',{});

            // lets navigateuser, after a second
            setTimeout(() => {
                this.router
                    .navigate([Constants.NAVIGATION_URL.patientList]);
            }, 1000);
        });
    }




}
