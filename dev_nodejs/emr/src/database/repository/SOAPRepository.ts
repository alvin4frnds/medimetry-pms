import {EntityRepository, getConnection, Repository} from "typeorm";
import { Soap } from '../models/Soap';
import { db } from '../../config/DatabaseConfiguration';
import { StaticHelpers } from '../../helpers/Statics';

@EntityRepository(Soap)
export class SOAPRepository extends Repository<Soap> {

    private _repository;

    constructor() {
        super();
    }

    public init() {
        if (this._repository) return this;

        this._repository = getConnection().getRepository(Soap);
        return this;
    }

    public async createSoapByPostId(postId) {
        const post = (await db.wpdb(`select * from medi_posts where ID = ${postId}`))[0];
        const pobject = (await db.wpdb(`select * from medi_pobject where post_id = ${postId} order by start_date desc`))[0];
        const consultation = (await db.wpdb(`select * from medi_consultation where code = '${pobject.code}'`))[0];
        const patient = (await db.wpdb(`select * from medi_patients where id = ${consultation.patient_id}`))[0];

        // soap-uuid: patient/user/channel/center
        const theValues = {
            "soap_code": StaticHelpers.strRandom(32),
            "consultation_code": pobject.code,
            "patient_id": patient.id,
            "meta": {},
            "created_by": consultation.user_id,
            "center_code": patient.center_code,
            "uuid": patient.id + "/" + post.post_author + "/" + consultation.channel_id,
            "created_at": new Date,
            "updated_at": new Date,
        };

        const foundSoaps = await Soap.getRepo().find({where: {consultation_code: pobject.code}}); // returns an array

        if (foundSoaps.length) return foundSoaps[0];

        // if not lets create new one
        return await this.save(theValues);
    }

    public async save(toSave) {
        return await this.init()._repository.save(toSave);
    }

    public repo() {
        return this.init()._repository;
    }
}