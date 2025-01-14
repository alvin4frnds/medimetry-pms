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
var typeorm_1 = require("typeorm");
var Statics_1 = require("../helpers/Statics");
var DatabaseConfiguration = /** @class */ (function () {
    function DatabaseConfiguration() {
        var _this = this;
        this._connections = [];
        this._ormConfig = require('../../ormconfig.json');
        typeorm_1.createConnections(this._ormConfig).then(function (connections) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._connections = connections;
                this._defaultConn = connections[0];
                this._wpdbConn = connections[1];
                this._serviceDbConn = connections[2];
                console.debug("TypeORM: successfully connected.", connections[0].isConnected);
                return [2 /*return*/];
            });
        }); }).catch(function (error) { return console.debug("TypeORM connection error: ", error); });
    }
    DatabaseConfiguration.prototype.connection = function (name) {
        if (name === void 0) { name = ''; }
        if (this._defaultConn)
            return this._defaultConn;
        if (this._connections.length)
            return this._connections[0];
        return typeorm_1.getConnection(name || "default");
    };
    DatabaseConfiguration.prototype.wpdb = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._wpdbConn)
                            this._wpdbConn = typeorm_1.getConnection("medi");
                        return [4 /*yield*/, this._wpdbConn.query(query)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, JSON.parse(JSON.stringify(result))];
                }
            });
        });
    };
    DatabaseConfiguration.prototype.mailServiceDb = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mailServiceConn().query(query)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, JSON.parse(JSON.stringify(result))];
                }
            });
        });
    };
    DatabaseConfiguration.prototype.mailServiceConn = function () {
        if (!this._serviceDbConn)
            this._serviceDbConn = typeorm_1.getConnection("logs");
        return this._serviceDbConn;
    };
    DatabaseConfiguration.prototype.wpdbGetColumn = function (query, colname) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.wpdb(query)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, Statics_1.StaticHelpers.getColumnFromJsonObj(results, colname)];
                }
            });
        });
    };
    DatabaseConfiguration.prototype.getConfigs = function (name) {
        if (name === void 0) { name = null; }
        var configs = {};
        this._ormConfig.forEach(function (config) {
            configs[config.name] = config;
        });
        if (!name)
            return configs;
        if (configs[name])
            return configs[name];
        return false;
    };
    DatabaseConfiguration.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._connections.forEach(function (connection) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, connection.disconnect()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseConfiguration.prototype.postConnectionStuff = function () {
        return __awaiter(this, void 0, void 0, function () {
            var responses, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        responses = [];
                        _b = (_a = responses).push;
                        return [4 /*yield*/, this._defaultConn.query('delete from consultations_status where id in ' +
                                '(select min(id) from consultations_status group by consultation_code ' +
                                'having count(consultation_code) > 1 )')];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/];
                }
            });
        });
    };
    return DatabaseConfiguration;
}());
exports.DatabaseConfiguration = DatabaseConfiguration;
exports.db = new DatabaseConfiguration();
