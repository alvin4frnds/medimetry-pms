import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { UtilityService } from '../services/utility.service';

@Component({
  selector: "app-patient-unique-id",
  templateUrl: "./patient-unique-id.component.html",
  styleUrls: ["./patient-unique-id.component.css"]
})
export class PatientUniqueIdComponent implements OnInit {
  dataProvider=null;
  isCurrentModeProcessing=false;
  constructor(
    public dialog: MatDialogRef<PatientUniqueIdComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}


  public selectedIndex=0;
  ngOnInit() {

    try{
      this.dataProvider=this.data.util.getDataProviders().subscribe(result=>  {
        if  (result.type  === 'consultation_state') {
          if  (result.data  === 'processing') {
            this.isCurrentModeProcessing  = true;
          } else if (result.data  === 'done')  {
            this.isCurrentModeProcessing  = false;
          }
        }
  });
    } catch(err)  {

    }




  }

  closeDialog() {
    if(this.isCurrentModeProcessing){
        this.data.util.showSnackBar('Cannot close until consultation create');
    }else{
     this.dialog.close();
     try{
      this.dataProvider.unsubscribe();
     }catch(err){

     }
    }
  }


  switchToTab(tabNum){
      this.selectedIndex=tabNum;
  }

}
