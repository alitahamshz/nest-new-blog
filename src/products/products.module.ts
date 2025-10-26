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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Tag,
      ProductCategory,
      ProductVariant,
      ProductImage,
      ProductSpecification,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
