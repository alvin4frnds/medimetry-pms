import {EntityRepository, getConnection, Repository} from "typeorm";
import {Allergy} from "../models/Allergy";

@EntityRepository(Allergy)
export class AllergyRepository extends Repository<Allergy> {


    //private repository;
    constructor() {
        super();
        //self.repository=getConnection().getRepository(Allergy);
    }

    async getAllergiesByPatientId(patientId: number) {

        let allergies = await Allergy.repo().find({where:{patient_id: patientId}});

        for ( let j = 0; j < allergies.length; j ++) {
            const allergy = allergies[j];
            let substances = [];
            let reactions = [];

            const terms = allergy["meta"]["terms"] || [];
            for ( let i = 0; i < terms.length; i ++) {
                if (terms[i].term_type == "allergy_reaction") {
                    reactions.push(terms[i].term_body);
                }

                if (terms[i].term_type == "allergy_substance") {
                    substances.push(terms[i].term_body);
                }
            }

            allergy["substances"] = substances.join(",");
            allergy["reactions"] = reactions.join(",");

            allergies[j] = allergy;
        }

        return allergies;
    }

    saveAllergies(allergies: Allergy) {
        return getConnection().getRepository(Allergy).save(allergies);
    }

    deleteById(id) {
        return getConnection().getRepository(Allergy).delete({id: id});
    }


}