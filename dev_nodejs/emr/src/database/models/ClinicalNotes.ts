import { Column, Entity, getRepository, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";

@Entity("clinical_notes")
export class ClinicalNote {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    patient_id: string;

    @Column({type: "int"})
    doctor_id: number;

    @Column({type: "varchar",length:"100"})
    uuid: string;

    @Column({type: "text"})
    inspection: string;

    @Column({type: "text"})
    palpation: string;

    @Column({type: "text"})
    percussion: string;

    @Column({type: "text"})
    quscultation: string;

    @Column({type: "text"})
    system_wide_examination: string;

    @Column({type: "text"})
    key_observation: string;

    @OneToOne(type => Soap, soap => soap.clinical_notes, {
        cascade:true
    })
    @JoinColumn({name:"soap_id"})
    soap:Soap;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at: Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at: Date;

    public static repo () {
        return getRepository(ClinicalNote);
    }

    public static createEmptyFromSoap(soap: Soap) {
        const note = new ClinicalNote;
        note.patient_id = soap.patient_id + "";
        note.doctor_id = soap.created_by;
        note.uuid = soap.uuid;
        note.soap = soap;

        note.inspection = "";
        note.palpation = "";
        note.percussion = "";
        note.quscultation = "";
        note.system_wide_examination = "";
        note.key_observation = "";

        return note;
    }
}
