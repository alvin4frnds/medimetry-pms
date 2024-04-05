import { config } from '../config/Config';
import { StaticHelpers } from './Statics';

export class Debug {
    private _sh;
    private _fs;
    private _environment = 'server';
    private _logLevel;

    public static readonly DEBUG_LEVELS = {
        ALL: 6,
        DEBUG: 5,
        INFO: 4,
        WARN: 3,
        ERROR: 2,
        FATAL: 1,
        OFF: 0,
        TRACE: -1,
    };

    private static readonly DEFAULT = Debug.DEBUG_LEVELS.INFO;

    constructor(env = 'server') {
        this._sh = require('shelljs');
        this._fs = require('fs');
        this._environment = env;

        this._logLevel = Debug.DEBUG_LEVELS[config.get('logLevel', "info").toUpperCase()] || 4;
    }

    public environment( env = null ) {
        if (! env) {
            return this._environment;
        } else {
            this._environment = env;
            return this;
        }
    }

    verboseLog (env, level, includeTrace, ...rest) {
        if (level > this._logLevel) return false;

        let logString = `----- ${env.toUpperCase()} - ${this.keyFromLevel(level).toUpperCase()} - ${new Date()} ----- \n`;

        rest.forEach( param => {
            if (typeof param === "object") logString += "object => " + JSON.stringify(param) + "\n";
            else logString += typeof param + " => " + param + "\n";
        });

        if (includeTrace) {
            logString += this.getStackTrace();
        }

        this._fs.appendFile(this.fileName(), logString, function (err) {
            if (err) console.error(err);
            else console.log("Debug Logs Updated !!! ");
        });
    }

    log(...info) {
        this.verboseLog(this._environment, Debug.DEFAULT, ( this._logLevel === -1 ), ...info);
    }

    private fileName() {
        if (! this._sh.test('-d', 'debug')) this._sh.mkdir("-p", "debug");

        const filename = 'debug/' + StaticHelpers.dateStamp() + '.log';
        if (! this._sh.test('-f', filename)) this._sh.exec(`touch ${filename}`);

        return filename;
    }

    private keyFromLevel(level = Debug.DEFAULT) {
        for ( let key in Debug.DEBUG_LEVELS)
            if (Debug.DEBUG_LEVELS[key] == level)
                return key;

        return "INFO";
    }

    private getStackTrace() {
        try {
            // if something unexpected
            throw new Error("Below is the stack trace");

        } catch (e) {
            return e.stack;
        }
    };
}

export const debug = new Debug('server');