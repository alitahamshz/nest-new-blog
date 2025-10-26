import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductSpecificationDto {
  @ApiProperty({
    description: 'نام ویژگی (کلید)',
    example: 'کشور سازنده',
  })
  @IsNotEmpty({ message: 'نام ویژگی الزامی است' })
  @IsString({ message: 'نام ویژگی باید رشته باشد' })
  key: string;

  @ApiProperty({
    description: 'مقدار ویژگی',
    example: 'ایران',
  })
  @IsNotEmpty({ message: 'مقدار ویژگی الزامی است' })
  @IsString({ message: 'مقدار ویژگی باید رشته باشد' })
  value: string;

  @ApiPropertyOptional({
    description: 'واحد اندازه‌گیری (اختیاری)',
    example: 'کیلوگرم',
  })
  @IsOptional()
  @IsString({ message: 'واحد اندازه‌گیری باید رشته باشد' })
  unit?: string;

  @ApiPropertyOptional({
    description: 'ترتیب نمایش',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ترتیب نمایش باید عدد باشد' })
  @Min(0, { message: 'ترتیب نمایش نمی‌تواند منفی باشد' })
  displayOrder?: number;
}
