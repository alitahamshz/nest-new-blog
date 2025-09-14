/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterPostsDto {
  @ApiPropertyOptional({ description: 'شماره صفحه', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'تعداد آیتم در هر صفحه', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'جستجو بر اساس عنوان', example: 'NestJS' })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'نام نویسنده', example: 'Ali' })
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({ description: 'وضعیت پست', example: 'published' })
  @IsOptional()
  status?: string;
}
