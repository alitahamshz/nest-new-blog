import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnusedVariantColumns1735732000000 implements MigrationInterface {
  name = 'RemoveUnusedVariantColumns1735732000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // حذف ستون‌های غیر ضروری
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "selectedVariants"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP COLUMN "variantNames"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // بازگشت ستون‌های حذف شده
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "variantNames" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD "selectedVariants" jsonb`,
    );
  }
}
