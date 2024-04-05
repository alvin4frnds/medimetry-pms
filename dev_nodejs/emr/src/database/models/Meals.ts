import {Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Soap} from "./Soap";
@Entity("meals")

export class Meal {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 100, nullable: true})
    meal_time: string = "";

    @Column({type: "varchar", length: 255, nullable: true})
    name: string;

    @Column({type: "varchar", length: 150})
    quantity: string = "";

    @Column({type: "varchar", length: 150, nullable: true})
    quantity_unit: string = "";

    @Column({type: "boolean"})
    weekend: boolean;

    @Column({type: "int"})
    unique_meal_id: number;

    @Column({type: "int"})
    patient_id: number;

    @Column({type: "int"})
    doctor_id: number;

    @ManyToOne(type => Soap, soap => soap.meals, {
        cascade: true
    })
    @JoinColumn({name:"soap_id"})
    soap: Soap;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;


    public static repo() {
        return getRepository(Meal);
    }
}
