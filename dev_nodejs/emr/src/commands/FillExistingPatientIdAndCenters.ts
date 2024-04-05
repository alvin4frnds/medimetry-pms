#!/usr/bin/env node
import { DatabaseConfiguration, db } from '../config/DatabaseConfiguration';
import { Config, config } from '../config/Config';
import { ConsultationStatus } from '../database/models/ConsultationStatus';
import { StaticHelpers } from '../helpers/Statics';

export class FillExistingPatientIdAndCenters {
    private _db: DatabaseConfiguration;
    private _config: Config;

    constructor() {
        this._db = db;
        this._config = config;
    }

    public async handle() {
        let count = await ConsultationStatus.repo()
            .createQueryBuilder()
            .select(`count(*) as count`)
            .where(`patient_id is null and active = true`)
            .getRawOne();

        count = count.count;

        const TAKE = 100;
        const chunks = Math.ceil(count / TAKE);
        let temp = {};

        for ( let i = 0; i < chunks; i ++) {
            const SKIP = i * TAKE;

            let consultations = await ConsultationStatus.repo()
                .createQueryBuilder()
                .select("consultation_code")
                .where(`patient_id is null and active = true`)
                .orderBy("consultation_id", "ASC")
                .skip(SKIP).take(TAKE)
                .getRawMany();

            if (! consultations.length) process.exit(0);

            let consultationCodes = StaticHelpers.getColumnFromJsonObj(consultations, "consultation_code");
            let consultationCodeVsPatientId = {};
            temp = await this._db.wpdb(`
                select code, patient_id from medi_consultation
                where 
                    code in ( ${consultationCodes.map(c => '"' + c + '"').join(', ')} )
                    and patient_id is not null
            `);

            let allPatientIds = StaticHelpers.getColumnFromJsonObj(temp, "patient_id");

            // @ts-ignore
            temp.forEach(row => {
                consultationCodeVsPatientId[row['code']] = row['patient_id'];
            });

            if (! allPatientIds.length) process.exit(0);
            temp = await this._db.wpdb(`
                select id, center_code from medi_patients
                where id in ( ${allPatientIds.join(", ")} )
            `);
            let patientIdVsCenterCode = {};

            // @ts-ignore
            temp.forEach(row => {
                patientIdVsCenterCode[row['id']] = row['center_code'];
            });

            for ( let key in consultationCodeVsPatientId) {
                await ConsultationStatus.repo()
                    .createQueryBuilder()
                    .update(ConsultationStatus)
                    .set({
                        patient_id: consultationCodeVsPatientId[key],
                        center_code: patientIdVsCenterCode[consultationCodeVsPatientId[key]],
                    })
                    .where(`consultation_code = '${key}'`)
                    .execute();
            }

            console.log(`Done chunk ${i + 1} of ${chunks}`);
        }
    }
}

console.log('Starting ...');
setTimeout(() => {
    (new FillExistingPatientIdAndCenters()).handle().then( () => {

        console.log('!! End !!');
        process.exit(0);
    } );
}, 2000);


