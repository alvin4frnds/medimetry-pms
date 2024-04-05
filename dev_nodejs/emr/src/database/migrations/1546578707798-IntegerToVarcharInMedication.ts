import {MigrationInterface, QueryRunner} from "typeorm";

export class IntegerToVarcharInMedication1546578707798 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."medications" DROP COLUMN "frequency"`);
        await queryRunner.query(`ALTER TABLE "public"."medications" ADD "frequency" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "public"."medications" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "public"."medications" ADD "duration" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."medications" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "public"."medications" ADD "duration" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."medications" DROP COLUMN "frequency"`);
        await queryRunner.query(`ALTER TABLE "public"."medications" ADD "frequency" integer NOT NULL`);
    }

}
