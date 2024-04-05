"use strict";
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import { StaticHelpers } from '../helpers/Statics';
import { db } from '../config/DatabaseConfiguration';
import { Notification } from '../database/models/Notification';
import { Soap } from '../database/models/Soap';
import { HttpRequest } from '../helpers/HttpRequest';
import { LessThan } from 'typeorm';
import { config } from '../config/Config'


const Router = require('./Router');

export class NotificationsController extends Router {

    private _db;
    private _request: HttpRequest;
    private _config;

    constructor(routePath, app) {
        super(routePath, app);

        this._db = db;
        this._request = new HttpRequest();
        this._config = config;
    }

    get services() {
        return {
            '/listing/:page?': 'listing',
            '/mark-read/:id': 'markRead',
            '/mark-done/:id': 'markDone',
            '/mark-done-all/': 'markDoneAll',
            'POST /pms-staff-stat-notification': "pmsStaffStatNotification",
            '/pms-staff-stats/:id': "pmsStaffStats",
        };
    }

    private preMiddlewares() { return [ AuthMiddleware ]; }

    public async listing(req, res) {
        const page = parseInt(req.params.page) || 1;
        const type = req.query.type || "";

        console.log("Page & type: ", page, type);

        const take = 30; const skip = (page - 1) * take;

        const doctorIds = req.wpUserIds.join(", ");
        const now = StaticHelpers.toMysql(new Date);

        let thirtyDaysBefore = new Date();
        thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);

        let unfollowedUpSoapCount = await Soap.repo()
            .query(`SELECT COUNT(*) as count FROM "public"."soaps" "Soap" WHERE follow_up IS NULL AND active = true AND created_at > '${StaticHelpers.toMysql(thirtyDaysBefore)}'`);
        if (unfollowedUpSoapCount && unfollowedUpSoapCount[0] && unfollowedUpSoapCount[0]['count'])
            unfollowedUpSoapCount = unfollowedUpSoapCount[0]['count'];

        let notifications = await this._db.mailServiceDb(`
            select *,
                case when due_at is null then created_at
                     else due_at
                end as "date"
            from mail_log.notifications where "done" = false 
                and ( "to" in ( ${doctorIds} ) or "from" in ( ${doctorIds} ) )
                and ( "due_at" is null or "due_at" < NOW() ) 
                ${(type && type.length) ? ('and "type" = \'' + type + "'") : ''}  
            order by "date" desc
            limit ${take} offset ${skip}
        `);

        if (notifications && notifications.length) {}
        else return res.send(this.build("No new notifications", 1, {
            "rows": [],
            "count": 0,
            "page": page,
            "take": take,
            "unread": 0,
            "maxPage": 1,
            "unfollowedUpSoapCount": unfollowedUpSoapCount,
        }));

        let uniqueUsers:any = StaticHelpers.getColumnFromJsonObj(notifications, "from")
            .concat(StaticHelpers.getColumnFromJsonObj(notifications, "to")).join(", ");
        uniqueUsers = await this._db.wpdb(`select * from medi_users where ID in (${uniqueUsers})`);
        uniqueUsers = StaticHelpers.arrayToMappedObject(uniqueUsers, "ID");

        let notificationIds: any = [];

        notifications.map(notification => {
            notificationIds.push(notification.id);

            if (uniqueUsers[notification["from"]])
                notification["from_user"] = uniqueUsers[notification["from"]];
            else notification["from_user"] = {};

            if (uniqueUsers[notification["to"]])
                notification["to_user"] = uniqueUsers[notification["to"]];
            else notification["to_user"] = {};

           notification["mine"] = req.wpUserIds.indexOf(notification["to"]) > -1;

           // gmt to isd conversion of datetime
            notification["created_at"] = StaticHelpers.gmtToIst(notification["created_at"]);

            if (notification["meta"] && notification["meta"].trim().length)
                notification["meta"] = StaticHelpers.unserialize(notification["meta"]);

            return notification;
        });

