import { Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";

@Entity("medications")
export class Medication {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    patient_id: number;

    @Column({type: "int"})
    doctor_id: number;

    @Column({type: "varchar", length: "100"})
    uuid: string;

    @Column({type: "varchar", length: 255, nullable: true})
    drug_name: string;


    @Column({type: "varchar", length: 150})
    drug_dosage: string = "";

    @Column({type: "varchar", length: 100})
    drug_dosage_unit: string = "";

    @Column({type: "varchar", length: 100, nullable: true})
    frequency: string = "";

    @Column({type: "varchar", length: 100, nullable: true})
    duration: string = "";

    @Column({type: "varchar", length: 50})
    duration_unit: string = "";

    @Column({type: "varchar", length: 100})
    intake: string = "";

    @Column({type: "varchar", length: 500})
    remarks: string = "";

    @Column({type: "varchar", length: 100, nullable: true})
    type: Type = null;
    // allowed values: tab, syrup, powder, tube, capsule, injection

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    @ManyToOne(type => Soap, soap => soap.medications, {
        cascade: true
    })
    @JoinColumn({name:"soap_id"})
    soap: Soap;

    public static repo() {
        return getRepository(Medication);
    }
}

const enum Type {
    Tab = "tab",
    Syrup = "syrup",
    Capsule = "capsule",
    Injection = "injection",
    Powder = "powder",
    Tube = "tube"
}