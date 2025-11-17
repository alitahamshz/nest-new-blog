import {
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from '../../entities/post.entity';

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'یادگیری NestJS سطح پیشرفته' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'nestjs-learning-advanced' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'سئو پیشرفته NestJS' })
  @IsOptional()
  @IsString()
  seo_title?: string;

  @ApiPropertyOptional({ example: 'این مقاله درباره NestJS است...' })
  @IsOptional()
  @IsString()
  meta_description?: string;

  @ApiPropertyOptional({ example: 'خلاصه جدید مقاله...' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({ example: '<p>محتوای جدید مقاله</p>' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: ['nestjs', 'typescript'], type: [String] })
  @IsOptional()
  @IsArray()
  inner_tags?: string[];

  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  @IsOptional()
  @IsArray()
  tags?: number[];

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'آی‌دی محصولات مرتبط',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  productIds?: number[];

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  category_id?: number;

  @ApiPropertyOptional({
    enum: PostStatus,
    example: PostStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({ example: '/uploads/2025/09/cover.png' })
  @IsOptional()
  @IsString()
  cover_image?: string;

  @ApiPropertyOptional({ example: '/uploads/2025/09/thumb.png' })
  @IsOptional()
  @IsString()
  thumbnail?: string;
}
