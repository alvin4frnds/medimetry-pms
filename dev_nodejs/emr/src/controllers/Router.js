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
var Router = /** @class */ (function () {
    // Constructor takes:
    // - routePath which is the base path for each service exposed by the router subclass (ie. '/auth/users')
    // - app which is the Express application ref
    function Router(routePath, app) {
        if (app == null)
            throw new Error("Missing required App");
        this.app = app;
        this.routePath = routePath;
        this._config = Config_1.config;
        this._routes = [];
        if (this.routePath)
            this.registerServices();
        this._shadowSaveBit = this._config.get('shadowSave', false);
    }
    Object.defineProperty(Router.prototype, "services", {
        // Computed services property is the only property you must overwrite in your
        // Router subclass. Base implementation does nothing but here you should
        // return a dictionary where:
        // - the key is the HTTP_METHOD + PATH of the service (ie. 'POST login/fb/:token')
        //   the path is the same you should set with a classic route register with express.
        // - the value is the name of the function you should call (you must implement it in your subclass).
        get: function () { return {}; },
        enumerable: true,
        configurable: true
    });
    Router.prototype.preMiddlewares = function () { return []; };
    Router.prototype.postMiddlewares = function () { return []; };
    // registerRoutes function simply iterate over services property getting the verb, the path
    // and the function and register it along with the base path of the route.
    Router.prototype.registerServices = function () {
        var _this = this;
        if (this.preMiddlewares().length) {
            var middlewares = this.preMiddlewares();
            for (var i = 0; i < middlewares.length; i++) {
                this.app.use(this.routePath, middlewares[i]);
            }
        }
        var router_services = this.services;
        Object.keys(router_services).forEach(function (full_path) { return __awaiter(_this, void 0, void 0, function () {
            var service_function, path_items, verb, path;
            var _this = this;
            return __generator(this, function (_a) {
                service_function = router_services[full_path];
                path_items = full_path.split(' ');
                verb = (path_items.length > 1 ? path_items[0] : 'get').toLowerCase();
                path = this.routePath + (path_items.length > 1 ? path_items[1] : full_path);
                if (this.postMiddlewares().length) {
                    this.app[verb](path, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this._req = req;
                                    return [4 /*yield*/, this[service_function](req, res, next)];
                                case 1:
                                    _a.sent();
                                    next();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                }
                else {
                    this.app[verb](path, this[service_function].bind(this));
                }
                return [2 /*return*/];
            });
        }); });
        if (this.postMiddlewares().length) {
            var middlewares = this.postMiddlewares();
            for (var i = 0; i < middlewares.length; i++) {
                this.app.use(this.routePath, middlewares[i]);
            }
        }
    };
    Router.prototype.build = function (message, success, more) {
        if (success === void 0) { success = 0; }
        if (more === void 0) { more = {}; }
        var response = { message: message, success: success };
        for (var key in more)
            if (more.hasOwnProperty(key))
                response[key] = more[key];
        // will only be executed on controllers having, postMiddlewares
        // i.e. Middlewares that work once the response is sent to client end.
        if (this._shadowSaveBit && this._req && (this._req.method != "GET")) {
            // if there are more than 3 arguments, hopefullt it is request id
            var requestId = false;
            try {
                requestId = arguments.length > 3
                    ? arguments[arguments.length - 1].headers["id"]
                    : this._req.headers["id"];
            }
            catch (e) {
                console.error("Found error: ", e);
            }
            this._config.lastResponse(requestId || this._req.headers["id"], response);
        }
        return response;
    };
    return Router;
}());
module.exports = Router;
