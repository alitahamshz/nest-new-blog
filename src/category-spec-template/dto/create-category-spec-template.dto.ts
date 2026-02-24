import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';
import { SpecType } from '../../entities/category-spec-template.entity';

export class CreateCategorySpecTemplateDto {
  @ApiProperty({ description: 'شناسه دسته‌بندی' })
  @IsNumber()
  categoryId!: number;

  @ApiProperty({ description: 'نام ویژگی', example: 'اندازه صفحه' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'کلید یکتا برای Query', example: 'screen_size' })
  @IsString()
  key!: string;

  @ApiProperty({ enum: SpecType, description: 'نوع ویژگی', default: SpecType.TEXT })
  @IsEnum(SpecType)
  @IsOptional()
  type?: SpecType;

  @ApiPropertyOptional({ description: 'واحد اندازه‌گیری', example: 'اینچ' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({
    description: 'گزینه‌های ممکن برای نوع select',
    type: [String],
    example: ['Samsung', 'Apple', 'Xiaomi'],
  })
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiPropertyOptional({ description: 'قابل فیلتر بودن', default: true })
  @IsBoolean()
  @IsOptional()
  filterable?: boolean;

  @ApiPropertyOptional({ description: 'ترتیب نمایش', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  displayOrder?: number;
}
