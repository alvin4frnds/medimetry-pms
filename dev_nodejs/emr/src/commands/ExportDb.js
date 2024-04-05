#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DatabaseConfiguration_1 = require("../config/DatabaseConfiguration");
var Config_1 = require("../config/Config");
var Statics_1 = require("../helpers/Statics");
var ExportDb = /** @class */ (function () {
    function ExportDb() {
        this.DATE_STAMP = Statics_1.StaticHelpers.dateStamp();
    }
    ExportDb.prototype.handle = function () {
        var _this = this;
        this._db = DatabaseConfiguration_1.db;
        this._config = Config_1.config;
        this._sh = require('shelljs');
        this._fs = require('fs');
        if (process.argv[2])
            this.DATE_STAMP = process.argv[2];
        // console.log("DB Config", this._db.getConfigs("default"), this._db.getConfigs("medi"));
        var now = new Date();
        ["default", "medi"].forEach(function (connName) {
            var dbConfig = _this._db.getConfigs(connName);
            console.log("Backing up db: " + connName);
            var backupFile;
            switch (dbConfig.type) {
                case "postgres":
                    backupFile = _this.createPostgresBackup(dbConfig);
                    break;
                case "mysql":
                    backupFile = _this.createMysqlBackup(dbConfig);
                    break;
                default:
                    console.error("Unknown database type: ", dbConfig.type);
                    return;
            }
            console.log("Backup complete: " + backupFile);
        });
        var diff = Math.ceil((new Date).getTime() - now.getTime());
        console.info("Command took: (ms)", diff);
        // ending process will disconnect it itself.
        // this._db.disconnect();
    };
    ExportDb.prototype.createPgPassFile = function (dbConfig) {
        var PGPASS_LOCATIOIN = "~/.pgpass";
        if (dbConfig.type != "postgres")
            return false;
        var PGPASS_CONTENT = [
            dbConfig.host,
            dbConfig.port,
            dbConfig.database,
            dbConfig.username,
            dbConfig.password
        ].join(":");
        if (!this._sh.test('-f', PGPASS_LOCATIOIN)) { // .pgpass file doesn't exist
            this._sh.exec("echo '" + PGPASS_CONTENT + "' >> " + PGPASS_LOCATIOIN);
            this._sh.chmod('600', PGPASS_LOCATIOIN);
            return this._sh.test('-f', PGPASS_LOCATIOIN);
        }
        else { // file exists
            // check contents,
            // if contents exists, give permission move on
            //      if not, make an entry, move on
            var fileContents = this._sh.cat(PGPASS_LOCATIOIN);
            if (fileContents.indexOf(PGPASS_CONTENT) > -1) { // content exists
                this._sh.chmod('600', PGPASS_LOCATIOIN);
                return this._sh.test('-f', PGPASS_LOCATIOIN);
            }
            else {
                this._sh.exec("echo '" + fileContents.stdout + "\n" + PGPASS_CONTENT + "' >> " + PGPASS_LOCATIOIN);
                this._sh.chmod('600', PGPASS_LOCATIOIN);
                return this._sh.test('-f', PGPASS_LOCATIOIN);
            }
        }
    };
    ExportDb.prototype.createPostgresBackup = function (dbConfig) {
        var fileName = this.getDBLocation() + "/" + dbConfig.database + "_" + this.DATE_STAMP + ".psql";
        this.createPgPassFile(dbConfig);
        var command = "pg_dump -U " + dbConfig.username + " -h " + dbConfig.host + " -p " + dbConfig.port + " " + dbConfig.database + " > " + fileName;
        this._sh.exec(command);
        return fileName;
    };
    ExportDb.prototype.createMysqlBackup = function (dbConfig) {
        var fileName = this.getDBLocation() + "/" + dbConfig.database + "_" + this.DATE_STAMP + ".sql";
        var command = "mysqldump -u " + dbConfig.username + " --password=\"" + dbConfig.password + "\" --host " + dbConfig.host + " --port " + dbConfig.port + " " + dbConfig.database + " > " + fileName;
        this._sh.exec(command);
        return fileName;
    };
    ExportDb.prototype.getDBLocation = function () {
        var dbLocation = this._config.get("shadowSaveDbStorageLocation");
        if (!this._sh.test('-d', dbLocation))
            this._sh.mkdir('-p', dbLocation);
        return dbLocation;
    };
    return ExportDb;
}());
exports.ExportDb = ExportDb;
if (process.argv[1] && (process.argv[1].indexOf("ExportDb") > -1)) {
    // base check so, this command can be called via HTTP controller as well
    console.log('Starting ...');
    (new ExportDb()).handle();
    console.log('!! End !!');
    process.exit(0);
}
