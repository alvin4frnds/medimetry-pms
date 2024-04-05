import { Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";
import {Term} from "./Term";

@Entity("diagnosis")
export class Diagnosis {
    public static REQUST_TYPE="diagnosis";

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar",length:"100"})
    uuid: string;

    @Column({type: "int"})
    patient_id: number;

    @Column({type: "int"})
    doctor_id: number;


    @Column({type: "varchar", length: 500})
    category: string;

    // @Column({type: "varchar", length: 500, nullable: true})
    // diagnosis: string;

    @Column({type: "varchar", length:50, nullable: true})
    icd_code: string;

    @Column({type: "boolean"})
    chronic: boolean;

    @Column({type: "varchar", length: 500})
    status: string;

    @Column({type: "varchar", length: 500})
    remarks: string;


    @ManyToOne(type => Soap)
    @JoinColumn({name:"soap_id"})
    soap:Soap;


    @ManyToOne(type => Term, term=>term.diagnosis,{
        cascade:true
    })
    @JoinColumn({name:"term_id"})
    term: Term;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    public static repo () {
        return getRepository(Diagnosis);
    }
}
