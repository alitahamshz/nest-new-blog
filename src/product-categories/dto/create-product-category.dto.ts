import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  IsNumber,
} from 'class-validator';

export class CreateProductCategoryDto {
  @ApiProperty({
    example: 'لباس',
    description: 'نام دسته‌بندی محصول',
  })
  @IsNotEmpty({ message: 'نام دسته‌بندی الزامی است' })
  @IsString({ message: 'نام دسته‌بندی باید رشته باشد' })
  name: string;

  @ApiProperty({
    example: 'clothes',
    description: 'اسلاگ دسته‌بندی (URL-friendly)',
  })
  @IsNotEmpty({ message: 'اسلاگ الزامی است' })
  @IsString({ message: 'اسلاگ باید رشته باشد' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'اسلاگ فقط باید شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'icon-clothes',
    description: 'نام آیکون دسته‌بندی',
  })
  @IsOptional()
  @IsString({ message: 'آیکون باید رشته باشد' })
  icon?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'شناسه دسته‌بندی والد (اگر زیرمجموعه است)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'شناسه والد باید عدد باشد' })
  parent_id?: number | null;
}
