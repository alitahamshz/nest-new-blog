/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class CreateProductVariantValueTable1763275986488 {
    name = 'CreateProductVariantValueTable1763275986488'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "product_variant_values" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "icon" character varying, "image" character varying, "hexCode" character varying, "variantId" integer, "productId" integer, CONSTRAINT "PK_0985fc3dd1c18b70f0edff039f6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "icon" character varying`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "image" character varying`);
        await queryRunner.query(`ALTER TABLE "product_variant_values" ADD CONSTRAINT "FK_347a81cb3a53ae7185c4ad351a8" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variant_values" ADD CONSTRAINT "FK_abcaf2b3103bca604e3c165c827" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_variant_values" DROP CONSTRAINT "FK_abcaf2b3103bca604e3c165c827"`);
        await queryRunner.query(`ALTER TABLE "product_variant_values" DROP CONSTRAINT "FK_347a81cb3a53ae7185c4ad351a8"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "icon"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "value" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "product_variant_values"`);
    }
}
