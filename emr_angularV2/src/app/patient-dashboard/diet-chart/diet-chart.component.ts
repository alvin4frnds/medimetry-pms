import { Component, OnInit } from '@angular/core';
import { UtilityService } from '../../services/utility.service';
import {RestService} from '../../services/rest.service';
import {Constants} from '../../Utilities/Constants';
import {ScreenDetectorService} from '../../services/screen-detector.service';

@Component({
  selector: 'app-diet-chart',
  templateUrl: './diet-chart.component.html',
  styleUrls: ['./diet-chart.component.css']
})
export class DietChartComponent implements OnInit {

  page_name='Diet Chart';
  meals = [];
  meal_times = [];
  meal_suggestions = [];
  mealUnitSuggestions = [];
  isWeekend = false;
  isSameRow = false;
  currentConsultationData = {};
  defaultMealUnitSuggestions;


  constructor(public _util: UtilityService,
              private _rest: RestService,
              public screen_detector: ScreenDetectorService,) { }


  deleteSection() {

    this._util.deleteSection('diet_chart');

    // this._rest.deleteMealSection(this._util.current_soap_model.id).subscribe(resp => {
    //   if (!resp['success']) {
    //     return;
    //   }
    //   this._util.current_soap_model.diet_chart = [];
    //   this.addNextRow(0);
    // })



  }

  saveRow(meal:any) {

    if(meal.time == ''){
      console.log('meal time is required');
      return;
    }
    if(meal.name == '') {
      console.log('meal name is required');
      return;
    }

    meal.soap_id = this._util.current_soap_model.id;
    meal.doctor_id = this.currentConsultationData['doctor'].ID;
    meal.consultation_code = this.currentConsultationData['consultation_code'];
    meal.patient_id = this.currentConsultationData['patient'].id;

    if(meal.quantity_values != '') {
      meal.quantity_unit = meal.quantity_values.replace(/[^a-zA-Z]/g, '').toLowerCase().trim();
      meal.quantity = parseFloat(meal.quantity_values.match(/[\d\.]+/));
    }

    if (! meal.quantity) return;

    this._rest.saveMeal(meal, meal.soap_id).subscribe(resp => {
      if (!resp['success']) {
        return;
      }
      meal.id = resp["row"].id;


    });


  }

  saveMealName(meal, position) {
    if(meal.meal_time == '' && meal.weekend == '') {
      meal.meal_time = this._util.current_soap_model.diet_chart[position - 1].meal_time;
      meal.weekend = this._util.current_soap_model.diet_chart[position - 1].weekend;
    }
    if(meal.name.length) meal.name = meal.name.toLowerCase().trim();

    this.saveRow(meal);

  }

  addNextRow(position) {
    this.mealUnitSuggestions = [];
    this.meal_suggestions = [];
    this._util.start_trace_log(this.page_name,'addNextRow()','addNextRow() starts');
    if(position >=  this._util.current_soap_model.diet_chart.length-2)
    this._util.addNextRowIfNotExists('diet_chart',this._util.current_soap_model.diet_chart,this._util.createNewObject('diet_chart'));


    if ((position + 2) === this._util.current_soap_model.diet_chart.length) return;

    if(this._util.current_soap_model.diet_chart[position + 1] && this._util.current_soap_model.diet_chart[position + 1].meal_time == '')
      this._util.current_soap_model.diet_chart[position + 1].meal_time = this._util.current_soap_model.diet_chart[position].meal_time;
    if(this._util.current_soap_model.diet_chart[position + 1] && this._util.current_soap_model.diet_chart[position + 1].weekend == '')
      this._util.current_soap_model.diet_chart[position + 1].weekend = this._util.current_soap_model.diet_chart[position].weekend;

      this._util.sendStaffPMSStat('staff-followup-done');

  }

