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
var Config_1 = require("../config/Config");
var S3_1 = require("../config/S3");
var Debug_1 = require("../helpers/Debug");
var ExportDb_1 = require("../commands/ExportDb");
var Router = require('./Router');
var fs = require('fs');
var AWS = require('aws-sdk');
var TestController = /** @class */ (function (_super) {
    __extends(TestController, _super);
    function TestController(routePath, app) {
        var _this = _super.call(this, routePath, app) || this;
        _this._config = Config_1.config;
        _this._s3 = S3_1.uploader;
        return _this;
    }
    Object.defineProperty(TestController.prototype, "services", {
        get: function () {
            return {
                '/1': 'firstTest',
                'POST /log/:env/:level': 'debugLog',
                '/generate-db-backup/:key': 'generateDbBackup',
                'POST /upload': 'uploadFile',
            };
        },
        enumerable: true,
        configurable: true
    });
    TestController.prototype.firstTest = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // do something
                return [2 /*return*/, res.send("This test is passing.")];
            });
        });
    };
    TestController.prototype.uploadFile = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._s3.upload("emptyfile.txt")];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, res.send(this.build("success", 1, { resp: resp }))];
                }
            });
        });
    };
    TestController.prototype.generateDbBackup = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var expDB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expDB = new ExportDb_1.ExportDb();
                        if (!(req.params.key === this._config.getOAuthClientKey())) return [3 /*break*/, 2];
                        return [4 /*yield*/, expDB.handle()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, res.send("Backups Created")];
                    case 2: return [2 /*return*/, res.send("Invalid Key")];
                }
            });
        });
    };
    TestController.prototype.debugLog = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                Debug_1.debug.verboseLog(req.params.env, req.params.level, req.params.level == -1, req.body);
                res.send(this.build("done", 1));
                return [2 /*return*/];
            });
        });
    };
    return TestController;
}(Router));
exports.TestController = TestController;
