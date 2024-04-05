import { Column, Entity, getRepository, Index, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import {ChiefComplaint} from "./ChiefComplaint";
import {Examination} from "./Examination";
import {Diagnosis} from "./Diagnosis";
import {Medication} from "./Medication";
import {Referral} from "./Referral";
import {Procedure} from "./Procedure";
import {Investigation} from "./Investigation";
import {Attachment} from "./Attachment";
import {TestResult} from "./TestResult";
import { Vitals } from './Vital';
import { ClinicalNote } from './ClinicalNotes';
import { SoapController } from '../../controllers/SoapController';
import { PersonalHistory } from './PersonalHistory';
import { GeneratedHistory } from './GeneratedHistory';
import { Feedback } from './Feedback';
import {Meal} from "./Meals";
import { db } from '../../config/DatabaseConfiguration';

@Entity("soaps")
export class Soap {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 80})
    soap_code:string;

    @Column({type: "varchar", length: 70})
    consultation_code: string;

    @Column({type: "int"})
    patient_id: number;

    @Column({type: "int"})
    created_by:number;

    @Column({type: "varchar"})
    center_code:string;

    @Column({type: "varchar", length: 255, nullable: true})
    follow_up: string;

    @Column({type: "varchar", length: 511, nullable: true})
    remark: string;

    @Column({type: "boolean", "default": true})
    active: boolean = true;

    @Column({type:'jsonb', "default": "{}"})
    meta:JSON = JSON.parse("{}");

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    @Index()
    @Column({type: "varchar", length: 100})
    uuid:string;

    @OneToMany(type => Feedback, feedbacks => feedbacks.soap)
    feedbacks: Feedback[];

    @OneToMany(type => ChiefComplaint, chief_complaints => chief_complaints.soap)
    chief_complaints: ChiefComplaint[];

    @OneToMany(type => GeneratedHistory, generated_histories => generated_histories.soap)
    generated_histories: GeneratedHistory[];

    @OneToMany(type => Examination, examinations=>examinations.soap)
    examinations: Examination[];

    @OneToOne(type => Vitals, vitals => vitals.soap)
    vitals: Vitals;

    @OneToOne(type => PersonalHistory, personal_history => personal_history.soap)
    personal_history: PersonalHistory;

    @OneToOne(type => ClinicalNote, clinical_notes => clinical_notes.soap)
    clinical_notes:ClinicalNote;

    @OneToMany(type => Diagnosis, diagnosis => diagnosis.soap)
    diagnosis:Diagnosis[];

    @OneToMany(type => Medication, medication=>medication.soap)
    medications:Medication[];

    @OneToMany(type => Referral, referral=>referral.soap)
    referrals:Referral[];

    @OneToMany(type => Procedure, procedure=>procedure.soap)
    procedures:Procedure[];

    @OneToMany(type => Investigation, investigation=>investigation.soap)
    investigations:Investigation[];

    @OneToMany(type => Attachment, attachment=>attachment.soap)
    attachments:Attachment[];

    @OneToMany(type => TestResult,test_results=>test_results.soap)
    test_results:TestResult[];

    @OneToMany(type => Meal, meals=>meals.soap)
    meals:Meal[];

    public static getRepo () { return getRepository(Soap); }
    public static repo() { return Soap.getRepo(); }

    public static urlTypeParamToRelationNames(urlParam) {
        if (urlParam === "chief-complains") return "chief_complaints";
        return urlParam.replace("-", "_");
    }
    // examinations,vitals,diagnosis,medications,investigations,referrals,procedures,test_results,chief_complains
    public static async getFullById(soapId) {
        const soap = await Soap.repo().findOne({
            where: {id: soapId},
            relations: Object.keys(SoapController.URL_CLASS_MAPPING)
                .map(Soap.urlTypeParamToRelationNames)
                .concat(["investigations.term", "procedures.term", "diagnosis.term", "test_results.term"])
        });

        ["investigations", "procedures", "diagnosis", "test_results"].forEach(relation => {
            soap[relation] = (soap[relation] || []).map(entity => {
                if (entity.term) entity["term_text"] = entity.term.term_body || "";
                return entity;
            });
        });

        soap["diagnosis"] = (soap["diagnosis"] || []).map(entity => {
            if (entity.term) entity["diagnosis"] = entity.term.term_body || "";
            return entity;
        });

        return soap;
    }

    public static async appendMedicationSalts(soapMedications) {
        if ( ! soapMedications.length) return [];

        // failsafe, if there are no salts found, dont throw error in frontend
        soapMedications = soapMedications.map(row => {
            row.salts = [];
            return row;
        });

        const _db = db;

        let drugDBMedications      = [];
        let sanitizedMedicineNames = [];
        for ( let i = 0; i < soapMedications.length; i ++ )
            sanitizedMedicineNames.push(soapMedications[i].drug_name.trim().replace(/["']/g, ""));

        for ( let i = 0; i < sanitizedMedicineNames.length; i ++ ) {
            const sanitizedMedicineName = sanitizedMedicineNames[i];
            let medicationFound = await _db.mailServiceDb(`select id, name 
                from mail_log.medications 
                where name ilike '${sanitizedMedicineName}' and deprecated = false`);
            if ( medicationFound.length && medicationFound[0]) 
                drugDBMedications.push(medicationFound[0]);
        }
        if ( ! drugDBMedications.length) return soapMedications;
        
        const drugDBMedicationsIds = drugDBMedications.map( row => row.id).join(", ");
        if ( ! drugDBMedicationsIds.length) return soapMedications;

        const medicationIdSalts    = await _db.mailServiceDb(`select medication_id, salt_id 
            from mail_log.medication_salt 
            where medication_id in (${drugDBMedicationsIds})`);
        const saltsIds             = medicationIdSalts.map( row => row.salt_id ).join(", ");
        if ( ! saltsIds.length) return soapMedications;

        const salts                = await _db.mailServiceDb(`select id, name, dosage, dosage_unit 
            from mail_log.salts 
            where id in (${saltsIds})`);

        let mappedSalts            = {};
        salts.forEach(salt => { mappedSalts[salt.id] = salt.name + " " + salt.dosage + salt.dosage_unit; });
        let mappedMedications      = {};

        drugDBMedications.forEach(drugDBMedication => {
            const saltsIds = medicationIdSalts.filter(row => row.medication_id == drugDBMedication.id)
                .map(row => row.salt_id);

            drugDBMedication.salts = saltsIds.map(id => mappedSalts[id]);
            mappedMedications[drugDBMedication.name.trim().toLowerCase()] = drugDBMedication.salts;
        });

        soapMedications = soapMedications.map(medication => {
            const medicationDrugName = medication.drug_name.trim().toLowerCase();

            medication.salts = ( mappedMedications[medicationDrugName] 
                    && mappedMedications[medicationDrugName].length) 
                ? mappedMedications[medicationDrugName]
                : [];

            return medication;
        });

        return soapMedications;
    }
}
