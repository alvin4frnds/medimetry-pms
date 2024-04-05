import {MigrationInterface, QueryRunner} from "typeorm";

export class createAuditLogs1562659707144 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "public"."audit_logs" ("id" SERIAL NOT NULL, "consultation_code" character varying(80), "doctor_id" integer, "patient_id" integer, "wp_user_id" integer NOT NULL, "token_used" character varying(160) NOT NULL, "user_agent" character varying(255) NOT NULL, "ip" character varying(160) NOT NULL, "log_category" character varying(20) NOT NULL, "log_authority" character varying(20) NOT NULL, "title" character varying(160) NOT NULL, "new_content" jsonb NOT NULL DEFAULT '{}', "old_content" text, "full_req" jsonb NOT NULL DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_509c4d9e721cd3d0bdf18a01c32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE attachments ALTER COLUMN attachment_type TYPE VARCHAR(120)`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "public"."audit_logs"`);
        await queryRunner.query(`ALTER TABLE attachments ALTER COLUMN attachment_type TYPE VARCHAR(60)`);
    }

}
