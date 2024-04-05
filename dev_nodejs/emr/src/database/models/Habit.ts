import { Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {Term} from "./Term";

@Entity("habits")
export class Habit{

    public static REQUEST_TYPE="habit";

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    patient_id:number;
    @Column()
    habit_started_at:Date;
    @Column()
    doctor_id:number;
    @Column({type:"varchar",length:500})
    remarks:string;

    @ManyToOne(type => Term, term => term.habit, {
        cascade: true
    })
    @JoinColumn({name:"term_id"})
    terms: Term;



    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    public static repo() {
        return getRepository(Habit);
    }

}