import { Column, Entity, getRepository, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";

@Entity("examinations")
export class Examination {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    patient_id: number;

    @Column({type: "varchar"})
    uuid: string;

   @Column({type: "int"})
    doctor_id: number;

    @Column({type: "varchar", length: 100})
    examined_by: string = "";

    @Column({type: "varchar", length: 250})
    examined_organ: string;

    @Column({type: "varchar", length: 500})
    examined_place: string = "";

    @Column({type: "varchar", length: 500})
    remarks: string;

    @Column({type: "timestamp"})
    examined_date: Date = new Date;



    @ManyToOne(type => Soap,soap=>soap.examinations,{
        cascade:true
    })
    @JoinColumn({name:"soap_id"})
    soap:Soap;


    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    public static repo () {
        return getRepository(Examination);
    }

    public static getFilteredOrgans (search = "") {
        const foundOrgans = [
            "pharynx", "larynx", "heart", "bicep", "tricep", "shoulder", "artries", "muscles",
            "kidneys", "skelton", "intestine", "brain", "lymph nodes", "lungs", "spleen",
            "bone marrow", "stomach", "veins", "pancreas", "urinary bladder"
        ];

        if (! search.length) return foundOrgans.slice(0, 15);

        return foundOrgans.filter(function(organ) {
            return organ.indexOf(search) > -1;
        });
    }
}
