import { Injectable } from '@angular/core';
import { RestService } from './services/rest.service';

@Injectable({
    providedIn: 'root'
})
export class CallRecorderService {

    private currentConsultationAVRow = {};

    constructor(private _rest: RestService) {
    }

    startRecording(consultationId) {
        console.log("Received start request for consultationId", consultationId);

        this._rest.videoCallRecordRow(consultationId)
            .then(resp => {
                this.currentConsultationAVRow = resp;
            });
    }
}
