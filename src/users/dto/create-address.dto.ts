import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({
    description: 'عنوان آدرس',
    example: 'خانه',
  })
  @IsNotEmpty({ message: 'عنوان آدرس الزامی است' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'نام گیرنده',
    example: 'علی احمدی',
  })
  @IsNotEmpty({ message: 'نام گیرنده الزامی است' })
  @IsString()
  recipientName: string;

  @ApiProperty({
    description: 'شماره تماس',
    example: '09123456789',
  })
  @IsNotEmpty({ message: 'شماره تماس الزامی است' })
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'شماره تلفن باید با 09 شروع شود و 11 رقم باشد',
  })
  phone: string;

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

  @ApiProperty({
    description: 'آدرس کامل',
    example: 'تهران، خیابان ولیعصر، پلاک 123، واحد 5',
  })
  @IsNotEmpty({ message: 'آدرس الزامی است' })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'شهر',
    example: 'تهران',
  })
  @IsNotEmpty({ message: 'شهر الزامی است' })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'استان',
    example: 'تهران',
  })
  @IsNotEmpty({ message: 'استان الزامی است' })
  @IsString()
  province: string;

  @ApiProperty({
    description: 'کد پستی 10 رقمی',
    example: '1234567890',
  })
  @IsNotEmpty({ message: 'کد پستی الزامی است' })
  @IsString()
  @Length(10, 10, { message: 'کد پستی باید 10 رقم باشد' })
  @Matches(/^\d{10}$/, { message: 'کد پستی فقط باید شامل اعداد باشد' })
  postalCode: string;

  @ApiPropertyOptional({
    description: 'آیا این آدرس پیش‌فرض باشد؟',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
