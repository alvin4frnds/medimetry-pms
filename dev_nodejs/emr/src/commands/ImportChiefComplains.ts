#!/usr/bin/env node
import { DatabaseConfiguration, db } from '../config/DatabaseConfiguration';
import { Config, config } from '../config/Config';
import { Term } from '../database/models/Term.js';
import { StaticHelpers } from '../helpers/Statics';
import { createConnection } from 'typeorm';

export class ImportChiefComplains {
    private _db: DatabaseConfiguration;
    private _config: Config;

    constructor() {
        this._db = db;
        this._config = config;
    }

    public async handle() {
        console.log('Starting ...');

        const chiefComplains = [
            "Back Pain",
            "Blood pressure-High",
            "Allergy ",
            "Stomach ache",
            "Teeth Problem",
            "Eyes Pain",
            "Ear Pain",
            "Eye Weakness",
            "Chest Pain",
            "Blood Sugar",
            "Cough",
            "Legs Pain",
            "Head Ache",
            "Cough with Sputum",
            "Watery Eyes",
            "Gas Problem",
            "Allergic Red Patches on Body",
            "Allergic Dermatitis",
            "Whole Body Pain",
            "Fever",
            "Dizziness",
            "Dyspnea",
            "Allergy Red Patches",
            "Weakness",
            "Dry Cough",
            "Knee Pain",
            "Joint Pain",
            "Watery Eyes With Pain",
            "Hypotension",
            "Swelling on Stomach",
            "Cold",
            "Loose Motion",
            "Anemia",
            "Waist Pain",
            "Rashes in Private area",
            "Pancreatitis",
            "Rashes on Foot",
            "Stomach Germs",
            "Private Area Pain and Itching",
            "Stone in Kidney",
            "Eyes Weak",
            "Vomiting",
            "Right Legs Pain",
            "Hypertension",
        ];

        for (let i = 0; i < chiefComplains.length; i ++) {
            await Term.createFromText(chiefComplains[i], "chief-complains", 87648);
        }

        console.log('!! End !!');
        process.exit(0);
    }

}

const obj = new ImportChiefComplains();
setTimeout(() => {
    obj.handle();
}, 2000);


