import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'تعداد جدید',
    example: 2,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'تعداد الزامی است' })
  @IsNumber({}, { message: 'تعداد باید عدد باشد' })
  @Min(1, { message: 'تعداد باید حداقل 1 باشد' })
  quantity: number;
}
