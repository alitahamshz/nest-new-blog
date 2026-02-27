import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BulkSettingItem {
  @ApiProperty({ description: 'کلید تنظیم' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'مقدار جدید' })
  @IsString()
  value: string;
}

export class BulkUpdateSettingsDto {
  @ApiProperty({ description: 'لیست تنظیمات برای بروزرسانی', type: [BulkSettingItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSettingItem)
  settings: BulkSettingItem[];
}
