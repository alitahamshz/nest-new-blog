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
    description: 'شناسه یکتای آیتم سبد (مثل: offer_59_variant_1641)',
    example: 'offer_59_variant_1641',
  })
  @IsNotEmpty({ message: 'cartItemId الزامی است' })
  @IsString({ message: 'cartItemId باید رشته‌ای باشد' })
  cartItemId: string;

  @ApiProperty({
    description: 'شناسه محصول',
    example: 20,
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
    example: 'گوشی-موبایل-اپل-iphone-16',
  })
  @IsNotEmpty({ message: 'productSlug الزامی است' })
  @IsString({ message: 'productSlug باید رشته‌ای باشد' })
  productSlug: string;

  @ApiPropertyOptional({
    description: 'لینک تصویر محصول',
    example: 'http://localhost:5000/uploads/2025/12/image.jpg',
  })
  @IsOptional()
  @IsString({ message: 'productImage باید رشته‌ای باشد' })
  productImage?: string;

  @ApiProperty({
    description: 'شناسه پیشنهاد فروشنده',
    example: 59,
  })
  @IsNotEmpty({ message: 'offerId الزامی است' })
  @IsNumber({}, { message: 'offerId باید عدد باشد' })
  offerId: number;

  @ApiProperty({
    description: 'نام فروشنده',
    example: 'ادمین فروشنده',
  })
  @IsNotEmpty({ message: 'sellerName الزامی است' })
  @IsString({ message: 'sellerName باید رشته‌ای باشد' })
  sellerName: string;

  @ApiProperty({
    description: 'قیمت اصلی',
    example: 26000000,
  })
  @IsNotEmpty({ message: 'price الزامی است' })
  @IsNumber({}, { message: 'price باید عدد باشد' })
  price: number;

  @ApiPropertyOptional({
    description: 'قیمت تخفیف‌دار',
    example: 26000000,
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
    description: 'واریانت‌های انتخاب شده (مثل: {16: 41})',
    example: { 16: 41 },
  })
  @IsOptional()
  selectedVariants?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'نام‌های واریانت‌های انتخاب شده',
    example: { 16: { variantName: 'مقدار حافظه', valueName: '512 گیگابایت' } },
  })
  @IsOptional()
  variantNames?: Record<string, any>;

  @ApiProperty({
    description: 'تعداد',
    example: 1,
  })
  @IsNotEmpty({ message: 'quantity الزامی است' })
  @IsNumber({}, { message: 'quantity باید عدد باشد' })
  quantity: number;

  @ApiProperty({
    description: 'حداقل سفارش',
    example: 1,
  })
  @IsNotEmpty({ message: 'minOrder الزامی است' })
  @IsNumber({}, { message: 'minOrder باید عدد باشد' })
  minOrder: number;

  @ApiProperty({
    description: 'حداکثر سفارش',
    example: 2,
  })
  @IsNotEmpty({ message: 'maxOrder الزامی است' })
  @IsNumber({}, { message: 'maxOrder باید عدد باشد' })
  maxOrder: number;

  @ApiProperty({
    description: 'موجودی',
    example: 20,
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
    example: 'گارانتی 24 ماهه',
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
