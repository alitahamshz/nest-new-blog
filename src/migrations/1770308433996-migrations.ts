import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1770308433996 implements MigrationInterface {
  name = 'Migrations1770308433996';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying(200) NOT NULL, "en_name" character varying(255), "slug" character varying(200) NOT NULL, "parentId" integer, CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."comment_status_enum" AS ENUM('pending', 'confirmed', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" SERIAL NOT NULL, "content" text NOT NULL, "status" "public"."comment_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer, "postId" integer, "parentId" integer, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_categories" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "icon" character varying, "parentId" integer, CONSTRAINT "UQ_f314a8b42f88d87b2dcb7fc491a" UNIQUE ("slug"), CONSTRAINT "PK_7069dac60d88408eca56fdc9e0c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variant_values" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "icon" character varying, "image" character varying, "hexCode" character varying, "variantId" integer, "productId" integer, CONSTRAINT "PK_0985fc3dd1c18b70f0edff039f6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variants" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "icon" character varying, "image" character varying, "sku" character varying, "productId" integer, CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_images" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "alt" character varying, "isMain" boolean NOT NULL DEFAULT false, "productId" integer, CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sellers" ("id" SERIAL NOT NULL, "businessName" character varying NOT NULL, "registrationNumber" character varying, "nationalId" character varying, "phone" character varying, "logo" character varying, "cardNumber" character varying, "accountNumber" character varying, "shebaNumber" character varying, "address" character varying, "description" text, "rating" numeric(3,2) NOT NULL DEFAULT '0', "totalSales" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "userId" integer NOT NULL, CONSTRAINT "REL_4c1c59db4ac1ed90a1a7c0ff3d" UNIQUE ("userId"), CONSTRAINT "PK_97337ccbf692c58e6c7682de8a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "seller_offers" ("id" SERIAL NOT NULL, "price" numeric(12,2) NOT NULL, "discountPrice" numeric(12,2) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "discountPercent" integer, "minOrder" integer, "maxOrder" integer, "sellerNotes" text, "hasWarranty" boolean, "warrantyDescription" character varying, "isDefault" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "sellerId" integer, "productId" integer, CONSTRAINT "PK_81b5f26bd647c43586e67dccfb8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_specifications" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "value" text NOT NULL, "unit" character varying, "displayOrder" integer NOT NULL DEFAULT '0', "productId" integer, CONSTRAINT "PK_1936a81a371c31faaddb04331a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "metaDescription" text, "sku" character varying, "mainImage" character varying, "hasVariant" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" integer, CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tags" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "en_name" character varying, "slug" character varying NOT NULL, CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"), CONSTRAINT "UQ_27511c718108a371c32bc8b7a27" UNIQUE ("en_name"), CONSTRAINT "UQ_b3aa10c29ea4e61a830362bd25a" UNIQUE ("slug"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."posts_status_enum" AS ENUM('draft', 'published', 'pending')`,
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" SERIAL NOT NULL, "title" character varying(200) NOT NULL, "seo_title" character varying(200), "slug" character varying(200) NOT NULL, "meta_description" character varying(300), "excerpt" text, "content" text NOT NULL, "inner_tags" text array, "view_count" integer NOT NULL DEFAULT '0', "thumbnail" character varying, "cover_image" character varying, "status" "public"."posts_status_enum" NOT NULL DEFAULT 'draft', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer, "categoryId" integer, CONSTRAINT "UQ_54ddf9075260407dcfdd7248577" UNIQUE ("slug"), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "addresses" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "recipientName" character varying NOT NULL, "phone" character varying NOT NULL, "alternativePhone" character varying, "address" text NOT NULL, "city" character varying NOT NULL, "province" character varying NOT NULL, "postalCode" character varying(10) NOT NULL, "isDefault" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userProfileId" integer, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_profile" ("id" SERIAL NOT NULL, "bio" character varying, "avatar" character varying, "website" character varying, "location" character varying, "socialLinks" character varying, "phone" character varying, "alternativePhone" character varying, "address" text, "city" character varying, "province" character varying, "postalCode" character varying, "nationalId" character varying, "userId" integer, CONSTRAINT "REL_51cb79b5555effaf7d69ba1cff" UNIQUE ("userId"), CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" SERIAL NOT NULL, "productName" character varying NOT NULL, "productSlug" character varying, "productImage" character varying, "variantValueNames" character varying, "sellerBusinessName" character varying NOT NULL, "discountPrice" numeric(12,2), "discountPercent" integer NOT NULL DEFAULT '0', "minOrder" integer NOT NULL, "maxOrder" integer NOT NULL, "stock" integer NOT NULL, "hasWarranty" boolean NOT NULL DEFAULT false, "warrantyDescription" text, "selectedVariantId" integer, "selectedVariantValueId" integer, "selectedVariantObject" jsonb, "selectedVariantValueObject" jsonb, "quantity" integer NOT NULL, "price" numeric(12,2) NOT NULL, "subtotal" numeric(12,2) NOT NULL, "discount" numeric(12,2) NOT NULL DEFAULT '0', "total" numeric(12,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "orderId" integer, "productId" integer NOT NULL, "sellerId" integer NOT NULL, "offerId" integer NOT NULL, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_paymentmethod_enum" AS ENUM('online', 'cash_on_delivery', 'wallet')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM('pending', 'completed', 'failed', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" SERIAL NOT NULL, "orderNumber" character varying NOT NULL, "subtotal" numeric(12,2) NOT NULL, "shippingCost" numeric(12,2) NOT NULL DEFAULT '0', "discount" numeric(12,2) NOT NULL DEFAULT '0', "tax" numeric(12,2) NOT NULL DEFAULT '0', "total" numeric(12,2) NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "paymentMethod" "public"."orders_paymentmethod_enum" NOT NULL DEFAULT 'online', "paymentStatus" "public"."orders_paymentstatus_enum" NOT NULL DEFAULT 'pending', "transactionId" character varying, "paidAt" TIMESTAMP, "shippingAddress" text NOT NULL, "shippingPhone" character varying, "recipientName" character varying, "trackingNumber" character varying, "shippedAt" TIMESTAMP, "deliveredAt" TIMESTAMP, "customerNote" text, "adminNote" text, "cancelReason" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "UQ_59b0c3b34ea0fa5562342f24143" UNIQUE ("orderNumber"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "files" ("id" SERIAL NOT NULL, "filename" character varying NOT NULL, "path" character varying NOT NULL, "url" character varying NOT NULL, "mimeType" character varying NOT NULL, "size" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "carts" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_items" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "price" numeric(12,2) NOT NULL, "productName" character varying NOT NULL, "productSlug" character varying NOT NULL, "productImage" character varying, "sellerName" character varying NOT NULL, "discountPrice" numeric(12,2), "discountPercent" integer NOT NULL DEFAULT '0', "minOrder" integer, "maxOrder" integer, "stock" integer NOT NULL, "hasWarranty" boolean NOT NULL DEFAULT false, "warrantyDescription" text, "selectedVariantId" integer, "selectedVariantValueId" integer, "selectedVariantObject" jsonb, "selectedVariantValueObject" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "cartId" integer, "productId" integer NOT NULL, "offerId" integer NOT NULL, CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "offer_variant_values" ("offer_id" integer NOT NULL, "variant_value_id" integer NOT NULL, CONSTRAINT "PK_be95677927acc734b8cdc057bd6" PRIMARY KEY ("offer_id", "variant_value_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a1739a3be37e1c4ecc84cdbb90" ON "offer_variant_values" ("offer_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5cdfe68073a6744bd1ddecb042" ON "offer_variant_values" ("variant_value_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "products_tags_tags" ("productsId" integer NOT NULL, "tagsId" integer NOT NULL, CONSTRAINT "PK_b06c7e3d7d74a176b4d936bcd73" PRIMARY KEY ("productsId", "tagsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_88687975db5205fdbdb10969fc" ON "products_tags_tags" ("productsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_72fa6ba0f176a89a2e9d90274c" ON "products_tags_tags" ("tagsId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "post_tags" ("post_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "PK_deee54a40024b7afc16d25684f8" PRIMARY KEY ("post_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5df4e8dc2cb3e668b962362265" ON "post_tags" ("post_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_192ab488d1c284ac9abe2e3035" ON "post_tags" ("tag_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "post_products" ("post_id" integer NOT NULL, "product_id" integer NOT NULL, CONSTRAINT "PK_924e1c4d0124b9e8713fc9af4fb" PRIMARY KEY ("post_id", "product_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef865fdb52938413178a18dd3b" ON "post_products" ("post_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1d71f0a20f537d8118ba387202" ON "post_products" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users_roles_roles" ("usersId" integer NOT NULL, "rolesId" integer NOT NULL, CONSTRAINT "PK_6c1a055682c229f5a865f2080c1" PRIMARY KEY ("usersId", "rolesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_df951a64f09865171d2d7a502b" ON "users_roles_roles" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b2f0366aa9349789527e0c36d9" ON "users_roles_roles" ("rolesId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "category_closure" ("id_ancestor" integer NOT NULL, "id_descendant" integer NOT NULL, CONSTRAINT "PK_8da8666fc72217687e9b4f4c7e9" PRIMARY KEY ("id_ancestor", "id_descendant"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4aa1348fc4b7da9bef0fae8ff4" ON "category_closure" ("id_ancestor") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6a22002acac4976977b1efd114" ON "category_closure" ("id_descendant") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_categories_closure" ("id_ancestor" integer NOT NULL, "id_descendant" integer NOT NULL, CONSTRAINT "PK_88d9d261ff8b8ec33e94a02a08d" PRIMARY KEY ("id_ancestor", "id_descendant"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_449efbb5bc4f348dea8de05439" ON "product_categories_closure" ("id_ancestor") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b893de72eb86109dcb33d45b49" ON "product_categories_closure" ("id_descendant") `,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10" FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_e3aebe2bd1c53467a07109be596" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" ADD CONSTRAINT "FK_cbf04073e03d8873ae0662053a3" FOREIGN KEY ("parentId") REFERENCES "product_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_values" ADD CONSTRAINT "FK_347a81cb3a53ae7185c4ad351a8" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_values" ADD CONSTRAINT "FK_abcaf2b3103bca604e3c165c827" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" ADD CONSTRAINT "FK_b367708bf720c8dd62fc6833161" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sellers" ADD CONSTRAINT "FK_4c1c59db4ac1ed90a1a7c0ff3df" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seller_offers" ADD CONSTRAINT "FK_2cb082e332eb642a36603b2cc6b" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seller_offers" ADD CONSTRAINT "FK_ec56b801cfc9d94a447ede946c4" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_specifications" ADD CONSTRAINT "FK_845a8fe33a0909b9978b3337669" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_168bf21b341e2ae340748e2541d" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_9667d61ea82200d48b72a81c01e" FOREIGN KEY ("userProfileId") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_1200397d761353a3a79f593b9e4" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_52b4bc1652998dd609949808f58" FOREIGN KEY ("offerId") REFERENCES "seller_offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_3e6f17255dfb30fa41cfd9f0e2f" FOREIGN KEY ("offerId") REFERENCES "seller_offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_variant_values" ADD CONSTRAINT "FK_a1739a3be37e1c4ecc84cdbb907" FOREIGN KEY ("offer_id") REFERENCES "seller_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_variant_values" ADD CONSTRAINT "FK_5cdfe68073a6744bd1ddecb0427" FOREIGN KEY ("variant_value_id") REFERENCES "product_variant_values"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "products_tags_tags" ADD CONSTRAINT "FK_88687975db5205fdbdb10969fc4" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "products_tags_tags" ADD CONSTRAINT "FK_72fa6ba0f176a89a2e9d90274c5" FOREIGN KEY ("tagsId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_tags" ADD CONSTRAINT "FK_5df4e8dc2cb3e668b962362265d" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_tags" ADD CONSTRAINT "FK_192ab488d1c284ac9abe2e30356" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_products" ADD CONSTRAINT "FK_ef865fdb52938413178a18dd3b7" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_products" ADD CONSTRAINT "FK_1d71f0a20f537d8118ba3872022" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_roles_roles" ADD CONSTRAINT "FK_df951a64f09865171d2d7a502b1" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_roles_roles" ADD CONSTRAINT "FK_b2f0366aa9349789527e0c36d97" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_closure" ADD CONSTRAINT "FK_4aa1348fc4b7da9bef0fae8ff48" FOREIGN KEY ("id_ancestor") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_closure" ADD CONSTRAINT "FK_6a22002acac4976977b1efd114a" FOREIGN KEY ("id_descendant") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories_closure" ADD CONSTRAINT "FK_449efbb5bc4f348dea8de054397" FOREIGN KEY ("id_ancestor") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories_closure" ADD CONSTRAINT "FK_b893de72eb86109dcb33d45b49c" FOREIGN KEY ("id_descendant") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_categories_closure" DROP CONSTRAINT "FK_b893de72eb86109dcb33d45b49c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories_closure" DROP CONSTRAINT "FK_449efbb5bc4f348dea8de054397"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_closure" DROP CONSTRAINT "FK_6a22002acac4976977b1efd114a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_closure" DROP CONSTRAINT "FK_4aa1348fc4b7da9bef0fae8ff48"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_roles_roles" DROP CONSTRAINT "FK_b2f0366aa9349789527e0c36d97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_roles_roles" DROP CONSTRAINT "FK_df951a64f09865171d2d7a502b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_products" DROP CONSTRAINT "FK_1d71f0a20f537d8118ba3872022"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_products" DROP CONSTRAINT "FK_ef865fdb52938413178a18dd3b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_tags" DROP CONSTRAINT "FK_192ab488d1c284ac9abe2e30356"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_tags" DROP CONSTRAINT "FK_5df4e8dc2cb3e668b962362265d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products_tags_tags" DROP CONSTRAINT "FK_72fa6ba0f176a89a2e9d90274c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products_tags_tags" DROP CONSTRAINT "FK_88687975db5205fdbdb10969fc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_variant_values" DROP CONSTRAINT "FK_5cdfe68073a6744bd1ddecb0427"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_variant_values" DROP CONSTRAINT "FK_a1739a3be37e1c4ecc84cdbb907"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_3e6f17255dfb30fa41cfd9f0e2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_72679d98b31c737937b8932ebe6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_69828a178f152f157dcf2f70a89"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_52b4bc1652998dd609949808f58"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_1200397d761353a3a79f593b9e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_9667d61ea82200d48b72a81c01e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_168bf21b341e2ae340748e2541d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_specifications" DROP CONSTRAINT "FK_845a8fe33a0909b9978b3337669"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seller_offers" DROP CONSTRAINT "FK_ec56b801cfc9d94a447ede946c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seller_offers" DROP CONSTRAINT "FK_2cb082e332eb642a36603b2cc6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sellers" DROP CONSTRAINT "FK_4c1c59db4ac1ed90a1a7c0ff3df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" DROP CONSTRAINT "FK_b367708bf720c8dd62fc6833161"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_values" DROP CONSTRAINT "FK_abcaf2b3103bca604e3c165c827"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_values" DROP CONSTRAINT "FK_347a81cb3a53ae7185c4ad351a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" DROP CONSTRAINT "FK_cbf04073e03d8873ae0662053a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_e3aebe2bd1c53467a07109be596"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_276779da446413a0d79598d4fbd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b893de72eb86109dcb33d45b49"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_449efbb5bc4f348dea8de05439"`,
    );
    await queryRunner.query(`DROP TABLE "product_categories_closure"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6a22002acac4976977b1efd114"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4aa1348fc4b7da9bef0fae8ff4"`,
    );
    await queryRunner.query(`DROP TABLE "category_closure"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2f0366aa9349789527e0c36d9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_df951a64f09865171d2d7a502b"`,
    );
    await queryRunner.query(`DROP TABLE "users_roles_roles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1d71f0a20f537d8118ba387202"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ef865fdb52938413178a18dd3b"`,
    );
    await queryRunner.query(`DROP TABLE "post_products"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_192ab488d1c284ac9abe2e3035"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5df4e8dc2cb3e668b962362265"`,
    );
    await queryRunner.query(`DROP TABLE "post_tags"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_72fa6ba0f176a89a2e9d90274c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_88687975db5205fdbdb10969fc"`,
    );
    await queryRunner.query(`DROP TABLE "products_tags_tags"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5cdfe68073a6744bd1ddecb042"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a1739a3be37e1c4ecc84cdbb90"`,
    );
    await queryRunner.query(`DROP TABLE "offer_variant_values"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TABLE "files"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum"`);
    await queryRunner.query(`DROP TYPE "public"."orders_paymentmethod_enum"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "user_profile"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TYPE "public"."posts_status_enum"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "product_specifications"`);
    await queryRunner.query(`DROP TABLE "seller_offers"`);
    await queryRunner.query(`DROP TABLE "sellers"`);
    await queryRunner.query(`DROP TABLE "product_images"`);
    await queryRunner.query(`DROP TABLE "product_variants"`);
    await queryRunner.query(`DROP TABLE "product_variant_values"`);
    await queryRunner.query(`DROP TABLE "product_categories"`);
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(`DROP TYPE "public"."comment_status_enum"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
