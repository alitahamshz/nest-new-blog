import { Module } from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategoriesController } from './product-categories.controller';
import { ProductCategory } from 'src/entities/product-category.entity';
import { Product } from 'src/entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ProductCategory, Product])],
  controllers: [ProductCategoriesController],
  providers: [ProductCategoriesService],
})
export class ProductCategoriesModule {}
