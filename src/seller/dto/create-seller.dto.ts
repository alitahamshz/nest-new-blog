import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSellerDto {
  @ApiProperty({
    description: 'شناسه کاربر که می‌خواهد فروشنده شود',
    example: 1,
  })
  @IsNotEmpty({ message: 'شناسه کاربر الزامی است' })
  @IsNumber({}, { message: 'شناسه کاربر باید عدد باشد' })
  userId: number;

  @ApiProperty({
    description: 'نام تجاری فروشگاه',
    example: 'فروشگاه الکترونیک پارس',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'نام تجاری الزامی است' })
  @IsString({ message: 'نام تجاری باید رشته باشد' })
  @MaxLength(255, { message: 'نام تجاری نباید بیشتر از 255 کاراکتر باشد' })
  businessName: string;

  @ApiPropertyOptional({
    description: 'شماره ثبت شرکت/کسب‌وکار',
    example: '12345678',
  })
  @IsOptional()
  @IsString({ message: 'شماره ثبت باید رشته باشد' })
  registrationNumber?: string;

  @ApiPropertyOptional({
    description: 'کد ملی یا شناسه ملی',
    example: '1234567890',
  })
  @IsOptional()
  @IsString({ message: 'کد ملی باید رشته باشد' })
  @MinLength(10, { message: 'کد ملی باید 10 رقم باشد' })
  @MaxLength(11, { message: 'شناسه ملی نباید بیشتر از 11 رقم باشد' })
  nationalId?: string;

  @ApiPropertyOptional({
    description: 'شماره تماس فروشگاه',
    example: '09123456789',
  })
  @IsOptional()
  @IsString({ message: 'شماره تماس باید رشته باشد' })
  @MinLength(11, { message: 'شماره تماس باید 11 رقم باشد' })
  @MaxLength(11, { message: 'شماره تماس نباید بیشتر از 11 رقم باشد' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'آدرس لوگوی فروشگاه',
    example: '/uploads/logos/logo.png',
  })
  @IsOptional()
  @IsString({ message: 'آدرس لوگو باید رشته باشد' })
  logo?: string;

  @ApiPropertyOptional({
    description: 'شماره کارت بانکی',
    example: '6037991234567890',
  })
  @IsOptional()
  @IsString({ message: 'شماره کارت باید رشته باشد' })
  @MinLength(16, { message: 'شماره کارت باید 16 رقم باشد' })
  @MaxLength(16, { message: 'شماره کارت باید 16 رقم باشد' })
  cardNumber?: string;

  @ApiPropertyOptional({
    description: 'شماره حساب بانکی',
    example: '123456789',
  })
  @IsOptional()
  @IsString({ message: 'شماره حساب باید رشته باشد' })
  accountNumber?: string;

  @ApiPropertyOptional({
    description: 'شماره شبا (بدون IR)',
    example: 'IR123456789012345678901234',
  })
  @IsOptional()
  @IsString({ message: 'شماره شبا باید رشته باشد' })
  @MinLength(24, { message: 'شماره شبا باید 24 کاراکتر باشد' })
  @MaxLength(26, { message: 'شماره شبا نباید بیشتر از 26 کاراکتر باشد' })
  shebaNumber?: string;

  @ApiPropertyOptional({
    description: 'آدرس فروشگاه/انبار',
    example: 'تهران، خیابان ولیعصر، پلاک 123',
  })
  @IsOptional()
  @IsString({ message: 'آدرس باید رشته باشد' })
  address?: string;

  @ApiPropertyOptional({
    description: 'توضیحات درباره فروشگاه',
    example: 'ما بهترین محصولات الکترونیکی را ارائه می‌دهیم',
  })
  @IsOptional()
  @IsString({ message: 'توضیحات باید رشته باشد' })
  description?: string;
}
