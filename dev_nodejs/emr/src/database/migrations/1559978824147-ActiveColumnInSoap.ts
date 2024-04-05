import {MigrationInterface, QueryRunner} from "typeorm";

export class ActiveColumnInSoap1559978824147 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."soaps" ADD "active" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."soaps" DROP COLUMN "active"`);
    }

}
