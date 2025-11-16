import { Module } from '@nestjs/common';
import { ProductVariantValueService } from './product-variant-value.service';
import { ProductVariantValueController } from './product-variant-value.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantValue } from 'src/entities/product-variant-value.entity';
import { ProductVariant } from 'src/entities/product-variant.entity';
import { Product } from 'src/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductVariantValue, ProductVariant, Product]),
  ],
  controllers: [ProductVariantValueController],
  providers: [ProductVariantValueService],
  exports: [ProductVariantValueService],
})
export class ProductVariantValueModule {}
