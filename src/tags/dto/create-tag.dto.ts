// src/tags/dto/create-tag.dto.ts
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'نست جی اس', description: 'نام تگ' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'nestjs', description: 'نام لاتین' })
  @IsNotEmpty()
  @IsString()
  en_name: string;

  @ApiPropertyOptional({ example: 'nestjs', description: 'اسلاگ تگ' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;
}
