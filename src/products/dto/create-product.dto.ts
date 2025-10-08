import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    description: 'لیست شناسه ویژگی‌ها',
    type: [Number],
    required: false,
  })
  @IsArray()
  @IsOptional()
  attributeIds?: number[];

  @ApiProperty({
    description: 'لیست URL های تصاویر گالری',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  galleryUrls?: string[];
}
