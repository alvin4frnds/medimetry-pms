import {FamilyHistoryRepository} from "../database/repository/FamilyHistoryRepository";
import {PatientHabitRepository} from "../database/repository/HabitRepository";
import {AllergyRepository} from "../database/repository/AllergiesRepository";
import {FamilyHistory} from "../database/models/FamilyHistory";
import {Habit} from "../database/models/Habit";
import {Allergy} from "../database/models/Allergy";
import {TermsRepository} from "../database/repository/TermsRepository";
import {MedicationRepository} from "../database/repository/MedicationRepository";
import {DiagnosisRepository} from "../database/repository/DiagnosisRepository";
import {ProcedureRepository} from "../database/repository/ProcedureRepository";
import {Diagnosis} from "../database/models/Diagnosis";
import {Procedure} from "../database/models/Procedure";
import {AuthMiddleware} from "./middlewares/AuthMiddleware";
import { PastIllness } from '../database/models/PastIllness';
import { PastMedication } from '../database/models/PastMedication';
import { Term } from '../database/models/Term';
import { ShadowSave } from './middlewares/ShadowSave';
import { AuditLog } from '../database/models/AuditLog';

const Router = require('./Router');

export class HistoryController extends Router {

    getPatientId: number;


    //Need to make Global
    termRepository = new TermsRepository();
    habitRepo = new PatientHabitRepository();
    familyHistoryRepo = new FamilyHistoryRepository();
    allergiesRepo = new AllergyRepository();
    medicineRepository = new MedicationRepository();
    diagnosisRepository = new DiagnosisRepository();
    procedureRepo = new ProcedureRepository();


    private historyObject: any;
    private terms: any;

    public temp: string;
    private getTermId: any;
    private response: any;


    constructor(routePath, app) {
        super(routePath, app);
    }

    private preMiddlewares() { return [ AuthMiddleware ]; }
    private postMiddlewares() { return [ ShadowSave ]; }


    get services() {
        return {
            'POST /getHistory': "getHistory",
            '/getHistoryV2/:patient': "getHistoryV2",
            'POST /createHistory': 'createHistory',
            'POST /createBulkHistory': 'createBulkHistory',
            'POST /getTerms': 'getTerms',
            '/getPastMedications/:patientId': 'getPastMedications',
            'POST /delete': 'deleteHistory'
        };
    }


    async deleteHistory(req, res) {
        let deleteResponse;
        if (!req.body.type || !req.body.id) {
            return res.send(this.build("Some Params are missing", 0));
        }

        await AuditLog.create(req, AuditLog.TYPES.HistoryController.DeleteHistory);

        switch (req.body.type) {
            case FamilyHistory.REQUEST_TYPE:
               deleteResponse = await FamilyHistory.repo().findOne({where: { id: req.body.id }});
                await this.familyHistoryRepo.deleteHistory(req.body.id);
                break;
            case Habit.REQUEST_TYPE:
                deleteResponse = await Habit.repo().findOne({where: { id: req.body.id }});
                await this.habitRepo.deleteHabits(req.body.id);
                break;
            case Allergy.REQUEST_TYPE:
                deleteResponse = await Allergy.repo().findOne({where: { id: req.body.id }});
                await this.allergiesRepo.deleteById(req.body.id);
                break;
            case Diagnosis.REQUST_TYPE:
                deleteResponse = await Diagnosis.repo().findOne({where: { id: req.body.id }});
                await this.diagnosisRepository.deleteById(req.body.id);
                break;
            case Procedure.REQUEST_TYPE:
                deleteResponse = await Procedure.repo().findOne({where: { id: req.body.id }});
                await this.procedureRepo.deleteById(req.body.id);
                break;
            default:
                return res.send(this.build("type missing", 0));
                break;

        }

        return res.send(this.build("Successfully Deleted", 1, {deleteResponse}));
    }


    async getTerms(req, res) {
        const rows = await this.termRepository.getTerms(req.body.type, req.body.term || req.body.text);

        const uniqueNames = [];
        rows.filter( row => {
            if(uniqueNames.indexOf(row.term_body.toLowerCase().trim()) > -1)
                return false;

            uniqueNames.push(row.term_body.toLowerCase().trim());
            return true;
        });

        res.send(this.build("Terms sent", "1", {'data': rows }, req));
    }

