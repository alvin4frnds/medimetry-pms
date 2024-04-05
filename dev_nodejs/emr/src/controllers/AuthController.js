"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var Router = require('./Router');
var User_1 = require("../database/models/User");
var DatabaseConfiguration_1 = require("../config/DatabaseConfiguration");
var HttpRequest_1 = require("../helpers/HttpRequest");
var Config_1 = require("../config/Config");
var Debug_1 = require("../helpers/Debug");
var AuthController = /** @class */ (function (_super) {
    __extends(AuthController, _super);
    function AuthController(routePath, app) {
        var _this = _super.call(this, routePath, app) || this;
        _this._dbConn = DatabaseConfiguration_1.db.connection();
        _this._config = Config_1.config;
        _this._request = new HttpRequest_1.HttpRequest();
        return _this;
    }
    Object.defineProperty(AuthController.prototype, "services", {
        get: function () {
            return {
                'POST /get-token': 'getToken',
                'POST /doctor-signup': 'doctorSignup',
                '/auth-url': 'getAuthUrl'
            };
        },
        enumerable: true,
        configurable: true
    });
    AuthController.prototype.getAuthUrl = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var logLevel;
            return __generator(this, function (_a) {
                logLevel = this._config.get('logLevel', 'info').toUpperCase();
                res.send({
                    "url": this._config.getAuthUrl(),
                    "shadowSave": this._config.get('shadowSave', false),
                    "token": this._config.get('defaultToken', null),
                    "pusher_app_id": this._config.get("pusher_app_id", null),
                    "pusher_key": this._config.get("pusher_key", null),
                    "pusher_secret": this._config.get("pusher_secret", null),
                    "pusher_cluster": this._config.get("pusher_cluster", null),
                    "logLevel": logLevel,
                    "logLevelInt": Debug_1.Debug.DEBUG_LEVELS[logLevel],
                    "app_environment": this._config.get("environment", "TESTING"),
                    "patientTags": this._config.get("patientTags", ""),
                    "appName": this._config.get("appName", "PMS MediMetry"),
                    "hideRxPricingInfo": this._config.get("hideRxPricingInfo", false),
                });
                return [2 /*return*/];
            });
        });
    };
    AuthController.prototype.getToken = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var token, httpResp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = req.body.token;
                        return [4 /*yield*/, this._request.seRequest("oauth/get-token", {
                                token: token, key: this._config.get('oauthClientKey')
                            })];
                    case 1:
                        httpResp = _a.sent();
                        if (!httpResp.success)
                            return [2 /*return*/, res.send(httpResp)];
                        User_1.User.getRepo().save(User_1.User.newFromHttpResp(httpResp));
                        return [2 /*return*/, res.send(httpResp)];
                }
            });
        });
    };
    AuthController.prototype.doctorSignup = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var url, _;
            return __generator(this, function (_a) {
                if (req.body.name && req.body.mobile && req.body.email && req.body.specialty) {
                } // everything is OK
                else
                    return [2 /*return*/, res.send(this.build("Missing required fields"))];
                url = "signup/" + req.body.mobile + "/" + req.body.name + "/" + req.body.email + "/" + req.body.specialty;
                _ = this._request.coreRequest(url, [], true);
                _.then(function (response) {
                    console.debug("Http response: ", response);
                });
                return [2 /*return*/, res.send(this.build("Requested Successfully", 1))];
            });
        });
    };
    return AuthController;
}(Router));
exports.AuthController = AuthController;