        let unreadCount = await this._db.mailServiceDb(`
            select count(*) as count from mail_log.notifications 
            where 
                "read" = false and "done" = false
                and "to" in ( ${doctorIds} )
                and ( "due_at" is null or "due_at" < NOW() )
        `);
        if (unreadCount 
            && unreadCount[0] 
            && unreadCount[0]["count"]
        ) unreadCount = unreadCount[0]["count"];
        else unreadCount = 0;

        let totalCount = await this._db.mailServiceDb(`
            select count(*) as count from mail_log.notifications 
            where 
                "done" = false
                and ( "to" in ( ${doctorIds} ) OR "from" in ( ${doctorIds} ) )
                and ( "due_at" is null or "due_at" < NOW() )
        `);
        if (totalCount 
            && totalCount[0] 
            && totalCount[0]["count"]
        ) totalCount = totalCount[0]["count"];
        else totalCount = 0;

        notificationIds = notificationIds.join(", ");
        await this._db.mailServiceDb(`
            update mail_log.notifications 
            set "received" = true
            where 
                "received" = false 
                and "id" in ( ${notificationIds} )
        `);
        
        return res.send(this.build("Here youu go", 1, {
            "rows": notifications,
            "count": unreadCount,
            "total": totalCount,
            "page": page,
            "take": take,
            "unread": unreadCount,
            "maxPage": Math.ceil(totalCount / take),
            "unfollowedUpSoapCount": unfollowedUpSoapCount,
        }));
    }

    public async markRead(req, res) {
        const id = parseInt(req.params.id);

        const notification = await this._db.mailServiceDb(`
            select * from mail_log.notifications where "id" = ${id}
        `);

        if (notification && notification[0]) {}
        else return res.send(this.build("Invlaid notification id"));

        await this._db.mailServiceDb(`
            update mail_log.notifications set "read" = true where "id" = ${id}
        `);

        return res.send(this.build("Marked done", 1, {
            row: notification[0]
        }));
    }

    public async markDoneAll(req, res) {
        const doctorIds = req.wpUserIds.join(", ");
        await this._db.mailServiceDb(`
            update mail_log.notifications set "done" = true 
            where 
                "to" in (${doctorIds}) 
                and "done" = false
        `);

        return res.send(this.build("Marked done successfully !", 1));
    }

    public async markDone(req, res) {
        const id = parseInt(req.params.id);

        let notification = await this._db.mailServiceDb(`
            select * from mail_log.notifications where "id" = ${id}
        `);
        if (notification && notification[0]) { notification = notification[0]; }
        else return res.send(this.build("invalid notification id"));

        const now = StaticHelpers.toMysql(new Date);

        await this._db.mailServiceDb(`
            update mail_log.notifications set "read" = true, "done" = true, "updated_at" = NOW() where "id" = ${id}
        `);
        await this._db.mailServiceDb(`
            update mail_log.notifications 
            set 
                "read" = true, 
                "done" = true,
                "updated_at" = NOW()
            where 
                "type" = '${notification.type}'
                and "consultation_code" = '${notification.consultation_code}'
        `);

        return res.send(this.build("Marked done successfully", 1, {
            notification
        }));
    }

    public async pmsStaffStatNotification(req, res) {
        const soap: Soap = await Soap.repo().findOne({where: {id: req.body.soap}});

        if ((req.body.type === "staff-followup-done") && soap) {
            // check if patient have previous consultation, if not then this will not be added

            const previousSoap = await Soap.repo().findOne({
                where: {
                    created_at: LessThan(soap.created_at),
                }
            });

            if (previousSoap) {} // then you are good to go
            else return res.send(this.build("This is patient's first consultation. Sorry"));
        }

        const resp = await this._request.seRequest("api/v1/notifications/pms-staff-stat-notification", {
            "type": req.body.type,
            "code": (soap && soap.consultation_code) ? soap.consultation_code : "test",
        }, {
            "token": req.headers.token
        });

        return res.send(this.build("Stored successfully.", 1));
    }

    public async pmsStaffStats(req, res) {
        const resp = await this._request.seRequest("api/v1/notifications/pms-staff-stats", {
            staff: req.params.id,
            key: this._config.getOAuthClientKey(),
        }); 

        return res.send(this.build("Here you go", 1, resp));
    }
}
