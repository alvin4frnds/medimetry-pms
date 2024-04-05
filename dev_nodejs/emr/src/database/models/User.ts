import { Column, Entity, getRepository, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("users")
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar",length:"150"})
    access_token: string;

    @Column({type: "varchar",length:"80"})
    refresh_token: string;

    @Column({type: "int"})
    user_id: number;

    @Column({type: "varchar", length:"20"})
    user_type: string;

    @Column({type: "varchar", length:"40"})
    encrypted: string;

    @Column({type: "varchar", length:"80"})
    name: string;

    @Column({type: "varchar", length:"80"})
    mobile: string;

    @Column({type: "varchar", length:"80"})
    email: string;

    @Column({type: "varchar", length:"10"})
    referral: string;

    @Column({type: "varchar", length:"255"})
    pic: string;

    @Column({type: "jsonb"})
    meta: JSON = JSON.parse("{}");

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at:Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at:Date;

    public static newFromHttpResp (httpResp) {
        if (JSON.stringify(httpResp.meta) === "[]") httpResp.meta = {};

        let user = new User;
        user.user_id = httpResp.user.id;
        user.name = httpResp.user.name;
        user.email = httpResp.user.email;
        user.encrypted = httpResp.user.encrypted;
        user.mobile = httpResp.user.mobile;
        user.pic = httpResp.user.pic;
        user.referral = httpResp.user.referral;
        user.refresh_token = httpResp.refresh_token;
        user.access_token = httpResp.access_token;
        user.user_type = httpResp.user.type;
        user.meta = httpResp.meta || JSON.parse("{}");
        user.created_at = httpResp.created_at;
        user.updated_at = httpResp.updated_at;

        if (httpResp.user) user.meta["user"] = httpResp.user;
        return user;
    }

    public static getRepo () { return getRepository(User); }

    public static repo() { return User.getRepo(); }

    public getDoctorIds() {
        if (this.user_type !== "assistant") return [];

        let doctorIds = [];
        this.meta["doctors"].forEach( function(doctor) {
            doctorIds.push(doctor.doctor_id);
        });

        return doctorIds;
    }
}
