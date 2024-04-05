import { config } from './Config';
const aws = require('aws-sdk');
const multer = require("multer");

export class SQSService {

    private _config;
    private _sqs;
    private _queueUrl;

    constructor() {
        this._config = config;
        this._queueUrl = this._config.get('AWS_SQS_URL', "");

        aws.config.update({
            accessKeyId: this._config.get("AWS_S3_KEY"),
            secretAccessKey: this._config.get("AWS_S3_SECRET"),
            "region": this._config.get("AWS_S3_REGION")
        });

        this._sqs = new aws.SQS();
    }

    public send(url, body, headers = {}) {
        if (!this._queueUrl || !this._queueUrl.length) return false;

        const params = {
            MessageBody: JSON.stringify({ url, body, headers })
        }
    }
}

export const queueService = new SQSService();