  deleteMeal(position, meal_id) {
    if(meal_id != 0) {
      this._rest.deleteMeal(meal_id, this._util.current_soap_model.id).subscribe(resp => {
        if (!resp['success']) {
          alert('there is no previous meals');
          return;
        }

      });
    }

    this._util.current_soap_model.diet_chart.splice(position, 1);

  }

  getPreviousMeals() {
    this._rest.getPreviousSoapMeals(this._util.current_soap_model.id).subscribe(resp => {
      if(!resp["success"]) {
        this._util.showSnackBar('previous meals not found');
        return;
      }
      this._util.current_soap_model.diet_chart = this._util.processAllMeals(resp["rows"]).filter(meal => { meal.id = 0;
        return meal;})
      this._util.current_soap_model.diet_chart.forEach(meal => {
        this.saveRow(meal);
      })
      this.addNextRow(resp["rows"].length-1);

    })
  }

  sendFocusToNextElement(position) {
    console.log('send focus to next element');
  }

  selectNewDay(position) {
    this.addNextRow(position);

  }

  showMealSuggestions(meal_name, position){
    if(meal_name == '') {
      this.meal_suggestions = [];
      return;
    }

    if(meal_name.length > 2)
    this._rest.getMealSuggestion(meal_name).subscribe(resp => {
      if (!resp['success']) {
        return;
      }
      this.meal_suggestions = resp['matches'];

    });

  }

  addNewMeal(position) {
    this.addNextRow(position);
    this._util.current_soap_model.diet_chart[position+1].same_day = true;
    this._util.current_soap_model.diet_chart[position + 1].same_time = true;

  }

  hasWhiteSpace(s) {
    return /\s/g.test(s);
  }


  AddNewTime(meal, position) {
    // this.addNextRow(position);
    if(this._util.current_soap_model.diet_chart[position].weekend == '')
      this._util.current_soap_model.diet_chart[position].weekend = this._util.current_soap_model.diet_chart[position - 1].weekend;

  }

  showMealUnitSuggestions(meal_property, position) {

    let meal_quantity = parseFloat(meal_property.match(/[\d\.]+/));
    let meal_quantity_unit = meal_property.replace(/[^a-zA-Z]/g, '').trim();

    if (!this.hasWhiteSpace(meal_property)) {
      if(meal_property == '') {
        this.mealUnitSuggestions = [];
        return;
      }

      this.mealUnitSuggestions = this.defaultMealUnitSuggestions.filter(suggestion => {
        suggestion.term_body = meal_quantity + ' ' + suggestion.item;
        return suggestion;
      });

    } else {

      if(!meal_quantity) {
        return;
      }


      if(meal_quantity_unit == '') {
        this.mealUnitSuggestions = [];
        return;
      }
      if(meal_quantity_unit.length)
        this._rest.getMealUnitSuggestion(meal_quantity_unit).subscribe(resp => {
          if (!resp['success']) {
            return;
          }
          this.mealUnitSuggestions = resp['suggestions'].filter(suggestion => {

            suggestion.term_body = meal_quantity + ' ' + suggestion.term_body;
            return suggestion;

          });

        });

    }



  }

  selectSuggestion(suggestion, position, event) {
      let el = document.getElementById("meal-name-input-" + (position + 1));
      if ( el ) el.focus();
  }


  ngOnInit() {
    const method='ngOnInit()';
    this._util.start_trace_log(this.page_name,method,method+' function starts');

    this.currentConsultationData = this._util.getLocalData(Constants.KEY_CURRENT_CONSULTATION);

    this.meal_times = this._util.meal_times;
    this.defaultMealUnitSuggestions = [{'item': 'Bowl'},
      {'item': 'Plate'},
      {'item': 'Glass'},
      {'item': 'Mug'},
      {'item': 'Cup'},
      {'item': 'Piece'},
      {'item': 'Pack'}];

      this._util.getDataProviders().subscribe(object => {
          if (object.type == "updateVitalsKeys") {
              this.meals = this.meals.map(meal => {
                  meal.soap_id = object.data;
                  return meal;
              });
          }
      });
  }

}
