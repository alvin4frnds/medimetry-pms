import { Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {Term} from "./Term";

@Entity("consultations_status")
export class ConsultationStatus {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    consultation_id: number;

    @Column({nullable: true})
    doctor_id: number;

    @Column({nullable: true})
    patient_id: number = null;

    @Column({type: "varchar", length: 255, default: "", nullable: true})
    center_code: String;

    @Column({type: "varchar", length: 40, unique: true})
    consultation_code: String;

    @Column({type: "timestamp"})
    consultation_modified: Date;

    @Column({type: "varchar", length: 40})
    consultation_status: String;

    @Column()
    done: Boolean;

    @Column({default: true})
    active: Boolean = true;

    @Column({type: "jsonb"})
    meta: JSON = JSON.parse("{}");

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    public static repo() { return getRepository(ConsultationStatus); }

}
