import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerOfferService } from './seller-offer.service';
import { SellerOfferController } from './seller-offer.controller';
import { SellerOffer } from '../entities/seller-offer.entity';
import { Seller } from '../entities/seller.entity';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerOffer, Seller, Product, ProductVariant]),
  ],
  controllers: [SellerOfferController],
  providers: [SellerOfferService],
  exports: [SellerOfferService],
})
export class SellerOfferModule {}
