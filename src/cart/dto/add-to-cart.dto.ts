import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({
    description: 'شناسه پیشنهاد فروشنده',
    example: 1,
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
    description: 'شناسه واریانت (در صورت وجود)',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'شناسه واریانت باید عدد باشد' })
  variantId?: number;
}
