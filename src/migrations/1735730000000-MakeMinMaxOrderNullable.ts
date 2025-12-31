import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeMinMaxOrderNullable1735730000000 implements MigrationInterface {
  name = 'MakeMinMaxOrderNullable1735730000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // تغییر minOrder و maxOrder در cart_items به nullable
    await queryRunner.query(
      `ALTER TABLE "cart_items" ALTER COLUMN "minOrder" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ALTER COLUMN "maxOrder" DROP NOT NULL`,
    );

    // تغییر minOrder و maxOrder در order_items به nullable
    await queryRunner.query(
      `ALTER TABLE "order_items" ALTER COLUMN "minOrder" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ALTER COLUMN "maxOrder" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // بازگشت minOrder و maxOrder در cart_items به NOT NULL با مقدار پیش‌فرض
    await queryRunner.query(
      `ALTER TABLE "cart_items" ALTER COLUMN "minOrder" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ALTER COLUMN "maxOrder" SET NOT NULL`,
    );

    // بازگشت minOrder و maxOrder در order_items به NOT NULL
    await queryRunner.query(
      `ALTER TABLE "order_items" ALTER COLUMN "minOrder" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ALTER COLUMN "maxOrder" SET NOT NULL`,
    );
  }
}
