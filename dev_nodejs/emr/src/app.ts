import { Socket } from './config/Socket';
import * as express from 'express';
import { db } from "./config/DatabaseConfiguration";
import * as bodyParser from "body-parser";
import * as fileUpload from "express-fileupload";

// Controllers
import { HistoryController } from './controllers/HistoryController';
import { AuthController } from './controllers/AuthController';
import { ConsultationsController } from './controllers/ConsultationsController';
import { SoapController } from "./controllers/SoapController";
import { AffiliateController } from "./controllers/AffiliateController";
import { MedicalRecordsController } from "./controllers/MedicalRecordsController";
import { NotificationsController } from "./controllers/NotificationsController";
import { TestController } from './controllers/TestController';
import { AngularRoutesController } from './controllers/AngularRoutesController';
import { UniqueRequestId } from './controllers/middlewares/UniqueRequestId';
import { Debug, debug } from './helpers/Debug';
import { config } from './config/Config';
import { GenerateHistoryController } from './controllers/GenerateHistoryController';


class App {
    app;
    db;
    server_instance;
    constructor() {
        this.app = express();
        this.app.use(bodyParser.json({limit: '50mb'}));
        this.app.use(fileUpload());
        this.app.use(UniqueRequestId);

        /**
         * For Later Usage. like angular file serving.
         */
        this.app.use("/assets", express.static('./src/public/assets'));
        this.app.use("/api/files", express.static('./src/public/api/files'));
        this.app.use("/", express.static('../../emr_angularV2/dist/MedEmr'));

        this.db = db;

        new HistoryController("/api/v1/history", this.app);
        new AuthController("/api/v1/auth", this.app);
        new SoapController("/api/v1/soap", this.app);
        new ConsultationsController("/api/v1/consultations", this.app);
        new MedicalRecordsController("/api/v1/records", this.app);
        new AffiliateController('/api/v1/affiliate', this.app);
        new NotificationsController('/api/v1/notifications', this.app);
        new GenerateHistoryController('/api/v1/patient-history', this.app);

        new TestController("/api/test", this.app);
        new AngularRoutesController("/", this.app);
        new Socket(this.app);

        App.otherBootingStuff();

        // debug.log('hello world', 1, {hello: "world"});
    }

    private static otherBootingStuff() {
        // require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();

        // const _ = uploader.upload(__dirname + '/public/emptyfile.txt');
    }
 
}


export const app = new App().app;