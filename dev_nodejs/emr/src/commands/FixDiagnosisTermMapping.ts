#!/usr/bin/env node
import { DatabaseConfiguration, db } from '../config/DatabaseConfiguration';
import { Config, config } from '../config/Config';
import { Term } from '../database/models/Term.js';
import { StaticHelpers } from '../helpers/Statics';
import { createConnection, getConnection } from 'typeorm';
import { Diagnosis } from '../database/models/Diagnosis';

export class ImportChiefComplains {
    private _db: DatabaseConfiguration;
    private _config: Config;

    constructor() {
        this._db = db;
        this._config = config;
    }

    public async handle() {
        console.log('Starting ...');

        const diagnosisCount = (await Diagnosis.repo().createQueryBuilder("diagnosis")
            .select("COUNT(*)", "count")
            .getRawOne()).count;

        for ( let i = 0; i < diagnosisCount; i += 100) { // take 100 at a time
            let diagnosis = await getConnection()
                .query(`select * from diagnosis order by id desc limit 100 offset ${i}`);
            diagnosis = JSON.parse(JSON.stringify(diagnosis));
            /* Diagnosis.repo().find({
                order: { id: 'ASC' },
                skip: i,
                take: 100,
            }); */

            for (let j = 0; j < diagnosis.length; j ++) {
                const diag = diagnosis[j];

                if (!diag || !diag["diagnosis"]) continue;
                if (diag["term_id"]) continue;

                diag["term"] = await Term.createFromText(diag["diagnosis"], "diagnosis", diag.doctor_id);
                diag["term_id"] = diag.term.id;

                await Diagnosis.repo().save(diag);
            }

            console.log("Processed: ", diagnosis.length);
        }

        console.log('!! End !!');
        process.exit(0);
    }

}

const obj = new ImportChiefComplains();
setTimeout(() => {
    obj.handle();
}, 2000);


