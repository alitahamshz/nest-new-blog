import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({
    description: 'شناسه محصول',
    example: 1,
  })
  @IsNotEmpty({ message: 'شناسه محصول الزامی است' })
  @IsNumber({}, { message: 'شناسه محصول باید عدد باشد' })
  productId: number;

  @ApiProperty({
    description: 'نام ویژگی (مثلاً رنگ، سایز)',
    example: 'رنگ',
  })
  @IsNotEmpty({ message: 'نام ویژگی الزامی است' })
  @IsString({ message: 'نام ویژگی باید رشته باشد' })
  @MaxLength(100, { message: 'نام ویژگی نباید بیشتر از 100 کاراکتر باشد' })
  name: string;

  @ApiProperty({
    description: 'مقدار ویژگی (مثلاً قرمز، XL)',
    example: 'قرمز',
  })
  @IsNotEmpty({ message: 'مقدار ویژگی الزامی است' })
  @IsString({ message: 'مقدار ویژگی باید رشته باشد' })
  @MaxLength(100, { message: 'مقدار ویژگی نباید بیشتر از 100 کاراکتر باشد' })
  value: string;

  @ApiPropertyOptional({
    description: 'کد SKU واریانت',
    example: 'TSHIRT-RED-XL',
  })
  @IsOptional()
  @IsString({ message: 'SKU باید رشته باشد' })
  @MaxLength(50, { message: 'SKU نباید بیشتر از 50 کاراکتر باشد' })
  sku?: string;
}
