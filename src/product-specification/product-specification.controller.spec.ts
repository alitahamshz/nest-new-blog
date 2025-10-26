import { Test, TestingModule } from '@nestjs/testing';
import { ProductSpecificationController } from './product-specification.controller';
import { ProductSpecificationService } from './product-specification.service';

describe('ProductSpecificationController', () => {
  let controller: ProductSpecificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSpecificationController],
      providers: [ProductSpecificationService],
    }).compile();

    controller = module.get<ProductSpecificationController>(
      ProductSpecificationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
