import { config } from './Config';
import { StaticHelpers } from '../helpers/Statics';
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const uuidv1 = require('uuid/v1');
const multer = require("multer");
const multers3 = require("multer-s3");
const uuid = require("uuid");
const shell = require('shelljs');

export class S3Uploader {

    private _config;
    private _bucket;
    private _saveOffline;

    public static readonly ACL = "public-read";
    public static readonly UTF8 = "utf8";

    constructor() {
        this._config = config;

        this._bucket = this._config.get("AWS_S3_BUCKET");
        AWS.config.update({
            accessKeyId: this._config.get("AWS_S3_KEY"),
            secretAccessKey: this._config.get("AWS_S3_SECRET"),
            "region": this._config.get("AWS_S3_REGION")
        });

        this._saveOffline = this._config.get('shadowSave');
    }

    private static getFileName(filename = ".txt") {
        const date = new Date();

        let extn = "";
        if (filename) extn = filename.split('.').pop();

        return "emr/" + date.getFullYear() + "/"
            + StaticHelpers.twoDigits(date.getMonth() + 1) + "/"
            + StaticHelpers.twoDigits(date.getDate()) + "/"
            + uuidv1() + "." + extn;
    }

    public uploadFromData(fileObject) {
        let params = this.baseParams(fileObject.name);

        const _this = this;
        return new Promise((function (resolve, reject) {
            params.Body = fileObject.data;

            if (_this._config.get("shadowSave")) {
                _this.uploadLocally(params, resolve, reject);
            } else {
                const s3 = new AWS.S3();

                s3.upload(params, function (err, resp) {
                    if (err) {
                        console.error("Uploading file: ", err);
                        reject(err);
                    }

                    resolve(S3Uploader.urlFromS3Resp(resp));
                });
            }
        }))
    }

    public upload(filePath) {
        let params = this.baseParams(filePath);
        const filepath = (filePath.charAt(0) === "/")
            ? filePath
            : this._config._dir.public + filePath;

        const _this = this;
        return new Promise(function (resolve, reject) {
            fs.readFile(filepath, function (err, body) {
                if (err) {
                    console.error("Uploading file: ", err);
                    reject(err);
                }

                params.Body = body;

                if (_this._config.get("shadowSave")) {
                    _this.uploadLocally(params, resolve, reject);
                } else {
                    const s3 = new AWS.S3();

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
    }

    private baseParams(filePath) {
        return {
            ACL: S3Uploader.ACL,
            Bucket: this._bucket,
            Key: S3Uploader.getFileName(filePath),
            Body: null
        };
    }

    private static urlFromS3Resp(resp) {
        return "https://" + resp.Bucket + "/" + resp.Key;
    }

    private uploadLocally(params, resolve, reject) {
        // console.log("Params: ", params, __dirname);
        // /Users/praveen/Desktop/code/MedimetryDev/dev_nodejs/emr/src/config

        const dir = __dirname.replace("config", "public/api/files/" + params.Key.replace(/[a-z0-9.-]+$/g, ""));
        const fil = __dirname.replace("config", "public/api/files/" + params.Key);

        if (!shell.test('-e', dir)) shell.mkdir("-p", dir);

        const _this = this;
        fs.writeFile(fil, params.Body, function (err) {
            if (err) {
                console.error("Error saving file: ", err);
                reject(err);
            }

            const path = "http://" + _this._config.get('host', "localhost") + ":" + _this._config.get('port', 4000) + "/api/files/" + params.Key;
            console.log("Path to file: ", path);
            resolve(path);
        });
    }
}

export const uploader = new S3Uploader();