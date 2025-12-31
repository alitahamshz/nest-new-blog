import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVariantFieldsToCartItem1735724400000
  implements MigrationInterface
{
  name = 'AddVariantFieldsToCartItem1735724400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // اضافه کردن فیلدهای variant به cart_items جدول
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "selectedVariantId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "selectedVariantValueId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "selectedVariantObject" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "selectedVariantValueObject" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // حذف فیلدهای variant از cart_items جدول
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "selectedVariantValueObject"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "selectedVariantObject"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "selectedVariantValueId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "selectedVariantId"`,
    );
  }
}
