import { Column, Entity, getRepository, JoinColumn, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";
import {Term} from "./Term";

@Entity("procedures")
export class Procedure {
    public static REQUEST_TYPE="procedure";
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    patient_id: number;
    @Column({type: "int"})
    doctor_id: number;

    @Column({type:"int", nullable: true})
    term_id:number;

    @Column({type: "varchar",length:"100"})
    uuid: string;

    @Column({type: "varchar", length: 100})
    speciality: string;

    @Column({type: "varchar", length: 500})
    remarks: string;

    @Column({type: "jsonb"})
    meta: JSON = JSON.parse("{}");


    @Column({type:"varchar",length:250})
    status:string = "";



    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;


    @ManyToOne(type => Soap,soap=>soap.procedures,{
        cascade:true
    })
    @JoinTable({name:"soap_id"})
    soap:Soap;


    @ManyToOne(type => Term, term=>term.procedure,{
        cascade:true
    })
    @JoinColumn({name:"term_id"})
    term:Term;

    public static repo() {
        return getRepository(Procedure);
    }
}
