import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSellerOfferFields1764754273514 implements MigrationInterface {
    name = 'AddSellerOfferFields1764754273514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seller_offers" ADD "minOrder" integer`);
        await queryRunner.query(`ALTER TABLE "seller_offers" ADD "maxOrder" integer`);
        await queryRunner.query(`ALTER TABLE "seller_offers" ADD "sellerNotes" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seller_offers" DROP COLUMN "sellerNotes"`);
        await queryRunner.query(`ALTER TABLE "seller_offers" DROP COLUMN "maxOrder"`);
        await queryRunner.query(`ALTER TABLE "seller_offers" DROP COLUMN "minOrder"`);
    }

}
