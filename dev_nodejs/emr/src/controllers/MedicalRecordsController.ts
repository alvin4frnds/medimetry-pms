"use strict";
import {AttachmentsRepository} from "../database/repository/AttachmentsRepository";
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import { Attachment } from '../database/models/Attachment';
import { Term } from '../database/models/Term';
import { StaticHelpers } from '../helpers/Statics';
import { PatientNotes } from '../database/models/PatientNotes';
import { HttpRequest } from '../helpers/HttpRequest';
import { config } from '../config/Config';
import { db } from '../config/DatabaseConfiguration';

const Router = require('./Router');

export class MedicalRecordsController extends Router {

    attachmentRepository=new AttachmentsRepository();
    private _request: HttpRequest;
    private _config;
    private _db;

    constructor(routePath, app) {
        super(routePath, app);

        this._db = db;
        this._config = config;
        this._request = new HttpRequest();
    }

    get services() {
        return {
            '/getMedicalRecords/:patientId': 'getMedicalRecords',
            '/get-medical-records/:patientId': 'getMedicalRecords2',
            '/notes/list/:patient': 'getPatientNotes',
            'DELETE /notes/:id': "deletePatientNote",
            'PATCH /notes/:id': "updatePatientNote",
            'POST /notes/:patient': "createPatientNote",
            'POST /patient-tag/:patient': "addPatientTag",
            '/grammer-list': 'getGrammerList',
        };
    }

    private preMiddlewares() { return [ AuthMiddleware ]; }

    async getPatientNotes(req, res) {
        const notes = await PatientNotes.repo().find({
            where: {
                patient_id: req.params.patient,
            },
            order: { id: "DESC", }, 
        });

        return res.send(this.build("Here you go", 1, {
            notes
        }));
    }

    async deletePatientNote(req, res) {
        const note = await PatientNotes.repo().findOne({
            where: {id: req.params.id},
        });

        if (! note) return res.send(this.build("Note not found."));

        await PatientNotes.repo().delete(note.id);

        return res.send(this.build("Deleted Successfully", 1, {
            note,
        }));
    }

    async updatePatientNote(req, res) {
        const note: PatientNotes = await PatientNotes.repo().findOne({
            where: {id: req.params.id},
        });

        if ( ! note) return res.send(this.build("Record not found"));

        note.text = req.body.text;
        note.writer = req.user.name;

        await PatientNotes.repo().save(note);

        return res.send(this.build("Updated successfully", 1, {note}));
    }

    async createPatientNote(req, res) {
        const note = new PatientNotes();

        note.text = req.body.text;
        note.patient_id = req.params.patient;
        note.writer = req.user.name;

        if (req.body.code) note.consultation_code = req.body.code;

        await PatientNotes.repo().save(note);

        return res.send(this.build("Created successfully", 1, {
            note,
        }));
    }

    async  getMedicalRecords(req, res) {
        let getAllRecords = await  this.attachmentRepository.getAllMedicalRecords(req.params.userId);
        console.debug(getAllRecords);
        res.send(this.build("All Attachments by patient", 1, {"records":getAllRecords}));
    }

    async getMedicalRecords2(req, res) {
        const allAttachmentsOfPatients = await Attachment.repo().find({
            where: {patient_id: req.params.patientId}
        });

        const uniqueTimestamps = StaticHelpers.getColumnFromJsonObj(allAttachmentsOfPatients, "created_at");
        let uniqueDates = [];
        uniqueTimestamps.forEach( timestamp => {
            const date = timestamp.toLocaleDateString();
            if (uniqueDates.indexOf(date) === -1) uniqueDates.push(date);
        });
        let attachmentsGroupedByDates = {};
        uniqueDates.forEach( date => {
            attachmentsGroupedByDates[date] = allAttachmentsOfPatients.filter( attachment => {
                return attachment.created_at.toLocaleDateString() === date;
            });
        });

        res.send(this.build("Here you go!", 1, { attachments: attachmentsGroupedByDates }));
    }

    async addPatientTag(req, res) {
        const resp = await this._request.seRequest("internal-api/emr/add-patient-tag", {
            key: this._config.getOAuthClientKey(),
            patient: req.params.patient,
            tag: req.body.tag,
        });

        return res.send(resp);
    }

    async getGrammerList(req, res) {
        const colors = ['aqua' , 'azure' , 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow'];
        const PMSKeywords = StaticHelpers.onlyUnique('patient notification refresh listing missing soap followup duration stats doctors binded logout open done testing filter tag tags center centers mobile phone mine name age address male female consultation complaints complaint chief history medications medicine allergies substance reaction family history relation illness past procedures treatment previous section vitals BP temp pulse height weight systolic dystolic UID fasting post parandial oxygen saturation respiratory circumference BMI head generate feedback generate history consult diagnosis investigations attachment personal history referrals examinations remarks clinical notes diet chart'.split(' '));

        let PMSTerms = await Term.repo().query(`select distinct(term_body), term_type from terms`);
        let groupedPMSTerms = {};

        PMSTerms.forEach(term => {
            if ( groupedPMSTerms[term.term_type])
                groupedPMSTerms[term.term_type].push(term.term_body.trim());
            else groupedPMSTerms[term.term_type] = [ term.term_body.trim() ];
        });
        
        for ( const type in groupedPMSTerms )
            groupedPMSTerms[type] = StaticHelpers.onlyUnique(groupedPMSTerms[type].filter(body => body.length > 2));

        PMSTerms = groupedPMSTerms;

        let medications = await this._db.mailServiceDb(`select distinct(name) from mail_log.medications where deprecated = false and type = 'medication'`);
        medications = StaticHelpers.onlyUnique(medications.map( med => med.name.trim() ));

        let investigations = await this._db.mailServiceDb(`select distinct(name), type from mail_log.medications where deprecated = false and type in ('pathology', 'radiology')`);

        const patientTags = this._config.get("patientTags", "").split(',');
        const centers = StaticHelpers.onlyUnique(
            (await this._db.mailServiceDb(`select * from mail_log.channel_centers`)));
        const channels = StaticHelpers.onlyUnique(
            (await this._db.mailServiceDb(`select * from mail_log.channels`)));
        const staff = StaticHelpers.onlyUnique(
            (await this._db.mailServiceDb(`select * from mail_log.channel_staff`)));

        let doctors = [];
        if ( req.user.user_type === 'assistant') doctors = doctors.concat(req.user.meta.doctors || []);
        if ( req.user.user_type === 'contributor') 
        	doctors.push({"doctor_id": req.user.user_id, "doctor_name": req.user.name, "doctor_phone": "91" + req.user.mobile});

        return res.send(this.build("Here you go", 1, {
            colors, PMSKeywords, PMSTerms, medications, patientTags, centers, channels, staff, doctors, investigations,
        }));
    }

}