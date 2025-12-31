import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOrderItemVariantValuesRelation1735735000000
  implements MigrationInterface
{
  name = 'RemoveOrderItemVariantValuesRelation1735735000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // حذف جدول ManyToMany order_item_variant_values
    await queryRunner.query(
      `DROP TABLE IF EXISTS "order_item_variant_values" CASCADE`,
    );

    // اضافه کردن فیلدهای variant snapshot به order_items
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "selectedVariantId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "selectedVariantValueId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "selectedVariantObject" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "selectedVariantValueObject" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // حذف کردن فیلدهای variant snapshot
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "selectedVariantValueObject"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "selectedVariantObject"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "selectedVariantValueId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "selectedVariantId"`,
    );

    // بازگشت جدول
    await queryRunner.query(
      `CREATE TABLE "order_item_variant_values" (
        "orderItemId" integer NOT NULL,
        "variantValueId" integer NOT NULL,
        PRIMARY KEY ("orderItemId", "variantValueId"),
        CONSTRAINT "FK_orderItem" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_variantValue" FOREIGN KEY ("variantValueId") REFERENCES "product_variant_values"("id")
      )`,
    );
  }
}
