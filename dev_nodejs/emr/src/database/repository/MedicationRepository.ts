import {EntityRepository, getConnection, Repository} from "typeorm";
import {Medication} from "../models/Medication";

@EntityRepository(Medication)
export class MedicationRepository extends Repository<Medication> {


    //_repository;
    constructor() {
        super();
   // this._repository=getConnection().getRepository(Medication);
    }

    getPastMedicationByPatientId(patientId){
        return getConnection().getRepository(Medication).find({where:{patient_id:patientId}});
    }

}