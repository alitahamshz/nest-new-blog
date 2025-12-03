import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
  Min,
  Max,
  ValidateIf,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSellerOfferDto {
  @ApiProperty({
    description: 'شناسه فروشنده',
    example: 1,
  })
  @IsNotEmpty({ message: 'شناسه فروشنده الزامی است' })
  @IsNumber({}, { message: 'شناسه فروشنده باید عدد باشد' })
  sellerId: number;

  @ApiProperty({
    description: 'شناسه محصول',
    example: 1,
  })
  @IsNotEmpty({ message: 'شناسه محصول الزامی است' })
  @IsNumber({}, { message: 'شناسه محصول باید عدد باشد' })
  productId: number;

  @ApiPropertyOptional({
    description: 'شناسه‌های مقادیر واریانت (برای محصول با واریانت)',
    example: [1, 2],
  })
  @IsOptional()
  @IsArray({ message: 'مقادیر واریانت باید آرایه باشند' })
  @IsNumber({}, { each: true, message: 'هر شناسه واریانت باید عدد باشد' })
  variantValueIds?: number[];

  @ApiProperty({
    description: 'قیمت پایه محصول',
    example: 1500000,
  })
  @IsNotEmpty({ message: 'قیمت الزامی است' })
  @IsNumber({}, { message: 'قیمت باید عدد باشد' })
  @Min(0, { message: 'قیمت نمی‌تواند منفی باشد' })
  price: number;

  @ApiPropertyOptional({
    description: 'قیمت با تخفیف',
    example: 1350000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'قیمت تخفیف‌خورده باید عدد باشد' })
  @Min(0, { message: 'قیمت تخفیف‌خورده نمی‌تواند منفی باشد' })
  discountPrice?: number;

  @ApiPropertyOptional({
    description: 'درصد تخفیف (0 تا 100)',
    example: 10,
  })
  @IsOptional()
  @IsNumber({}, { message: 'درصد تخفیف باید عدد باشد' })
  @Min(0, { message: 'درصد تخفیف نمی‌تواند منفی باشد' })
  @Max(100, { message: 'درصد تخفیف نمی‌تواند بیشتر از 100 باشد' })
  discountPercent?: number;

  @ApiProperty({
    description: 'تعداد موجودی در انبار',
    example: 50,
  })
  @IsNotEmpty({ message: 'موجودی الزامی است' })
  @IsNumber({}, { message: 'موجودی باید عدد باشد' })
  @Min(0, { message: 'موجودی نمی‌تواند منفی باشد' })
  stock: number;

  @ApiPropertyOptional({
    description: 'حداقل تعداد سفارش',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'حداقل سفارش باید عدد باشد' })
  @Min(1, { message: 'حداقل سفارش باید حداقل 1 باشد' })
  minOrder?: number;

  @ApiPropertyOptional({
    description: 'حداکثر تعداد سفارش',
    example: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'حداکثر سفارش باید عدد باشد' })
  @Min(1, { message: 'حداکثر سفارش باید حداقل 1 باشد' })
  maxOrder?: number;

  @ApiPropertyOptional({
    description: 'نقد و بررسی محصول توسط فروشنده',
    example: 'این محصول با کیفیت عالی است و...',
  })
  @IsOptional()
  @IsString({ message: 'نقد و بررسی باید رشته باشد' })
  sellerNotes?: string;

  @ApiPropertyOptional({
    description: 'آیا گارانتی دارد؟',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'وضعیت گارانتی باید boolean باشد' })
  hasWarranty?: boolean;

  @ApiPropertyOptional({
    description: 'توضیحات گارانتی',
    example: 'گارانتی 18 ماهه شرکتی',
  })
  @ValidateIf((o: CreateSellerOfferDto) => o.hasWarranty === true)
  @IsString({ message: 'توضیحات گارانتی باید رشته باشد' })
  warrantyDescription?: string;

  @ApiPropertyOptional({
    description: 'آیا این پیشنهاد پیش‌فرض است؟',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'وضعیت پیش‌فرض باید boolean باشد' })
  isDefault?: boolean;
}
