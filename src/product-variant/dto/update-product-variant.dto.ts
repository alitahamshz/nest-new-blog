import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CreateProductVariantDto,
  CreateProductVariantValueInlineDto,
} from './create-product-variant.dto';
import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductVariantDto extends PartialType(
  CreateProductVariantDto,
) {
  @ApiPropertyOptional({
    description: 'مقادیر نوع تنوع برای بروزرسانی',
    type: [CreateProductVariantValueInlineDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantValueInlineDto)
  values?: CreateProductVariantValueInlineDto[];
}
