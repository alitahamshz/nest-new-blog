import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'شماره صفحه',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'شماره صفحه باید عدد باشد' })
  @Min(1, { message: 'شماره صفحه باید حداقل 1 باشد' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'تعداد آیتم‌های هر صفحه',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'تعداد آیتم‌ها باید عدد باشد' })
  @Min(1, { message: 'تعداد آیتم‌ها باید حداقل 1 باشد' })
  limit?: number = 10;
}
