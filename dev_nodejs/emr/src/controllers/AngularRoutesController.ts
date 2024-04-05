"use strict";
const Router = require('./Router');
const fs = require('fs');

export class AngularRoutesController extends Router {

    constructor(routePath,app) {
        super(routePath, app);

        app.use(this.indexHtmlFile);
    }

    get services() {
        return {
            '/:path': 'indexHtmlFile',
        };
    }

    async indexHtmlFile(req, res) {
        if (req.path.split("/").length > 2) return; // only for single-page routes

        console.log("Returning index file: ", req.path, __dirname);

        const pathToServe = __dirname.replace("dev_nodejs/emr/src/controllers", "emr_angularV2/dist/MedEmr/index.html");
        return res.sendFile(pathToServe);
    }
}