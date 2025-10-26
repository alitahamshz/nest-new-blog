import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateProductSpecificationDto } from '../../product-specification/dto';

export class CreateProductDto {
  @ApiProperty({ description: 'نام محصول' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Slug محصول', example: 'my-product' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'توضیحات محصول', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'توضیحات سئو', required: false })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiProperty({ description: 'کد محصول (SKU)', required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ description: 'آدرس تصویر اصلی محصول', required: false })
  @IsString()
  @IsOptional()
  mainImage?: string;

  @ApiProperty({ description: 'آیا محصول واریانت دارد یا خیر', default: false })
  @IsBoolean()
  @IsOptional()
  hasVariant?: boolean;

  @ApiProperty({ description: 'شناسه دسته‌بندی محصول' })
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    description: 'لیست شناسه تگ‌ها',
    type: [Number],
    required: false,
  })
  @IsArray()
  @IsOptional()
  tagIds?: number[];

  @ApiProperty({
    description: 'مشخصات فنی محصول (ویژگی‌های ثابت)',
    type: [CreateProductSpecificationDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSpecificationDto)
  specifications?: CreateProductSpecificationDto[];

  @ApiProperty({
    description: 'لیست URL های تصاویر گالری',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  galleryUrls?: string[];
}
