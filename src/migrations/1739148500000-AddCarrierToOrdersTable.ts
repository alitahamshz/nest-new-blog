import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCarrierToOrdersTable1739148500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'carrier',
        type: 'varchar',
        isNullable: true,
        comment: 'شرکت پستی (پست ایران، ...)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders', 'carrier');
  }
}
