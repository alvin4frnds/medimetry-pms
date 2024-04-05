#!/usr/bin/env node
import { DatabaseConfiguration, db } from '../config/DatabaseConfiguration';
import { Config, config } from '../config/Config';
import { StaticHelpers } from '../helpers/Statics';
import { uploader } from '../config/S3';
import { HttpRequest } from '../helpers/HttpRequest';
import * as util from 'util';
import { Soap } from '../database/models/Soap';
import { In } from 'typeorm';

export class ExportUberPatientsStats {
    private _db: DatabaseConfiguration;
    private _config: Config;
    private _sh;
    private _s3Uploader;
    private _fs;
    private _http;

    private DATE_STAMP = StaticHelpers.dateStamp();

    private readonly places = ['chandigarh', 'gurgaon', 'mumbai'];
    private uniqueMeals = [];
    private idealMeals = {};
    private dietStats = {};

    // TODO: Incude all places data, not just chandigarh's
    private readonly centerCodes = ['medimetry-camps-QuGYJY5ywnEAlxGh5P0gKn0pVljCkrmz', 'medimetry-camps-EFO9lucHxfAI1EGnAvnEgqAlT9ktMTkh', 'medimetry-camps-0sqdtbB09yLdAKslslP6GxJ81Uf0xkKk'];
    // private readonly centerCodes = ['medimetry-camps-QuGYJY5ywnEAlxGh5P0gKn0pVljCkrmz'];

    public static readonly DEFAULT_MEAL = {
        id: 0,
        calories: 2,
        carbohydrates: 1,
        protiens: 0,
        fats: 1,
        saturated_fats: 0,
        timeOfDay: null,
        tag: "",
    };
    public static readonly TAKE = 20;
    public static readonly SLEEPING_TIME = 3;

    constructor() {
        this._db = db;
        this._config = config;
        this._sh = require('shelljs');
        this._fs = require('fs');
        this._s3Uploader = uploader;
        this._http = new HttpRequest;

        if (process.argv[2]) this.DATE_STAMP = process.argv[2];
    }

    public async handle() {
        // sheet 1 unique food items, load them, store in memory.

        // TODO: UNcomment below code
        this.uniqueMeals = await this._db.mailServiceDb("select * from mail_log.unique_meals");
        console.log("UniqueMeals loaded length: ", this.uniqueMeals.length);

        let centerCodesQuery = this.centerCodes.map(code => "'" + code + "'").join(",");
        let patientsCount = await this._db.wpdb(`select count(*) as count from medi_patients where center_code in (${centerCodesQuery}) order by id asc`);
        patientsCount = patientsCount[0]['count'];
        let chunksCount = Math.ceil(patientsCount / ExportUberPatientsStats.TAKE);
        let statsData = [];

        for ( let i = 0; i < chunksCount; i ++) {
            let SKIP = i * ExportUberPatientsStats.TAKE;

            const patients = await this._db.wpdb(`select * from medi_patients where center_code in (${centerCodesQuery}) order by id asc limit ${SKIP}, ${ExportUberPatientsStats.TAKE}`);
            statsData = statsData.concat(this.toCSVArray(await this.getPatientsStatDataFor(patients)));

            await this.sleep(100);
            console.info("processed chunk: of ", i + 1, chunksCount);
        }

        console.log("Writing patients data for graph: ", statsData.length);
        await this.writePatientsDataForGraph(statsData);

        let uniqueMealsUsedIds = [];
        for ( let key in this.dietStats) uniqueMealsUsedIds.push(parseInt(key));

        this.uniqueMeals = this.uniqueMeals.filter(meal => (uniqueMealsUsedIds.indexOf(meal.id) > -1));
        console.log("writing unique meals ...", this.uniqueMeals.length);
        await this.writeUniqueMealsToCSV(this.uniqueMeals);

        console.log("patientsCount: ", patientsCount);
    }

