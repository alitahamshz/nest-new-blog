import { Module } from '@nestjs/common';
import { SellerOfferService } from './seller-offer.service';
import { SellerOfferController } from './seller-offer.controller';

@Module({
  controllers: [SellerOfferController],
  providers: [SellerOfferService],
})
export class SellerOfferModule {}
