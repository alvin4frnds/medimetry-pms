import { Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";

@Entity("referral")
export class Referral {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    patient_id: number;

    @Column({type: "int"})
    doctor_id: number;

    @Column({type: "varchar",length:"100"})
    uuid: string;

    @Column({type: "varchar", length: 100})
    referral_type: string = "";

    @Column({type: "varchar", length: 255, nullable: true})
    procedure: string = "";

    @Column({type: "int", nullable:true})
    procedure_term_id: number;

    @Column({type: "varchar", length: 200,nullable:true})
    location: string = "";

    @Column({type: "varchar", length: 200,nullable:true})
    department: string = "";

    @Column({type: "varchar", length: 150})
    doctor_name: string = "";

    @Column({type: "varchar", length: 100})
    priority: string = "";

    @Column({type: "timestamp"})
    referral_date: Date = new Date;

    @Column({type: "varchar", length: 500,nullable:true})
    status: string;

    @Column({type: "varchar", length: 500,nullable:true})
    diagnosis_term: string;

    @Column({type: "int", nullable: true})
    diagnosis_term_id: number;

    @Column({type: "jsonb"})
    meta: JSON = JSON.parse("{}");

    @Column({type: "varchar", length: 500})
    remarks: string = "";

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    @ManyToOne(type => Soap,emr_soap=>emr_soap.referrals,{
        cascade:true
    })
    @JoinColumn({name:"soap_id"})
    soap:Soap;

    public static repo() {
        return getRepository(Referral);
    }
}
