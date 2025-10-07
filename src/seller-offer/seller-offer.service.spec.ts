import { Test, TestingModule } from '@nestjs/testing';
import { SellerOfferService } from './seller-offer.service';

describe('SellerOfferService', () => {
  let service: SellerOfferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SellerOfferService],
    }).compile();

    service = module.get<SellerOfferService>(SellerOfferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