    async getHistory(req, res) {

        this.getPatientId = req.body.patientId;

        let allergies = await this.allergiesRepo.getAllergiesByPatientId(this.getPatientId);
        let habits = await this.habitRepo.getHabitsByPatientId(this.getPatientId);
        // Need to add past diagnosis and procedure data
        let diagnosis = await  this.diagnosisRepository.getPastDiagnosisByPatientId(this.getPatientId);
        diagnosis.map(diag => {
            diag["diagnosis"] = diag.term.term_body;
            return diag;
        });
        let procedures = await this.procedureRepo.getProceduresById(this.getPatientId);
        let familyHistory = await this.familyHistoryRepo.getFamilyHistoryByPatientId(this.getPatientId);


        if (!req.body.type)
            res.send(this.build("No Type Found with request", 0));
        else if (req.body.type === FamilyHistory.REQUEST_TYPE) {

            console.debug("Data Entering ",req.body);
            console.debug("Data Getting ",familyHistory);

            this.historyObject = {
                "familyHistory": familyHistory,
                "allergies": [],
                "habits": [],
                "past_illness": [],
                "past_treatment": []
            };

        }
        else {
            let allergies = await this.allergiesRepo.getAllergiesByPatientId(this.getPatientId);
            let habits = await this.habitRepo.getHabitsByPatientId(this.getPatientId);
            // Need to add past diagnosis and procedure data
            let diagnosis = await  this.diagnosisRepository.getPastDiagnosisByPatientId(this.getPatientId);
            diagnosis.map(diag => {
                diag["diagnosis"] = diag.term.term_body;
                return diag;
            });
            let procedures = await this.procedureRepo.getProceduresById(this.getPatientId);

            const pastIllnesses = await PastIllness.repo().find({
                where: { patient_id: this.getPatientId }
            });
            const pastMedications = await PastMedication.repo().find({
                where: { patient_id: this.getPatientId }
            });

            this.historyObject = {
                "familyHistory": familyHistory,
                "allergies": allergies,
                "habits": habits,
                "past_illness": diagnosis,
                "past_treatment": procedures,
                "past_illness_2": pastIllnesses,
                "past_medication_2": pastMedications
            };
        }


        res.send(this.build("History Data", 1, this.historyObject, req));

    }

    async createBulkHistory(req, res) {

        await AuditLog.create(req, AuditLog.TYPES.HistoryController.CreateBulkHistory);

        let termsToSave = Array<any>();
        let getHabitObject = req.body.data.habits;
        let getFamilyHistoryObject = req.body.data.family_history;
        let getAllergiesObject = req.body.data.allergy;
         let getPastIllenessObject=req.body.data.past_illness;
         let getPastTreatments=req.body.data.past_treatment;

        getHabitObject.forEach((habit) => {
            if (habit.terms < 1) {
                termsToSave.push(this.makeTermObject(Habit.REQUEST_TYPE,habit,habit.term_text));
            }
        });
        getPastIllenessObject.forEach((past_illness)=>{
           termsToSave.push(this.makeTermObject(Diagnosis.REQUST_TYPE,past_illness,past_illness.diagnosis));
        });
        getPastTreatments.forEach((past_treatment)=>{
           termsToSave.push(this.makeTermObject(Procedure.REQUEST_TYPE,past_treatment,past_treatment.term_text));
        });
        let response = await this.termRepository.syncTerms(termsToSave);
        let termVsId = {};
        termVsId=this.termsVsIdExtractor(response,termVsId);

        console.debug("term vs id",termVsId);
        getHabitObject.map(function (obj) {
            if (!obj.terms)
                obj.terms = termVsId["habit"][obj.term_text];
            return obj;
        });
        getPastIllenessObject.map((obj)=>{
            if (!obj.term) {
                obj.term = termVsId["diagnosis"][obj.diagnosis];
            }


            return obj;
        });
        getPastTreatments.map((obj)=>{
            if (!obj.term_id)
                obj.term_id = termVsId["procedure"][obj.term_text];
            return obj;
        });

        if (getHabitObject.length > 0) {
            await this.habitRepo.saveHabits(getHabitObject).catch(error=>{
            console.debug("Habit",error);
            });
        }
        if (getFamilyHistoryObject.length > 0) {
            await this.familyHistoryRepo.saveHistory(getFamilyHistoryObject).catch(error=>{
                console.debug("Family "+error);
            });
        }
        if(getPastIllenessObject.length > 0){
            await this.diagnosisRepository.saveDiagnosis(getPastIllenessObject).catch(error=>{
                console.debug("diagnosis ",error);
            });
        }

        if(getPastTreatments.length > 0){
            await this.procedureRepo.saveProcedure(getPastTreatments).catch(error=>{
                console.debug("diagnosis ",error);
            });
        }


        getAllergiesObject.forEach((async (data_allergy) => {
            await Allergy.saveFromRequest(data_allergy);
        }));

        return res.send(this.build("Successful", 1, req));
    }

    private getUnsavedTermsList(data_allergy, termsToSave) {
        if (data_allergy.terms < 1) {
            termsToSave.push(this.makeTermObject(Allergy.REQUEST_TYPE, data_allergy, data_allergy.term_name));
        }
        //Only if allergy substance term id is 0
        if (data_allergy.substance < 1) {
            termsToSave.push(this.makeTermObject(Allergy.REQUEST_TYPE_SUBSTANCE, data_allergy, data_allergy.substance_name));
        }

        return termsToSave;
    }

