import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../entities/order.enums';

class OrderItemDto {
  @ApiProperty({ description: 'شناسه پیشنهاد فروشنده' })
  @IsNotEmpty({ message: 'شناسه پیشنهاد الزامی است' })
  @IsNumber({}, { message: 'شناسه پیشنهاد باید عدد باشد' })
  offerId: number;

  @ApiProperty({ description: 'تعداد' })
  @IsNotEmpty({ message: 'تعداد الزامی است' })
  @IsNumber({}, { message: 'تعداد باید عدد باشد' })
  @Min(1, { message: 'تعداد باید حداقل 1 باشد' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'شناسه کاربر (خودکار از JWT پر می‌شود)',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'شناسه کاربر باید عدد باشد' })
  userId?: number;

  @ApiPropertyOptional({
    description: 'آدرس ارسال (JSON یا متن)',
    example: 'تهران، خیابان ولیعصر، پلاک 123',
  })
  @IsOptional()
  @IsString({ message: 'آدرس ارسال باید متن باشد' })
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'شماره تماس',
    example: '09123456789',
  })
  @IsOptional()
  @IsString({ message: 'شماره تماس باید متن باشد' })
  shippingPhone?: string;

  @ApiPropertyOptional({
    description: 'نام گیرنده',
    example: 'علی احمدی',
  })
  @IsOptional()
  @IsString({ message: 'نام گیرنده باید متن باشد' })
  recipientName?: string;

  @ApiProperty({
    description: 'روش پرداخت',
    enum: PaymentMethod,
    example: PaymentMethod.ONLINE,
  })
  @IsNotEmpty({ message: 'روش پرداخت الزامی است' })
  @IsEnum(PaymentMethod, { message: 'روش پرداخت نامعتبر است' })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'یادداشت مشتری',
    example: 'لطفاً قبل از ارسال تماس بگیرید',
  })
  @IsOptional()
  @IsString({ message: 'یادداشت باید متن باشد' })
  customerNote?: string;

  @ApiPropertyOptional({
    description: 'آیتم‌های سفارش (اگر از سبد خرید نباشد)',
  })
  @IsOptional()
  @IsArray({ message: 'آیتم‌ها باید آرایه باشد' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];
}
