import { IsOptional, IsString, IsUrl, Length, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserProfileDto {
  @ApiPropertyOptional({
    description: 'بیوگرافی کاربر',
    example: 'توسعه‌دهنده نرم‌افزار',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'آدرس تصویر پروفایل',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'وبسایت شخصی',
    example: 'https://example.com',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    description: 'موقعیت مکانی (شهر)',
    example: 'تهران',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'لینک‌های شبکه‌های اجتماعی (JSON)',
    example: '{"twitter": "@user", "telegram": "@user"}',
  })
  @IsOptional()
  @IsString()
  socialLinks?: string;

  // ========== اطلاعات تماس و آدرس ==========
  @ApiPropertyOptional({
    description: 'شماره تلفن اصلی',
    example: '09123456789',
  })
  @IsOptional()
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'شماره تلفن باید با 09 شروع شود و 11 رقم باشد',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'شماره تماس جایگزین',
    example: '09121234567',
  })
  @IsOptional()
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'شماره تماس جایگزین باید با 09 شروع شود و 11 رقم باشد',
  })
  alternativePhone?: string;

  @ApiPropertyOptional({
    description: 'آدرس کامل',
    example: 'تهران، خیابان ولیعصر، پلاک 123',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'شهر',
    example: 'تهران',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'استان',
    example: 'تهران',
  })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({
    description: 'کد پستی (10 رقمی)',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  @Length(10, 10, { message: 'کد پستی باید 10 رقم باشد' })
  @Matches(/^\d{10}$/, { message: 'کد پستی فقط باید شامل اعداد باشد' })
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'کد ملی (10 رقمی)',
    example: '0123456789',
  })
  @IsOptional()
  @IsString()
  @Length(10, 10, { message: 'کد ملی باید 10 رقم باشد' })
  @Matches(/^\d{10}$/, { message: 'کد ملی فقط باید شامل اعداد باشد' })
  nationalId?: string;
}
