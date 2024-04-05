import {MigrationInterface, QueryRunner} from "typeorm";

export class UniqueConsultationCode1547876511086 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."consultations_status" ADD CONSTRAINT "UQ_0759ac525cc63c6c8de85f449e2" UNIQUE ("consultation_code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."consultations_status" DROP CONSTRAINT "UQ_0759ac525cc63c6c8de85f449e2"`);
    }

}
