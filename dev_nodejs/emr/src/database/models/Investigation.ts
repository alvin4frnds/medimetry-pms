import { Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";
import {Term} from "./Term";

@Entity("investigation")
export class Investigation {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    patient_id: number;


    @Column({type: "int"})
    doctor_id: number;

    @Column({type: "varchar", length: "100"})
    uuid: string;

    @Column({type:"int", nullable: true})
    term_id:number;

    @Column({type: "varchar", length: 100})
    category: string;

    @Column({type: "varchar", length: 50})
    loinc_code: string;

    @Column({type: "varchar", length: 500})
    status: string;

    @Column({type: "varchar", length: 500})
    remarks: string;



    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;


    @ManyToOne(type => Soap, soap => soap.investigations, {
        cascade: true
    })
    @JoinColumn({name: "soap_id"})
    soap: Soap;

    @ManyToOne(type => Term, term => term.investigation, {
        cascade: true
    })
    @JoinColumn({name: "term_id"})
    term: Term;

    public static repo() {
        return getRepository(Investigation);
    }
}
