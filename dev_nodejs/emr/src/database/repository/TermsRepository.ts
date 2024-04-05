import { EntityRepository, FindOperator, getConnection, In, Like, Repository } from "typeorm";
import {Term} from "../models/Term";

@EntityRepository(Term)
export class TermsRepository extends Repository<Term> {
    private object: any;


    constructor() {
        super();
        //   this._repository = ;
    }

    getTerms(type, term) {

        return getConnection("default").getRepository(Term)
            .createQueryBuilder("terms")
            .where("term_type = :type and term_name ilike :term", {
                type,
                term: "%" + term + "%",
            })
            .getMany();
    }

    async saveTerm(termData) {

        this.object = {
            "doctor_id": termData.data.doctor_id,
            "term_type": termData.type,
            "term_name": termData.data.term_text,
            "term_body": termData.data.term_text,
            "meta": [],
            "created_at": new Date
        };
        let term = await this.checkIfTermAlreadyExists({
            term_type: this.object.term_type,
            term_name: this.object.term_body
        });

        if (!term) {
            return getConnection("default").getRepository(Term).save(this.object);

        }
        else {
            return term;
        }
    }

    async syncTerms(terms) {
        // console.debug("Coming Here too =>",terms);
        let term_name = [], term_type = [];
        terms.forEach(row => {
            term_name.push(row.term_name);
            term_type.push(row.term_type);
        });
        await getConnection().createQueryBuilder().insert()
            .into(Term)
            .values(terms)
            .onConflict(`(term_type,term_name) DO NOTHING`).execute();
        return getConnection("default").getRepository(Term).find({term_type: In(term_type), term_name: In(term_name)});
    }


    async checkIfTermAlreadyExists(condition) {
        return getConnection().getRepository(Term).findOne({where: condition});
    }
}