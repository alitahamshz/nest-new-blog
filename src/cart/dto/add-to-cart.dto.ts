import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({
    description: 'شناسه پیشنهاد فروشنده',
    example: 54,
  })
  @IsNotEmpty({ message: 'شناسه پیشنهاد الزامی است' })
  @IsNumber({}, { message: 'شناسه پیشنهاد باید عدد باشد' })
  offerId: number;

  @ApiProperty({
    description: 'تعداد',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'تعداد الزامی است' })
  @IsNumber({}, { message: 'تعداد باید عدد باشد' })
  @Min(1, { message: 'تعداد باید حداقل 1 باشد' })
  quantity: number;

  @ApiPropertyOptional({
    description: 'شناسه واریانت انتخاب شده (در صورت وجود)',
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
}
