import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductVariantValueInlineDto {
  @ApiProperty({
    description: 'نام مقدار تنوع (مثلاً سبز، قرمز، S، XL)',
    example: 'قرمز',
  })
  @IsNotEmpty({ message: 'نام مقدار الزامی است' })
  @IsString({ message: 'نام مقدار باید رشته باشد' })
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'آیکن مقدار',
    example: 'http://localhost:5000/uploads/2025/11/icon.png',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'تصویر مقدار',
    example: 'http://localhost:5000/uploads/2025/11/color.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'کد رنگ (برای رنگ‌ها)',
    example: '#FF0000',
  })
  @IsOptional()
  @IsString()
  hexCode?: string;
}

export class CreateProductVariantDto {
  @ApiProperty({
    description: 'شناسه محصول',
    example: 1,
  })
  @IsNotEmpty({ message: 'شناسه محصول الزامی است' })
  @IsNumber({}, { message: 'شناسه محصول باید عدد باشد' })
  productId: number;

  @ApiProperty({
    description: 'نام نوع تنوع (مثلاً رنگ، سایز)',
    example: 'رنگ',
  })
  @IsNotEmpty({ message: 'نام تنوع الزامی است' })
  @IsString({ message: 'نام تنوع باید رشته باشد' })
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'آیکن نوع تنوع',
    example: 'http://localhost:5000/uploads/2025/11/color-icon.png',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'تصویر نوع تنوع',
    example: 'http://localhost:5000/uploads/2025/11/color-image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'کد SKU واریانت',
    example: 'COLOR',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @ApiProperty({
    description: 'مقادیر نوع تنوع',
    type: [CreateProductVariantValueInlineDto],
  })
  @IsArray({ message: 'مقادیر باید آرایه باشند' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantValueInlineDto)
  values: CreateProductVariantValueInlineDto[];
}
