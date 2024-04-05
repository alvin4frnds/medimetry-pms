/**
 * Created by praveen on 08/07/19.
 */

import { Column, Entity, getRepository, Index, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Soap } from './Soap';
import { User } from '../../database/models/User';

enum Category {
    Consultation = "Consultation",
    Soap = "Soap",
    Patient = "Patient",
    PatientEntity = "PatientEntity",
    TreatmentPlan = "TreatmentPlan",
    SoapEntity = "SoapEntity",
    PatientFeedback = "PatientFeedback",
    DoctorBindings = "DoctorBindings",
    Logs = "Logs",
    ThirdPartyService = "ThirdPartyService",
}

enum Authority {
    Fresh = "Fresh",
    Update = "Update",
    Delete = "Delete",
    BulkDelete = "BulkDelete",
}

@Entity("audit_logs")
export class AuditLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 80, nullable: true})
    consultation_code:string = "";

    @Column({type: "int", nullable: true})
    doctor_id: number;

    @Column({type: "int", nullable: true})
    patient_id: number;

    @Column({type: "int"})
    wp_user_id: number = 1;

    @Column({type: "varchar", length: 160})
    token_used: string = "";

    @Column({type: "varchar", length: 255})
    user_agent: string = "";

    @Column({type: "varchar", length: 160})
    ip: string = "";

    // consultation / soap / patient / patient-history
    @Column({type: "varchar", length: 20})
    log_category: string = "";

    // fresh / update / delete / bulk-delete
    @Column({type: "varchar", length: 20})
    log_authority: string = "";

    @Column({type: "varchar", length: 160})
    title: string = "";

    @Column({type:'jsonb', "default": "{}"})
    new_content:JSON = JSON.parse("{}");

    @Column({type: "text", nullable: true})
    old_content: string = "";

    @Column({type: 'jsonb', "default": "{}"})
    full_req: JSON = JSON.parse("{}");

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    public static repo() { return getRepository( AuditLog ); }

    public static async create(request, logType, extra = {}) {
        let soap = null;

        if (extra['code'] || extra['consultation'] || extra['soap'] || extra['patient']) {
            let findOptions = {};
            if (extra['code']) findOptions = {where: {consultation_code: extra['code']}};
            if (extra['consultation']) findOptions = {where: {consultation_code: extra['consultation']}};
            if (extra['soap']) findOptions = {where: {id: extra['soap']}};
            if (extra['patient']) findOptions = {where: {patient_id: extra['patient']}, order: { id: "DESC"}};

            soap = await Soap.repo().findOne(findOptions);
        }

        let auditLog = new AuditLog();
        if (soap && soap['consultation_code']) auditLog.consultation_code = soap.consultation_code;
        if (soap && soap['created_by']) auditLog.doctor_id = soap.created_by;
        if (soap && soap['patient_id']) auditLog.patient_id = soap.patient_id;

        if (request && request['user'] && request['user']['user_id'])
            auditLog.wp_user_id = request['user']['user_id'];
        if (request && request['headers'] && request['headers']['token'])
            auditLog.token_used = request['headers']['token'];
        if (request && request['headers'] && request['headers']['user-agent'])
            auditLog.user_agent = request['headers']['user-agent'];
        else auditLog.user_agent = "undefined";

        if ( ! auditLog.wp_user_id && !request.headers.token) {
            // for affiliate cases
            auditLog.wp_user_id = 1;

        } else if (!auditLog.wp_user_id && request.headers.token) {
            const user = await User.getRepo().createQueryBuilder("user")
                .where("user.access_token = :token")
                .setParameters({token: request.headers.token})
                .orderBy("user.id", "DESC")
                .getOne();

            auditLog.wp_user_id = user['user_id'];
        }

        auditLog.ip = "0.0.0.0";
        if (request && request['connection'] && request['connection']['remoteAddress'])
            auditLog.ip = request['connection']['remoteAddress'];
        if (request && request['headers'] && request['headers']['x-forwarded-for'])
            auditLog.ip = request['headers']['x-forwarded-for'];

        auditLog.log_category = logType['category'] || "";
        auditLog.log_authority = logType['authority'] || "";
        auditLog.title = logType['title'] || "";
        auditLog.new_content = request['body'] || request['params'] || {};
        auditLog.old_content = extra['previous'] ? JSON.stringify(extra['previous']) : "";
        auditLog.full_req = JSON.parse(JSON.stringify({
            "params": request['params'] || {},
            "query": request['query'] || {},
            "body": request['body'] || {},
            "headers": request['headers'] || {},
            "url": request['originalUrl'] || "",
        }));

        await AuditLog.repo().save(auditLog);
    }

    public static readonly TYPES = {
        AffiliateController: { // not using, will maybe use if i have someway to securly pass logged in user data
            CreateSoap: { category: Category.Soap, authority: Authority.Fresh, title: "create soap from outside" },
            AttachImage: { category: Category.SoapEntity, authority: Authority.Fresh, title: "added attachment from outside" },
            SaveVitals: { category: Category.SoapEntity, authority: Authority.Fresh, title: "received vitals from outside"},
            SaveFeedback: { category: Category.PatientFeedback, authority: Authority.Fresh, title: "received feedback from partner app"},
            UpdateSoap: { category: Category.Soap, authority: Authority.Update, title: "received soap update from outside"},
            MarkConsultationDone: { cateogory: Category.Consultation, authority: Authority.Update, title: "cron marked consultation done"}
        },
        ConsultationController: {
            MarkDone: { category: Category.Consultation, authority: Authority.Update, title: "marked a consultation done" },
            MarkUndone: { category: Category.Consultation, authority: Authority.Update, title: "marked a consultation open"},
            CreatePatient: { category: Category.Patient, authority: Authority.Fresh, title: "request to create new patient"},
            CreateConsultation: { category: Category.Consultation, authority: Authority.Fresh, title: "request to create new consultation"},
            SaveDoctorBindings: { category: Category.DoctorBindings, authority: Authority.Update, title: "updating managing doctors list"},
            CloseConsultation: { category: Category.Consultation, authority: Authority.Delete, title: "closing a consultation"},
            UpdatePatient: { category: Category.Patient, authority: Authority.Update, title: "update patient's other details"},
            UpdatePatientUID: { category: Category.Patient, authority: Authority.Update, title: "update patient's UID"},
            AddVideoCallLogs: { category: Category.Logs, authority: Authority.Fresh, title: "added video-call logs"},
            SendSMS: { category: Category.ThirdPartyService, authority: Authority.Fresh, title: "sending SMS to patient"},
            GeneratePatientHistory: { category: Category.TreatmentPlan, authority: Authority.Fresh, title: "patient history link generate request" },
            SubmitPartnerAppFeedback: { category: Category.PatientFeedback, authority: Authority.Fresh, title: "patient feedback for patient created"},
        },
        GenerateHistoryController: {
            GenerateLink: { category: Category.TreatmentPlan, authority: Authority.Fresh, title: "created treatment plan link for sharing to doctors" },
            SaveTreatmentPlan: { category: Category.Soap, authority: Authority.Update, title: "updated soap based on treatment plan from consultant doctor"},
        },
        HistoryController: {
            CreateHistory: { category: Category.PatientEntity, authority: Authority.Fresh, title: "patient history component fill request"},
            CreateBulkHistory: { category: Category.PatientEntity, authority: Authority.Fresh, title: "multiple patient history component fill request"},
            DeleteHistory: { category: Category.PatientEntity, authority: Authority.Delete, title: "deleting rows of patient history"},
        },
        SoapController: {
            CreateSoap: { category: Category.Soap, authority: Authority.Fresh, title: "new soap creation request"},
            CreateTerm: { category: Category.SoapEntity, authority: Authority.Fresh, title: "new term creation request"},
            UpdateSoap: { category: Category.Soap, authority: Authority.Update, title: "soap bulk updation request"},
            CreateAttachment: { category: Category.SoapEntity, authority: Authority.Fresh, title: "create attachment from bit data request"},
            UploadAttachment: { category: Category.SoapEntity, authority: Authority.Fresh, title: "create attachment from binary file request"},
            UpdateRemarkFollowup: { category: Category.Soap, authority: Authority.Update, title: "remarks and followup updation request"},
            CreateEntities: { category: Category.SoapEntity, authority: Authority.Fresh, title: "creating soap entities request"},
            UpdateEntities: { category: Category.SoapEntity, authority: Authority.Update, title: "updating existing soap entity request"},
            DeleteEntity: { category: Category.SoapEntity, authority: Authority.Delete, title: "delete existing soap entity request"},
            DeleteAllEntities: { category: Category.SoapEntity, authority: Authority.BulkDelete, title: "empty the section"},
            SavePastIllness: { category: Category.PatientEntity, authority: Authority.Fresh, title: "saving past illness request"},
            SavePastMedications: { category: Category.PatientEntity, authority: Authority.Fresh, title: "saving past medications request"},
            DeletePastIllness: { category: Category.PatientEntity, authority: Authority.Delete, title: "deleting past illness request"},
            DeletePastMedications: { category: Category.PatientEntity, authority: Authority.Delete, title: "deleting past medications request"},
            PrescriptionSend: { category: Category.ThirdPartyService, authority: Authority.Fresh, title: "sending the prescription to patient"},
            DeleteSoap: { Category: Category.Soap, authority: Authority.Delete, title: "removing the soap out of existance"},
            EmptyFollowupDuration: { category: Category.Soap, authority: Authority.Update, title: "remarks and followup updation request"},
        }
    };
}