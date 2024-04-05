import { Column, Entity, getRepository, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("family_history")
export class FamilyHistory {
    public static REQUEST_TYPE="family_history";


    @PrimaryGeneratedColumn()
    id: number;
    @Column({type: "int"})
    patient_id: number;

    @Column({type: "varchar", length: 50})
    relation: string;

    @Column({type: "varchar", length: 100})
    name: string;

    @Column({type: "varchar", length: 150})
    diagnosis: string;

    @Column({type: "timestamp"})
    diagnosed_at: Date;

    @Column({type: "varchar", nullable: true, length: 511, "default": ""})
    remark: string = "";

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;



    public static repo() {
        return getRepository(FamilyHistory);
    }


}
