import { Component, OnInit } from '@angular/core';
import { UtilityService } from '../../services/utility.service';
import { RestService } from '../../services/rest.service';
import { Constants } from '../../Utilities/Constants';

@Component({
    selector: 'app-personal-history',
    templateUrl: './personal-history.component.html',
    styleUrls: ['./personal-history.component.css']
})
export class PersonalHistoryComponent implements OnInit {

    public data: PersonalHistory;
    public id: 0;

    constructor(public _util: UtilityService,
                public _rest: RestService) {
    }

    ngOnInit() {
        this.id = this._util.current_soap_model.personal_history['id'] || 0;
        this.data = PersonalHistoryComponent.emptyObject();

        if (this._util.current_soap_model.personal_history
            && this._util.current_soap_model.personal_history['id']
        ) {
            this.id = this._util.current_soap_model.personal_history['id'];
            this.data = this._util.current_soap_model.personal_history['info']
        }
    }

    private static emptyObject() {
        return {
            dietaryCompliance: 0,
            drugCompliance: 0,
            exercise: 0,
            occupation: 0,
            drinkingHabit: 0,
            smokingHabit: 0,
            economicStatus: 0,
            lifeStyle: "",
            occupationText: "",
        };
    }

    public deleteSection() {
        this._util.deleteSection('personal_history');
    }

    public updateValues(event) {
        console.log("radio button updated: ", event);

        const object = {
            id: this.id,
            info: this.data,
        };

        this._rest.inserCurrentSoapElement(this._util.current_soap_model.id, "personal-history", object)
            .subscribe(resp => {

                if (resp.row && resp.row['id']) this.id = resp.row['id'];
            });

        this._util.sendStaffPMSStat('staff-followup-done');
    }
}

export interface PersonalHistory {
    dietaryCompliance: number;
    drugCompliance: number;
    exercise: number;
    occupation: number;
    drinkingHabit: number;
    smokingHabit: number;
    lifeStyle: string;
    occupationText: string;
    economicStatus: number;
}