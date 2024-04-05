"use strict";
import { config } from '../config/Config';

class Router {
    protected app;
    protected routePath;
    protected _routes;
    private _config;
    private _shadowSaveBit;
    private _req;

    // Constructor takes:
    // - routePath which is the base path for each service exposed by the router subclass (ie. '/auth/users')
    // - app which is the Express application ref
    constructor(routePath ,app) {
        if (app == null) throw new Error("Missing required App");

        this.app = app;
        this.routePath = routePath;
        this._config = config;
        this._routes = [];

        if (this.routePath) this.registerServices();

        this._shadowSaveBit = this._config.get('shadowSave', false);
    }

    // Computed services property is the only property you must overwrite in your
    // Router subclass. Base implementation does nothing but here you should
    // return a dictionary where:
    // - the key is the HTTP_METHOD + PATH of the service (ie. 'POST login/fb/:token')
    //   the path is the same you should set with a classic route register with express.
    // - the value is the name of the function you should call (you must implement it in your subclass).
    get services() { return {}; }

    private preMiddlewares() { return []; }
    private postMiddlewares() { return []; }

    // registerRoutes function simply iterate over services property getting the verb, the path
    // and the function and register it along with the base path of the route.
    registerServices() {
        if ( this.preMiddlewares().length) {
            const middlewares = this.preMiddlewares();

            for (let i = 0; i < middlewares.length; i ++) {
                this.app.use(this.routePath, middlewares[i]);
            }
        }

        const router_services = this.services;
        Object.keys(router_services).forEach( async full_path => {
            // This is the name of the JS function which implement the service's logic
            const service_function = router_services[full_path];
            const path_items = full_path.split(' ');
            const verb = (path_items.length > 1 ? path_items[0] : 'get').toLowerCase();
            const path = this.routePath + (path_items.length > 1 ? path_items[1] : full_path);

            if (this.postMiddlewares().length) {
                this.app[verb](path, async (req, res, next) => {
                    this._req = req;
                    await this[service_function](req, res, next);
                    next();
                });

            } else {
                this.app[verb](path, this[service_function].bind(this));
            }
        });

        if ( this.postMiddlewares().length) {
            const middlewares = this.postMiddlewares();

            for (let i = 0; i < middlewares.length; i ++) {
                this.app.use(this.routePath, middlewares[i]);
            }
        }
    }

    protected build (message , success = 0, more = {}) {
        let response = { message, success };

        for ( const key in more )
            if (more.hasOwnProperty(key))
                response[key] = more[key];

        // will only be executed on controllers having, postMiddlewares
        // i.e. Middlewares that work once the response is sent to client end.
        if (this._shadowSaveBit && this._req && (this._req.method != "GET")) {

            // if there are more than 3 arguments, hopefullt it is request id
            let requestId = false;
            try {
                requestId = arguments.length > 3
                    ? arguments[arguments.length - 1].headers["id"]
                    : this._req.headers["id"];
            } catch(e) {
                console.error("Found error: ", e);
            }

            this._config.lastResponse(requestId || this._req.headers["id"], response);
        }

        return response;
    }
}

module.exports = Router;