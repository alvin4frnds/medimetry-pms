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
var AuthMiddleware_1 = require("./middlewares/AuthMiddleware");
var Statics_1 = require("../helpers/Statics");
var DatabaseConfiguration_1 = require("../config/DatabaseConfiguration");
var Soap_1 = require("../database/models/Soap");
var HttpRequest_1 = require("../helpers/HttpRequest");
var typeorm_1 = require("typeorm");
var Config_1 = require("../config/Config");
var Router = require('./Router');
var NotificationsController = /** @class */ (function (_super) {
    __extends(NotificationsController, _super);
    function NotificationsController(routePath, app) {
        var _this = _super.call(this, routePath, app) || this;
        _this._db = DatabaseConfiguration_1.db;
        _this._request = new HttpRequest_1.HttpRequest();
        _this._config = Config_1.config;
        return _this;
    }
    Object.defineProperty(NotificationsController.prototype, "services", {
        get: function () {
            return {
                '/listing/:page?': 'listing',
                '/mark-read/:id': 'markRead',
                '/mark-done/:id': 'markDone',
                '/mark-done-all/': 'markDoneAll',
                'POST /pms-staff-stat-notification': "pmsStaffStatNotification",
                '/pms-staff-stats/:id': "pmsStaffStats",
            };
        },
        enumerable: true,
        configurable: true
    });
    NotificationsController.prototype.preMiddlewares = function () { return [AuthMiddleware_1.AuthMiddleware]; };
    NotificationsController.prototype.listing = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var page, type, take, skip, doctorIds, now, thirtyDaysBefore, unfollowedUpSoapCount, notifications, uniqueUsers, notificationIds, unreadCount, totalCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = parseInt(req.params.page) || 1;
                        type = req.query.type || "";
                        console.log("Page & type: ", page, type);
                        take = 30;
                        skip = (page - 1) * take;
                        doctorIds = req.wpUserIds.join(", ");
                        now = Statics_1.StaticHelpers.toMysql(new Date);
                        thirtyDaysBefore = new Date();
                        thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);
                        return [4 /*yield*/, Soap_1.Soap.repo()
                                .query("SELECT COUNT(*) as count FROM \"public\".\"soaps\" \"Soap\" WHERE follow_up IS NULL AND active = true AND created_at > '" + Statics_1.StaticHelpers.toMysql(thirtyDaysBefore) + "'")];
                    case 1:
                        unfollowedUpSoapCount = _a.sent();
                        if (unfollowedUpSoapCount && unfollowedUpSoapCount[0] && unfollowedUpSoapCount[0]['count'])
                            unfollowedUpSoapCount = unfollowedUpSoapCount[0]['count'];
                        return [4 /*yield*/, this._db.mailServiceDb("\n            select *,\n                case when due_at is null then created_at\n                     else due_at\n                end as \"date\"\n            from mail_log.notifications where \"done\" = false \n                and ( \"to\" in ( " + doctorIds + " ) or \"from\" in ( " + doctorIds + " ) )\n                and ( \"due_at\" is null or \"due_at\" < NOW() ) \n                " + ((type && type.length) ? ('and "type" = \'' + type + "'") : '') + "  \n            order by \"date\" desc\n            limit " + take + " offset " + skip + "\n        ")];
                    case 2:
                        notifications = _a.sent();
                        if (notifications && notifications.length) { }
                        else
                            return [2 /*return*/, res.send(this.build("No new notifications", 1, {
                                    "rows": [],
                                    "count": 0,
                                    "page": page,
                                    "take": take,
                                    "unread": 0,
                                    "maxPage": 1,
                                    "unfollowedUpSoapCount": unfollowedUpSoapCount,
                                }))];
                        uniqueUsers = Statics_1.StaticHelpers.getColumnFromJsonObj(notifications, "from")
                            .concat(Statics_1.StaticHelpers.getColumnFromJsonObj(notifications, "to")).join(", ");
                        return [4 /*yield*/, this._db.wpdb("select * from medi_users where ID in (" + uniqueUsers + ")")];
                    case 3:
                        uniqueUsers = _a.sent();
                        uniqueUsers = Statics_1.StaticHelpers.arrayToMappedObject(uniqueUsers, "ID");
                        notificationIds = [];
                        notifications.map(function (notification) {
                            notificationIds.push(notification.id);
                            if (uniqueUsers[notification["from"]])
                                notification["from_user"] = uniqueUsers[notification["from"]];
                            else
                                notification["from_user"] = {};
                            if (uniqueUsers[notification["to"]])
                                notification["to_user"] = uniqueUsers[notification["to"]];
                            else
                                notification["to_user"] = {};
                            notification["mine"] = req.wpUserIds.indexOf(notification["to"]) > -1;
                            // gmt to isd conversion of datetime
                            notification["created_at"] = Statics_1.StaticHelpers.gmtToIst(notification["created_at"]);
                            if (notification["meta"] && notification["meta"].trim().length)
                                notification["meta"] = Statics_1.StaticHelpers.unserialize(notification["meta"]);
                            return notification;
                        });
                        return [4 /*yield*/, this._db.mailServiceDb("\n            select count(*) as count from mail_log.notifications \n            where \n                \"read\" = false and \"done\" = false\n                and \"to\" in ( " + doctorIds + " )\n                and ( \"due_at\" is null or \"due_at\" < NOW() )\n        ")];
                    case 4:
                        unreadCount = _a.sent();
                        if (unreadCount
                            && unreadCount[0]
                            && unreadCount[0]["count"])
                            unreadCount = unreadCount[0]["count"];
                        else
                            unreadCount = 0;
                        return [4 /*yield*/, this._db.mailServiceDb("\n            select count(*) as count from mail_log.notifications \n            where \n                \"done\" = false\n                and ( \"to\" in ( " + doctorIds + " ) OR \"from\" in ( " + doctorIds + " ) )\n                and ( \"due_at\" is null or \"due_at\" < NOW() )\n        ")];
                    case 5:
                        totalCount = _a.sent();
                        if (totalCount
                            && totalCount[0]
                            && totalCount[0]["count"])
                            totalCount = totalCount[0]["count"];
                        else
                            totalCount = 0;
                        notificationIds = notificationIds.join(", ");
                        return [4 /*yield*/, this._db.mailServiceDb("\n            update mail_log.notifications \n            set \"received\" = true\n            where \n                \"received\" = false \n                and \"id\" in ( " + notificationIds + " )\n        ")];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Here youu go", 1, {
                                "rows": notifications,
                                "count": unreadCount,
                                "total": totalCount,
                                "page": page,
                                "take": take,
                                "unread": unreadCount,
                                "maxPage": Math.ceil(totalCount / take),
                                "unfollowedUpSoapCount": unfollowedUpSoapCount,
                            }))];
                }
            });
        });
    };
    NotificationsController.prototype.markRead = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, notification;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = parseInt(req.params.id);
                        return [4 /*yield*/, this._db.mailServiceDb("\n            select * from mail_log.notifications where \"id\" = " + id + "\n        ")];
                    case 1:
                        notification = _a.sent();
                        if (notification && notification[0]) { }
                        else
                            return [2 /*return*/, res.send(this.build("Invlaid notification id"))];
                        return [4 /*yield*/, this._db.mailServiceDb("\n            update mail_log.notifications set \"read\" = true where \"id\" = " + id + "\n        ")];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Marked done", 1, {
                                row: notification[0]
                            }))];
                }
            });
        });
    };
    NotificationsController.prototype.markDoneAll = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var doctorIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        doctorIds = req.wpUserIds.join(", ");
                        return [4 /*yield*/, this._db.mailServiceDb("\n            update mail_log.notifications set \"done\" = true \n            where \n                \"to\" in (" + doctorIds + ") \n                and \"done\" = false\n        ")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Marked done successfully !", 1))];
                }
            });
        });
    };
    NotificationsController.prototype.markDone = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, notification, now;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = parseInt(req.params.id);
                        return [4 /*yield*/, this._db.mailServiceDb("\n            select * from mail_log.notifications where \"id\" = " + id + "\n        ")];
                    case 1:
                        notification = _a.sent();
                        if (notification && notification[0]) {
                            notification = notification[0];
                        }
                        else
                            return [2 /*return*/, res.send(this.build("invalid notification id"))];
                        now = Statics_1.StaticHelpers.toMysql(new Date);
                        return [4 /*yield*/, this._db.mailServiceDb("\n            update mail_log.notifications set \"read\" = true, \"done\" = true, \"updated_at\" = NOW() where \"id\" = " + id + "\n        ")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._db.mailServiceDb("\n            update mail_log.notifications \n            set \n                \"read\" = true, \n                \"done\" = true,\n                \"updated_at\" = NOW()\n            where \n                \"type\" = '" + notification.type + "'\n                and \"consultation_code\" = '" + notification.consultation_code + "'\n        ")];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, res.send(this.build("Marked done successfully", 1, {
                                notification: notification
                            }))];
                }
            });
        });
    };
    NotificationsController.prototype.pmsStaffStatNotification = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var soap, previousSoap, resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Soap_1.Soap.repo().findOne({ where: { id: req.body.soap } })];
                    case 1:
                        soap = _a.sent();
                        if (!((req.body.type === "staff-followup-done") && soap)) return [3 /*break*/, 3];
                        return [4 /*yield*/, Soap_1.Soap.repo().findOne({
                                where: {
                                    created_at: typeorm_1.LessThan(soap.created_at),
                                }
                            })];
                    case 2:
                        previousSoap = _a.sent();
                        if (previousSoap) { } // then you are good to go
                        else
                            return [2 /*return*/, res.send(this.build("This is patient's first consultation. Sorry"))];
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this._request.seRequest("api/v1/notifications/pms-staff-stat-notification", {
                            "type": req.body.type,
                            "code": (soap && soap.consultation_code) ? soap.consultation_code : "test",
                        }, {
                            "token": req.headers.token
                        })];
                    case 4:
                        resp = _a.sent();
                        return [2 /*return*/, res.send(this.build("Stored successfully.", 1))];
                }
            });
        });
    };
    NotificationsController.prototype.pmsStaffStats = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._request.seRequest("api/v1/notifications/pms-staff-stats", {
                            staff: req.params.id,
                            key: this._config.getOAuthClientKey(),
                        })];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, res.send(this.build("Here you go", 1, resp))];
                }
            });
        });
    };
    return NotificationsController;
}(Router));
exports.NotificationsController = NotificationsController;
