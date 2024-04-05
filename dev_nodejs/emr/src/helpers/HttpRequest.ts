import { config, Config } from '../config/Config';
import { User } from '../database/models/User';
const request = require('request');

export class HttpRequest {
    private _request;
    private _config: Config;
    private _token = "";

    constructor() {
        this._request = request;
        this._config = config;
    }

    public coreRequest(url, params = {}, isDoctor = false, userId = 0) {
        const endUrl = this._config.get('coreMedimetryUrl')
            + "wp-json/"
            + ((isDoctor) ? "medidoctors/" : "nativeusers/")
            + url;

        let headers = {
            'auth-userId': params["encrypted"] ? params["encrypted"] : null,
        };

        delete params["encrypted"];
        return this.anyRequest(endUrl, params, headers);
    }

    public seRequest(url, params = {}, headers = {}) {
        const endUrl = this._config.get('seMedimetryUrl') + url;
        let isPost = false;
        for ( let _ in params) isPost = true;

        if (isPost && !params["key"])
            params["key"] = this._config.get('oauthClientKey');

        return this.anyRequest(endUrl, params, headers);
    }

    public async self(url, params = {}, headers = {}) {
        if (! this._token) {
            // set current token if not exists
            const selfUser = await User.repo().findOne({where: {refresh_token: this._config.get("defaultToken", "")}});
            if (selfUser) this._token = selfUser.access_token;
            else return false;
        }

        const endUrl = (this._config.get('secure', false) ? "https://" : "http://")
            + this._config.get("host", "0.0.0.0")
            + (this._config.get('secure', false) ? "" : (":" + this._config.get("port", 4000) ) )
            + "/" + url;
        headers["token"] = this._token;
        headers["content-type"] = 'application/json';

        return this.anyRequest(endUrl, params, headers);
    }

    public anyRequest(endUrl, params, headers = {}) {
        let method = "GET";
        for ( let _ in params) method = "POST";
        if (headers["method"]) method = headers["method"];

        return new Promise(function (resolve, reject) {
            console.log("Third party requesting: ", method, endUrl, params, headers);

            request(HttpRequest.baseConf(endUrl, params, method, headers), function (err, resp, body) {
                if (err) {
                    console.error("Http Error: ", endUrl, params, err);
                    reject(err);
                }

                // console.debug("Third party response: ", body);
                resolve(body);
            });
        });
    }

    private static baseConf(url, params, method = "GET", headers = {}) {
        const baseconf = {
            url: url,
            form: params,
            strictSSL: false,
            json: true,
            method: method,
            headers: headers
        };

        headers["User-Agent"] = "Mozilla/5.0 (Windows NT 6.2; WOW64; rv:17.0) Gecko/20100101 Firefox/17.0";
        headers["Referer"] = "pms.medimetry";

        if (headers["content-type"] && (headers["content-type"] == "application/json")) {
            delete baseconf["form"];
            baseconf["json"] = params;
        }

        return baseconf;
    }
}
