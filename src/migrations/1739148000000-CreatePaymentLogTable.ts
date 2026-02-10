import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreatePaymentLogTable1739148000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payment_logs',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'orderId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: `'pending'`,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'transactionId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'gateway',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'gatewayResponse',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'referenceCode',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            columnNames: ['orderId'],
          },
          {
            columnNames: ['status'],
          },
          {
            columnNames: ['createdAt'],
          },
        ],
      }),
      true,
    );

    // اضافه کردن Foreign Key
    await queryRunner.createForeignKey(
      'payment_logs',
      new TableForeignKey({
        columnNames: ['orderId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('payment_logs');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('orderId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('payment_logs', foreignKey);
      }
    }
    await queryRunner.dropTable('payment_logs', true);
  }
}
