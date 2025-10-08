import { Module } from '@nestjs/common';
import { SellerOfferService } from './seller-offer.service';
import { SellerOfferController } from './seller-offer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seller } from 'src/entities/seller.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seller])],
  controllers: [SellerOfferController],
  providers: [SellerOfferService],
})
export class SellerOfferModule {}
