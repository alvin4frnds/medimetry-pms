import { Column, Entity, getRepository, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";

@Entity("personal_history")
export class PersonalHistory {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    patient_id: string;

    @Column({type: "int"})
    doctor_id: number;

    @Column({type: "varchar",length:"100"})
    uuid: string;

    @Column({type: "jsonb"})
    info: JSON;

    @OneToOne(type => Soap, soap=> soap.personal_history,{
        cascade:true
    })
    @JoinColumn({name:"soap_id"})
    soap:Soap;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at: Date;

    public static repo () {
        return getRepository(PersonalHistory);
    }
}
