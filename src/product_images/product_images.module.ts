import { Module } from '@nestjs/common';
import { ProductImagesService } from './product_images.service';
import { ProductImagesController } from './product_images.controller';

@Module({
  controllers: [ProductImagesController],
  providers: [ProductImagesService],
})
export class ProductImagesModule {}
