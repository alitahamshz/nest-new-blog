import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SyncCartItemDto {
  @ApiProperty({
    description: 'شناسه یکتای آیتم سبد (مثل: offer_54_variant_36)',
    example: 'offer_54_variant_36',
  })
  @IsNotEmpty({ message: 'cartItemId الزامی است' })
  @IsString({ message: 'cartItemId باید رشته‌ای باشد' })
  cartItemId: string;

  @ApiProperty({
    description: 'شناسه محصول',
    example: 17,
  })
  @IsNotEmpty({ message: 'productId الزامی است' })
  @IsNumber({}, { message: 'productId باید عدد باشد' })
  productId: number;

  @ApiProperty({
    description: 'نام محصول',
    example: 'گوشی موبایل اپل',
  })
  @IsNotEmpty({ message: 'productName الزامی است' })
  @IsString({ message: 'productName باید رشته‌ای باشد' })
  productName: string;

  @ApiProperty({
    description: 'slug محصول',
  })
  @IsNotEmpty({ message: 'productSlug الزامی است' })
  @IsString({ message: 'productSlug باید رشته‌ای باشد' })
  productSlug: string;

  @ApiPropertyOptional({
    description: 'لینک تصویر محصول',
  })
  @IsOptional()
  @IsString({ message: 'productImage باید رشته‌ای باشد' })
  productImage?: string;

  @ApiProperty({
    description: 'شناسه پیشنهاد فروشنده',
    example: 54,
  })
  @IsNotEmpty({ message: 'offerId الزامی است' })
  @IsNumber({}, { message: 'offerId باید عدد باشد' })
  offerId: number;

  @ApiProperty({
    description: 'نام فروشنده',
  })
  @IsNotEmpty({ message: 'sellerName الزامی است' })
  @IsString({ message: 'sellerName باید رشته‌ای باشد' })
  sellerName: string;

  @ApiProperty({
    description: 'قیمت اصلی',
    example: 18000000,
  })
  @IsNotEmpty({ message: 'price الزامی است' })
  @IsNumber({}, { message: 'price باید عدد باشد' })
  price: number;

  @ApiPropertyOptional({
    description: 'قیمت تخفیف‌دار',
  })
  @IsOptional()
  @IsNumber({}, { message: 'discountPrice باید عدد باشد' })
  discountPrice?: number;

  @ApiPropertyOptional({
    description: 'درصد تخفیف',
    example: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'discountPercent باید عدد باشد' })
  discountPercent?: number;

  @ApiPropertyOptional({
    description: 'شناسه واریانت انتخاب شده',
    example: 15,
  })
  @IsOptional()
  @IsNumber({}, { message: 'selectedVariantId باید عدد باشد' })
  selectedVariantId?: number;

  @ApiPropertyOptional({
    description: 'شناسه مقدار واریانت انتخاب شده',
    example: 36,
  })
  @IsOptional()
  @IsNumber({}, { message: 'selectedVariantValueId باید عدد باشد' })
  selectedVariantValueId?: number;

  @ApiPropertyOptional({
    description: 'object کامل واریانت انتخاب شده',
  })
  @IsOptional()
  selectedVariantObject?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'object کامل مقدار واریانت انتخاب شده',
  })
  @IsOptional()
  selectedVariantValueObject?: Record<string, any>;

  @ApiProperty({
    description: 'تعداد',
    example: 1,
  })
  @IsNotEmpty({ message: 'quantity الزامی است' })
  @IsNumber({}, { message: 'quantity باید عدد باشد' })
  quantity: number;

  @ApiPropertyOptional({
    description: 'حداقل سفارش',
  })
  @IsOptional()
  @IsNumber({}, { message: 'minOrder باید عدد باشد' })
  minOrder?: number;

  @ApiPropertyOptional({
    description: 'حداکثر سفارش',
  })
  @IsOptional()
  @IsNumber({}, { message: 'maxOrder باید عدد باشد' })
  maxOrder?: number;

  @ApiProperty({
    description: 'موجودی',
    example: 25,
  })
  @IsNotEmpty({ message: 'stock الزامی است' })
  @IsNumber({}, { message: 'stock باید عدد باشد' })
  stock: number;

  @ApiProperty({
    description: 'آیا محصول گارانتی دارد',
    example: true,
  })
  @IsNotEmpty({ message: 'hasWarranty الزامی است' })
  hasWarranty: boolean;

  @ApiPropertyOptional({
    description: 'توضیح گارانتی',
  })
  @IsOptional()
  @IsString({ message: 'warrantyDescription باید رشته‌ای باشد' })
  warrantyDescription?: string;
}

export class SyncCartDto {
  @ApiProperty({
    description: 'آیتم‌های سبد خرید آفلاین',
    type: [SyncCartItemDto],
  })
  @IsNotEmpty({ message: 'items الزامی است' })
  @IsArray({ message: 'items باید آرایه‌ای باشد' })
  @ValidateNested({ each: true })
  @Type(() => SyncCartItemDto)
  items: SyncCartItemDto[];
}
