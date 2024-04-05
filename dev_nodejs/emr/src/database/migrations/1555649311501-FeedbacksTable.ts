import {MigrationInterface, QueryRunner} from "typeorm";

export class FeedbacksTable1555649311501 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "public"."feedbacks" ("id" SERIAL NOT NULL, "from" integer NOT NULL, "to" integer NOT NULL, "consultation_code" character varying(40) NOT NULL, "value" character varying(3) NOT NULL, "body" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "soap_id" integer, CONSTRAINT "PK_0d85e1877641a21faa42f8c8269" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."feedbacks" ADD CONSTRAINT "FK_25c0066e3a3908ad179eafa5a15" FOREIGN KEY ("soap_id") REFERENCES "public"."soaps"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."feedbacks" DROP CONSTRAINT "FK_25c0066e3a3908ad179eafa5a15"`);
        await queryRunner.query(`DROP TABLE "public"."feedbacks"`);
    }

}
