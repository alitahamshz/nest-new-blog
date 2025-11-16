import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSellerOfferVariantRelation1763277438362 implements MigrationInterface {
    name = 'UpdateSellerOfferVariantRelation1763277438362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seller_offers" DROP CONSTRAINT "FK_d43895cfabd89728c68009963de"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_516736b9807228bb17b2d0a3e2a"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_5a27845bc2d79be6f1fa3d2c036"`);
        await queryRunner.query(`CREATE TABLE "offer_variant_values" ("offer_id" integer NOT NULL, "variant_value_id" integer NOT NULL, CONSTRAINT "PK_be95677927acc734b8cdc057bd6" PRIMARY KEY ("offer_id", "variant_value_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a1739a3be37e1c4ecc84cdbb90" ON "offer_variant_values" ("offer_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5cdfe68073a6744bd1ddecb042" ON "offer_variant_values" ("variant_value_id") `);
        await queryRunner.query(`CREATE TABLE "order_item_variant_values" ("orderItemId" integer NOT NULL, "variantValueId" integer NOT NULL, CONSTRAINT "PK_daed9d353c43dc7a10fbb8c542c" PRIMARY KEY ("orderItemId", "variantValueId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a5d22de3b0d33c472508b81965" ON "order_item_variant_values" ("orderItemId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1d1263cca504e9c454f0e024aa" ON "order_item_variant_values" ("variantValueId") `);
        await queryRunner.query(`CREATE TABLE "cart_item_variant_values" ("cartItemId" integer NOT NULL, "variantValueId" integer NOT NULL, CONSTRAINT "PK_b4cd428432bcd704884015c68d4" PRIMARY KEY ("cartItemId", "variantValueId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3bd67f8cc0ac497ddadc283178" ON "cart_item_variant_values" ("cartItemId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fcf48bb3573f74dfd32d9b62a5" ON "cart_item_variant_values" ("variantValueId") `);
        await queryRunner.query(`ALTER TABLE "seller_offers" DROP COLUMN "variantId"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "variantId"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "variantName"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "variantId"`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "variantValueNames" character varying`);
        await queryRunner.query(`ALTER TABLE "offer_variant_values" ADD CONSTRAINT "FK_a1739a3be37e1c4ecc84cdbb907" FOREIGN KEY ("offer_id") REFERENCES "seller_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "offer_variant_values" ADD CONSTRAINT "FK_5cdfe68073a6744bd1ddecb0427" FOREIGN KEY ("variant_value_id") REFERENCES "product_variant_values"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "order_item_variant_values" ADD CONSTRAINT "FK_a5d22de3b0d33c472508b81965e" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "order_item_variant_values" ADD CONSTRAINT "FK_1d1263cca504e9c454f0e024aa3" FOREIGN KEY ("variantValueId") REFERENCES "product_variant_values"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "cart_item_variant_values" ADD CONSTRAINT "FK_3bd67f8cc0ac497ddadc283178d" FOREIGN KEY ("cartItemId") REFERENCES "cart_items"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "cart_item_variant_values" ADD CONSTRAINT "FK_fcf48bb3573f74dfd32d9b62a5c" FOREIGN KEY ("variantValueId") REFERENCES "product_variant_values"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_item_variant_values" DROP CONSTRAINT "FK_fcf48bb3573f74dfd32d9b62a5c"`);
        await queryRunner.query(`ALTER TABLE "cart_item_variant_values" DROP CONSTRAINT "FK_3bd67f8cc0ac497ddadc283178d"`);
        await queryRunner.query(`ALTER TABLE "order_item_variant_values" DROP CONSTRAINT "FK_1d1263cca504e9c454f0e024aa3"`);
        await queryRunner.query(`ALTER TABLE "order_item_variant_values" DROP CONSTRAINT "FK_a5d22de3b0d33c472508b81965e"`);
        await queryRunner.query(`ALTER TABLE "offer_variant_values" DROP CONSTRAINT "FK_5cdfe68073a6744bd1ddecb0427"`);
        await queryRunner.query(`ALTER TABLE "offer_variant_values" DROP CONSTRAINT "FK_a1739a3be37e1c4ecc84cdbb907"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "variantValueNames"`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "variantId" integer`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "variantName" character varying`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "variantId" integer`);
        await queryRunner.query(`ALTER TABLE "seller_offers" ADD "variantId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fcf48bb3573f74dfd32d9b62a5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3bd67f8cc0ac497ddadc283178"`);
        await queryRunner.query(`DROP TABLE "cart_item_variant_values"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1d1263cca504e9c454f0e024aa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a5d22de3b0d33c472508b81965"`);
        await queryRunner.query(`DROP TABLE "order_item_variant_values"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5cdfe68073a6744bd1ddecb042"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a1739a3be37e1c4ecc84cdbb90"`);
        await queryRunner.query(`DROP TABLE "offer_variant_values"`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_5a27845bc2d79be6f1fa3d2c036" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_516736b9807228bb17b2d0a3e2a" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "seller_offers" ADD CONSTRAINT "FK_d43895cfabd89728c68009963de" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
