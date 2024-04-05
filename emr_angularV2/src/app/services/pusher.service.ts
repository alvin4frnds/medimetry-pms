import {Injectable} from '@angular/core';
import {UtilityService} from './utility.service';
import {Constants} from '../Utilities/Constants';
import * as Pusher from 'pusher-js';
import {Observable} from 'rxjs';
import {forEach} from '@angular/router/src/utils/collection';


@Injectable({
    providedIn: 'root'
})
export class PusherService {

    public serviceWorker:any;
    pusher: any;
    channel: any;
    public permission: Permission;
    getPusherDetails: any;
    getCurrentUser: any;

    constructor(public _util: UtilityService) {


        this.permission = this.isSupported() ? 'default' : 'denied';

        this.getPusherDetails = this._util.getLocalData(Constants.KEY_PUSHER_DETAILS);
        this.getCurrentUser = this._util.getLocalData(Constants.KEY_CURRENT_USER);

        // if (this.getCurrentUser) {
        //
        //     this.connectToPusher();
        // }
    }

    public connectToPusher() {


        this.pusher = new Pusher(this.getPusherDetails['pusher_key'], {
            cluster: this.getPusherDetails['pusher_cluster'],
            encrypted: true
        });
        if (this.getCurrentUser['user']['type'] === 'contributor') {
            this.channel = this.pusher.subscribe('pusher-channel-' + this.getCurrentUser['user']['id']);
        } else if (this.getCurrentUser['user']['type'] === 'assistant') {

            //0 inside error so that it dont cause any problem if it dont found any doctor
            let doctors = this.getCurrentUser['meta']['doctors']?this.getCurrentUser['meta']['doctors']:[0];
            doctors.forEach(element => {
                this.channel = this.pusher.subscribe('pusher-channel-' + element.doctor_id);
            });

        }


    }

    requestPermission(): void {
        let self = this;
        if ('Notification' in window) {
            Notification.requestPermission(function (status) {
                return self.permission = status;
            });
        }

        if('serviceWorker' in navigator){
          navigator.serviceWorker.register("/ngsw-worker.js").then((registration)=>{
              // console.error("Registered service worker");
              this.serviceWorker=registration;
          }).catch(err=>{
              console.error("Error",err);
          });
        }

        window.addEventListener('notificationclick', function(event) {
            self._util.setDataToObservabla({
                type: "openNotification",
                data: event.target["data"]
            });

            window.focus();
            event["notification"].close();
        });
    }

    public isSupported(): boolean {
        return !('serviceWorker' in navigator);
    }


    generateNotification(item: Array<any>): void {
        if (!item["title"] && item["message"])
            item["title"] = item["message"];

        if (! item["title"]) item["title"] = "New notification";

        let options = {
            body: item["description"],
            icon: '../../assets/icons/Icon-128.png',
            data: item,
            silent: false,
            sticky: item["isSticky"],
            requireInteraction: item["isSticky"],
        };
        if (this.isSupported())
            this.create(item["title"], options).subscribe();
        else this.serviceWorker.showNotification(item['title'], options);
    }


    create(title: string, options ?: PushNotification): any {
        let self = this;
        return new Observable(function (obs) {
            if (!('Notification' in window)) {
                console.log('Notifications are not available in this environment');
                obs.complete();
            }
            if (self.permission !== 'granted') {
                console.log('The user hasn\'t granted you permission to send push notifications');
                obs.complete();
            }
            let _notify = new Notification(title, options);
            _notify.onshow = function (e) {
                return obs.next({
                    notification: _notify,
                    event: e
                });
            };
            _notify.onclick = function (e) {
                self._util.setDataToObservabla({
                    type: "openNotification",
                    data: e.target["data"]
                });

                window.focus();
                this.close();

                return obs.next({
                    notification: _notify,
                    event: e
                });
            };
            _notify.onerror = function (e) {
                return obs.error({
                    notification: _notify,
                    event: e
                });
            };
            _notify.onclose = function () {
                return obs.complete();
            };
        });
    }
}

export declare type Permission = 'denied' | 'granted' | 'default';

export interface PushNotification {
    body?: string;
    icon?: string;
    tag?: string;
    data?: any;
    renotify?: boolean;
    silent?: boolean;
    sound?: string;
    noscreen?: boolean;
    sticky?: boolean;
    dir?: 'auto' | 'ltr' | 'rtl';
    lang?: string;
    vibrate?: number[];
}
