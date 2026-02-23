import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BannerSection } from '../banner.entity';

export class CreateBannerDto {
  @ApiPropertyOptional({ enum: BannerSection, example: BannerSection.BLOG })
  @IsOptional()
  @IsEnum(BannerSection)
  section?: BannerSection;

  @ApiPropertyOptional({
    example: 'blog_sidebar_1',
    description: 'شناسه یکتای جایگاه',
  })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ example: 'جشنواره تابستانه', description: 'عنوان بنر' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'تا ۷۰٪ تخفیف', description: 'زیرعنوان' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ example: 'فرصت محدود', description: 'توضیحات کوتاه' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '/img/banner1.webp', description: 'آدرس تصویر' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiPropertyOptional({ example: '/shop/products', description: 'لینک دکمه' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ example: 'مشاهده محصولات', description: 'متن دکمه' })
  @IsOptional()
  @IsString()
  btnText?: string;

  @ApiPropertyOptional({ example: '#6d28d9', description: 'رنگ پس‌زمینه' })
  @IsOptional()
  @IsString()
  bgColor?: string;

  @ApiPropertyOptional({ example: 0, description: 'ترتیب نمایش' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true, description: 'فعال/غیرفعال' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
