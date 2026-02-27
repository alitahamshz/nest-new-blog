import { IsString, IsOptional, IsNotEmpty, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SettingType, SettingGroup } from '../../entities/setting.entity';

export class CreateSettingDto {
  @ApiProperty({ description: 'کلید یکتای تنظیم', example: 'site.theme' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'مقدار تنظیم', example: 'blossom' })
  @IsString()
  value: string;

  @ApiProperty({ enum: SettingType, description: 'نوع تنظیم' })
  @IsEnum(SettingType)
  type: SettingType;

  @ApiProperty({ enum: SettingGroup, description: 'گروه تنظیم' })
  @IsEnum(SettingGroup)
  group: SettingGroup;

  @ApiProperty({ description: 'برچسب فارسی تنظیم', example: 'تم سایت' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({ description: 'توضیحات تنظیم' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'گزینه‌های تنظیم (برای select و غیره)' })
  @IsOptional()
  options?: Record<string, any>;

  @ApiPropertyOptional({ description: 'ترتیب نمایش', default: 0 })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: 'آیا عمومی است؟', default: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
