import {MigrationInterface, QueryRunner} from "typeorm";

export class NewEmrAPI1545467165685 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "public"."past_illness" ("id" SERIAL NOT NULL, "patient_id" integer NOT NULL, "remark" character varying(511) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_e4dd18b174df35f1aa9d738ab57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "public"."past_medications" ("id" SERIAL NOT NULL, "patient_id" integer NOT NULL, "remark" character varying(511) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_76160076c654764e07408dc54df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."family_history" ADD "remark" character varying(511) DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."family_history" DROP COLUMN "remark"`);
        await queryRunner.query(`DROP TABLE "public"."past_medications"`);
        await queryRunner.query(`DROP TABLE "public"."past_illness"`);
    }

}
