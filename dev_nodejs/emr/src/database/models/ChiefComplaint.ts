import { Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";

@Entity("chief_complaints")
export class ChiefComplaint{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int",})
    patient_id: number;

    @Column({type: "varchar",length:"100"})
    uuid: string;

    @Column({type: "int"})
    doctor_id: number;

    @Column({type: "varchar", length: 500})
    complaint: string;

    @Column({type: "varchar", length: 500})
    remarks: string;

    @Column({type: "varchar", length: 20, "default": "text"})
    type: string = "text";

    @ManyToOne(type => Soap, soap => soap.chief_complaints, {
        cascade:true
    })
    @JoinColumn({name: "soap_id"})
    soap: Soap;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    public static readonly TYPES = {
        "TEXT": "text",
        "IMAGE": "image",
        "DOWNLOAD": "download",
    };

    public static repo () {
        return getRepository(ChiefComplaint);
    }

}