import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientIdAndCenterInConsultationStatus1556783129542 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."consultations_status" ADD "patient_id" integer`);
        await queryRunner.query(`ALTER TABLE "public"."consultations_status" ADD "center_code" character varying(255) DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."consultations_status" DROP COLUMN "center_code"`);
        await queryRunner.query(`ALTER TABLE "public"."consultations_status" DROP COLUMN "patient_id"`);
    }

}
