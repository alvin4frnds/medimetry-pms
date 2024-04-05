import {MigrationInterface, QueryRunner} from "typeorm";

export class remarkColumnInSoapTable1546421253390 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."soaps" ADD "follow_up" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "public"."soaps" ADD "remark" character varying(511)`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."soaps" DROP COLUMN "remark"`);
        await queryRunner.query(`ALTER TABLE "public"."soaps" DROP COLUMN "follow_up"`);
    }

}
