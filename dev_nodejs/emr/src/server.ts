import { Socket } from './config/Socket';
import { app } from "./app";
import { config } from './config/Config';


export const server = app.listen(config.get('port', 4000), function () {
    console.info("Server is listening on port: " + config.get('port', 4000))
 });
//new Socket(this.app).io.listen(app_listen);
