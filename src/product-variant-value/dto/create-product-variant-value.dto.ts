import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductVariantValueDto {
  @ApiProperty({
    description: 'شناسه واریانت',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  variantId: number;

  @ApiProperty({
    description: 'نام مقدار تنوع (سبز، قرمز، S، XL)',
    example: 'قرمز',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'آیکن مقدار',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'تصویر مقدار',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'کد رنگ (برای رنگ‌ها)',
    example: '#FF0000',
  })
  @IsOptional()
  @IsString()
  hexCode?: string;
}
