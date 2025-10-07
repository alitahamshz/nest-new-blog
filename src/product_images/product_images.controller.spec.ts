import { Test, TestingModule } from '@nestjs/testing';
import { ProductImagesController } from './product_images.controller';
import { ProductImagesService } from './product_images.service';

describe('ProductImagesController', () => {
  let controller: ProductImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductImagesController],
      providers: [ProductImagesService],
    }).compile();

    controller = module.get<ProductImagesController>(ProductImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
