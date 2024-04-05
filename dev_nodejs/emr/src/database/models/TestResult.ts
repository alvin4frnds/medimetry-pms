import { Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {Soap} from "./Soap";
import { Term } from './Term';

@Entity()
export class TestResult{

    @PrimaryGeneratedColumn()
    id:number;

    @Column({type:"int", nullable: true})
    term_id:number;

    @Column({type:"int"})
    patient_id:number;

    @Column({type: "int"})
    doctor_id: number;

    @Column({type: "varchar",length:"100"})
    uuid: string;

    @Column({type:"varchar",length:250})
    test_result:string;

    @Column({type:"varchar",length:500})
    remarks:string;

    @Column({type: "varchar", length: 20, "default": "text"})
    type: string = "text";

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @ManyToOne(type => Soap,soap=>soap.test_results,{
        cascade:true
    })
    @JoinColumn({name:"soap_id"})
    soap:Soap;

    @ManyToOne(type => Term, term=>term.test_result,{
        cascade:true
    })
    @JoinColumn({name:"term_id"})
    term:Term;

    @Column({type:'jsonb', "default": "{}", "nullable": true})
    json: JSON = JSON.parse("{}");

    public static readonly TYPES = {
        "TEXT": "text",
        "IMAGE": "image",
        "DOWNLOAD": "download",
        "JSON": "json",
    };

    public static repo() {
        return getRepository(TestResult);
    }
}