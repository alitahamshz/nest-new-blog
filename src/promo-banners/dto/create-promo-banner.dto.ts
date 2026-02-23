import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePromoBannerDto {
  @ApiProperty({ example: '/img/promo1.webp', description: 'آدرس تصویر' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiPropertyOptional({ example: '/shop/products', description: 'لینک مقصد' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ example: 0, description: 'ترتیب نمایش' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true, description: 'فعال/غیرفعال' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
