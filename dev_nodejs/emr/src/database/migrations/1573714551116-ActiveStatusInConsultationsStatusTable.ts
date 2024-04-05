import {MigrationInterface, QueryRunner} from "typeorm";

export class ActiveStatusInConsultationsStatusTable1573714551116 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."consultations_status" ADD "active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`update consultations_status set active = false where patient_id in ('48480','49254','48382','49517','48061','47294','49334','49473','49270','48940','49178','49083','49082','49081','49078','49070','49065','49041','49017','49007','48800','48642','48643','48575','48573','48577','48102','48078','48535','47871','47729','48218','48186','48082','46839','47061','46813','46736','46225','46017','46196','46334','39843','46318','46209','46213','46073','46012','46027','45600','45548','43712','45009','44965','38680','44001','44676','41637','40683','44760','43913','42771','42976','38839','44191','40060','43986','43966','38721','40690','43902','38979','43845','43855','43850')`);
        await queryRunner.query(`UPDATE consultations_status set active = false where consultation_code in ( select consultation_code from soaps where active = false )`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."consultations_status" DROP COLUMN "active"`);
    }

}
