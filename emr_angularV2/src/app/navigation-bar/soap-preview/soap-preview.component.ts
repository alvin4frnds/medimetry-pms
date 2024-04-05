import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {UtilityService} from "../../services/utility.service";
import {MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-soap-preview',
  templateUrl: './soap-preview.component.html',
  styleUrls: ['./soap-preview.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SoapPreviewComponent implements OnInit {

  constructor(public _util: UtilityService, public dialog: MatDialogRef<SoapPreviewComponent>) {
  }

  ngOnInit() {


  }


  saveCurrentSoap() {
    this.closeDialog();
  }

  closeDialog() {
    this.dialog.close();
  }

}
