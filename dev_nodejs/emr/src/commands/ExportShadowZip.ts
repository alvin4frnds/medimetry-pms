#!/usr/bin/env node
import { DatabaseConfiguration, db } from '../config/DatabaseConfiguration';
import { Config, config } from '../config/Config';
import { StaticHelpers } from '../helpers/Statics';

export class ExportShadowZip {
    private _db: DatabaseConfiguration;
    private _config: Config;
    private _sh;
    private _fs;

    private DATE_STAMP = StaticHelpers.dateStamp();

    constructor() {
        this._db = db;
        this._config = config;
        this._sh = require('shelljs');
        this._fs = require('fs');

        if (process.argv[2]) this.DATE_STAMP = process.argv[2];
    }

    public async handle() {
        const todaysFolder = __dirname + "/temp/" + this.DATE_STAMP;
        this._sh.mkdir("-p", todaysFolder);

        console.log("- Creating directory structure");
        const shadowSaveJsonFile = __dirname.replace("/src/commands", "/shadowSaveDumps/")
            + this.DATE_STAMP + ".json";
        if (! this._sh.test('-f', shadowSaveJsonFile)) return false;
        if (! this._sh.test('-d', todaysFolder + "/files")) this._sh.mkdir('-p', todaysFolder + "/files");

        console.log("- copying the .json file");
        this._sh.exec(`cp ${shadowSaveJsonFile} ${todaysFolder}/dump.json`);

        console.log("- copying the attachments");
        const imagesFolderPath = __dirname.replace(
            "/commands",
            "/public/api/files/emr/" +
                this.DATE_STAMP.split("-").join("/") +
                "/*"
        );
        this._sh.exec(`cp ${imagesFolderPath} ${todaysFolder}/files`);

        console.log("- zipping them together");
        const zipName = todaysFolder + ".zip";
        this._sh.exec(`zip -r ${this.DATE_STAMP}.zip src/commands/temp/${this.DATE_STAMP}`, { silent: true });

        console.log(`Zip location: ${zipName.replace("src/commands/temp/", "")}`);
        this._db.disconnect();
        process.exit(0);
    }
}

if (process.argv[1] && (process.argv[1].indexOf("ExportShadowZip") > -1)) {
    // base check so, this command can be called via HTTP controller as well

    console.log('Starting ...');
    (new ExportShadowZip()).handle().then( () => {
        console.log('!! End !!');
        process.exit(0);
    } );
}