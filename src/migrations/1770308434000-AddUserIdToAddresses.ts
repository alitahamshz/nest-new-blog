import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddUserIdToAddresses1770308434000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // افزودن ستون userId به جدول addresses (قابل null برای مقدار دهی داده های قدیم)
    await queryRunner.addColumn(
      'addresses',
      new TableColumn({
        name: 'userId',
        type: 'integer',
        isNullable: true,
      }),
    );

    // مقدار دهی userId برای رکوردهای موجود از طریق userProfile
    await queryRunner.query(`
      UPDATE addresses 
      SET "userId" = up."userId"
      FROM user_profile up 
      WHERE addresses."userProfileId" = up.id
    `);

    // تغییر userId به NOT NULL
    await queryRunner.changeColumn(
      'addresses',
      'userId',
      new TableColumn({
        name: 'userId',
        type: 'integer',
        isNullable: false,
      }),
    );

    // ایجاد فام کلید برای userId
    await queryRunner.createForeignKey(
      'addresses',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // تغییر userProfileId به nullable
    await queryRunner.changeColumn(
      'addresses',
      'userProfileId',
      new TableColumn({
        name: 'userProfileId',
        type: 'integer',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // حذف foreign key برای userId
    const table = await queryRunner.getTable('addresses');
    const userIdForeignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );

    if (userIdForeignKey) {
      await queryRunner.dropForeignKey('addresses', userIdForeignKey);
    }

    // حذف ستون userId
    await queryRunner.dropColumn('addresses', 'userId');

    // بازگرداندن userProfileId به NOT NULL
    await queryRunner.changeColumn(
      'addresses',
      'userProfileId',
      new TableColumn({
        name: 'userProfileId',
        type: 'integer',
        isNullable: false,
      }),
    );
  }
}
