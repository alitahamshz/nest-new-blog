import { PartialType } from '@nestjs/swagger';
import { CreateProductImageDto } from './create-product_image.dto';

export class UpdateProductImageDto extends PartialType(CreateProductImageDto) {}
