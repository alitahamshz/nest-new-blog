import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePostProductsRelation1763366935378 implements MigrationInterface {
    name = 'CreatePostProductsRelation1763366935378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post_products" ("post_id" integer NOT NULL, "product_id" integer NOT NULL, CONSTRAINT "PK_924e1c4d0124b9e8713fc9af4fb" PRIMARY KEY ("post_id", "product_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ef865fdb52938413178a18dd3b" ON "post_products" ("post_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1d71f0a20f537d8118ba387202" ON "post_products" ("product_id") `);
        await queryRunner.query(`ALTER TABLE "post_products" ADD CONSTRAINT "FK_ef865fdb52938413178a18dd3b7" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_products" ADD CONSTRAINT "FK_1d71f0a20f537d8118ba3872022" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_products" DROP CONSTRAINT "FK_1d71f0a20f537d8118ba3872022"`);
        await queryRunner.query(`ALTER TABLE "post_products" DROP CONSTRAINT "FK_ef865fdb52938413178a18dd3b7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1d71f0a20f537d8118ba387202"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef865fdb52938413178a18dd3b"`);
        await queryRunner.query(`DROP TABLE "post_products"`);
    }

}
