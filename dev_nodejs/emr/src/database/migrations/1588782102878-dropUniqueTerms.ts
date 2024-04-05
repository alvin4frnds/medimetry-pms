import {MigrationInterface, QueryRunner} from "typeorm";

export class dropUniqueTerms1588782102878 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."terms" DROP CONSTRAINT "UQ_ae6b48f33ac85bf5779be30fbbf"`);
        await queryRunner.query(`ALTER TABLE "public"."terms" ADD CONSTRAINT "UQ_5153fc087ebfdc2c1380cae1c25" UNIQUE ("term_type", "term_name", "doctor_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."terms" DROP CONSTRAINT "UQ_5153fc087ebfdc2c1380cae1c25"`);
        await queryRunner.query(`ALTER TABLE "public"."terms" ADD CONSTRAINT "UQ_ae6b48f33ac85bf5779be30fbbf" UNIQUE ("doctor_id", "term_type", "term_name")`);
    }

}
