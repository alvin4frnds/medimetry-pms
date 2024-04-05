"use strict";
import { config, Config } from '../config/Config';
import { S3Uploader, uploader } from '../config/S3';
import { debug } from '../helpers/Debug';
import { ExportDb } from '../commands/ExportDb';
const Router = require('./Router');
const fs = require('fs');
const AWS = require('aws-sdk');

export class TestController extends Router {
    private _config: Config;
    private _s3: S3Uploader;

    constructor(routePath,app) {
        super(routePath, app);

        this._config = config;
        this._s3 = uploader;
    }

    get services() {
        return {
            '/1': 'firstTest',
            'POST /log/:env/:level': 'debugLog',
            '/generate-db-backup/:key': 'generateDbBackup',
            'POST /upload': 'uploadFile',
        };
    }

    async firstTest(req, res, next) {
        // do something

        return res.send("This test is passing.");
    }

    async uploadFile(req, res) {
        const resp = await this._s3.upload("emptyfile.txt");

        return res.send(this.build("success", 1, {resp}));
    }

    async generateDbBackup(req, res) {
        const expDB = new ExportDb();

        if (req.params.key === this._config.getOAuthClientKey()) {
            await expDB.handle();
            return res.send("Backups Created");
        }

        return res.send("Invalid Key");
    }

    async debugLog(req, res) {
        debug.verboseLog(req.params.env, req.params.level, req.params.level == -1, req.body);
        
        res.send(this.build("done", 1));
    }
}