import { AfterViewInit, Component, OnInit } from "@angular/core";
import { UtilityService } from "./services/utility.service";
import { Constants } from "./Utilities/Constants";
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, AfterViewInit {
    isLoginRequired = null;
    isPageStandAlone = false;

    constructor(public _utilityService: UtilityService,
                public _router: Router) {
    }

    ngOnInit(): void {
        this._utilityService.getDataProviders().subscribe(row => {
            if (row && row.type === 'loginDone') {
                this.isLoginRequired = false;
            } else if (row && row.type === 'logout') {
                this.isLoginRequired = true;
            }
        });

        this._utilityService.eventProvider.subscribe(row => {
            console.log("app component, received event: ", row);

            switch (row.name) {
                case "httpWarn":
                    this._utilityService.showSnackBar(row.value);
                    break;
                default: break;
            }
        });

        let currentUserData = this._utilityService.getLocalData(Constants.KEY_CURRENT_USER);
        this.isLoginRequired = !(currentUserData && (currentUserData["success"]));

        var loaderEl = document.getElementById('initial-loader-container');
        if ( loaderEl) loaderEl.parentElement.removeChild(loaderEl);
    }

    ngAfterViewInit(): void {

        this.setPageIsStandAlone();
    }

    setPageIsStandAlone() {
        const url = window.location.href.match(/\/([a-z-]+)\?/g);
        if (!url || !url[0]) return;

        const componentPath = url[0].replace("/", "").replace("?", "");
        if ([Constants.NAVIGATION_URL.treatmentPlan].indexOf(componentPath) > -1)
            this.isPageStandAlone = true;
    }
}
