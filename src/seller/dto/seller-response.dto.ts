import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

// اطلاعات پایه کاربر (بدون حساس بودن)
@Exclude()
export class UserBasicInfoDto {
  @Expose()
  @ApiProperty({ description: 'شناسه کاربر', example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ description: 'نام کاربر', example: 'علی احمدی' })
  name: string;

  @Expose()
  @ApiProperty({ description: 'ایمیل کاربر', example: 'ali@example.com' })
  email: string;
}

@Exclude()
export class SellerResponseDto {
  @Expose()
  @ApiProperty({ description: 'شناسه فروشنده', example: 1 })
  id: number;

  @Expose()
  @ApiProperty({
    description: 'نام تجاری فروشگاه',
    example: 'فروشگاه الکترونیک پارس',
  })
  businessName: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'شماره ثبت شرکت',
    example: '12345678',
  })
  registrationNumber?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'شماره تماس فروشگاه',
    example: '09123456789',
  })
  phone?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'آدرس لوگوی فروشگاه',
    example: '/uploads/logos/logo.png',
  })
  logo?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'آدرس فروشگاه',
    example: 'تهران، خیابان ولیعصر',
  })
  address?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'توضیحات درباره فروشگاه',
    example: 'ما بهترین محصولات الکترونیکی را ارائه می‌دهیم',
  })
  description?: string;

  @Expose()
  @ApiProperty({
    description: 'امتیاز فروشنده (0 تا 5)',
    example: 4.5,
  })
  rating: number;

  @Expose()
  @ApiProperty({
    description: 'تعداد کل فروش‌ها',
    example: 150,
  })
  totalSales: number;

  @Expose()
  @ApiProperty({
    description: 'وضعیت فعال بودن فروشنده',
    example: true,
  })
  isActive: boolean;

  @Expose()
  @ApiPropertyOptional({
    description: 'اطلاعات کاربر مرتبط با فروشنده',
    type: () => UserBasicInfoDto,
  })
  user?: UserBasicInfoDto;
}
