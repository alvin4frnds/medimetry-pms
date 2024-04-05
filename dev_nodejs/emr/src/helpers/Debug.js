"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Config_1 = require("../config/Config");
var Statics_1 = require("./Statics");
var Debug = /** @class */ (function () {
    function Debug(env) {
        if (env === void 0) { env = 'server'; }
        this._environment = 'server';
        this._sh = require('shelljs');
        this._fs = require('fs');
        this._environment = env;
        this._logLevel = Debug.DEBUG_LEVELS[Config_1.config.get('logLevel', "info").toUpperCase()] || 4;
    }
    Debug.prototype.environment = function (env) {
        if (env === void 0) { env = null; }
        if (!env) {
            return this._environment;
        }
        else {
            this._environment = env;
            return this;
        }
    };
    Debug.prototype.verboseLog = function (env, level, includeTrace) {
        var rest = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            rest[_i - 3] = arguments[_i];
        }
        if (level > this._logLevel)
            return false;
        var logString = "----- " + env.toUpperCase() + " - " + this.keyFromLevel(level).toUpperCase() + " - " + new Date() + " ----- \n";
        rest.forEach(function (param) {
            if (typeof param === "object")
                logString += "object => " + JSON.stringify(param) + "\n";
            else
                logString += typeof param + " => " + param + "\n";
        });
        if (includeTrace) {
            logString += this.getStackTrace();
        }
        this._fs.appendFile(this.fileName(), logString, function (err) {
            if (err)
                console.error(err);
            else
                console.log("Debug Logs Updated !!! ");
        });
    };
    Debug.prototype.log = function () {
        var info = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            info[_i] = arguments[_i];
        }
        this.verboseLog.apply(this, [this._environment, Debug.DEFAULT, (this._logLevel === -1)].concat(info));
    };
    Debug.prototype.fileName = function () {
        if (!this._sh.test('-d', 'debug'))
            this._sh.mkdir("-p", "debug");
        var filename = 'debug/' + Statics_1.StaticHelpers.dateStamp() + '.log';
        if (!this._sh.test('-f', filename))
            this._sh.exec("touch " + filename);
        return filename;
    };
    Debug.prototype.keyFromLevel = function (level) {
        if (level === void 0) { level = Debug.DEFAULT; }
        for (var key in Debug.DEBUG_LEVELS)
            if (Debug.DEBUG_LEVELS[key] == level)
                return key;
        return "INFO";
    };
    Debug.prototype.getStackTrace = function () {
        try {
            // if something unexpected
            throw new Error("Below is the stack trace");
        }
        catch (e) {
            return e.stack;
        }
    };
    ;
    Debug.DEBUG_LEVELS = {
        ALL: 6,
        DEBUG: 5,
        INFO: 4,
        WARN: 3,
        ERROR: 2,
        FATAL: 1,
        OFF: 0,
        TRACE: -1,
    };
    Debug.DEFAULT = Debug.DEBUG_LEVELS.INFO;
    return Debug;
}());
exports.Debug = Debug;
exports.debug = new Debug('server');
