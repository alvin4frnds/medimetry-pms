import { Column, Entity, getRepository, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("past_medications")
export class PastMedication {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    patient_id: number;

    @Column({type: "varchar", length: 511})
    remark: string;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    public static repo() {
        return getRepository(PastMedication);
    }
}
