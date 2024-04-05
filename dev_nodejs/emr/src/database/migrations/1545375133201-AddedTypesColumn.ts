import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedTypesColumn1545375133201 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."chief_complaints" ADD "type" character varying(20) NOT NULL DEFAULT 'text'`);
        await queryRunner.query(`ALTER TABLE "public"."test_result" ADD "type" character varying(20) NOT NULL DEFAULT 'text'`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."test_result" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "public"."chief_complaints" DROP COLUMN "type"`);
    }

}
