#!/usr/bin/env node
import { DatabaseConfiguration, db } from '../config/DatabaseConfiguration';
import { Config, config } from '../config/Config';
import { StaticHelpers } from '../helpers/Statics';

export class ExportDb {
    private _db: DatabaseConfiguration;
    private _config: Config;
    private _sh;
    private _fs;
    private DATE_STAMP = StaticHelpers.dateStamp();

    constructor() {}

    public handle() {
        this._db = db;
        this._config = config;
        this._sh = require('shelljs');
        this._fs = require('fs');

        if (process.argv[2]) this.DATE_STAMP = process.argv[2];
        // console.log("DB Config", this._db.getConfigs("default"), this._db.getConfigs("medi"));

        const now = new Date();

        ["default", "medi"].forEach( connName => {
            const dbConfig = this._db.getConfigs(connName);
            console.log(`Backing up db: ${connName}`);

            let backupFile;
            switch (dbConfig.type) {
                case "postgres":
                    backupFile = this.createPostgresBackup(dbConfig);
                    break;
                case "mysql":
                    backupFile = this.createMysqlBackup(dbConfig);
                    break;
                default:
                    console.error("Unknown database type: ", dbConfig.type);
                    return;
            }

            console.log(`Backup complete: ${backupFile}`);
        });

        const diff = Math.ceil((new Date).getTime() - now.getTime());
        console.info("Command took: (ms)", diff);

        // ending process will disconnect it itself.
        // this._db.disconnect();
    }

    private createPgPassFile( dbConfig ) {
        const PGPASS_LOCATIOIN = "~/.pgpass";

        if (dbConfig.type != "postgres") return false;

        const PGPASS_CONTENT = [
            dbConfig.host,
            dbConfig.port,
            dbConfig.database,
            dbConfig.username,
            dbConfig.password
        ].join(":");

        if (! this._sh.test('-f', PGPASS_LOCATIOIN)) { // .pgpass file doesn't exist

            this._sh.exec(`echo '${PGPASS_CONTENT}' >> ${PGPASS_LOCATIOIN}`);
            this._sh.chmod('600', PGPASS_LOCATIOIN);

            return this._sh.test('-f', PGPASS_LOCATIOIN);

        } else { // file exists

            // check contents,
            // if contents exists, give permission move on
            //      if not, make an entry, move on

            let fileContents = this._sh.cat(PGPASS_LOCATIOIN);

            if (fileContents.indexOf(PGPASS_CONTENT) > -1) { // content exists
                this._sh.chmod('600', PGPASS_LOCATIOIN);
                return this._sh.test('-f', PGPASS_LOCATIOIN);

            } else {
                this._sh.exec(`echo '${fileContents.stdout}\n${PGPASS_CONTENT}' >> ${PGPASS_LOCATIOIN}`);
                this._sh.chmod('600', PGPASS_LOCATIOIN);
                return this._sh.test('-f', PGPASS_LOCATIOIN);
            }
        }
    }
    private createPostgresBackup (dbConfig) {

        const fileName = this.getDBLocation() + "/" + dbConfig.database + "_" + this.DATE_STAMP + ".psql";


        this.createPgPassFile(dbConfig);

        const command = `pg_dump -U ${dbConfig.username} -h ${dbConfig.host} -p ${dbConfig.port} ${dbConfig.database} > ${fileName}`;
        this._sh.exec(command);
        return fileName;
    }
    private createMysqlBackup (dbConfig) {
        const fileName = this.getDBLocation() + "/" + dbConfig.database + "_" + this.DATE_STAMP + ".sql";

        const command = `mysqldump -u ${dbConfig.username} --password="${dbConfig.password}" --host ${dbConfig.host} --port ${dbConfig.port} ${dbConfig.database} > ${fileName}`;
        this._sh.exec(command);
        return fileName;
    }
    private getDBLocation() {
        const dbLocation = this._config.get("shadowSaveDbStorageLocation");
        if (! this._sh.test('-d', dbLocation)) this._sh.mkdir('-p', dbLocation);

        return dbLocation;
    }

}

if (process.argv[1] && (process.argv[1].indexOf("ExportDb") > -1)) {
    // base check so, this command can be called via HTTP controller as well

    console.log('Starting ...');
    (new ExportDb()).handle();

    console.log('!! End !!');
    process.exit(0);
}