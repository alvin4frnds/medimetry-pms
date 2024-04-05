import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveDiagnosisColumnFromDiagnosiTable1548836618896 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."diagnosis" DROP COLUMN "diagnosis"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."diagnosis" ADD "diagnosis" character varying(500)`);
    }

}
