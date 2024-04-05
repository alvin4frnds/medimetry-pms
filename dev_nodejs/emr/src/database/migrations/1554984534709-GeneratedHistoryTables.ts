import {MigrationInterface, QueryRunner} from "typeorm";

export class GeneratedHistoryTables1554984534709 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "public"."treatment_plan_logs" ("id" SERIAL NOT NULL, "remarks" character varying(511) NOT NULL, "follow_up" character varying(100) NOT NULL, "data" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "generated_history_id" integer, CONSTRAINT "PK_cb3fcb15b1b65d80df52b76f1b8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "public"."generated_histories" ("id" SERIAL NOT NULL, "patient_id" integer NOT NULL, "for_name" character varying(100) NOT NULL, "unique_id" character varying(32) NOT NULL, "consultation_code" character varying(100) NOT NULL, "data" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "soap_id" integer, CONSTRAINT "PK_6d31f1134d35dfd4c668902c853" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."treatment_plan_logs" ADD CONSTRAINT "FK_b4101237bed51a73ab9c0739fa0" FOREIGN KEY ("generated_history_id") REFERENCES "public"."generated_histories"("id")`);
        await queryRunner.query(`ALTER TABLE "public"."generated_histories" ADD CONSTRAINT "FK_aed5f416efd1592b1feaff6b81e" FOREIGN KEY ("soap_id") REFERENCES "public"."soaps"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."generated_histories" DROP CONSTRAINT "FK_aed5f416efd1592b1feaff6b81e"`);
        await queryRunner.query(`ALTER TABLE "public"."treatment_plan_logs" DROP CONSTRAINT "FK_b4101237bed51a73ab9c0739fa0"`);
        await queryRunner.query(`DROP TABLE "public"."generated_histories"`);
        await queryRunner.query(`DROP TABLE "public"."treatment_plan_logs"`);
    }

}
