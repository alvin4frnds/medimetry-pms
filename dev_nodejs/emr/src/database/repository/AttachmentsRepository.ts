import {EntityRepository, getConnection, Repository} from "typeorm";
import {Attachment} from "../models/Attachment";

@EntityRepository(Attachment)
export class AttachmentsRepository extends Repository<Attachment>{


    private _repository;


    constructor() {
        super();
       // this._repository =getConnection().getRepository(Attachment);
    }

    getAllMedicalRecords(patientId){
        return this._repository.createQueryBuilder().select().where({patient_id:patientId}).groupBy("created_at,id").getMany();
    }


}