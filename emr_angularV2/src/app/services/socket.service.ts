import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { observable, Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket;

    constructor() {
    }


    public connect_io() {
        this.socket = io('/');
    }

    send_message(type, message) {
        try {
            if (this.socket) {
                this.socket.emit(type, message);
            }
        } catch (err) {
            console.error('Getting error', err);
        }
    }

    public onMessage(): Observable<any> {
        return Observable.create((observer) => {
            try {
                if (this.socket) {
                    this.socket.on('token_info', (message) => {
                        observer.next(message);
                    });
                }
            } catch (err) {
                console.error("Received error, while receiving socket event: ", err);
            }
        });
    }

}
