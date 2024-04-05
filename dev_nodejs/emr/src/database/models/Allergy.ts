import { Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {Term} from "./Term";

@Entity("allergies")
export class Allergy {

    public static REQUEST_TYPE="allergy";
    public static REQUEST_TYPE_SUBSTANCE="allergy_substance";
    @PrimaryGeneratedColumn()
    id: number;
    @Column({type: "int"})
    patient_id: number;


    @Column({type: "timestamp"})
    started_at: Date;
    @Column({type: "varchar", length: 500})
    remarks: string;

    @ManyToOne(type => Term, term => term.allergy, {
        cascade: true
    })
    @JoinColumn({name:"term_id"})
    terms: Term;

    @ManyToOne(type => Term, term => term.allergySubstance, {
        cascade: true
    })
    @JoinColumn({name:"substance_term_id"})
    substance: Term;

    @Column({type:'jsonb', "default": "{}"})
    meta:JSON = JSON.parse("{}");

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    public static repo() {
        return getRepository(Allergy);
    }

    public static async saveFromRequest(request) {
        const terms = [];
        const substances = request.substances.split(',').map(sub => sub.trim());
        const reactions = request.reactions.split(',').map(sub => sub.trim());

        for ( let k = 0; k < substances.length; k ++) {
            const term = await Term.createFromText(substances[k], 'allergy_substance', 0);
            terms.push(term)
        }

        for ( let k = 0; k < reactions.length; k ++) {
            const term = await Term.createFromText(reactions[k], 'allergy_reaction', 0);
            terms.push(term)
        }

        const allergy = {
            "patient_id": request.patient_id,
            "started_at": request.started_at,
            "remarks": request.remarks || "",
            "meta": JSON.parse(JSON.stringify({terms: terms})),
            "substances": request.substances,
            "reactions": request.reactions,
        };

        return await Allergy.repo().save(allergy);
    }
}
