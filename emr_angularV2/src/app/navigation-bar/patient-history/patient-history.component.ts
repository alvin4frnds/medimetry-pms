import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef
} from "@angular/core";
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { UtilityService } from "../../services/utility.service";
import { HistoryInterface } from "../../HistoryInterface";
import { Constants } from "../../Utilities/Constants";
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatChipInputEvent, MatAutocomplete, MatAutocompleteSelectedEvent, MatVerticalStepper } from '@angular/material';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: "app-patient-history",
  templateUrl: "./patient-history.component.html",
  styleUrls: ["./patient-history.component.css"]
})
export class PatientHistoryComponent
  implements OnInit, OnDestroy, AfterViewInit, HistoryInterface {
  @Input() data: any;
  @Input() fromDialog: any;



  tempStoreAllergy:any;



    selectedIndexOfAllergies  = 0;

  dataProvider: any;
  isCurrentModeProcessing = false;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  allergyFormControl = new FormControl();
  filteredFruits: Observable<string[]>;

  @ViewChild('alleryInput') alleryInput: ElementRef<HTMLInputElement>;
  @ViewChild('allergiesSuggestion') allergiesSuggestion: MatAutocomplete;

  suggestions: string[] = [];
  allergySuggestion: string[] = [];

  var_temp_allergySubs="";
  var_temp_remarks="";

  var_family_relation="";
  var_family_remark="";

  var_past_illness_remark="";
  var_past_treatment_remarks="";
  var_past_medication_remarks="";


  patientId = 0;


    unsaved_data=[];

  addHistoryObject(type,event,completeList,isPastMedication = false,isPastIllness = false,fromUnsavedBit=false) {
    let object = this._util.createNewObject(type, event);

    if (!fromUnsavedBit && event.target.value === "") {
      //this._util.showSnackBar("Please Enter Something", "");
    } else {
      if (type === "past-treatment") {
        type = "procedure";
      }
      if (!isPastIllness && !isPastMedication && type !== "family_history") // past-treatment / procedure
      {

        if(this.isCurrentModeProcessing){
            this.unsaved_data.push({'type':'past-treatment','value':event.target.value});
            this._util.patientHistoryObject.past_treatment.push(this._util.createNewObject('past-treatment',false,false,0,0,true,event.target.value));

        }else{

        //@ts-ignore
        object.patient_id = this.patientId;
        //@ts-ignore
        object.term_text = !fromUnsavedBit?event.target.value:event;
        this._util.addHistoryObject(type, object, completeList, false).then(result => {


          });
        }
      } else if (!isPastIllness && !isPastMedication && type === "family_history") {
        //@ts-ignore
        object.patient_id = this.patientId;
        //@ts-ignore
        object.remark = event.target.value;
        this._util
          .addHistoryObject(type, object, completeList, false)
          .then(result => {});
      } else if (isPastIllness && !isPastMedication) {

          if(this.isCurrentModeProcessing){
              this.unsaved_data.push({'type':'past-illness','value':event.target.value});

                this._util.patientHistoryObject.past_illness_2.push(this._util.createNewObject('past-illness',false,false,0,0,true,event.target.value));
          }else{
        //@ts-ignore
        object.patientId = this.patientId;
        //@ts-ignore
        object.remark = !fromUnsavedBit?event.target.value:event;
        this._util
          .addHistoryObject(type, object, completeList, true)
          .then(result => {});
        this._util
          .getRestObject()
          .savePastIllness(object)
          .subscribe(result => {
                for(let index=0;index<this._util.patientHistoryObject.past_illness_2.length;index++){
                  if(this._util.patientHistoryObject.past_illness_2[index].remark===result.row.remark){
                    this._util.patientHistoryObject.past_illness_2[index].id=result.row.id;
                    break;
                  }
                }

          });
        }
      } else if (!isPastIllness && isPastMedication) {


         if(this.isCurrentModeProcessing){
           this._util.patientHistoryObject.past_medication_2.push(this._util.createNewObject('past-medication',false,false,0,0,true,event.target.value));
           this.unsaved_data.push({'type':'past-medication','value':event.target.value});


          }else{

        //@ts-ignore
        object.patientId = this.patientId;
        //@ts-ignore
        object.remark = !fromUnsavedBit?event.target.value:event;
        this._util
          .addHistoryObject(type, object, completeList, true)
          .then(result => {});
        this._util
          .getRestObject()
          .savePastMedication(object)
          .subscribe(result => {
            for(let index=0;index<this._util.patientHistoryObject.past_medication_2.length;index++){
              if(this._util.patientHistoryObject.past_medication_2[index].remark===result.row.remark){

                this._util.patientHistoryObject.past_medication_2[index].id=result.row.id;
                break;
              }
            }

          });
        }
      }

      try {
        event.target.value = "";
        this.var_past_illness_remark='';
        this.var_past_treatment_remarks='';
        this.var_past_medication_remarks='';

      } catch (err) {}
    }
  }



  deleteHistoryObject() {}

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    setTimeout(() => {
      this._util.patientHistoryObject = {
        allergies: [],
        familyHistory: [],
        habits: [],
        past_illness: [],
        past_treatment: [],
        medications: [],
        past_medication_2: [],
        past_illness_2: []
      };
    }, 200);
    if (this.fromDialog) {
      this.dataProvider.unsubscribe();
    }
  }

  constructor(public _util: UtilityService) {


    this.filteredFruits = this.allergyFormControl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => fruit ? this._filter(fruit) : this.allergySuggestion.slice()));

  }
  ngOnInit() {
    if (this.fromDialog) {
      this.patientId = this._util.getLocalData(Constants.KEY_PATIENT_ID);
    } else {
      this.patientId = this._util.getLocalData(
        Constants.KEY_CURRENT_CONSULTATION
      ).patient.id;
    }

    this.dataProvider = this._util.getDataProviders().subscribe(result => {
      if (result.type === "consultation_state") {
        if (result.data === "processing") {
          this.isCurrentModeProcessing = true;
        } else if (result.data === "done") {
          this.isCurrentModeProcessing = false;
          this.patientId = this._util.getLocalData(Constants.KEY_PATIENT_ID);
          this.getHistoryOfPatient();

        }
      }

      if ( result.type === "openSoapRefreshed" || (result.type === "refreshHistory")) {
        if ( !result.data || !result.data.patient) return;

        this.getHistoryOfPatient(result.data.patient.id);
      }
    });

  }

  deleteHistory(id, type, position, completeList,event=null) {

    if (type === "past-medication" || type === "past-illness") {
      this._util
        .getRestObject()
        .deleteHistoryIllness(id, type)
        .subscribe(result => {
          completeList.splice(position, 1);
        });
    } else {
      this._util
        .getRestObject()
        .deleteHistory({ id: id, type: type })
        .subscribe(result => {
          completeList.splice(position, 1);
        });
    }
    try{
      event.stopPropagation();
      }catch(err){

      }
  }

  getHistoryOfPatient(patientId = null) {
    patientId = patientId || this._util.getLocalData(Constants.KEY_PATIENT_ID);
    this.patientId = patientId;
    
    this._util
      .getRestObject()
      .getHistory({ patientId: patientId, type: "other" })
      .subscribe(row => {
        this._util.patientHistoryObject = row;
        this._util.patientHistoryObject.allergies = this._util.patientHistoryObject.allergies.map( result => {
          if ( result.substance && result.substance.term_name)
            result.substances = result.substance.term_name;

          return result;
        });

        this._util
          .getRestObject()
          .getHistory({ patientId: patientId, type: "family_history" })
          .subscribe(row => {
            this._util.patientHistoryObject.familyHistory = row.familyHistory;
              this.upload_unsaved_data();
          });
      });

    this._util
      .getRestObject()
      .getPastMedications(patientId)
      .subscribe(row => {
        this._util.patientHistoryObject.medications = row.medication;
      });
  }


  remove(term: string): void {

    const index = this.suggestions.indexOf(term);

    if (index >= 0) {
      this.suggestions.splice(index, 1);
    }

    this.deleteSubstanceTerm(term);
  }



  add(event: MatChipInputEvent): void {
    if (!this.allergiesSuggestion.isOpen) {
      const input = event.input;
      const value = event.value;

      if ((value || '').trim()) {
        this.suggestions.push(value.trim());
        this.processSubstanceTerm(value);

      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.allergyFormControl.setValue(null);
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allergySuggestion.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.suggestions.push(event.option.viewValue);
    this.processSubstanceTerm(event.option.viewValue);
    this.alleryInput.nativeElement.value = '';
    this.allergyFormControl.setValue(null);
  }


  getSuggestionFromServer(event) {

    let object={'term':event.target.value,'type':'allergy_substance'};
    this._util.getRestObject().getTermsSuggestions(object).subscribe((row)=>{
        this.allergySuggestion=[];
      row.data.forEach(element => {
        this.allergySuggestion.push(element.term_name);
      });
   });
  }





  getLastIndexOfAllergies(){
    this.selectedIndexOfAllergies=this._util.patientHistoryObject.allergies.length;
    return this.selectedIndexOfAllergies;
  }

  upload_unsaved_data(){

    for(let index=0;index<this.unsaved_data.length;index++)
    {
      if(this.unsaved_data[index]['type']==='past-medication'){
        this.addHistoryObject(this.unsaved_data[index].type,this.unsaved_data[index]['value'],this._util.patientHistoryObject.past_medication_2,true,false,true);
      }else if(this.unsaved_data[index]['type']==='allergy'){
          this.saveAllergy(true,this.unsaved_data[index]['substance'],this.unsaved_data[index]['value']);
      }else if(this.unsaved_data[index]['type']==='family_history'){
       this.processCurrentPastRelation(true,this.unsaved_data[index]['relation'],this.unsaved_data[index]['remark']);
      }else if(this.unsaved_data[index]['type']==='past-illness'){
        this.addHistoryObject(this.unsaved_data[index]['type'],this.unsaved_data[index]['value'],false,false,true,true);
      }else if(this.unsaved_data[index]['type']==='past-treatment'){
        this.addHistoryObject(this.unsaved_data[index]['type'],this.unsaved_data[index]['value'],false,false,false,true);

      }

    }


  }

  saveAllergy(isFromUnsaved=false,allergy_substance='',allergic_reaction=''){
   let processValue=true;

    if((isFromUnsaved) && (allergy_substance==='') && (allergic_reaction==='')){
        processValue=false;

    }

      if((!isFromUnsaved) && (this.var_temp_allergySubs==='') && (this.var_temp_remarks==='') ){
        processValue=false;
      }

      if(processValue){
    if(this.isCurrentModeProcessing){
        this.unsaved_data.push({'type':'allergy','value':this.var_temp_remarks,'substance':this.var_temp_allergySubs});
        this._util.patientHistoryObject.allergies.push(
         this._util.createNewObject('allergy',false,false,0,0,true,this.var_temp_remarks,this.var_temp_allergySubs));
        this.var_temp_allergySubs="";
        this.var_temp_remarks="";


    } else{
    this.tempStoreAllergy=null;
    if( this.var_temp_allergySubs && this.var_temp_allergySubs.startsWith(',')){
      this.var_temp_allergySubs=  this.var_temp_allergySubs.substring(1,this.var_temp_allergySubs.length);
    }


    this._util.patientHistoryObject.allergies.push(this._util.createNewObject('allergy',false,false,this.patientId));
    let selectedIndex=this.getLastIndexOfAllergies()-1;

    this._util.patientHistoryObject.allergies[selectedIndex].substances=!isFromUnsaved?this.var_temp_allergySubs:allergy_substance;
    this._util.patientHistoryObject.allergies[selectedIndex].reactions=!isFromUnsaved?this.var_temp_remarks:allergic_reaction;
    this._util.patientHistoryObject.allergies[selectedIndex].processed=true;
    this.var_temp_allergySubs="";
    this.var_temp_remarks="";
    this.suggestions=[];

    this._util.addHistoryObject('allergy',this._util.patientHistoryObject.allergies[selectedIndex],
    this._util.patientHistoryObject.allergies).then(result=>{

    });
  }
}
  }




  deleteSubstanceTerm(termToDelete){
    let arr_substance=this.var_temp_allergySubs.split(',');
    for(let index=0;index<arr_substance.length;index++){
        if(arr_substance[index]===termToDelete){
          arr_substance.splice(index,1);
          break;
        }
    }
    this.var_temp_allergySubs="";
    for(let index=0;index<arr_substance.length;index++){
      if(arr_substance[index]!=''){
        this.var_temp_allergySubs=this.var_temp_allergySubs+","+arr_substance[index];
      }}
  }

  processSubstanceTerm(term){

      this.var_temp_allergySubs = ""+this.var_temp_allergySubs+','+term;
  }


  updateCurrentAllergy(allergy,position){
    this.var_temp_remarks="";
    this.var_temp_allergySubs="";
    this.suggestions=[];
    this.suggestions=allergy.substances.split(',');
    for(let index=0;index<this.suggestions.length;index++){
      this.var_temp_allergySubs=this.var_temp_allergySubs+','+this.suggestions[index];
    }

    this.var_temp_remarks=this._util.patientHistoryObject.allergies[position].reactions;

    this.deleteHistory(allergy.id,'allergy',position,this._util.patientHistoryObject.allergies);
    //this._util.patientHistoryObject.allergies.splice(position,1);

      if(this.tempStoreAllergy){
        this._util.patientHistoryObject.allergies.push(this.tempStoreAllergy);
      }

      this.tempStoreAllergy=allergy;
  }

  processCurrentPastRelation(isFromUnsaved=false,patient_relation='',history_remark=''){
    let process_data=true;
    if((isFromUnsaved) && (patient_relation==='') && (history_remark==='')){
        process_data=false;
    }

    if((!isFromUnsaved) && (this.var_family_relation==='') && (this.var_family_remark==='')){
        process_data=false;
    }


    if(process_data)
{
      if(this.isCurrentModeProcessing){
          this.unsaved_data.push({'type':'family_history','relation':this.var_family_relation,'remark':this.var_family_remark});
          this._util.patientHistoryObject.familyHistory.push(this._util.createNewObject('family_history',false,false,0,0,true,this.var_family_remark,this.var_family_relation));

        }else{

    this._util.patientHistoryObject.familyHistory.push(this._util.createNewObject('family_history'));
    let index=this._util.patientHistoryObject.familyHistory.length-1;
    this._util.patientHistoryObject.familyHistory[index].remark=!isFromUnsaved?this.var_family_remark:history_remark;
    this._util.patientHistoryObject.familyHistory[index].relation=!isFromUnsaved?this.var_family_relation:patient_relation;
    this._util.patientHistoryObject.familyHistory[index].patient_id=this.patientId;

    this.var_family_remark="";
    this.var_family_relation="";

    this._util.getRestObject().addHistoryObject({'type':'family_history','data':this._util.patientHistoryObject.familyHistory[index]}).subscribe(row => {
          this._util.patientHistoryObject.familyHistory[index].id=row.data.id;
    });
  }
}
  }




updatePastIllness(illness,position,id)  {

  this.var_past_illness_remark='';
  this.var_past_illness_remark  = illness;

  this.deleteHistory(this._util.patientHistoryObject.past_illness_2[position].id,
    'past-illness',
    position,this._util.patientHistoryObject.past_illness_2);
}

updatePastTreatment(treatment,position,id)  {

   this.var_past_treatment_remarks='';
  this.var_past_treatment_remarks  = ""+treatment;

  this.deleteHistory(this._util.patientHistoryObject.past_treatment[position].id,
    'procedure',
    position,this._util.patientHistoryObject.past_treatment);
}

updatePastMedicine(medicine,position,id){

  this.var_past_medication_remarks='';
  this.var_past_medication_remarks=""+medicine;
  this.deleteHistory(this._util.patientHistoryObject.past_medication_2[position].id,
    'past-medication',
    position,this._util.patientHistoryObject.past_medication_2);
}




}




