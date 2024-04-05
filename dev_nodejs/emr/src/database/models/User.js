"use strict";
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
var User = /** @class */ (function () {
    function User() {
        this.meta = JSON.parse("{}");
    }
    User_1 = User;
    User.newFromHttpResp = function (httpResp) {
        if (JSON.stringify(httpResp.meta) === "[]")
            httpResp.meta = {};
        var user = new User_1;
        user.user_id = httpResp.user.id;
        user.name = httpResp.user.name;
        user.email = httpResp.user.email;
        user.encrypted = httpResp.user.encrypted;
        user.mobile = httpResp.user.mobile;
        user.pic = httpResp.user.pic;
        user.referral = httpResp.user.referral;
        user.refresh_token = httpResp.refresh_token;
        user.access_token = httpResp.access_token;
        user.user_type = httpResp.user.type;
        user.meta = httpResp.meta || JSON.parse("{}");
        user.created_at = httpResp.created_at;
        user.updated_at = httpResp.updated_at;
        if (httpResp.user)
            user.meta["user"] = httpResp.user;
        return user;
    };
    User.getRepo = function () { return typeorm_1.getRepository(User_1); };
    User.repo = function () { return User_1.getRepo(); };
    User.prototype.getDoctorIds = function () {
        if (this.user_type !== "assistant")
            return [];
        var doctorIds = [];
        this.meta["doctors"].forEach(function (doctor) {
            doctorIds.push(doctor.doctor_id);
        });
        return doctorIds;
    };
    var User_1;
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], User.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "150" }),
        __metadata("design:type", String)
    ], User.prototype, "access_token", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "80" }),
        __metadata("design:type", String)
    ], User.prototype, "refresh_token", void 0);
    __decorate([
        typeorm_1.Column({ type: "int" }),
        __metadata("design:type", Number)
    ], User.prototype, "user_id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "20" }),
        __metadata("design:type", String)
    ], User.prototype, "user_type", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "40" }),
        __metadata("design:type", String)
    ], User.prototype, "encrypted", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "80" }),
        __metadata("design:type", String)
    ], User.prototype, "name", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "80" }),
        __metadata("design:type", String)
    ], User.prototype, "mobile", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "80" }),
        __metadata("design:type", String)
    ], User.prototype, "email", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "10" }),
        __metadata("design:type", String)
    ], User.prototype, "referral", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: "255" }),
        __metadata("design:type", String)
    ], User.prototype, "pic", void 0);
    __decorate([
        typeorm_1.Column({ type: "jsonb" }),
        __metadata("design:type", Object)
    ], User.prototype, "meta", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; } }),
        __metadata("design:type", Date)
    ], User.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "timestamp", "default": function () { return "CURRENT_TIMESTAMP"; }, onUpdate: "CURRENT_TIMESTAMP" }),
        __metadata("design:type", Date)
    ], User.prototype, "updated_at", void 0);
    User = User_1 = __decorate([
        typeorm_1.Entity("users")
    ], User);
    return User;
}());
exports.User = User;
