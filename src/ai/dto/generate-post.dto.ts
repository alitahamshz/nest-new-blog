import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PostTone {
  FORMAL = 'formal',
  INFORMAL = 'informal',
  EDUCATIONAL = 'educational',
  PERSUASIVE = 'persuasive',
}

export class GeneratePostDto {
  @ApiProperty({ example: 'آموزش استفاده از ریمل در آرایش چشم' })
  @IsNotEmpty()
  @IsString()
  topic: string;

  @ApiProperty({ example: ['ریمل', 'آرایش چشم', 'زیبایی'], required: false })
  @IsOptional()
  keywords?: string[];

  @ApiProperty({ enum: PostTone, default: PostTone.EDUCATIONAL, required: false })
  @IsOptional()
  @IsEnum(PostTone)
  tone?: PostTone;

  @ApiProperty({ example: 'خلاصه‌ای از محصولات آرایشی پوست', required: false })
  @IsOptional()
  @IsString()
  extraContext?: string;
}
