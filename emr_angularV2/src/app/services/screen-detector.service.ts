import { Injectable } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Observable } from "rxjs/index";
import { map } from "rxjs/internal/operators";
import { Router } from "@angular/router";
import { UtilityService } from "./utility.service";
import { Constants } from "../Utilities/Constants";

@Injectable({
  providedIn: "root"
})
export class ScreenDetectorService {
 public deviceType = { isMobile: false };

  // header_settings = {'hamburger_icon_visible': false};
  //
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset,Breakpoints.Tablet])
    .pipe(map(result => result.matches));

  constructor(private breakpointObserver: BreakpointObserver) {
      this.deviceType.isMobile = window.innerWidth < 1278;
  }
}
