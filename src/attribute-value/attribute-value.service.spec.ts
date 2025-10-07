import { Test, TestingModule } from '@nestjs/testing';
import { AttributeValueService } from './attribute-value.service';

describe('AttributeValueService', () => {
  let service: AttributeValueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttributeValueService],
    }).compile();

    service = module.get<AttributeValueService>(AttributeValueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
