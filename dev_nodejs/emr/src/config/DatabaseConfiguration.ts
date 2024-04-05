import { createConnections, getConnection } from "typeorm";
import { StaticHelpers } from '../helpers/Statics';

export class DatabaseConfiguration {
    private _connections = [];
    private _defaultConn;
    private _wpdbConn;
    private _serviceDbConn;
    private _ormConfig;

    constructor() {
        this._ormConfig = require('../../ormconfig.json');

        createConnections(this._ormConfig).then(async connections => {
            this._connections = connections;
            this._defaultConn = connections[0];
            this._wpdbConn = connections[1];
            this._serviceDbConn = connections[2];
            console.debug("TypeORM: successfully connected.", connections[0].isConnected);

            // await this.postConnectionStuff();
        }).catch(error => console.debug("TypeORM connection error: ", error));
    }

    public connection(name = '') {
        if (this._defaultConn) return this._defaultConn;

        if (this._connections.length) return this._connections[0];

        return getConnection(name || "default");
    }

    public async wpdb(query) {
        if (!this._wpdbConn) this._wpdbConn = getConnection("medi");

        const result = await this._wpdbConn.query(query);
        return JSON.parse(JSON.stringify(result));
    }

    public async mailServiceDb(query) {

        const result = await this.mailServiceConn().query(query);
        return JSON.parse(JSON.stringify(result));
    }

    public mailServiceConn() {
        if (!this._serviceDbConn) this._serviceDbConn = getConnection("logs");
        return this._serviceDbConn;
    }

    public async wpdbGetColumn(query, colname) {
        const results = await this.wpdb(query);

        return StaticHelpers.getColumnFromJsonObj(results, colname);
    }

    public getConfigs (name = null) {
        let configs = {};

        this._ormConfig.forEach( (config) => {
            configs[config.name] = config;
        });

        if (! name) return configs;

        if (configs[name]) return configs[name];

        return false;
    }

    public async disconnect() {
        await this._connections.forEach(async connection => await connection.disconnect());
    }

    private async postConnectionStuff () {
        const responses = [];

        responses.push(await this._defaultConn.query('delete from consultations_status where id in ' +
            '(select min(id) from consultations_status group by consultation_code ' +
            'having count(consultation_code) > 1 )'));

        // console.log("Post Connection stuff: ", responses);
    }
}

export const db = new DatabaseConfiguration();

