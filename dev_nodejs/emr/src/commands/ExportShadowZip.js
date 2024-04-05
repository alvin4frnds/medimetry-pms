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
var ExportShadowZip = /** @class */ (function () {
    function ExportShadowZip() {
        this.DATE_STAMP = Statics_1.StaticHelpers.dateStamp();
        this._db = DatabaseConfiguration_1.db;
        this._config = Config_1.config;
        this._sh = require('shelljs');
        this._fs = require('fs');
        if (process.argv[2])
            this.DATE_STAMP = process.argv[2];
    }
    ExportShadowZip.prototype.handle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var todaysFolder, shadowSaveJsonFile, imagesFolderPath, zipName;
            return __generator(this, function (_a) {
                todaysFolder = __dirname + "/temp/" + this.DATE_STAMP;
                this._sh.mkdir("-p", todaysFolder);
                console.log("- Creating directory structure");
                shadowSaveJsonFile = __dirname.replace("/src/commands", "/shadowSaveDumps/")
                    + this.DATE_STAMP + ".json";
                if (!this._sh.test('-f', shadowSaveJsonFile))
                    return [2 /*return*/, false];
                if (!this._sh.test('-d', todaysFolder + "/files"))
                    this._sh.mkdir('-p', todaysFolder + "/files");
                console.log("- copying the .json file");
                this._sh.exec("cp " + shadowSaveJsonFile + " " + todaysFolder + "/dump.json");
                console.log("- copying the attachments");
                imagesFolderPath = __dirname.replace("/commands", "/public/api/files/emr/" +
                    this.DATE_STAMP.split("-").join("/") +
                    "/*");
                this._sh.exec("cp " + imagesFolderPath + " " + todaysFolder + "/files");
                console.log("- zipping them together");
                zipName = todaysFolder + ".zip";
                this._sh.exec("zip -r " + this.DATE_STAMP + ".zip src/commands/temp/" + this.DATE_STAMP, { silent: true });
                console.log("Zip location: " + zipName.replace("src/commands/temp/", ""));
                this._db.disconnect();
                process.exit(0);
                return [2 /*return*/];
            });
        });
    };
    return ExportShadowZip;
}());
exports.ExportShadowZip = ExportShadowZip;
if (process.argv[1] && (process.argv[1].indexOf("ExportShadowZip") > -1)) {
    // base check so, this command can be called via HTTP controller as well
    console.log('Starting ...');
    (new ExportShadowZip()).handle().then(function () {
        console.log('!! End !!');
        process.exit(0);
    });
}