    private toCSVArray(objects) {
        return objects.map(obj => {
            return [
                obj['patientId'] || "",
                obj["place"] || "",
                obj['phone'] ? obj['phone'].substr(2, 10) : "",
                obj['name'] || "",
                obj['age'] || "",
                obj['height'] || "",
                obj['weight'] || "",
                obj['BPS'] || "",
                obj['BPD'] || "",
                obj['pulse'] || "",
                obj['RBS'] || "",
                (obj['stats'] && obj['stats']['calories']) ? obj['stats']['calories'] : "",
                (obj['stats'] && obj['stats']['carbohydrates']) ? obj['stats']['carbohydrates'] : "",
                (obj['stats'] && obj['stats']['protiens']) ? obj['stats']['protiens'] : "",
                (obj['stats'] && obj['stats']['fats']) ? obj['stats']['fats'] : "",
                (obj['stats'] && obj['stats']['saturated_fats']) ? obj['stats']['saturated_fats'] : "",
                (obj['ideals'] && obj['ideals']['calories']) ? obj['ideals']['calories'] : "",
                (obj['ideals'] && obj['ideals']['carbohydrates']) ? obj['ideals']['carbohydrates'] : "",
                (obj['ideals'] && obj['ideals']['protiens']) ? obj['ideals']['protiens'] : "",
                (obj['ideals'] && obj['ideals']['fats']) ? obj['ideals']['fats'] : "",
                (obj['ideals'] && obj['ideals']['saturated_fats']) ? obj['ideals']['saturated_fats'] : "",
                (obj['meals'] && obj['meals']['wakeup']) ? obj['meals']['wakeup'] : "",
                (obj['meals'] && obj['meals']['sleep']) ? obj['meals']['sleep'] : "",
                (obj['meals'] && obj['meals']['breakfast'] && obj['meals']['breakfast']['calories']) ? obj['meals']['breakfast']['calories'] : "",
                (obj['meals'] && obj['meals']['breakfast'] && obj['meals']['breakfast']['carbohydrates']) ? obj['meals']['breakfast']['carbohydrates'] : "",
                (obj['meals'] && obj['meals']['breakfast'] && obj['meals']['breakfast']['protiens']) ? obj['meals']['breakfast']['protiens'] : "",
                (obj['meals'] && obj['meals']['breakfast'] && obj['meals']['breakfast']['fats']) ? obj['meals']['breakfast']['fats'] : "",
                (obj['meals'] && obj['meals']['breakfast'] && obj['meals']['breakfast']['saturated_fats']) ? obj['meals']['breakfast']['saturated_fats'] : "",
                (obj['meals'] && obj['meals']['lunch'] && obj['meals']['lunch']['calories']) ? obj['meals']['lunch']['calories'] : "",
                (obj['meals'] && obj['meals']['lunch'] && obj['meals']['lunch']['carbohydrates']) ? obj['meals']['lunch']['carbohydrates'] : "",
                (obj['meals'] && obj['meals']['lunch'] && obj['meals']['lunch']['protiens']) ? obj['meals']['lunch']['protiens'] : "",
                (obj['meals'] && obj['meals']['lunch'] && obj['meals']['lunch']['fats']) ? obj['meals']['lunch']['fats'] : "",
                (obj['meals'] && obj['meals']['lunch'] && obj['meals']['lunch']['saturated_fats']) ? obj['meals']['lunch']['saturated_fats'] : "",
                (obj['meals'] && obj['meals']['dinner'] && obj['meals']['dinner']['calories']) ? obj['meals']['dinner']['calories'] : "",
                (obj['meals'] && obj['meals']['dinner'] && obj['meals']['dinner']['carbohydrates']) ? obj['meals']['dinner']['carbohydrates'] : "",
                (obj['meals'] && obj['meals']['dinner'] && obj['meals']['dinner']['protiens']) ? obj['meals']['dinner']['protiens'] : "",
                (obj['meals'] && obj['meals']['dinner'] && obj['meals']['dinner']['fats']) ? obj['meals']['dinner']['fats'] : "",
                (obj['meals'] && obj['meals']['dinner'] && obj['meals']['dinner']['saturated_fats']) ? obj['meals']['dinner']['saturated_fats'] : "",
                (obj['mealDifferences'] && obj['mealDifferences']['w-b']) ? obj['mealDifferences']['w-b'] : "",
                (obj['mealDifferences'] && obj['mealDifferences']['b-l']) ? obj['mealDifferences']['b-l'] : "",
                (obj['mealDifferences'] && obj['mealDifferences']['l-d']) ? obj['mealDifferences']['l-d'] : "",
                (obj['mealDifferences'] && obj['mealDifferences']['d-s']) ? obj['mealDifferences']['d-s'] : "",
                obj['mealsText'],
            ];
        });
    }
    private async writeUniqueMealsToCSV(meals) {
        let text = `"Unique Food Item","Quantity","Quantity Unit","Kcal","carbs","protein","fats","Unsaturated Fats"\n`;

        meals.forEach(row => {
            text += `"${row.name}","${row.quantity}","${row.quantity_unit}","${row.calories}","${row.carbohydrates}","${row.fat}","${row.protein}","${row.saturated_fat}"\n`;
        });

        const writeFile = util.promisify(this._fs.writeFile);
        const fileLocation = __dirname.replace("src/commands", "") + "unique-meals.csv";
        await writeFile(fileLocation, text);
    }
    private async writePatientsDataForGraph(stats) {
        let parameters = `Calories,Carbohydrates,Proteins,Fats,Saturated Fats`;
        let text = `ID,Place,Phone,Name,Age,Height,Weight,BPD,BPS,Pulse,RBS,`
            + parameters + ","
            + (parameters.split(",").map(w => "Ideal " + w).join(",")) + ","
            + "Wakes At,Sleeps At,"
            + (parameters.split(",").map(w => "Breakfast " + w).join(",")) + ","
            + (parameters.split(",").map(w => "Lunch " + w).join(",")) + ","
            + (parameters.split(",").map(w => "Dinner " + w).join(",")) + ","
            + "Wakeup to Breakfast,Breakfast to Lunch,Lunch to Dinner,Dinner to Sleep,Meals";
        text = text.split(",").map(w => '"' + w + '"').join(",");
        text += "\n";

        stats.forEach(stat => {
            let row = stat.map(w => '"' + w + '"').join(",");
            text = text + row + "\n";
        });

        const writeFile = util.promisify(this._fs.writeFile);
        const fileLocation = __dirname.replace("src/commands", "") + "patients-data-for-graphs.csv";
        await writeFile(fileLocation, text);
    }
    private async getPatientsStatDataFor(patients) {
        let soaps = await Soap.repo().find({
            where: { patient_id: In(patients.map( patient => patient.id )), },
            relations: ["vitals", "personal_history", "meals"],
            order: { id: "DESC", }
        });
        let uniquePatientSoaps = [];
        soaps = soaps.filter(soap => {
            if (uniquePatientSoaps.indexOf(soap.patient_id) > -1) return false;

            uniquePatientSoaps.push(soap.patient_id);
            return true;
        });

        const date = new Date();
        let patientsStats:PatientData[] = [];
        for ( let j = 0; j < soaps.length; j ++ ) {
            const soap = soaps[j];
            let patient = patients.filter(row => soap.patient_id === row.id);

            // if soap not found for that patient, continue
            if (patient.length) patient = patient[0];
            else continue;

            const dob = new Date(patient['date_of_birth']);
            const age = date.getFullYear() - dob.getFullYear();

            const patientData: PatientData = {
                patientId: soap.patient_id,
                place: this.places[this.centerCodes.indexOf(patient['center_code'])],
                phone: patient['mobile_number'],
                name: patient['name'],
                age: age + "",
                height: null,
                weight: null,
                BPD: null,
                BPS: null,
                pulse: null,
                RBS: null,
                stats: null,
                ideals: null,
                mealsText: "",
                meals: null,
                mealDifferences: {
                    "w-b": 0,
                    "b-l": 0,
                    "l-d": 0,
                    "d-s": 0,
                },
                mealTimings: [],
            };

            if (soap && soap['vitals'] && soap['vitals']['vital_information']) {
                if (soap['vitals']['vital_information']['BP(D)']) patientData.BPD
                    = soap['vitals']['vital_information']['BP(D)'];

                if (soap['vitals']['vital_information']['BP(S)']) patientData.BPS
                    = soap['vitals']['vital_information']['BP(S)'];

                if (soap['vitals']['vital_information']['Weight (kg)']) patientData.weight
                    = soap['vitals']['vital_information']['Weight (kg)'];

                if (soap['vitals']['vital_information']['Random Sugar']) patientData.RBS
                    = soap['vitals']['vital_information']['Random Sugar'];

                if (soap['vitals']['vital_information']['Pulse']) patientData.pulse
                    = soap['vitals']['vital_information']['Pulse'];

                if (soap['vitals']['vital_information']['Height(ft)']) patientData.height
                    = ( (soap['vitals']['vital_information']['Height(ft)'] * 30.48 )
                    + (soap['vitals']['vital_information']['Height(in)'] * 2.54 ) );
            }

            if (patientData.height) patientData.ideals = this.calculateIdealsByHeight(patientData.height);

            if (soap.meals && soap.meals.length) {
                let mealsText = "";

                soap.meals = soap.meals.filter(meal => {
                    if (meal.quantity && meal.quantity.length) {
                        meal['quantity_values'] = meal.quantity + ' ' + meal.quantity_unit;
                    }
                    return meal;
                }).sort((a, b) => {
                    let x = parseInt(a.meal_time);
                    let y = parseInt(b.meal_time);

                    if (!x && y) {
                        return 1;
                    } else if (x && !y) {
                        return -1;
                    } else if (!x && !y) {
                        return 0;
                    }

                    if (!a.weekend && b.weekend) {
                        return -1;
                    } else if (a.weekend && !b.weekend) {
                        return 1;
                    }

                    return x - y;
                });

                soap.meals.forEach(meal => {
                    let mealTime = parseInt(meal.meal_time);
                    mealsText += mealTime + ":00 ->" + meal.name + " : " + meal.quantity + " " + meal.quantity_unit + ";";

                    // differenciating between, late nights and early mornings
                    if (mealTime < ExportUberPatientsStats.SLEEPING_TIME) mealTime += 24;

                    if (patientData.mealTimings.indexOf(mealTime) > -1) {}
                    else patientData.mealTimings.push(mealTime);
                });

                patientData.mealsText = mealsText;

                patientData.mealTimings = patientData.mealTimings.sort((a, b) => {
                    if ( a < b) return -1;
                    return a > b ? 1 : 0;
                });

                const eatingRoutine = this.bestGuessMealTimings(patientData.mealTimings);
                patientData.stats = this.addDietStats(soap.meals.map(meal => this.getDietStatFor(meal)), "full-day");

                const breakfastStats = this.addDietStats(soap.meals.filter(meal => {
                    let mealTime = parseInt(meal.meal_time);
                    if (mealTime < ExportUberPatientsStats.SLEEPING_TIME) mealTime += 24;

                    return eatingRoutine.breakfast.indexOf(mealTime) > -1;
                }).map(meal => this.getDietStatFor(meal)), "breakfast");
                const lunchStats = this.addDietStats(soap.meals.filter(meal => {
                    let mealTime = parseInt(meal.meal_time);
                    if (mealTime < ExportUberPatientsStats.SLEEPING_TIME) mealTime += 24;

                    return eatingRoutine.lunch.indexOf(mealTime) > -1;
                }).map(meal => this.getDietStatFor(meal)), "lunch");
                const dinnerStats = this.addDietStats(soap.meals.filter(meal => {
                    let mealTime = parseInt(meal.meal_time);
                    if (mealTime < ExportUberPatientsStats.SLEEPING_TIME) mealTime += 24;

                    return eatingRoutine.dinner.indexOf(mealTime) > -1;
                }).map(meal => this.getDietStatFor(meal)), "dinner");

                patientData.meals = {
                    wakeup: eatingRoutine.wakeup || 0, // not possible, wakeup without breakfast
                    breakfast: breakfastStats,
                    lunch: lunchStats,
                    dinner: dinnerStats,
                    sleep: eatingRoutine.sleep || 0, // not possible, sleep without dinner
                };

                if (patientData.meals.wakeup && patientData.meals.breakfast.timeOfDay) {
                    //@ts-ignore
                    patientData.mealDifferences["w-b"] = patientData.meals.breakfast.timeOfDay - patientData.meals.wakeup;
                    if (patientData.mealDifferences["w-b"] < 0) patientData.mealDifferences["w-b"] = patientData.mealDifferences["w-b"] + 24;
                }
                if (patientData.meals.breakfast.timeOfDay && patientData.meals.lunch.timeOfDay) {
                    patientData.mealDifferences["b-l"] = patientData.meals.lunch.timeOfDay - patientData.meals.breakfast.timeOfDay;
                    if (patientData.mealDifferences["b-l"] < 0) patientData.mealDifferences["b-l"] = patientData.mealDifferences["b-l"] + 24;
                }
                if (patientData.meals.lunch.timeOfDay && patientData.meals.dinner.timeOfDay) {
                    patientData.mealDifferences["l-d"] = patientData.meals.dinner.timeOfDay - patientData.meals.lunch.timeOfDay;
                    if (patientData.mealDifferences["l-d"] < 0) patientData.mealDifferences["l-d"] = patientData.mealDifferences["l-d"] + 24;
                }
                if (patientData.meals.dinner.timeOfDay && patientData.meals.sleep) {
                    //@ts-ignore
                    patientData.mealDifferences["d-s"] = patientData.meals.sleep - patientData.meals.dinner.timeOfDay;
                    if (patientData.mealDifferences["d-s"] < 0) patientData.mealDifferences["d-s"] = patientData.mealDifferences["d-s"] + 24;
                }
            }

            patientsStats.push(patientData);
        }

        return patientsStats;
    }
    private calculateIdealsByHeight(height) {
        const hFactor = height - 100;

        if (this.idealMeals[hFactor]) return this.idealMeals[hFactor];

        const meal: DietStats = {
            timeOfDay: 0,
            tag: "ideal",
            calories: 0,
            carbohydrates: 0,
            protiens: 0,
            fats: 0,
            saturated_fats: 0,
        };

        meal.calories = Math.round(hFactor * 25);
        meal.carbohydrates = Math.round(( meal.calories * 0.65 ) / 4);
        meal.protiens = Math.round(((meal.calories * 0.2) / 4));
        meal.fats = Math.round((meal.calories * 0.15) / 9);
        meal.saturated_fats = Math.round(meal.fats / 3);

        this.idealMeals[hFactor] = meal;
        return meal;
    }
    private bestGuessMealTimings(mealTimings) {
        let wakeup = null, breakfast = [], lunch = [], dinner = [], sleep = null;

        switch (mealTimings.length) {
            case 0: break;
            case 1: wakeup = mealTimings[0] - 1;
                breakfast.push(mealTimings[0]);
                break;
            case 2: wakeup = mealTimings[0] - 1;
                sleep = mealTimings[1] + 1;
                breakfast.push(mealTimings[0]);
                dinner.push(mealTimings[1]);
                break;
            case 3:
                if ((mealTimings[1] - mealTimings[0]) < 3) {
                    wakeup = mealTimings[0];
                    breakfast.push(mealTimings[0], mealTimings[1]);
                    sleep = mealTimings[2] + 1;
                    dinner.push(mealTimings[2]);
                } else if ((mealTimings[2] - mealTimings[1]) < 3) {
                    wakeup = mealTimings[0] - 1;
                    breakfast.push(mealTimings[0]);
                    sleep = mealTimings[2];
                    dinner.push(mealTimings[1], mealTimings[2]);
                } else {
                    wakeup = mealTimings[0] - 1;
                    sleep = mealTimings[2] + 1;
                    breakfast.push(mealTimings[0]);
                    lunch.push(mealTimings[1]);
                    dinner.push(mealTimings[2]);
                }
                break;
            case 4:
                wakeup = mealTimings[0];
                breakfast.push(mealTimings[0], mealTimings[1]);
                lunch.push(mealTimings[2]);
                dinner.push(mealTimings[3]);
                sleep = mealTimings[3] + 1;
                break;
            case 5:
                wakeup = mealTimings[0];
                sleep = mealTimings[4];
                breakfast.push(mealTimings[0], mealTimings[1]);
                if ((mealTimings[3] - mealTimings[2]) < 3) {
                    lunch.push(mealTimings[2], mealTimings[3]);
                    dinner.push(mealTimings[4]);
                } else {
                    lunch.push(mealTimings[2]);
                    dinner.push(mealTimings[3], mealTimings[4]);
                }
                break;
            case 6:
                wakeup = mealTimings[0];
                sleep = mealTimings[5];
                breakfast.push(mealTimings[0], mealTimings[1]);
                lunch.push(mealTimings[2], mealTimings[3]);
                dinner.push(mealTimings[4], mealTimings[5]);
                break;
            case 7:
                wakeup = mealTimings[0];
                sleep = mealTimings[6];
                breakfast.push(mealTimings[0], mealTimings[1]);
                lunch.push(mealTimings[2], mealTimings[3]);
                dinner.push(mealTimings[4], mealTimings[5], mealTimings[6]);
                break;
            case 8:
                wakeup = mealTimings[0];
                sleep = mealTimings[7];
                breakfast.push(mealTimings[0], mealTimings[1], mealTimings[2]);
                lunch.push(mealTimings[3], mealTimings[4]);
                dinner.push(mealTimings[5], mealTimings[6], mealTimings[7]);
                break;
            case 9:
                wakeup = mealTimings[0];
                sleep = mealTimings[8];
                breakfast.push(mealTimings[0], mealTimings[1], mealTimings[2]);
                lunch.push(mealTimings[3], mealTimings[4], mealTimings[5]);
                dinner.push(mealTimings[6], mealTimings[7], mealTimings[8]);
                break;
            default:
                wakeup = mealTimings[0];
                sleep = mealTimings[mealTimings.length - 1];
                for ( let i = 0; i < 3; i ++)
                    breakfast.push(mealTimings[i]);

                for (let i = 3; i < mealTimings.length - 3; i ++)
                    lunch.push(mealTimings[i]);

                for (let i = mealTimings.length - 3; i < mealTimings.length; i ++)
                    dinner.push(mealTimings[i]);
                break;
        }

        if (sleep > 24) sleep -= 24;
        if (wakeup > 24) wakeup -= 24;

        return {
            wakeup, breakfast, lunch, dinner, sleep
        };
    }
    private getDietStatFor(meal) {
        const uniqueMealId = meal.unique_meal_id;

        let dietStat;
        if (this.dietStats[uniqueMealId]) dietStat = this.dietStats[uniqueMealId];
        else {
            let uniqueMeal = this.uniqueMeals.filter(row => row.id === uniqueMealId);
            dietStat = (uniqueMeal.length) ? uniqueMeal[0] : ExportUberPatientsStats.DEFAULT_MEAL;
            this.dietStats[uniqueMealId] = dietStat;
        }

        const quantity = meal.quantity || 1;

        return {
            tag: meal.name + " " + meal.quantity + " " + meal.quantity_unit,
            timeOfDay: meal.meal_time,
            calories: parseFloat(dietStat['calories']) * quantity,
            carbohydrates: parseFloat(dietStat['carbohydrates']) * quantity,
            protiens: parseFloat(dietStat['protein'] || dietStat['proteins']) * quantity,
            fats: parseFloat(dietStat['fat'] || dietStat['fats']) * quantity,
            saturated_fats: parseFloat(dietStat['saturated_fat'] || dietStat['saturated_fats']) * quantity,
        };
    }
    private addDietStats(stats: DietStats[], tag = "") {
        let calories = 0, carbohydrates = 0, protiens = 0, fats = 0, saturated_fats = 0, timeOfDay = null;

        for ( let i = 0; i < stats.length; i ++) {
            const stat = stats[i];
            calories += stat.calories;
            carbohydrates += stat.carbohydrates;
            protiens += stat.protiens;
            fats += stat.fats;
            saturated_fats += stat.saturated_fats;

            if (stat.calories || stat.carbohydrates || stat.protiens || stat.fats || stat.saturated_fats)
                timeOfDay = stat.timeOfDay;
        }

        return {
            timeOfDay: timeOfDay || null,
            calories, carbohydrates, protiens, fats, saturated_fats, tag
        };
    }

    private sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

interface PatientData {
    patientId: number;
    place: string;
    phone: string;
    name: string;
    age: string;
    height: number;
    weight: number;
    BPD: number;
    BPS: number;
    pulse: number;
    RBS: number;
    ideals: DietStats;
    stats: DietStats;
    mealsText: string,
    meals: {
        wakeup: string,
        breakfast: DietStats,
        lunch: DietStats,
        dinner: DietStats,
        sleep: string,
    };
    mealTimings: number[];
    mealDifferences: {
        "w-b": number,
        "b-l": number,
        "l-d": number,
        "d-s": number,
    };
}

interface DietStats {
    timeOfDay: number;
    tag: string;
    calories: number;
    carbohydrates: number;
    protiens: number;
    fats: number;
    saturated_fats: number;
}

console.log('Starting ...');
setTimeout( () => { // slow servers need a second, to start TypeORM and stuff
    (new ExportUberPatientsStats()).handle().then(() => {
        console.log('!! End !!');

        process.exit(0);
    });
}, 2000);


