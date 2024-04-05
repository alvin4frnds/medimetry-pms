"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Config = /** @class */ (function () {
    function Config() {
        this._all = require('../../appconfig.json');
        this.dirStructure();
        this._responses = [];
    }
    Config.prototype.get = function (key, _default) {
        if (_default === void 0) { _default = null; }
        if (key in this._all)
            return this._all[key];
        return _default;
    };
    Config.prototype.getOAuthClientKey = function () {
        return this.get("oauthClientKey");
    };
    Config.prototype.dirStructure = function () {
        var baseDir = __dirname + "/../../";
        this._dir = {
            "base": baseDir,
            "public": baseDir + "src/public/",
            "storage": baseDir + "src/storage/",
            "src": baseDir + "src/",
        };
    };
    Config.prototype.getAuthUrl = function () {
        if (!this.get("seMedimetryUrl"))
            return this.get("default_auth_url");
        return this.get("seMedimetryUrl");
    };
    Config.prototype.lastResponse = function (reqId, resp, attempt) {
        if (resp === void 0) { resp = null; }
        if (attempt === void 0) { attempt = 0; }
        if (resp) {
            resp["$$reqId"] = reqId;
            if (this._responses.length > Config.RESPONSES_SAVE_LIMIT)
                this._responses.shift();
            this._responses.push(resp);
            return resp;
        }
        else {
            return this._responses.filter(function (response) {
                return response.$$reqId == reqId;
            })[0] || null;
        }
    };
    Config.RESPONSES_SAVE_LIMIT = 48;
    return Config;
}());
exports.Config = Config;
exports.config = new Config();
