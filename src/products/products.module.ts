import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from 'src/entities/product.entity';
import { Tag } from 'src/entities/tag.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from 'src/entities/product-category.entity';
import { Attribute } from 'src/entities/attribute.entity';
import { ProductVariant } from 'src/entities/product-variant.entity';
import { ProductImage } from 'src/entities/product-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Tag,
      ProductCategory,
      Attribute,
      ProductVariant,
      ProductImage,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
