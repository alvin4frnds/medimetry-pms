/**
 * Created by Dronacharya on 11/Dec/2018.
 */

export class Constants {


    public static KEY_CURRENT_ENVIRONMENT = 'ENVIRONMENT';
    public static KEY_SHOULD_SHOW_PRICES_IN_RX = 'SHOULD_SHOW_PRICES_IN_RX';
    public static KEY_APP_NAME = 'APP_NAME';
    public static KEY_SELECTED_COUNTRY = 'selected_country';
    public static KEY_CURRENT_USER = 'current_user';
    public static KEY_CURRENT_USER_LAST_UPDATED = "current_user_last_updated";
    public static KEY_PATIENT_DATA = 'patient_info';
    public static KEY_HEADER_DATA = 'header_data';
    public static KEY_HEADER_SETTINGS = 'header_settings';
    public static KEY_CURRENT_CONSULTATION = 'current_consultation';
    public static KEY_CURRENT_SOAP = 'EXISTING_SOAP';
    public static KEY_PREVIOUS_SOAP_ID = 'previous_soap_id';
    public static KEY_CURRENT_ADDRESS = 'current_address';
    public static KEY_CURRENT_CHANNEL_CENTER_ID = 'current_channel_center_id';
    public static KEY_CONSULTATION_LIST = 'consultation_list';
    public static KEY_CURRENT_PAGE_NO = 1;
    public static KEY_SEND_LOGS_TO_SOCKET = 'sendLogsToSocket';
    public static KEY_CURRENT_CONSULTATION_POSITION = 'current_consultation_position';
    public static KEY_REQUIRED_LOG_LEVEL = 'LOG_LEVEL';
    public static KEY_PUSHER_DETAILS = 'PUSHER_DETAILS';
    public static KEY_PATIENT_TAGS = 'KEY_PATIENT_TAGS';
    public static KEY_LAST_OPEN_APPOINTMENT_DATE = 'LAST_OPEN_APPOINTMENT_DATE';
    public static KEY_ALL_COUNTRIES = 'ALL_COUNTRIES';

    public static PAGE_NAME = {
        'LOGIN': 'LOGIN',
        'PATIENT_LIST': 'PATIENT_LIST',
        'SOAP_DASHBOARD': 'SOAP_DASHBOARD',
        'PREVIOUS_SOAP': 'PREVIOUS_SOAP_SCREEN',
        'CREATE_CONSULTATION': 'CREATE_CONSULTATION',
        'UTILITY_SERVICE': 'UTILITY SERVER',
        'EDIT_PATIENT': 'EDIT PATIENT'
    };

    public static KEY_SOAP_ID_FROM_DIALOG = 'soap_id_from_dialog';
    public static KEY_PATIENT_ID = 'patient_id';
    public static LOG_MISC = {
        'BLOCK_START': '<<',
        'BLOCK_END': '>>',
        'METHOD_LINE_EXECUTION': '--',
        'CONSTRUCTOR': '**'
    };

    public static LOG_LEVEL_TYPE = {
        'TRACE': 'TRACE',
        'DEBUG': 'DEBUG',
        'INFO': 'INFO',
        'WARN': 'WARN',
        'ERROR': 'ERROR',
        'FATAL': 'FATAL'
    };
    public static LOG_LEVEL_CODE = { 'TRACE': 6, 'DEBUG': 5, 'INFO': 4, 'WARN': 3, 'ERROR': 2, 'FATAL': 1 };

    public static FAMILY_RELATION = ['Father', 'Mother', 'Sister', 'Brother', 'Husband', 'Uncle', 'Aunt', 'Son', 'Daugther', 'Cousing', 'Neighbour', 'Other'];

    public static readonly DEFAULT_PROFILE_PIC = '/assets/images/patientpic.png';

    public static API_ROUTES = {
        'sdkPath': '/api/v1/auth/auth-url',
        'getUserByToken': '/api/v1/auth/get-token',
        'searchPatient': '/api/v1/consultations/search-patients',
        'getOpenConsultations': '/api/v1/consultations/open-consultations',
        'getClosedConsultations': '/api/v1/consultations/closed-consultations',
        'getDoneConsultations': '/api/v1/consultations/done-consultations',
        'markConsultationDone': '/api/v1/consultations/mark-done',
        'markConsultationUnDone': '/api/v1/consultations/mark-undone',
        'getBindedDoctor': '/api/v1/consultations/get-binded-doctors',
        'createConsultation': '/api/v1/consultations/create-consultation',
        'soap_create': '/api/v1/soap/create',
        'getSoap': '/api/v1/soap',
        'deleteSection': '/api/v1/soap',
        'suggestions': '/api/v1/soap/suggestions',
        'getHistory': '/api/v1/history/getHistory',
        'getPreviousAttachment': '/api/v1/records/get-medical-records',
        'getPastMedications': '/api/v1/history/getPastMedications',
        'createHistory': '/api/v1/history/createHistory',
        'getSoapList': '/api/v1/soap/list',
        'getBindedDoctors': '/api/v1/consultations/get-binded-doctors',
        'updateDoctorBinding': '/api/v1/consultations/put-binded-doctors',
        'createPastIllness': '/api/v1/soap/past-illness',
        'createPastMedication': '/api/v1/soap/past-medication',
        'setDoctorAvailability': '/api/v1/consultations/set-doctor-availablity',
        'getDoctorAvailability': '/api/v1/consultations/get-doctor-availablity',
        'deleteHistory': '/api/v1/history/delete',
        'termsSuggestion': '/api/v1/history/getTerms',
        'logs': '/api/test/log/client',
        'addVideoLogs': '/api/v1/consultations/add-video-call-logs',
        'sendSms': '/api/v1/consultations/send-sms',
        'createConsultationsFromCSV': '/api/v1/consultations/create-from-csv',
    };

    public static NAVIGATION_URL = {
        'patientList': 'patient-list',
        'login': 'login',
        'create_patient': 'create-patient',
        'dashboard': 'patient-dashboard',
        'canvas': 'canvas',
        'edit-patient': 'edit-patient',
        'myDoctors': 'bind-doctor',
        'treatmentPlan': 'treatment-plan',
        'schedule_Appointment': 'schedule-appointment'
    };

}
