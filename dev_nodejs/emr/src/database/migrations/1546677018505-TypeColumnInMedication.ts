import {MigrationInterface, QueryRunner} from "typeorm";

export class TypeColumnInMedication1546677018505 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."medications" ADD "type" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."medications" DROP COLUMN "type"`);
    }

}
