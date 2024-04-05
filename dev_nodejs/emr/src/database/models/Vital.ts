import { Column, Entity, getRepository, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";

@Entity("vitals")
export class Vitals {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    patient_id: string;

    @Column({type: "int"})
    doctor_id: number;

    @Column({type: "varchar",length:"100"})
    uuid: string;

    @Column({type: "varchar", length: 500,nullable:true})
    vital_collected_at: string;

    @Column({type: "jsonb"})
    vital_information: JSON;

    @OneToOne(type => Soap, soap=>soap.vitals,{
        cascade:true
    })
    @JoinColumn({name:"soap_id"})
    soap:Soap;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    public static repo () {
        return getRepository(Vitals);
    }
}
