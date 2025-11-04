import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAddressesTable1762253000000 implements MigrationInterface {
  name = 'CreateAddressesTable1762253000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // بررسی اینکه جدول قبلاً وجود داره یا نه
    const tableExists = await queryRunner.hasTable('addresses');

    if (!tableExists) {
      await queryRunner.query(`
        CREATE TABLE "addresses" (
          "id" SERIAL NOT NULL,
          "title" character varying NOT NULL,
          "recipientName" character varying NOT NULL,
          "phone" character varying NOT NULL,
          "alternativePhone" character varying,
          "address" text NOT NULL,
          "city" character varying NOT NULL,
          "province" character varying NOT NULL,
          "postalCode" character varying(10) NOT NULL,
          "isDefault" boolean NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "userProfileId" integer,
          CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id")
        )
      `);

      await queryRunner.query(`
        ALTER TABLE "addresses" 
        ADD CONSTRAINT "FK_9667d61ea82200d48b72a81c01e" 
        FOREIGN KEY ("userProfileId") 
        REFERENCES "user_profile"("id") 
        ON DELETE CASCADE 
        ON UPDATE NO ACTION
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('addresses');

    if (tableExists) {
      await queryRunner.query(`
        ALTER TABLE "addresses" 
        DROP CONSTRAINT IF EXISTS "FK_9667d61ea82200d48b72a81c01e"
      `);

      await queryRunner.query(`DROP TABLE "addresses"`);
    }
  }
}
