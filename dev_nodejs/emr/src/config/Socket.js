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
var server_1 = require("./../server");
var Debug_1 = require("./../helpers/Debug");
var socketIo = require("socket.io");
var http_1 = require("http");
var DatabaseConfiguration_1 = require("./DatabaseConfiguration");
var User_1 = require("../database/models/User");
var Config_1 = require("./Config");
var Socket = /** @class */ (function () {
    function Socket(app) {
        this.app = app;
        this.user_tokens = [];
        this.debug = Debug_1.debug;
        this.db = DatabaseConfiguration_1.db;
        this.config = Config_1.Config;
        this.createServer();
        this.initSocket();
        this.connect();
    }
    Socket.prototype.createServer = function () {
        this.server = http_1.createServer(this.app);
    };
    Socket.prototype.initSocket = function () {
        var _this = this;
        this.io = socketIo(this.server);
        setTimeout(function () {
            _this.io.listen(server_1.server);
        }, 2000);
    };
    Socket.prototype.connect = function () {
        var _this = this;
        this.io.on('connection', function (socket) {
            socket.on('authentication', function (token) {
                _this.isUserAuthenticated(token).then(function (result) {
                    if (result) {
                        if (_this.user_tokens.length > 1000) {
                            _this.user_tokens.unshift();
                        }
                        _this.user_tokens.push(token);
                        socket.emit('token_info', { 'success': 1, 'message': 'Token Authenticated' });
                    }
                    else {
                        socket.emit('token_info', { 'success': 0, 'message': 'Token is unauthenticated' });
                    }
                });
            });
            socket.on('write_log', function (message) {
                if (message.token && _this.isUserTokenExists(message.token)) {
                    _this.debug.verboseLog(message.client, message.level, message.level == -1, message.body);
                }
            });
        });
    };
    Socket.prototype.isUserAuthenticated = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User_1.User.getRepo().createQueryBuilder("user")
                            .where("user.access_token = :token")
                            .setParameters({ token: token })
                            .orderBy("user.id", "DESC")
                            .getOne()];
                    case 1:
                        user = _a.sent();
                        if (typeof user === 'undefined' || !user)
                            return [2 /*return*/, false];
                        return [2 /*return*/, true];
                }
            });
        });
    };
    Socket.prototype.isUserTokenExists = function (token) {
        return this.user_tokens.indexOf(token) > -1;
    };
    return Socket;
}());
exports.Socket = Socket;
