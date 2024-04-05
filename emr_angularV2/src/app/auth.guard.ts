import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {UtilityService} from "./services/utility.service";
import {Constants} from "./Utilities/Constants";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {


  constructor(public _util: UtilityService,
              private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      const currentUser = this._util.getLocalData(Constants.KEY_CURRENT_USER);
      this.router.navigate(
          currentUser && currentUser.id
          ? [Constants.NAVIGATION_URL.patientList]
          : [Constants.NAVIGATION_URL.login]
      );

      const routerCurrentPath = this.router.url.match(/\/([a-z-]+)\?/)[1];

      // previous logic was always returning false;
      return [Constants.NAVIGATION_URL.treatmentPlan].indexOf(routerCurrentPath) > -1;
  }

}
