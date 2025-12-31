import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCartItemVariantValuesRelation1735734000000
  implements MigrationInterface
{
  name = 'RemoveCartItemVariantValuesRelation1735734000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // حذف جدول ManyToMany
    await queryRunner.query(
      `DROP TABLE IF EXISTS "cart_item_variant_values" CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // بازگشت جدول
    await queryRunner.query(
      `CREATE TABLE "cart_item_variant_values" (
        "cartItemId" integer NOT NULL,
        "variantValueId" integer NOT NULL,
        PRIMARY KEY ("cartItemId", "variantValueId"),
        CONSTRAINT "FK_cartItem" FOREIGN KEY ("cartItemId") REFERENCES "cart_items"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_variantValue" FOREIGN KEY ("variantValueId") REFERENCES "product_variant_values"("id")
      )`,
    );
  }
}
