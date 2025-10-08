import { Module } from '@nestjs/common';
import { ProductVariantService } from './product-variant.service';
import { ProductVariantController } from './product-variant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { SellerOffer } from 'src/entities/seller-offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, SellerOffer])],
  controllers: [ProductVariantController],
  providers: [ProductVariantService],
})
export class ProductVariantModule {}
