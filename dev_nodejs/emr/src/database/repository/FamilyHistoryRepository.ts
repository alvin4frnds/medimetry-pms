import {EntityRepository, getConnection, Repository} from "typeorm";
import {FamilyHistory} from "../models/FamilyHistory";

@EntityRepository(FamilyHistory)
export class FamilyHistoryRepository extends Repository<FamilyHistory> {


    //_repository;
    constructor() {
        super();
        //this._repository=getConnection().getRepository(FamilyHistory);
    }

    getFamilyHistoryByPatientId(patientId: number) {
        return getConnection().getRepository(FamilyHistory).find({where: {patient_id: patientId}});
    }

    saveHistory(history: FamilyHistory) {
        return getConnection().getRepository(FamilyHistory).save(history);
    }

    deleteHistory(id) {
        return getConnection().getRepository(FamilyHistory).delete({id: id});
    }


}