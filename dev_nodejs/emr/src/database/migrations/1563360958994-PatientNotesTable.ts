import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientNotesTable1563360958994 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "public"."patient_notes" ("id" SERIAL NOT NULL, "writer" character varying(120) NOT NULL, "patient_id" integer NOT NULL, "consultation_code" character varying(40), "text" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_b29931bef4b7d1ddc38853b8192" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "public"."patient_notes"`);
    }

}
