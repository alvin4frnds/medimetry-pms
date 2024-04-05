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
var Config_1 = require("../config/Config");
var User_1 = require("../database/models/User");
var request = require('request');
var HttpRequest = /** @class */ (function () {
    function HttpRequest() {
        this._token = "";
        this._request = request;
        this._config = Config_1.config;
    }
    HttpRequest.prototype.coreRequest = function (url, params, isDoctor, userId) {
        if (params === void 0) { params = {}; }
        if (isDoctor === void 0) { isDoctor = false; }
        if (userId === void 0) { userId = 0; }
        var endUrl = this._config.get('coreMedimetryUrl')
            + "wp-json/"
            + ((isDoctor) ? "medidoctors/" : "nativeusers/")
            + url;
        var headers = {
            'auth-userId': params["encrypted"] ? params["encrypted"] : null,
        };
        delete params["encrypted"];
        return this.anyRequest(endUrl, params, headers);
    };
    HttpRequest.prototype.seRequest = function (url, params, headers) {
        if (params === void 0) { params = {}; }
        if (headers === void 0) { headers = {}; }
        var endUrl = this._config.get('seMedimetryUrl') + url;
        var isPost = false;
        for (var _ in params)
            isPost = true;
        if (isPost && !params["key"])
            params["key"] = this._config.get('oauthClientKey');
        return this.anyRequest(endUrl, params, headers);
    };
    HttpRequest.prototype.self = function (url, params, headers) {
        if (params === void 0) { params = {}; }
        if (headers === void 0) { headers = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var selfUser, endUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this._token) return [3 /*break*/, 2];
                        return [4 /*yield*/, User_1.User.repo().findOne({ where: { refresh_token: this._config.get("defaultToken", "") } })];
                    case 1:
                        selfUser = _a.sent();
                        if (selfUser)
                            this._token = selfUser.access_token;
                        else
                            return [2 /*return*/, false];
                        _a.label = 2;
                    case 2:
                        endUrl = (this._config.get('secure', false) ? "https://" : "http://")
                            + this._config.get("host", "0.0.0.0")
                            + (this._config.get('secure', false) ? "" : (":" + this._config.get("port", 4000)))
                            + "/" + url;
                        headers["token"] = this._token;
                        headers["content-type"] = 'application/json';
                        return [2 /*return*/, this.anyRequest(endUrl, params, headers)];
                }
            });
        });
    };
    HttpRequest.prototype.anyRequest = function (endUrl, params, headers) {
        if (headers === void 0) { headers = {}; }
        var method = "GET";
        for (var _ in params)
            method = "POST";
        if (headers["method"])
            method = headers["method"];
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
    };
    HttpRequest.baseConf = function (url, params, method, headers) {
        if (method === void 0) { method = "GET"; }
        if (headers === void 0) { headers = {}; }
        var baseconf = {
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
    };
    return HttpRequest;
}());
exports.HttpRequest = HttpRequest;
