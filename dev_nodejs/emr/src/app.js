"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Socket_1 = require("./config/Socket");
var express = require("express");
var DatabaseConfiguration_1 = require("./config/DatabaseConfiguration");
var bodyParser = require("body-parser");
var fileUpload = require("express-fileupload");
// Controllers
var HistoryController_1 = require("./controllers/HistoryController");
var AuthController_1 = require("./controllers/AuthController");
var ConsultationsController_1 = require("./controllers/ConsultationsController");
var SoapController_1 = require("./controllers/SoapController");
var AffiliateController_1 = require("./controllers/AffiliateController");
var MedicalRecordsController_1 = require("./controllers/MedicalRecordsController");
var NotificationsController_1 = require("./controllers/NotificationsController");
var TestController_1 = require("./controllers/TestController");
var AngularRoutesController_1 = require("./controllers/AngularRoutesController");
var UniqueRequestId_1 = require("./controllers/middlewares/UniqueRequestId");
var GenerateHistoryController_1 = require("./controllers/GenerateHistoryController");
var App = /** @class */ (function () {
    function App() {
        this.app = express();
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(fileUpload());
        this.app.use(UniqueRequestId_1.UniqueRequestId);
        /**
         * For Later Usage. like angular file serving.
         */
        this.app.use("/assets", express.static('./src/public/assets'));
        this.app.use("/api/files", express.static('./src/public/api/files'));
        this.app.use("/", express.static('../../emr_angularV2/dist/MedEmr'));
        this.db = DatabaseConfiguration_1.db;
        new HistoryController_1.HistoryController("/api/v1/history", this.app);
        new AuthController_1.AuthController("/api/v1/auth", this.app);
        new SoapController_1.SoapController("/api/v1/soap", this.app);
        new ConsultationsController_1.ConsultationsController("/api/v1/consultations", this.app);
        new MedicalRecordsController_1.MedicalRecordsController("/api/v1/records", this.app);
        new AffiliateController_1.AffiliateController('/api/v1/affiliate', this.app);
        new NotificationsController_1.NotificationsController('/api/v1/notifications', this.app);
        new GenerateHistoryController_1.GenerateHistoryController('/api/v1/patient-history', this.app);
        new TestController_1.TestController("/api/test", this.app);
        new AngularRoutesController_1.AngularRoutesController("/", this.app);
        new Socket_1.Socket(this.app);
        App.otherBootingStuff();
        // debug.log('hello world', 1, {hello: "world"});
    }
    App.otherBootingStuff = function () {
        // require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
        // const _ = uploader.upload(__dirname + '/public/emptyfile.txt');
    };
    return App;
}());
exports.app = new App().app;
