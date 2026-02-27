import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingValueDto {
  @ApiProperty({ description: 'مقدار جدید تنظیم' })
  @IsString()
  @IsNotEmpty()
  value: string;
}
