import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedMealsTable1557836445905 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "public"."meals" ("id" SERIAL NOT NULL, "meal_time" character varying(100), "name" character varying(255), "quantity" character varying(150) NOT NULL, "quantity_unit" character varying(150), "weekend" boolean NOT NULL, "unique_meal_id" integer NOT NULL, "patient_id" integer NOT NULL, "doctor_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "soap_id" integer, CONSTRAINT "PK_e3b0260060e6938cef2ca3e6b66" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."meals" ADD CONSTRAINT "FK_8cc7d9a1cd9effc20b8935d87a5" FOREIGN KEY ("soap_id") REFERENCES "public"."soaps"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."meals" DROP CONSTRAINT "FK_8cc7d9a1cd9effc20b8935d87a5"`);
        await queryRunner.query(`DROP TABLE "public"."meals"`);
    }

}
