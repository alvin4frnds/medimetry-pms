#!/usr/bin/env node
import { DatabaseConfiguration, db } from '../config/DatabaseConfiguration';
import { Config, config } from '../config/Config';
import { Term } from '../database/models/Term.js';
import { StaticHelpers } from '../helpers/Statics';
import { createConnection } from 'typeorm';
import { Diagnosis } from '../database/models/Diagnosis';
import { Allergy } from '../database/models/Allergy';
import { Soap } from '../database/models/Soap';

export class FixAllergiesTable {
    private _db: DatabaseConfiguration;
    private _config: Config;

    constructor() {
        this._db = db;
        this._config = config;
    }

    public async handle() {
        console.log('Starting ...');

        try {
            console.info("Creating Column 'meta'");
            await Allergy.repo().query(`ALTER TABLE "public"."allergies" ADD COLUMN "meta" jsonb NOT NULL default '{}';`);
        } catch (e) {
            console.info("Column 'meta' already exists");
        }

        const allergiesCount = (await Allergy.repo().createQueryBuilder("allergies")
            .select("COUNT(*)", "count")
            .getRawOne()).count;

        for ( let i = 0; i < allergiesCount; i += 100) { // take 100 at a time
            const allergies = await Allergy.repo().find({
                order: { id: 'ASC' },
                relations: ["substance"],
                skip: i,
                take: 100,
            });

            for (let j = 0; j < allergies.length; j ++) {
                const allergy = allergies[j];

                if (!allergy || !allergy["substance"]) continue;

                const terms = [], substances = allergy.substance.term_body.split(',').map(sub => sub.trim());
                const reactions = allergy.remarks.split(',').map(sub => sub.trim());

                for ( let k = 0; k < substances.length; k ++) {
                    const term = await Term.createFromText(substances[k], 'allergy_substance', 0);
                    terms.push(term)
                }

                for ( let k = 0; k < reactions.length; k ++) {
                    const term = await Term.createFromText(reactions[k], 'allergy_reaction', 0);
                    terms.push(term)
                }

                allergy.meta = JSON.parse(JSON.stringify({terms: terms}));
                allergy["term_id"] = null;
                allergy["substance_term_id"] = null;

                await Allergy.repo().save(allergy);
            }

            console.log("Processed: ", allergies.length);
        }

        try {
            // console.info("Droping extra columns");
            // await Allergy.repo().query(`ALTER TABLE "public"."allergies" DROP COLUMN "substance_term_id"`);
            // await Allergy.repo().query(`ALTER TABLE "public"."allergies" DROP COLUMN "term_id"`);
        } catch (e) {}

        console.log('!! End !!');
        process.exit(0);
    }

}

const obj = new FixAllergiesTable();
setTimeout(() => {
    obj.handle();
}, 2000);


