import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductImageDto {
  @ApiProperty({
    description: 'شناسه محصول',
    example: 1,
  })
  @IsNotEmpty({ message: 'شناسه محصول الزامی است' })
  @IsNumber({}, { message: 'شناسه محصول باید عدد باشد' })
  productId: number;

  @ApiProperty({
    description: 'آدرس URL تصویر',
    example: '/uploads/products/2025/image.jpg',
  })
  @IsNotEmpty({ message: 'آدرس تصویر الزامی است' })
  @IsString({ message: 'آدرس تصویر باید رشته باشد' })
  url: string;

  @ApiPropertyOptional({
    description: 'متن جایگزین تصویر (alt)',
    example: 'تصویر گوشی موبایل سامسونگ',
  })
  @IsOptional()
  @IsString({ message: 'متن جایگزین باید رشته باشد' })
  alt?: string;

  @ApiPropertyOptional({
    description: 'آیا این تصویر اصلی محصول است؟',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'وضعیت تصویر اصلی باید boolean باشد' })
  isMain?: boolean;
}