    async createHistory(req, res) {
        if (req.body.data && req.body.data.patient_id) {
            await AuditLog.create(req, AuditLog.TYPES.HistoryController.CreateHistory, {
                patient: req.body.data.patient_id,
            });
        }

        switch (req.body.type) {
            case FamilyHistory.REQUEST_TYPE:
                this.response = await this.familyHistoryRepo.saveHistory(req.body.data).catch(error => {
                    console.debug("Error",error);
                });
                break;
            case Habit.REQUEST_TYPE:
                let term;
                await this.saveTermIfNotExists(req, term);
                this.response = await this.habitRepo.saveHabits(req.body.data).catch(error => {
                        console.error("Error",error);
                });
                break;
            case Allergy.REQUEST_TYPE:
                //It can be 0 only if no term available.
                this.response = await Allergy.saveFromRequest(req.body.data);
                break;
            case Diagnosis.REQUST_TYPE:
                if (req.body.data.term == 0 && !req.body.data.icd_code) {

                    // #280: use 'diagnosis' text intead of term_text
                    if (req.body.data.diagnosis) req.body.data.term_text = req.body.data.diagnosis;
                    let term = await this.termRepository.saveTerm(req.body);
                    req.body.data.term = term.id;
                }
                this.response = await this.diagnosisRepository.saveDiagnosis(req.body.data);

                break;
            case Procedure.REQUEST_TYPE:
                //it will be always 0
                if (!req.body.data.term) {
                    let term = await this.termRepository.saveTerm(req.body);
                    req.body.data.term = req.body.data.term_id = term.id || term.term;
                }

                this.response = await this.procedureRepo.saveProcedure(req.body.data);

                break;
            default:
                return res.send(this.build("Invalid Request Type", 0));
                break;
        }

        return res.send(this.build("Terms Data", 1, {"data": this.response}, req));

    }

    async getHistoryV2(req, res) {
        const allergies = await this.allergiesRepo.getAllergiesByPatientId(req.params.patient);
        const familyHistories = await FamilyHistory.repo().find({where: {patient_id: req.params.patient }});

        // #297
        // const diagnosis = await Diagnosis.repo().find({where: {patient_id: req.params.patient, soap_id: 1 }});
        // const procedures = await Procedure.repo().find({where: {patient_id: req.params.patient, soapId: 1 }});
        const diagnosis = await (new DiagnosisRepository()).getPastDiagnosisByPatientId(req.params.patient);
        const procedures = await (new ProcedureRepository()).getProceduresById(req.params.patient);

        const habits = await Habit.repo().find({where: {patient_id: req.params.patient }});
        const pastIllnesses = await PastIllness.repo().find({where: { patient_id: this.getPatientId }});
        const pastMedications = await PastMedication.repo().find({where: { patient_id: this.getPatientId }});

        return res.send(this.build("Here you go", 1, {
            "familyHistory": this.groupByCreatedDate(familyHistories),
            "allergies": this.groupByCreatedDate(allergies),
            "habits": this.groupByCreatedDate(habits),
            "past_illness": this.groupByCreatedDate(diagnosis),
            "past_treatment": this.groupByCreatedDate(procedures),
            "past_illness_2": this.groupByCreatedDate(pastIllnesses),
            "past_medication_2": this.groupByCreatedDate(pastMedications)
        }, req));
    }

    private replaceTermsIdToAllergy(allergyObject, termVsId) {
        if (!allergyObject.terms) {
            allergyObject.terms = termVsId['allergy'][allergyObject.term_name];
        }
        if (!allergyObject.substance) {
            allergyObject.substance = termVsId['allergy_substance'][allergyObject.substance_name];
        }

        return allergyObject;
    }
    private termsVsIdExtractor(savedTerms, termVsId) {
        savedTerms.forEach((row) => {
            if (typeof termVsId[row.term_type] === "object") {
                termVsId[row.term_type][row.term_name] = row.id;
            } else {
                termVsId[row.term_type] = {};
                termVsId[row.term_type][row.term_name] = row.id;
            }
        });
        return termVsId;
    }
    private async saveTermIfNotExists(req, term) {
        if (!req.body.data.terms) {
            term = await this.termRepository.saveTerm(req.body);
            req.body.data.terms = term.id;
        }
    }

    private groupByCreatedDate(rows) {
        let uniqueDates = [];
        rows.forEach( row => {
            if (uniqueDates.indexOf(row.created_at.toDateString()) === -1)
                uniqueDates.push(row.created_at.toDateString());
        });

        let groupedRows = {};
        uniqueDates.forEach( date => {
            groupedRows[date] = rows.filter( row => {
                return row.created_at.toDateString() === date;
            });
        });

        return groupedRows;
    }

    async getPastMedications(req, res) {
        this.medicineRepository.getPastMedicationByPatientId(req.params.patientId).then(row => {
            res.send(this.build("success", 1, {"medication": row}, req));
        }).catch(err => {
            console.error(err);
            res.send(this.build("Error Occured", 0));

        });

    }
    private makeTermObject(term_type, object, term_name) {
        return {
            "doctor_id": object.doctor_id,
            "term_type": term_type,
            "term_name": term_name,
            "term_body": term_name,
            "meta": [],
            "created_at": object.created_at
        }
    }

}