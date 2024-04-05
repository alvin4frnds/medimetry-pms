"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Config_1 = require("./Config");
var aws = require('aws-sdk');
var multer = require("multer");
var SQSService = /** @class */ (function () {
    function SQSService() {
        this._config = Config_1.config;
        this._queueUrl = this._config.get('AWS_SQS_URL', "");
        aws.config.update({
            accessKeyId: this._config.get("AWS_S3_KEY"),
            secretAccessKey: this._config.get("AWS_S3_SECRET"),
            "region": this._config.get("AWS_S3_REGION")
        });
        this._sqs = new aws.SQS();
    }
    SQSService.prototype.send = function (url, body, headers) {
        if (headers === void 0) { headers = {}; }
        if (!this._queueUrl || !this._queueUrl.length)
            return false;
        var params = {
            MessageBody: JSON.stringify({ url: url, body: body, headers: headers })
        };
    };
    return SQSService;
}());
exports.SQSService = SQSService;
exports.queueService = new SQSService();
