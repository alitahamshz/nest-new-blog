import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../entities/order.enums';

class OrderItemDto {
  @ApiProperty({ description: 'شناسه پیشنهاد فروشنده' })
  @IsNotEmpty()
  offerId: number;

  @ApiProperty({ description: 'تعداد' })
  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'شناسه کاربر',
    example: 1,
  })
  @IsNotEmpty({ message: 'شناسه کاربر الزامی است' })
  userId: number;

  @ApiPropertyOptional({
    description: 'آدرس ارسال (JSON یا متن)',
    example: 'تهران، خیابان ولیعصر، پلاک 123',
  })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'شماره تماس',
    example: '09123456789',
  })
  @IsOptional()
  @IsString()
  shippingPhone?: string;

  @ApiPropertyOptional({
    description: 'نام گیرنده',
    example: 'علی احمدی',
  })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiProperty({
    description: 'روش پرداخت',
    enum: PaymentMethod,
    example: PaymentMethod.ONLINE,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'یادداشت مشتری',
    example: 'لطفاً قبل از ارسال تماس بگیرید',
  })
  @IsOptional()
  @IsString()
  customerNote?: string;

  @ApiPropertyOptional({
    description: 'آیتم‌های سفارش (اگر از سبد خرید نباشد)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];
}
