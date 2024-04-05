"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Config_1 = require("./Config");
var Statics_1 = require("../helpers/Statics");
var AWS = require('aws-sdk');
var fs = require('fs');
var path = require('path');
var uuidv1 = require('uuid/v1');
var multer = require("multer");
var multers3 = require("multer-s3");
var uuid = require("uuid");
var shell = require('shelljs');
var S3Uploader = /** @class */ (function () {
    function S3Uploader() {
        this._config = Config_1.config;
        this._bucket = this._config.get("AWS_S3_BUCKET");
        AWS.config.update({
            accessKeyId: this._config.get("AWS_S3_KEY"),
            secretAccessKey: this._config.get("AWS_S3_SECRET"),
            "region": this._config.get("AWS_S3_REGION")
        });
        this._saveOffline = this._config.get('shadowSave');
    }
    S3Uploader.getFileName = function (filename) {
        if (filename === void 0) { filename = ".txt"; }
        var date = new Date();
        var extn = "";
        if (filename)
            extn = filename.split('.').pop();
        return "emr/" + date.getFullYear() + "/"
            + Statics_1.StaticHelpers.twoDigits(date.getMonth() + 1) + "/"
            + Statics_1.StaticHelpers.twoDigits(date.getDate()) + "/"
            + uuidv1() + "." + extn;
    };
    S3Uploader.prototype.uploadFromData = function (fileObject) {
        var params = this.baseParams(fileObject.name);
        var _this = this;
        return new Promise((function (resolve, reject) {
            params.Body = fileObject.data;
            if (_this._config.get("shadowSave")) {
                _this.uploadLocally(params, resolve, reject);
            }
            else {
                var s3 = new AWS.S3();
                s3.upload(params, function (err, resp) {
                    if (err) {
                        console.error("Uploading file: ", err);
                        reject(err);
                    }
                    resolve(S3Uploader.urlFromS3Resp(resp));
                });
            }
        }));
    };
    S3Uploader.prototype.upload = function (filePath) {
        var params = this.baseParams(filePath);
        var filepath = (filePath.charAt(0) === "/")
            ? filePath
            : this._config._dir.public + filePath;
        var _this = this;
        return new Promise(function (resolve, reject) {
            fs.readFile(filepath, function (err, body) {
                if (err) {
                    console.error("Uploading file: ", err);
                    reject(err);
                }
                params.Body = body;
                if (_this._config.get("shadowSave")) {
                    _this.uploadLocally(params, resolve, reject);
                }
                else {
                    var s3 = new AWS.S3();
                    s3.upload(params, function (err, resp) {
                        if (err) {
                            console.error("Uploading file: ", err);
                            reject(err);
                        }
                        resolve(S3Uploader.urlFromS3Resp(resp));
                    });
                }
            });
        });
    };
    S3Uploader.prototype.baseParams = function (filePath) {
        return {
            ACL: S3Uploader.ACL,
            Bucket: this._bucket,
            Key: S3Uploader.getFileName(filePath),
            Body: null
        };
    };
    S3Uploader.urlFromS3Resp = function (resp) {
        return "https://" + resp.Bucket + "/" + resp.Key;
    };
    S3Uploader.prototype.uploadLocally = function (params, resolve, reject) {
        // console.log("Params: ", params, __dirname);
        // /Users/praveen/Desktop/code/MedimetryDev/dev_nodejs/emr/src/config
        var dir = __dirname.replace("config", "public/api/files/" + params.Key.replace(/[a-z0-9.-]+$/g, ""));
        var fil = __dirname.replace("config", "public/api/files/" + params.Key);
        if (!shell.test('-e', dir))
            shell.mkdir("-p", dir);
        var _this = this;
        fs.writeFile(fil, params.Body, function (err) {
            if (err) {
                console.error("Error saving file: ", err);
                reject(err);
            }
            var path = "http://" + _this._config.get('host', "localhost") + ":" + _this._config.get('port', 4000) + "/api/files/" + params.Key;
            console.log("Path to file: ", path);
            resolve(path);
        });
    };
    S3Uploader.ACL = "public-read";
    S3Uploader.UTF8 = "utf8";
    return S3Uploader;
}());
exports.S3Uploader = S3Uploader;
exports.uploader = new S3Uploader();
