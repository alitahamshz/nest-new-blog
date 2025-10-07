import { Test, TestingModule } from '@nestjs/testing';
import { AttributeValueController } from './attribute-value.controller';
import { AttributeValueService } from './attribute-value.service';

describe('AttributeValueController', () => {
  let controller: AttributeValueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttributeValueController],
      providers: [AttributeValueService],
    }).compile();

    controller = module.get<AttributeValueController>(AttributeValueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
