import {EntityRepository, getConnection, Repository} from "typeorm";
import {Procedure} from "../models/Procedure";
import {FamilyHistory} from "../models/FamilyHistory";
import {accessSync} from "fs";
import { StaticHelpers } from '../../helpers/Statics';
import { Term } from '../models/Term';

@EntityRepository(Procedure)
export class ProcedureRepository extends Repository<Procedure>{

//_repository;
    constructor() {
        super();
    //this._repository=getConnection().getRepository(Procedure);
    }


     saveProcedure(object){
        console.debug("saving term",object);
        return getConnection().getRepository(Procedure).save(object);
    }

    async getProceduresById(patientId){

        const procedures = await Procedure.repo().query(`select * from procedures where "patient_id" = ${patientId} and "soapId" = 1`);
        if (! procedures) return [];

        return await StaticHelpers.bindTerms(procedures);
    }
    deleteById(id){
        return getConnection().getRepository(Procedure).delete({id:id});
    }

}