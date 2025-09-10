import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Programming', description: 'نام دسته‌بندی' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'programming', description: 'اسلاگ دسته‌بندی' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers and dashes',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 1, description: 'شناسه والد دسته‌بندی' })
  @IsOptional()
  parentId?: number;
}
