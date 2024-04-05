#!/usr/bin/env node
import { DatabaseConfiguration, db } from '../config/DatabaseConfiguration';
import { Config, config } from '../config/Config';
import { StaticHelpers } from '../helpers/Statics';
import { createConnection, createConnections, getConnection } from 'typeorm';
import { HttpRequest } from '../helpers/HttpRequest';

export class ImportDb {
    private _db: DatabaseConfiguration;
    private _config: Config;
    private _sh;
    private _fs;
    private _http;

    private DATE_STAMP = StaticHelpers.dateStamp();

    constructor() {
        this._db = db;
        this._config = config;
        this._sh = require('shelljs');
        this._fs = require('fs');
        this._http = new HttpRequest;

        if (process.argv[2]) this.DATE_STAMP = process.argv[2];
    }

    public async handle() {
        console.log('Starting ...');
        await this._db.disconnect();

        const tempDir = __dirname + "/temp";

        let resp = "";
        if (this._config.get('prodServerDbGenerationUrl', false))
            resp = await this._http.anyRequest(this._config.get('prodServerDbGenerationUrl'), {});

        if (resp && resp.length && (resp.trim().toLowerCase() == "backups created")) {} // this is OK
        else console.error("Something went wrong while generating DB Backup on prod server: ", resp);

        // this._sh.rm('-rf', tempDir);
        // this._sh.mkdir('-p', tempDir);

        ["medi" , "default"].forEach( async connName => {
            const dbConfig = this._db.getConfigs(connName);
            console.log(`Download DB ...: ${connName}`);

            const url = this.getDBPath(dbConfig, true);
            this._sh.exec(`wget ${url} -P ${tempDir} --no-check-certificate`, {silent: true});

            dbConfig["url"] = url;
            dbConfig["fileName"] = this.getDBPath(dbConfig);
            dbConfig["filePath"] = tempDir + dbConfig["fileName"];

            console.log(`Importing DB: ${dbConfig.name}`);
            switch (dbConfig.type) {
                case "postgres":
                    this.importPostgresDb(dbConfig);
                    break;
                case "mysql":
                    this.importMysqlDb(dbConfig);
                    break;
                default:
                    console.error("Unknown database type: ", dbConfig.type);
                    break;
            }

            console.log(`Import complete: ${dbConfig.name}`);
        });

        console.log('!! End !!');
        process.exit(0);
    }

    private importPostgresDb(dbConfig) {
        this._sh.exec(`pm2 stop all`, {silent: true});
        this._sh.exec(`psql -U ${dbConfig.username} -d ${dbConfig.username} -c "drop database ${dbConfig.database}"`, {silent: true});
        this._sh.exec(`psql -U ${dbConfig.username} -d ${dbConfig.username} -c "create database ${dbConfig.database}"`, {silent: true});
        this._sh.exec(`psql -U ${dbConfig.username} ${dbConfig.database} < ${dbConfig.filePath} &> /dev/null`, {silent: true});
        this._sh.exec(`pm2 restart all`, {silent: true});

        /* console.log("-------- Write following commands 1/1 ----------");
        console.log(`: pm2 stop all;`);
        console.log(`: psql -U ${dbConfig.username} -d ${dbConfig.username}`);
        console.log(`: DROP DATABASE ${dbConfig.database}; CREATE DATABASE ${dbConfig.database};`);
        console.log(`Ctrl + D -> to exit`);
        console.log(`: psql -U ${dbConfig.username} ${dbConfig.database} < ${dbConfig.filePath} &> /dev/null`);
        console.log(`: pm2 restart all;`);

        console.log("-------- End ----------"); */
    }

    private importMysqlDb(dbConfig) {
        this._sh.exec(`mysql -u ${dbConfig.username} --password="${dbConfig.password}" --host ${dbConfig.host} --port ${dbConfig.port} -e "drop database ${dbConfig.database}; create database ${dbConfig.database};"`);
        this._sh.exec(`mysql -u ${dbConfig.username} --password="${dbConfig.password}" --host ${dbConfig.host} --port ${dbConfig.port} ${dbConfig.database} < ${dbConfig.filePath}`);
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

    private getDBPath(dbConfig, withhost = false) {
        return ( withhost ? this._config.get("shadowSaveDbBaseUrl") : "" ) +
            "/" + dbConfig.database +
            "_" + this.DATE_STAMP +
            "." + (dbConfig.type == "postgres" ? "psql" : "sql");
    }

}

(new ImportDb()).handle();


