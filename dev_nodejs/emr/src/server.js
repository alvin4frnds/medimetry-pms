"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("./app");
var Config_1 = require("./config/Config");
exports.server = app_1.app.listen(Config_1.config.get('port', 4000), function () {
    console.info("Server is listening on port: " + Config_1.config.get('port', 4000));
});
//new Socket(this.app).io.listen(app_listen);
