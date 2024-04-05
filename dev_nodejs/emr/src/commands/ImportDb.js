#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var DatabaseConfiguration_1 = require("../config/DatabaseConfiguration");
var Config_1 = require("../config/Config");
var Statics_1 = require("../helpers/Statics");
var HttpRequest_1 = require("../helpers/HttpRequest");
var ImportDb = /** @class */ (function () {
    function ImportDb() {
        this.DATE_STAMP = Statics_1.StaticHelpers.dateStamp();
        this._db = DatabaseConfiguration_1.db;
        this._config = Config_1.config;
        this._sh = require('shelljs');
        this._fs = require('fs');
        this._http = new HttpRequest_1.HttpRequest;
        if (process.argv[2])
            this.DATE_STAMP = process.argv[2];
    }
    ImportDb.prototype.handle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tempDir, resp;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Starting ...');
                        return [4 /*yield*/, this._db.disconnect()];
                    case 1:
                        _a.sent();
                        tempDir = __dirname + "/temp";
                        resp = "";
                        if (!this._config.get('prodServerDbGenerationUrl', false)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._http.anyRequest(this._config.get('prodServerDbGenerationUrl'), {})];
                    case 2:
                        resp = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (resp && resp.length && (resp.trim().toLowerCase() == "backups created")) { } // this is OK
                        else
                            console.error("Something went wrong while generating DB Backup on prod server: ", resp);
                        // this._sh.rm('-rf', tempDir);
                        // this._sh.mkdir('-p', tempDir);
                        ["medi", "default"].forEach(function (connName) { return __awaiter(_this, void 0, void 0, function () {
                            var dbConfig, url;
                            return __generator(this, function (_a) {
                                dbConfig = this._db.getConfigs(connName);
                                console.log("Download DB ...: " + connName);
                                url = this.getDBPath(dbConfig, true);
                                this._sh.exec("wget " + url + " -P " + tempDir + " --no-check-certificate", { silent: true });
                                dbConfig["url"] = url;
                                dbConfig["fileName"] = this.getDBPath(dbConfig);
                                dbConfig["filePath"] = tempDir + dbConfig["fileName"];
                                console.log("Importing DB: " + dbConfig.name);
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
                                console.log("Import complete: " + dbConfig.name);
                                return [2 /*return*/];
                            });
                        }); });
                        console.log('!! End !!');
                        process.exit(0);
                        return [2 /*return*/];
                }
            });
        });
    };
    ImportDb.prototype.importPostgresDb = function (dbConfig) {
        this._sh.exec("pm2 stop all", { silent: true });
        this._sh.exec("psql -U " + dbConfig.username + " -d " + dbConfig.username + " -c \"drop database " + dbConfig.database + "\"", { silent: true });
        this._sh.exec("psql -U " + dbConfig.username + " -d " + dbConfig.username + " -c \"create database " + dbConfig.database + "\"", { silent: true });
        this._sh.exec("psql -U " + dbConfig.username + " " + dbConfig.database + " < " + dbConfig.filePath + " &> /dev/null", { silent: true });
        this._sh.exec("pm2 restart all", { silent: true });
        /* console.log("-------- Write following commands 1/1 ----------");
        console.log(`: pm2 stop all;`);
        console.log(`: psql -U ${dbConfig.username} -d ${dbConfig.username}`);
        console.log(`: DROP DATABASE ${dbConfig.database}; CREATE DATABASE ${dbConfig.database};`);
        console.log(`Ctrl + D -> to exit`);
        console.log(`: psql -U ${dbConfig.username} ${dbConfig.database} < ${dbConfig.filePath} &> /dev/null`);
        console.log(`: pm2 restart all;`);

        console.log("-------- End ----------"); */
    };
    ImportDb.prototype.importMysqlDb = function (dbConfig) {
        this._sh.exec("mysql -u " + dbConfig.username + " --password=\"" + dbConfig.password + "\" --host " + dbConfig.host + " --port " + dbConfig.port + " -e \"drop database " + dbConfig.database + "; create database " + dbConfig.database + ";\"");
        this._sh.exec("mysql -u " + dbConfig.username + " --password=\"" + dbConfig.password + "\" --host " + dbConfig.host + " --port " + dbConfig.port + " " + dbConfig.database + " < " + dbConfig.filePath);
    };
    ImportDb.prototype.createPgPassFile = function (dbConfig) {
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
    ImportDb.prototype.getDBPath = function (dbConfig, withhost) {
        if (withhost === void 0) { withhost = false; }
        return (withhost ? this._config.get("shadowSaveDbBaseUrl") : "") +
            "/" + dbConfig.database +
            "_" + this.DATE_STAMP +
            "." + (dbConfig.type == "postgres" ? "psql" : "sql");
    };
    return ImportDb;
}());
exports.ImportDb = ImportDb;
(new ImportDb()).handle();
