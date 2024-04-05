import {EntityRepository, getConnection, Repository} from "typeorm";
import {Diagnosis} from "../models/Diagnosis";
import {FamilyHistory} from "../models/FamilyHistory";
import { StaticHelpers } from '../../helpers/Statics';

@EntityRepository(Diagnosis)
export class DiagnosisRepository extends Repository<Diagnosis>{


   // _repository;
    constructor() {
        super();
       // this._repository=getConnection().getRepository(Diagnosis);
    }

    saveDiagnosis(object){

        return getConnection().getRepository(Diagnosis).save(object);
    }

    deleteById(id){
        return getConnection().getRepository(Diagnosis).delete({id:id});
    }

    async getPastDiagnosisByPatientId(patientId: number) {
        // adding { soap_id: 1 } #297

        const diagnosis = await Diagnosis.repo().query(`select * from diagnosis where "patient_id" = ${patientId} and "soap_id" = 1`);
        if (! diagnosis) return [];

        return await StaticHelpers.bindTerms(diagnosis);
    }
}