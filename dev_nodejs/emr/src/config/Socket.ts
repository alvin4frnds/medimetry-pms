import { server } from './../server';
import { getConnection } from 'typeorm';
import { Debug, debug } from './../helpers/Debug';
import * as socketIo from 'socket.io';
import { Server, createServer } from 'http';
import * as fs from 'fs';
import { db } from './DatabaseConfiguration';
import { User } from '../database/models/User';
import { Config } from './Config';

export class Socket {
    server: Server;
    io: SocketIO.Server;
    debug: any;
    db: any;
    user_tokens = [];
    config;

    constructor(private app) {
        this.debug = debug;
        this.db = db;
        this.config = Config;
        this.createServer();
        this.initSocket();
        this.connect();

    }

    createServer() {
        this.server = createServer(this.app);
    }
    initSocket() {
        this.io = socketIo(this.server);
        setTimeout(() => {
            this.io.listen(server);
        }, 2000);
    }

    connect() {
        this.io.on('connection', (socket: any) => {
            socket.on('authentication', (token: any) => {
                this.isUserAuthenticated(token).then(result => {
                    if (result) {
                        if (this.user_tokens.length > 1000) {
                            this.user_tokens.unshift();
                        }
                        this.user_tokens.push(token);
                        socket.emit('token_info', { 'success': 1, 'message': 'Token Authenticated' });
                    }
                    else {
                        socket.emit('token_info', { 'success': 0, 'message': 'Token is unauthenticated' });
                    }
                });
            });
            socket.on('write_log', (message: any) => {

                if (message.token && this.isUserTokenExists(message.token)) {
                    this.debug.verboseLog(message.client, message.level, message.level == -1, message.body);
                }
            });
        })
    }
    async isUserAuthenticated(token) {
        const user = await User.getRepo().createQueryBuilder("user")
            .where("user.access_token = :token")
            .setParameters({ token: token })
            .orderBy("user.id", "DESC")
            .getOne();

        if (typeof user === 'undefined' || !user) return false;

        return true;
    }
    isUserTokenExists(token) {
        return this.user_tokens.indexOf(token) > -1;
    }
}