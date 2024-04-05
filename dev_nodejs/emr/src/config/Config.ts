export class Config {
    private _all;
    public _dir;
    private _responses;

    private static readonly RESPONSES_SAVE_LIMIT = 48;

    constructor() {
        this._all = require('../../appconfig.json');

        this.dirStructure();
        this._responses = [];
    }

    public get(key, _default = null) {
        if (key in this._all) return this._all[key];

        return _default;
    }

    public getOAuthClientKey() {
        return this.get("oauthClientKey");
    }

    private dirStructure() {
        const baseDir = __dirname + "/../../";

        this._dir = {
            "base": baseDir,
            "public": baseDir + "src/public/",
            "storage": baseDir + "src/storage/",
            "src": baseDir + "src/",
        }
    }

    private getAuthUrl() {
        if(!this.get("seMedimetryUrl")) return this.get("default_auth_url");

        return this.get("seMedimetryUrl");
    }

    public lastResponse(reqId, resp = null, attempt = 0) {

        if (resp) {
            resp["$$reqId"] = reqId;
            if (this._responses.length > Config.RESPONSES_SAVE_LIMIT) this._responses.shift();
            this._responses.push(resp);
            return resp;
        } else {
            return this._responses.filter( response => {
                    return response.$$reqId == reqId;
                })[0] || null;
        }
    }
}

export const config = new Config();