import { Injectable } from '@nestjs/common';
import { CreateSellerOfferDto } from './dto/create-seller-offer.dto';
import { UpdateSellerOfferDto } from './dto/update-seller-offer.dto';

@Injectable()
export class SellerOfferService {
  create(createSellerOfferDto: CreateSellerOfferDto) {
    return 'This action adds a new sellerOffer';
  }

  findAll() {
    return `This action returns all sellerOffer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sellerOffer`;
  }

  update(id: number, updateSellerOfferDto: UpdateSellerOfferDto) {
    return `This action updates a #${id} sellerOffer`;
  }

  remove(id: number) {
    return `This action removes a #${id} sellerOffer`;
  }
}
