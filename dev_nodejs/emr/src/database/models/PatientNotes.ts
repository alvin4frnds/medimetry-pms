import { Column, Entity, getRepository, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";

@Entity("patient_notes")
export class PatientNotes {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 120})
    writer: string;

    @Column({type: "int"})
    patient_id: string;

    @Column({type: "varchar", length: 40, nullable: true})
    consultation_code: string = null;

    @Column({type: "text"})
    text: string;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at: Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at: Date;

    public static repo () {
        return getRepository(PatientNotes);
    }
}
