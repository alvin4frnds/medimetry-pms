import { Column, Entity, PrimaryGeneratedColumn, getRepository, getConnection, Connection, EntityRepository, FindOperator, In, Like, Repository } from "typeorm";
import { db } from '../../config/DatabaseConfiguration';

@Entity({
    database: db.getConfigs('logs').database, 
    schema: db.getConfigs('logs').schema,
    name: "notifications",
    synchronize: false
})
export class Notification{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({type: "varchar", length:"255"})
    center_code: string;

    @Column({type: "int"})
    from: number;

    @Column({type: "int"})
    to: number;

    @Column({type: "varchar", length:"32"})
    consultation_code: string;

    @Column({type: "varchar", length:"255"})
    title: string;

    @Column({type: "text"})
    description: string;

    @Column({type: "varchar", length:"48"})
    type: string;

    @Column({type: "text"})
    meta: string;

    @Column()
    done: Boolean;

    @Column()
    read: Boolean;

    @Column()
    received: Boolean;

    @Column({type: "timestamp"})
    due_at: Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP"})
    created_at: Date;

    @Column({type: "timestamp", "default": () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updated_at: Date;

    /**
     * // FIXME: This doesn't work, don't use and assume it to work.
     * @param {[type]} ) { return new NotificationsRepository( [description]
     */
    public static repo() { return new NotificationsRepository(); }
}

@EntityRepository(Notification)
export class NotificationsRepository extends Repository<Notification> {

    constructor() {
        super();

        return this;
    }
}
