"use strict";
const Router = require('./Router');
import {User} from "../database/models/User";
import {db} from "../config/DatabaseConfiguration";
import {HttpRequest} from "../helpers/HttpRequest";
import {config} from "../config/Config";
import { Debug } from "../helpers/Debug";

export class AuthController extends Router {
    private _dbConn;
    private _request;
    private _config;

    constructor(routePath, app) {
        super(routePath, app);

        this._dbConn = db.connection();
        this._config = config;
        this._request = new HttpRequest();
    }

    get services() {
        return {
            'POST /get-token': 'getToken',
            'POST /doctor-signup': 'doctorSignup',
            '/auth-url': 'getAuthUrl'
        };
    }


    async getAuthUrl(req, res) {
        const logLevel = this._config.get('logLevel', 'info').toUpperCase();

        res.send({
            "url": this._config.getAuthUrl(),
            "shadowSave": this._config.get('shadowSave', false),
            "token": this._config.get('defaultToken', null),
            "pusher_app_id":this._config.get("pusher_app_id",null),
            "pusher_key":this._config.get("pusher_key",null),
            "pusher_secret":this._config.get("pusher_secret",null),
            "pusher_cluster":this._config.get("pusher_cluster",null),
            "logLevel": logLevel,
            "logLevelInt": Debug.DEBUG_LEVELS[logLevel],
            "app_environment":this._config.get("environment","TESTING"),
            "patientTags": this._config.get("patientTags", ""),
            "appName": this._config.get("appName", "PMS MediMetry"),
            "hideRxPricingInfo": this._config.get("hideRxPricingInfo", false),
        });
    }

    async getToken(req, res) {
        const token = req.body.token;

        const httpResp = await this._request.seRequest("oauth/get-token", {
            token: token, key: this._config.get('oauthClientKey')
        });

        if (!httpResp.success) return res.send(httpResp);
        User.getRepo().save(User.newFromHttpResp(httpResp));

        return res.send(httpResp);
    }

    async doctorSignup(req, res) {
        if (req.body.name && req.body.mobile && req.body.email && req.body.specialty) {
        } // everything is OK
        else return res.send(this.build("Missing required fields"));

        const url = "signup/" + req.body.mobile + "/" + req.body.name + "/" + req.body.email + "/" + req.body.specialty;
        const _ = this._request.coreRequest(url, [], true);
        _.then(function (response) {
            console.debug("Http response: ", response);
        });

        return res.send(this.build("Requested Successfully", 1));
    }
}
