import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '../../entities/order.enums';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'وضعیت سفارش',
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
  })
  @IsOptional()
  @IsEnum(OrderStatus, {
    message: 'وضعیت سفارش نامعتبر است',
  })
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'وضعیت پرداخت',
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus, {
    message: 'وضعیت پرداخت نامعتبر است',
  })
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'کد رهگیری',
    example: '1234567890',
  })
  @IsOptional()
  @IsString({ message: 'کد رهگیری باید متن باشد' })
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'شرکت پستی',
    example: 'پست ایران',
  })
  @IsOptional()
  @IsString({ message: 'نام شرکت پستی باید متن باشد' })
  carrier?: string;

  @ApiPropertyOptional({
    description: 'یادداشت ادمین',
    example: 'سفارش آماده ارسال است',
  })
  @IsOptional()
  @IsString({ message: 'یادداشت ادمین باید متن باشد' })
  adminNote?: string;

  @ApiPropertyOptional({
    description: 'یادداشت کاربر',
    example: 'لطفاً جعبه‌ی محکمی استفاده کنید',
  })
  @IsOptional()
  @IsString({ message: 'یادداشت کاربر باید متن باشد' })
  customerNote?: string;
}
