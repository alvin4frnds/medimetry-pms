import { Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";
import { GeneratedHistory } from './GeneratedHistory';

@Entity("treatment_plan_logs")
export class TreatmentPlanLogs {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar",length:"511"})
    remarks: string;

    @Column({type: "varchar",length:"100"})
    follow_up: string;

    @Column({type: "jsonb"})
    data: JSON;

    @ManyToOne(type => GeneratedHistory, generatedHistory => generatedHistory.treatmentPlanLogs,{
        cascade:true
    })
    @JoinColumn({name:"generated_history_id"})
    generatedHistory: GeneratedHistory;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at: Date;

    public static repo () {
        return getRepository(TreatmentPlanLogs);
    }
}
