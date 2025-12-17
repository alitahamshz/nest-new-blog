import { IsOptional, IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '../../entities/order.enums';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'وضعیت سفارش',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'وضعیت پرداخت',
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'کد رهگیری',
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'یادداشت ادمین',
  })
  @IsOptional()
  @IsString()
  adminNote?: string;
}
