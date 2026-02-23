import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { PostsModule } from './posts/posts.module';
import { CategoryModule } from './category/category.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from './files/files.module';
import { CommentsModule } from './comments/comments.module';
import { UserProfileModule } from './users/user-profile.module';
import { ProductsModule } from './products/products.module';
import { SellerModule } from './seller/seller.module';
import { ProductImagesModule } from './product_images/product_images.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { SellerOfferModule } from './seller-offer/seller-offer.module';
import { ProductVariantModule } from './product-variant/product-variant.module';
import { ProductVariantValueModule } from './product-variant-value/product-variant-value.module';
import { ProductSpecificationModule } from './product-specification/product-specification.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentModule } from './payments/payment.module';
import { BannersModule } from './banners/banners.module';
import { PromoBannersModule } from './promo-banners/promo-banners.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    PostsModule,
    CategoryModule,
    TagsModule,
    UsersModule,
    RolesModule,
    AuthModule,
    FilesModule,
    CommentsModule,
    UserProfileModule,
    ProductsModule,
    SellerModule,
    ProductImagesModule,
    ProductCategoriesModule,
    SellerOfferModule,
    ProductVariantModule,
    ProductVariantValueModule,
    ProductSpecificationModule,
    CartModule,
    OrdersModule,
    PaymentModule,
    BannersModule,
    PromoBannersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
