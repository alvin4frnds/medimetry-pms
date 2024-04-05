import { Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";

@Entity("feedbacks")
export class Feedback {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    from: number;

    @Column({type: "int"})
    to: number;

    @Column({type: "varchar",length:"40"})
    consultation_code: string;

    @Column({type: "varchar",length:"3"})
    value: string;

    @Column({type: "varchar", length: 255, nullable: true})
    body: string;

    @ManyToOne(type => Soap, soap => soap.feedbacks,{
        cascade:true
    })
    @JoinColumn({name: "soap_id"})
    soap: Soap;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    public static repo () {
        return getRepository(Feedback);
    }
}
