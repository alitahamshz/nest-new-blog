import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCartOrderItemFields1735633000000 implements MigrationInterface {
  name = 'AddCartOrderItemFields1735633000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // اضافه کردن فیلدها به cart_items جدول
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "productName" varchar NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "productSlug" varchar NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "productImage" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "sellerName" varchar NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "discountPrice" decimal(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "discountPercent" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "minOrder" integer NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "maxOrder" integer NOT NULL DEFAULT 999`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "stock" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "hasWarranty" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "warrantyDescription" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "selectedVariants" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "variantNames" jsonb`,
    );

    // اضافه کردن فیلدها به order_items جدول
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "productSlug" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "productImage" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "discountPrice" decimal(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "discountPercent" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "minOrder" integer NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "maxOrder" integer NOT NULL DEFAULT 999`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "stock" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "hasWarranty" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "warrantyDescription" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // حذف فیلدها از cart_items جدول
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "variantNames"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "selectedVariants"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "warrantyDescription"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "hasWarranty"`,
    );
    await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "stock"`);
    await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "maxOrder"`);
    await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "minOrder"`);
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "discountPercent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "discountPrice"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "sellerName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "productImage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "productSlug"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "productName"`,
    );

    // حذف فیلدها از order_items جدول
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "warrantyDescription"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "hasWarranty"`,
    );
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "stock"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "maxOrder"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "minOrder"`);
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "discountPercent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "discountPrice"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "productImage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "productSlug"`,
    );
  }
}
