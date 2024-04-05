import { Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";

@Entity("attachments")
export class Attachment {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    patient_id: number;


    @Column({type: "int"})
    doctor_id: number;

    @Column({type: "varchar",length:"100"})
    uuid: string;


    @Column({type: "varchar", length: 100})
    attachment_type: string;

    @Column({type: "varchar", length: 50, "default": "general"})
    soap_section_type: string = "general";

    @Column({type: "varchar", length: 255, nullable: true})
    url: string;

    @Column({type: "jsonb"})
    meta: JSON = JSON.parse("{}");

    @ManyToOne(type => Soap,soap=>soap.attachments,{
        cascade:true
    })
    @JoinColumn({name:"soap_id"})
    soap:Soap;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    public static repo () {
        return getRepository(Attachment);
    }
}
