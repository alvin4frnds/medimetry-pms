import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/index';
import {Constants} from '../Utilities/Constants';
import {UtilityService} from './utility.service';
import { Moment } from 'moment';


@Injectable()
export class RestService {
  private header: { headers: HttpHeaders };

  constructor(public http: HttpClient, public _util: UtilityService) {
  }

  setRequestHeader() {
    this.header = {
      headers: new HttpHeaders({
        'token': this._util.getLocalData(Constants.KEY_CURRENT_USER).access_token
      })
    };
    return this.header;
  }


  public getLoginSdkPath(): Observable<any> {
    return this.http.get<any>(Constants.API_ROUTES.sdkPath);
  }

  public getUserByToken(object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.getUserByToken, object);
  }

  public searchPatients(searchObject): Observable<any[]> {
    return this.http.get<any[]>(Constants.API_ROUTES.searchPatient + '/' + searchObject.searchQuery + '/' + searchObject.page, this.setRequestHeader());
  }


  getOpenConsultations(pageNo, centerCode = '', patientTags = []): Observable<any> {
    return this.http.get<any>(Constants.API_ROUTES.getOpenConsultations + '/' + pageNo + '?center=' + centerCode
        + "&tags=" + patientTags.join(",")
        , this.setRequestHeader());
  }

  searchPatientByName(name, centerCode = '', patientTags = []): Observable<any> {
    return this.http.get<any>(`/api/v1/consultations/search-patients/${name}?center=${centerCode}&tags=${patientTags.join(",")}`, this.setRequestHeader());
  }

  searchAssignedPatients(search) {
    return this.http.get<any>(`/api/v1/consultations/search-patients/${search.searchQuery}?assigned=1`, this.setRequestHeader());
  }

  getPatientsConsltations(patientId): Observable<any> {
    return this.http.get<any>(`/api/v1/consultations/patient-consultations/${patientId}`, this.setRequestHeader());
  }

  getDoneConsultations(pageNo,  centerCode = '', patientTags = []): Observable<any> {
    return this.http.get<any>(Constants.API_ROUTES.getDoneConsultations + '/' + pageNo + '?center=' + centerCode
        + "&tags=" + patientTags.join(","), this.setRequestHeader());
  }

  markConsultationDone(consultationCode): Observable<any> {
    return this.http.get<any>(Constants.API_ROUTES.markConsultationDone + '/' + consultationCode, this.setRequestHeader());
  }

  toggleConsultationDone(consultationCode, isDone): Observable<any> {
    const route = isDone ? Constants.API_ROUTES.markConsultationUnDone : Constants.API_ROUTES.markConsultationDone;

    return this.http.get<any>(route + '/' + consultationCode, this.setRequestHeader());
  }


  getBindedDoctors(): Observable<any> {
    return this.http.get<any>(Constants.API_ROUTES.getBindedDoctor, this.setRequestHeader());
  }

  getPatientDetail(id, consultationCode = ''): Observable<any> {
    return this.http.get<any>('/api/v1/consultations/patient/' + id + '/' + consultationCode, this.setRequestHeader());
  }

  getPrescriptionPreview(soapId): Observable<any> {
    return this.http.get<any>('/api/v1/soap/prescription/preview/' + soapId, this.setRequestHeader());
  }

  public async sendPrescription(soapId, extraParams){
    return await this.http.post<any>('/api/v1/soap/prescription/send/' + soapId, extraParams, this.setRequestHeader())
        .toPromise();
  }

  addCustomTypeOfAttachment(soapId, attachmentUrl, attachmentType = 'prescription'): Observable<any> {
    return this.http.post<any>(`/api/v1/soap/${soapId}/attachments`, {
      'attachment_type': 'image/jpeg',
      'url': attachmentUrl,
      'soap_section_type': attachmentType,
    }, this.setRequestHeader());
  }

  updatePatientsDetails(id, details): Observable<any> {
    return this.http.patch<any>('/api/v1/consultations/patient/' + id, details, this.setRequestHeader());
  }
  removePatientFromListing(id): Observable<any> {
      return this.http.delete("/api/v1/consultations/patient/" + id, this.setRequestHeader());
  }

  updatePatientUID(id, newLogin, onConflict = 'updateAll'): Observable<any> {
    return this.http.post<any>('/api/v1/consultations/update-patients-uid', {
      'patientId': id,
      'newLogin': newLogin,
      'onConflict': onConflict,
    }, this.setRequestHeader());
  }

  createConsultation(consultationObject): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.createConsultation, consultationObject, this.setRequestHeader());
  }

  createSoapNote(soapObject): Observable<any> {
    return this.http.post<any>('/api/v1/soap/create', soapObject, this.setRequestHeader());
  }


  getSoapById(soapId): Observable<any> {
    return this.http.get<any>(Constants.API_ROUTES.getSoap + '/' + soapId, this.setRequestHeader());
  }

  deleteSections(soapId, sectionName): Observable<any> {
      if (sectionName == 'diet_chart') sectionName = 'meals';
      if (sectionName == 'clinical_notes') sectionName = 'clinical-notes';
      if (sectionName == 'personal_history') sectionName = 'personal-history';
      if (sectionName == 'results') sectionName = 'test-results';
      if (sectionName == 'investigation') sectionName = 'investigations';
      if (sectionName == 'medication') sectionName = 'medications';
      if (sectionName == 'chief_complaints') sectionName = 'chief-complains';

    return this.http.delete<any>(Constants.API_ROUTES.deleteSection + '/' + soapId + '/' + sectionName + '/all', this.setRequestHeader());
  }


  inserCurrentSoapElement(soapId, type, object): Observable<any> {
    return this.http.patch<any>(Constants.API_ROUTES.getSoap + '/' + soapId + '/' + type, object, this.setRequestHeader());
  }


  createAttachment(soapId, type, object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.getSoap + '/' + soapId + '/' + type, object, this.setRequestHeader());
  }


  showSuggestion(section, term): Observable<any> {
    return this.http.get<any>(Constants.API_ROUTES.suggestions + '/' + section + '/' + term, this.setRequestHeader());
  }

  getSuggestions(section, term) {
      return this.http.get<any>(Constants.API_ROUTES.suggestions + '/' + section + '/' + term, this.setRequestHeader())
          .toPromise();
  }

  deleteSoapComponentRow(soapId, rowType, rowId): Observable<any> {
    return this.http.delete<any>(Constants.API_ROUTES.getSoap + '/' + soapId + '/' + rowType + '/' + rowId, this.setRequestHeader());
  }

  getHistory(object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.getHistory, object, this.setRequestHeader());
  }

  getPastMedications(patientId): Observable<any> {
    return this.http.get<any>(Constants.API_ROUTES.getPastMedications + '/' + patientId, this.setRequestHeader());
  }

  addHistoryObject(object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.createHistory, object, this.setRequestHeader());
  }

  fetchPreviousSoap(object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.getSoapList, object, this.setRequestHeader());
  }

  savePastIllness(object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.createPastIllness, object, this.setRequestHeader());
  }

  savePastMedication(object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.createPastMedication, object, this.setRequestHeader());
  }

  getpreviousSoapMedication(soapId: number): Observable<any> {
    return this.http.get<any>('/api/v1/soap/' + soapId + '/medications/get-previous', this.setRequestHeader());
  }
  getPreviousSoapVitals(soapId: number): Observable<any> {
      return this.http.get<any>('/api/v1/soap/' + soapId + '/vitals/get-previous', this.setRequestHeader());
  }


  updateBindedDoctors(object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.updateDoctorBinding, object, this.setRequestHeader());
  }

  updateCurrentSoap(soapId, object): Observable<any> {
    return this.http.patch<any>(Constants.API_ROUTES.getSoap + '/' + soapId, object, this.setRequestHeader());
  }


  setDoctorAvailability(object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.setDoctorAvailability, object, this.setRequestHeader());
  }

  getDoctorAvailability(): Observable<any> {
    return this.http.get<any>(Constants.API_ROUTES.getDoctorAvailability, this.setRequestHeader());
  }


  deleteHistory(object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.deleteHistory, object, this.setRequestHeader());
  }


  deleteHistoryIllness(id, type): Observable<any> {
    return this.http.delete<any>(Constants.API_ROUTES.getSoap + '/' + type + '/' + id, this.setRequestHeader());
  }


  updateRemarksAndFollowUp(soapId, type, object): Observable<any> {
    return this.http.patch<any>(Constants.API_ROUTES.getSoap + '/' + soapId + '/' + type, object, this.setRequestHeader());
  }

  getTermsSuggestions(object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.termsSuggestion, object, this.setRequestHeader());
  }


  debugLog(level, object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.logs + '/' + level, object, this.setRequestHeader());
  }


  addVideoLogs(object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.addVideoLogs, object, this.setRequestHeader());
  }

  sendSmsToDoctor(object): Observable<any> {
    return this.http.post<any>(Constants.API_ROUTES.sendSms, object, this.setRequestHeader());
  }

  public getNotifications(page = 1, notificationType = ''): Observable<any> {
    return this.http.get('/api/v1/notifications/listing/' + page + "?type=" + notificationType , this.setRequestHeader());
  }

  public getMealSuggestion(search) {
    return this.http.get('/api/v1/soap/suggestions/meals/' + search, this.setRequestHeader());
  }

  public getMealUnitSuggestion(search) {
    return this.http.get('/api/v1/soap/suggestions/meal-quantity-unit/' + search, this.setRequestHeader());
  }

  public saveMeal(object, soap_id) {
    return this.http.patch('/api/v1/soap/' + soap_id + '/meals', object, this.setRequestHeader());
  }

  public deleteMeal(meal_id, soap_id) {
    return this.http.delete('/api/v1/soap/' + soap_id + '/meals/' + meal_id, this.setRequestHeader());
  }

  public deleteMealSection(soap_id) {
    return this.http.delete('/api/v1/soap/' + soap_id + '/meals/all', this.setRequestHeader());
  }

  public getPreviousSoapMeals(soap_id) {
    return this.http.get('/api/v1/soap/' + soap_id + '/meals/get-previous', this.setRequestHeader());
  }

  public markDone(notificationId): Observable<any> {
    return this.http.get('/api/v1/notifications/mark-done/' + notificationId, this.setRequestHeader());
  }

  public markAllDone(): Observable<any> {
    return this.http.get('/api/v1/notifications/mark-done-all/', this.setRequestHeader());
  }

  public markRead(notificationId): Observable<any> {
    return this.http.get('/api/v1/notifications/mark-read/' + notificationId, this.setRequestHeader());
  }

  public getConsultationListByCode(code): Observable<any> {
    return this.http.get('/api/v1/consultations/consultation-listing-by/' + code, this.setRequestHeader());
  }

  public async patientsHistoryGenerator(patientId, months = "3") {
    return await this.http.get('/api/v1/patient-history/generate/' + patientId + "?months=" + months, this.setRequestHeader()).toPromise();
  }

  public async generatePatientHistoryLink(toName, patientId, data, inviteToConsult) {
    return await this.http.post('/api/v1/patient-history/link', {
      'patient_id': patientId,
      'to_name': toName,
      'data': data,
      'inviteToConsult': inviteToConsult,
    }, this.setRequestHeader())
      .toPromise();
  }

  public async viewGeneratedHistory(uid) {
    return await this.http.get('/api/v1/patient-history/view/' + uid)
      .toPromise();
  }

  public async saveTreatmentPlan(uid, remarks, followUp, observations, data) {
    return await this.http.post('/api/v1/patient-history/treatment-plan', {
      'unique_id': uid,
      'remarks': remarks,
      'observations': observations,
      'follow_up': followUp,
      'data': data,
    }, this.setRequestHeader())
      .toPromise();
  }

  public async videoCallRecordRow(code) {
    return await this.http.get('/api/v1/consultations/av-row/' + code, this.setRequestHeader()).toPromise();
  }

  public async requestPayment(code) {
    return await this.http.post('/api/v1/consultations/request-payment/' + code, {}, this.setRequestHeader())
    .toPromise();
  }

  public async submitPartnerAppFeedback(code, rating, feedback = "") {
      return await this.http.post("/api/v1/consultations/submit-partnerapp-feedback/" + code, {
          rating, feedback
      }, this.setRequestHeader())
          .toPromise();
  }

  public async deactivateSoap(soapId) {
      return await this.http.delete("/api/v1/soap/" + soapId, this.setRequestHeader()).toPromise();
  }

  public async addEmptyFUP(soapId) {
      return await this.http.get("/api/v1/soap/empty-fup/" + soapId, this.setRequestHeader()).toPromise();
  }

  public async getUnfollowedConsultation(page = 1) {
      return await this.http.get('/api/v1/consultations/get-unfollow-uped-soaps/' + page, this.setRequestHeader())
          .toPromise();
  }

  public async getFollowupsListing(model) {
    return await this.http.post('/api/v1/consultations/followups-listing', model, this.setRequestHeader())
      .toPromise();
  }

  public async updateMeta(soapId, meta ) {
      return await this.http.patch('/api/v1/soap/' + soapId + '/meta', meta, this.setRequestHeader())
          .toPromise();
  }
  public async addPatientTag(patientId, tag) {
      return await this.http.post('/api/v1/records/patient-tag/' + patientId,
          {tag},
          this.setRequestHeader()
      ).toPromise();
  }

  public async sendStaffPMSStats(soap, type) {
      return await this.http.post("/api/v1/notifications/pms-staff-stat-notification", {
          soap, type
      }, this.setRequestHeader()).toPromise();
  }

  public async getPMSStaffStats (staffId) {
      return await this.http.get("/api/v1/notifications/pms-staff-stats/" + staffId, this.setRequestHeader())
          .toPromise();
  }

  public async fetchPatientNotes (patientId) {
      return await this.http.get("/api/v1/records/notes/list/" + patientId, this.setRequestHeader())
          .toPromise();
  }

  public async createPatientNote (patientId, text) {
      return await this.http.post("/api/v1/records/notes/" + patientId, {text}, this.setRequestHeader())
          .toPromise();
  }

  public async updatePatientNote (noteId, text) {
      return await this.http.patch("/api/v1/records/notes/" + noteId, {text}, this.setRequestHeader())
          .toPromise();
  }

  public async deletePatientNote (noteId) {
      return await this.http.delete("/api/v1/records/notes/" + noteId, this.setRequestHeader())
          .toPromise();
  }

  public async updateMedicineStock (consultationCode, stock) {
      return await this.http.patch('/api/v1/soap/' + consultationCode + '/medication-stock', {stock}, this.setRequestHeader())
          .toPromise();
  }

  public async fetchFreshGrammer() {
    return await this.http.get('/api/v1/records/grammer-list', this.setRequestHeader())
      .toPromise();
  }

    public async searchPatient(query) {
        return await this.http.get(`/api/v1/consultations/search-patients/${query}`, this.setRequestHeader())
            .toPromise();
    }

    public async createConsultationsFromCSV(textcontent, centerCode) {
      return await this.http.post(Constants.API_ROUTES.createConsultationsFromCSV, { csv: textcontent, centerCode: centerCode}, this.setRequestHeader())
        .toPromise()
    }

    public async initiatePhoneCall(consultationCode) {
      return await this.http.post("/api/v1/consultations/initiate-phone-call", { code: consultationCode}, this.setRequestHeader())
        .toPromise();
    }

  public async getConsultationsDateForMonth(date: Moment, patient = null) {
    const startTime = date.format("YYYY-MM-01");
    const endTime   = date.endOf('month').format("YYYY-MM-DD");

    return await this.http.post('/api/v1/consultations/appointment/get-dates', {
        startTime, endTime, patient
    }, this.setRequestHeader()).toPromise();
  }

  public async getAppointmentsForDate(date: Moment) {
    const today = date.format("YYYY-MM-DD");

    return await this.http.post('/api/v1/consultations/appointment/get-consultations', {
        startTime: today,
        endTime: today
      }, this.setRequestHeader())
      .toPromise();
  }

  public async updateAppointmentStatus(consultationCode, newStatus, timestamp, comment) {
    comment = comment || "";
    timestamp = timestamp || null;

    return await this.http.post('/api/v1/consultations/appointment/update-status', {
      "code": consultationCode,
      "to": newStatus,
      "time": timestamp,
      "comment": comment
    }, this.setRequestHeader())
      .toPromise();
  }

}
