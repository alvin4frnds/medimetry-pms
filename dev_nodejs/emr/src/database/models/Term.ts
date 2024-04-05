import { Column, Entity, getRepository, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import {Allergy} from "./Allergy";
import {Diagnosis} from "./Diagnosis";
import {Procedure} from "./Procedure";
import {Habit} from "./Habit";
import {Investigation} from "./Investigation";
import { TestResult } from './TestResult';


@Entity("terms")
@Unique(['term_type','term_name', 'doctor_id'])
export class Term {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    doctor_id: number;


    @Column({type: "varchar", length: 150})
    term_type: string;


    @Column({type: "varchar", length: 150})
    term_name: string;


    @Column({type: "varchar", length: 500})
    term_body: string;


    @Column({type: "jsonb"})
    meta: JSON = JSON.parse("{}");

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;


    @OneToMany(type => Allergy, allergy => allergy.terms)
    allergy: Allergy;

    @OneToMany(type => Allergy, allergy => allergy.substance)
    allergySubstance: Allergy;

    @OneToMany(type => Diagnosis, diagnosis => diagnosis.term)
    diagnosis: Diagnosis;

    @OneToMany(type => Procedure, procedure => procedure.term)
    procedure: Procedure;

    @OneToMany(type => TestResult, test_result => test_result.term)
    test_result: TestResult;

   @OneToMany(type => Investigation, investigation=> investigation.term)
   investigation: Investigation;

    @OneToMany(type => Habit, habit => habit.terms)
    habit: Habit;

    public static async createFromText(text, type, doctor_id) {
        const term = await Term.repo().findOne({
            where: {
                doctor_id: doctor_id,
                term_type: type,
                term_name: text,
                term_body: text,
            }
        });

        if (!! term) return term;

        return await Term.repo().save({
            "doctor_id": doctor_id,
            "term_type": type,
            "term_name": text,
            "term_body": text,
            "meta": {}
        });
    }

    public static repo() {
        return getRepository(Term);
    }
}