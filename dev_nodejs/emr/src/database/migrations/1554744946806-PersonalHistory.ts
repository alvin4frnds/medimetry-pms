import {MigrationInterface, QueryRunner} from "typeorm";

export class PersonalHistory1554744946806 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "public"."personal_history" ("id" SERIAL NOT NULL, "patient_id" integer NOT NULL, "doctor_id" integer NOT NULL, "uuid" character varying(100) NOT NULL, "info" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "soap_id" integer, CONSTRAINT "REL_9e71332f9724f8fd77bf69a054" UNIQUE ("soap_id"), CONSTRAINT "PK_ea2c70df916464587191883887b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."personal_history" ADD CONSTRAINT "FK_9e71332f9724f8fd77bf69a0546" FOREIGN KEY ("soap_id") REFERENCES "public"."soaps"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."personal_history" DROP CONSTRAINT "FK_9e71332f9724f8fd77bf69a0546"`);
        await queryRunner.query(`DROP TABLE "public"."personal_history"`);
    }

}
