/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddMarketplaceTables1762253083470 {
    name = 'AddMarketplaceTables1762253083470'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "product_categories" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "icon" character varying, "parentId" integer, CONSTRAINT "UQ_f314a8b42f88d87b2dcb7fc491a" UNIQUE ("slug"), CONSTRAINT "PK_7069dac60d88408eca56fdc9e0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sellers" ("id" SERIAL NOT NULL, "businessName" character varying NOT NULL, "registrationNumber" character varying, "nationalId" character varying, "phone" character varying, "logo" character varying, "cardNumber" character varying, "accountNumber" character varying, "shebaNumber" character varying, "address" character varying, "description" text, "rating" numeric(3,2) NOT NULL DEFAULT '0', "totalSales" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "userId" integer NOT NULL, CONSTRAINT "REL_4c1c59db4ac1ed90a1a7c0ff3d" UNIQUE ("userId"), CONSTRAINT "PK_97337ccbf692c58e6c7682de8a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "seller_offers" ("id" SERIAL NOT NULL, "price" numeric(12,2) NOT NULL, "discountPrice" numeric(12,2) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "discountPercent" integer, "hasWarranty" boolean, "warrantyDescription" character varying, "isDefault" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "sellerId" integer, "productId" integer, "variantId" integer, CONSTRAINT "PK_81b5f26bd647c43586e67dccfb8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_variants" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "value" character varying NOT NULL, "sku" character varying, "productId" integer, CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_images" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "alt" character varying, "isMain" boolean NOT NULL DEFAULT false, "productId" integer, CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_specifications" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "value" text NOT NULL, "unit" character varying, "displayOrder" integer NOT NULL DEFAULT '0', "productId" integer, CONSTRAINT "PK_1936a81a371c31faaddb04331a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "metaDescription" text, "sku" character varying, "mainImage" character varying, "hasVariant" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" integer, CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" SERIAL NOT NULL, "productName" character varying NOT NULL, "variantName" character varying, "sellerBusinessName" character varying NOT NULL, "quantity" integer NOT NULL, "price" numeric(12,2) NOT NULL, "subtotal" numeric(12,2) NOT NULL, "discount" numeric(12,2) NOT NULL DEFAULT '0', "total" numeric(12,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "orderId" integer, "productId" integer NOT NULL, "variantId" integer, "sellerId" integer NOT NULL, "offerId" integer NOT NULL, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentmethod_enum" AS ENUM('online', 'cash_on_delivery', 'wallet')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM('pending', 'completed', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "orderNumber" character varying NOT NULL, "subtotal" numeric(12,2) NOT NULL, "shippingCost" numeric(12,2) NOT NULL DEFAULT '0', "discount" numeric(12,2) NOT NULL DEFAULT '0', "tax" numeric(12,2) NOT NULL DEFAULT '0', "total" numeric(12,2) NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "paymentMethod" "public"."orders_paymentmethod_enum" NOT NULL DEFAULT 'online', "paymentStatus" "public"."orders_paymentstatus_enum" NOT NULL DEFAULT 'pending', "transactionId" character varying, "paidAt" TIMESTAMP, "shippingAddress" text NOT NULL, "shippingPhone" character varying, "recipientName" character varying, "trackingNumber" character varying, "shippedAt" TIMESTAMP, "deliveredAt" TIMESTAMP, "customerNote" text, "adminNote" text, "cancelReason" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "UQ_59b0c3b34ea0fa5562342f24143" UNIQUE ("orderNumber"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "price" numeric(12,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "cartId" integer, "productId" integer NOT NULL, "variantId" integer, "offerId" integer NOT NULL, CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products_tags_tags" ("productsId" integer NOT NULL, "tagsId" integer NOT NULL, CONSTRAINT "PK_b06c7e3d7d74a176b4d936bcd73" PRIMARY KEY ("productsId", "tagsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_88687975db5205fdbdb10969fc" ON "products_tags_tags" ("productsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_72fa6ba0f176a89a2e9d90274c" ON "products_tags_tags" ("tagsId") `);
        await queryRunner.query(`CREATE TABLE "product_categories_closure" ("id_ancestor" integer NOT NULL, "id_descendant" integer NOT NULL, CONSTRAINT "PK_88d9d261ff8b8ec33e94a02a08d" PRIMARY KEY ("id_ancestor", "id_descendant"))`);
        await queryRunner.query(`CREATE INDEX "IDX_449efbb5bc4f348dea8de05439" ON "product_categories_closure" ("id_ancestor") `);
        await queryRunner.query(`CREATE INDEX "IDX_b893de72eb86109dcb33d45b49" ON "product_categories_closure" ("id_descendant") `);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "alternativePhone" character varying`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "address" text`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "city" character varying`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "province" character varying`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "postalCode" character varying`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "nationalId" character varying`);
        await queryRunner.query(`ALTER TABLE "product_categories" ADD CONSTRAINT "FK_cbf04073e03d8873ae0662053a3" FOREIGN KEY ("parentId") REFERENCES "product_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD CONSTRAINT "FK_4c1c59db4ac1ed90a1a7c0ff3df" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "seller_offers" ADD CONSTRAINT "FK_2cb082e332eb642a36603b2cc6b" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "seller_offers" ADD CONSTRAINT "FK_ec56b801cfc9d94a447ede946c4" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "seller_offers" ADD CONSTRAINT "FK_d43895cfabd89728c68009963de" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_images" ADD CONSTRAINT "FK_b367708bf720c8dd62fc6833161" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_specifications" ADD CONSTRAINT "FK_845a8fe33a0909b9978b3337669" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_516736b9807228bb17b2d0a3e2a" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_1200397d761353a3a79f593b9e4" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_52b4bc1652998dd609949808f58" FOREIGN KEY ("offerId") REFERENCES "seller_offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_5a27845bc2d79be6f1fa3d2c036" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_3e6f17255dfb30fa41cfd9f0e2f" FOREIGN KEY ("offerId") REFERENCES "seller_offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products_tags_tags" ADD CONSTRAINT "FK_88687975db5205fdbdb10969fc4" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "products_tags_tags" ADD CONSTRAINT "FK_72fa6ba0f176a89a2e9d90274c5" FOREIGN KEY ("tagsId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_categories_closure" ADD CONSTRAINT "FK_449efbb5bc4f348dea8de054397" FOREIGN KEY ("id_ancestor") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_categories_closure" ADD CONSTRAINT "FK_b893de72eb86109dcb33d45b49c" FOREIGN KEY ("id_descendant") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_categories_closure" DROP CONSTRAINT "FK_b893de72eb86109dcb33d45b49c"`);
        await queryRunner.query(`ALTER TABLE "product_categories_closure" DROP CONSTRAINT "FK_449efbb5bc4f348dea8de054397"`);
        await queryRunner.query(`ALTER TABLE "products_tags_tags" DROP CONSTRAINT "FK_72fa6ba0f176a89a2e9d90274c5"`);
        await queryRunner.query(`ALTER TABLE "products_tags_tags" DROP CONSTRAINT "FK_88687975db5205fdbdb10969fc4"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_69828a178f152f157dcf2f70a89"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_3e6f17255dfb30fa41cfd9f0e2f"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_5a27845bc2d79be6f1fa3d2c036"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_72679d98b31c737937b8932ebe6"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_52b4bc1652998dd609949808f58"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_1200397d761353a3a79f593b9e4"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_516736b9807228bb17b2d0a3e2a"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`);
        await queryRunner.query(`ALTER TABLE "product_specifications" DROP CONSTRAINT "FK_845a8fe33a0909b9978b3337669"`);
        await queryRunner.query(`ALTER TABLE "product_images" DROP CONSTRAINT "FK_b367708bf720c8dd62fc6833161"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`);
        await queryRunner.query(`ALTER TABLE "seller_offers" DROP CONSTRAINT "FK_d43895cfabd89728c68009963de"`);
        await queryRunner.query(`ALTER TABLE "seller_offers" DROP CONSTRAINT "FK_ec56b801cfc9d94a447ede946c4"`);
        await queryRunner.query(`ALTER TABLE "seller_offers" DROP CONSTRAINT "FK_2cb082e332eb642a36603b2cc6b"`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP CONSTRAINT "FK_4c1c59db4ac1ed90a1a7c0ff3df"`);
        await queryRunner.query(`ALTER TABLE "product_categories" DROP CONSTRAINT "FK_cbf04073e03d8873ae0662053a3"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "nationalId"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "postalCode"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "province"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "alternativePhone"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "phone"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b893de72eb86109dcb33d45b49"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_449efbb5bc4f348dea8de05439"`);
        await queryRunner.query(`DROP TABLE "product_categories_closure"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_72fa6ba0f176a89a2e9d90274c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_88687975db5205fdbdb10969fc"`);
        await queryRunner.query(`DROP TABLE "products_tags_tags"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentmethod_enum"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "product_specifications"`);
        await queryRunner.query(`DROP TABLE "product_images"`);
        await queryRunner.query(`DROP TABLE "product_variants"`);
        await queryRunner.query(`DROP TABLE "seller_offers"`);
        await queryRunner.query(`DROP TABLE "sellers"`);
        await queryRunner.query(`DROP TABLE "product_categories"`);
    }
}
