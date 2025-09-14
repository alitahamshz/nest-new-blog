import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from '../entities/post.entity';

export class CreatePostDto {
  @ApiProperty({ example: 'یادگیری NestJS', description: 'عنوان پست' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'nestjs-learning',
    description: 'اسلاگ یکتا برای پست',
  })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    example: 'آموزش جامع NestJS',
    description: 'عنوان سئو',
  })
  @IsOptional()
  @IsString()
  seo_title?: string;

  @ApiPropertyOptional({
    example: 'این مقاله به آموزش فریمورک NestJS می‌پردازد',
    description: 'متا دیسکریپشن برای سئو',
  })
  @IsOptional()
  @IsString()
  meta_description?: string;

  @ApiPropertyOptional({
    example: 'یک خلاصه کوتاه از مقاله...',
    description: 'خلاصه مقاله',
  })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({
    example: '<p>محتوای کامل مقاله اینجاست...</p>',
    description: 'محتوای مقاله',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    example: ['nestjs', 'backend', 'typescript'],
    description: 'تگ‌های داخلی (string[])',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  inner_tags?: string[];

  @ApiPropertyOptional({ example: 1, description: 'شناسه نویسنده' })
  @IsOptional()
  @IsNumber()
  author_id?: number; // 🔹 اینو اضافه کن

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'آی‌دی تگ‌های انتخاب شده',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  tags?: number[];


  @IsOptional()
  @IsString()
  cover_image?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'آی‌دی دسته‌بندی',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  category_id?: number;

  @ApiPropertyOptional({
    enum: PostStatus,
    example: PostStatus.DRAFT,
    description: 'وضعیت مقاله (draft | published | pending)',
  })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;
}
