import { Test, TestingModule } from '@nestjs/testing';
import { SellerOfferController } from './seller-offer.controller';
import { SellerOfferService } from './seller-offer.service';

describe('SellerOfferController', () => {
  let controller: SellerOfferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerOfferController],
      providers: [SellerOfferService],
    }).compile();

    controller = module.get<SellerOfferController>(SellerOfferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
