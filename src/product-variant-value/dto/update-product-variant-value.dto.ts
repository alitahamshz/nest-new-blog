import { PartialType } from '@nestjs/swagger';
import { CreateProductVariantValueDto } from './create-product-variant-value.dto';

export class UpdateProductVariantValueDto extends PartialType(
  CreateProductVariantValueDto,
) {}
