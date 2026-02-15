import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from 'src/entities/product.entity';
import { Tag } from 'src/entities/tag.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from 'src/entities/product-category.entity';
import { ProductVariant } from 'src/entities/product-variant.entity';
import { ProductImage } from 'src/entities/product-image.entity';
import { ProductSpecification } from 'src/entities/product-specification.entity';
import { SellerOffer } from 'src/entities/seller-offer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Tag,
      ProductCategory,
      ProductVariant,
      ProductImage,
      ProductSpecification,
      SellerOffer,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
