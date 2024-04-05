import {AfterViewInit, Component, NgZone, OnInit} from '@angular/core';
import {UtilityService} from '../services/utility.service';
import {RestService} from '../services/rest.service';
import {Constants} from '../Utilities/Constants';
import {Router} from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, AfterViewInit {

  notifications = [];
  loading = true;
  page = 1;
  unreadCount = 0;
  maxPages = 1;
  take = 20;
  notificationTypes = [];
  selectedNotification: any;

  constructor(
    public _util: UtilityService,
    private _rest: RestService,
    private _route: Router,
    private ngZone: NgZone
  ) {
  }

  ngOnInit() {
    this._util.getDataProviders().subscribe(result => {
      if (result.type === 'refreshNotificationsListing') {
        this.fetchNotifications();
      }

      if (result.type === 'openNotification') {
        this.openNotification(result.data);
      }
    });
    this.notificationTypes = this._util.notification_types;
    this.selectedNotification = {
      'name': 'All Notification',
      'type': ''
    };

  }

  ngAfterViewInit(): void {
    this.fetchNotifications();

  }

  fetchNotifications(pageNo = 1) {
    this.page = pageNo;

    this._rest.getNotifications(this.page, this.selectedNotification.type)
      .subscribe(resp => {
        if (!resp.success) {
          return;
        }

        let uniqueNotifications = [];
        const beforeNotificationsCount = this.notifications.length;

        this.notifications = (this.page === 1 ? [] : this.notifications).concat(
          resp.rows.map(notif => {
            notif['date'] = new Date(notif['date']);

            return notif;
        })).filter( notification => {
          // for now disabling the uniqueness, but it can be done anytime
          // return true;

          const notificationName = notification['type'] + '-' + notification['consultation_code'];

          if (uniqueNotifications.indexOf(notificationName) > -1) return false;

          uniqueNotifications.push(notificationName);
          return true;
        });

        this.unreadCount = parseInt(resp.unread);
        this.maxPages = resp.maxPage;
        this.take = resp.take;
        this.page = resp.page;
        this.loading = false;

        this._util.setDataToObservabla({
          type: 'updateNotificationsCountBadge',
          data: this.unreadCount
        });

        this._util.setDataToObservabla({
            type: "updateUnFollowupedCountBadge",
            data: resp['unfollowedUpSoapCount'],
        });

        if ((resp.maxPage > resp.page) && (this.notifications.length < resp.take))
          this.fetchNotifications(this.page + 1);
        else if ((beforeNotificationsCount === this.notifications.length) && resp.rows.length)
          this.fetchNotifications(this.page + 1);
      });
  }

  public handleOpeningAppointmentNotification(notification) {
    console.log("handleOpeningAppointmentNotification: ", notification);

    if ( notification["meta"] && notification["meta"]["consultation"] 
        && notification["meta"]["consultation"]["schedule"]) {} 
     else return false;

   const scheduleTime = moment(notification.meta.consultation.schedule);
   console.log(scheduleTime, notification.meta.consultation.schedule);

    this._util.setDataToObservabla({ type: "open-calendar-for-date", data: scheduleTime, });
    this._util.setDataToObservabla({ type: "appointment-date-updated", data: scheduleTime, });
    this._util.setDataToObservabla({ type: "select-calendar-date", data: scheduleTime, });
    this._util.setDataToObservabla({ type: "openAppointmentDetailsForCode", data: notification["consultation_code"], });
  }

  public openNotification(notification) {
    if ( ! notification.read) this.markRead(notification);

    this._util.setDataToObservabla({
      'type': 'hideSearchLayout',
      'data': true
    });

    if ( notification.type === "pms-patientappointmentrequest")
      return this.handleOpeningAppointmentNotification(notification);

    this._rest.getConsultationListByCode(notification['consultation_code'])
      .subscribe(resp => {
        if (resp.success && resp.rows && resp.rows.length) {
          const consultation = resp.rows[0];
          
          //noinspection JSIgnoredPromiseFromCall

          this.ngZone.run(() => this._route.navigate([Constants.NAVIGATION_URL.dashboard])).then();

          this._util.setDataToObservabla({
            'type': 'showSoapFromNotifcation',
            'data': consultation,
          });
        }

      });

    this._util.setDataToObservabla({
      'type': 'hideRightSidebar',
      'data': true
    });
  }

  private decreaseCounter(notification) {
    if (notification.read === false) {
      this.unreadCount--;
      this._util.setDataToObservabla({
        type: 'updateNotificationsCountBadge',
        data: this.unreadCount
      });
    }
  }

  public markRead(notification) {
    if (!notification.mine) {
      return;
    }

    this.decreaseCounter(notification);

    notification.read = true;
    this._rest.markRead(notification.id)
      .subscribe(resp => {
      });
  }

  public markDone(notification) {
    this.decreaseCounter(notification);

    notification.done = true;
    let index = -1;
    this.notifications.forEach((row, i) => {
      if (row.id === notification.id) {
        index = i;
      }
    });

    this._rest.markDone(notification.id)
      .subscribe(resp => {
        if (index > -1 && resp.success) {
          this.notifications.splice(index, 1);
        }
      });
  }

  public markAllDone() {
    this.notifications = [];

    this._util.setDataToObservabla({
      type: 'updateNotificationsCountBadge',
      data: this.unreadCount
    });

    this._rest.markAllDone()
      .subscribe(resp => {
      });
    setTimeout(() => {
      this.fetchNotifications();
    }, 1000);
  }

  public onScrollMore() {
    console.log('onscrollmore function called: ');
    this.fetchNotifications(this.page + 1);
  }

  public filterNotifications(value = '', name = 'All Notifications') {

    console.log('selected notification type:' + value);
    this.selectedNotification.type = value;
    this.selectedNotification.name = name;
    this.fetchNotifications();
  }
}
