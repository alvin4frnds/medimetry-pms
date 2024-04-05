import { Column, Entity, getRepository, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";
import { TreatmentPlanLogs } from './TreatmentPlanLogs';

@Entity("generated_histories")
export class GeneratedHistory {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    patient_id: string;

    @Column({type: "varchar",length:"100"})
    for_name: string;

    @Column({type: "varchar", length: "32"})
    unique_id: string;

    @Column({type: "varchar",length:"100"})
    consultation_code: string;

    @Column({type: "jsonb"})
    data: JSON;

    @ManyToOne(type => Soap, soap => soap.generated_histories,{
        cascade:true
    })
    @JoinColumn({name:"soap_id"})
    soap: Soap;

    @OneToMany(type => TreatmentPlanLogs, treatmentPlanLogs => treatmentPlanLogs.generatedHistory)
    treatmentPlanLogs: TreatmentPlanLogs[];

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at: Date;

    public static repo () {
        return getRepository(GeneratedHistory);
    }
}
