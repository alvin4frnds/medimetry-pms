import {MigrationInterface, QueryRunner} from "typeorm";

export class SoapSectionTypeInAttachments1548829574895 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."attachments" ADD "soap_section_type" character varying(50) NOT NULL DEFAULT 'general'`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."attachments" DROP COLUMN "soap_section_type"`);
    }

}
