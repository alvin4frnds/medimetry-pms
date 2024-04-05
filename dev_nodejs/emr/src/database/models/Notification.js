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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var typeorm_1 = require("typeorm");
var DatabaseConfiguration_1 = require("../../config/DatabaseConfiguration");
var Notification = /** @class */ (function () {
    function Notification() {
    }
    /**
     * // FIXME: This doesn't work, don't use and assume it to work.
     * @param {[type]} ) { return new NotificationsRepository( [description]
     */
    Notification.repo = function () { return new NotificationsRepository(); };
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Notification.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "255" }),
        __metadata("design:type", String)
    ], Notification.prototype, "center_code", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Notification.prototype, "from", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], Notification.prototype, "to", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "32" }),
        __metadata("design:type", String)
    ], Notification.prototype, "consultation_code", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "255" }),
        __metadata("design:type", String)
    ], Notification.prototype, "title", void 0);
    __decorate([
        typeorm_1.Column({ type: "text" }),
        __metadata("design:type", String)
    ], Notification.prototype, "description", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "48" }),
        __metadata("design:type", String)
    ], Notification.prototype, "type", void 0);
    __decorate([
        typeorm_1.Column({ type: "text" }),
        __metadata("design:type", String)
    ], Notification.prototype, "meta", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Boolean)
    ], Notification.prototype, "done", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Boolean)
    ], Notification.prototype, "read", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Boolean)
    ], Notification.prototype, "received", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp" }),
        __metadata("design:type", Date)
    ], Notification.prototype, "due_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], Notification.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], Notification.prototype, "updated_at", void 0);
    Notification = __decorate([
        typeorm_1.Entity({
            database: DatabaseConfiguration_1.db.getConfigs('logs').database,
            schema: DatabaseConfiguration_1.db.getConfigs('logs').schema,
            name: "notifications",
            synchronize: false
        })
    ], Notification);
    return Notification;
}());
exports.Notification = Notification;
var NotificationsRepository = /** @class */ (function (_super) {
    __extends(NotificationsRepository, _super);
    function NotificationsRepository() {
        var _this = _super.call(this) || this;
        return _this;
    }
    NotificationsRepository = __decorate([
        typeorm_1.EntityRepository(Notification),
        __metadata("design:paramtypes", [])
    ], NotificationsRepository);
    return NotificationsRepository;
}(typeorm_1.Repository));
exports.NotificationsRepository = NotificationsRepository;
