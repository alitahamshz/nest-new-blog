import { IsOptional, IsString } from 'class-validator';

export class CreateFileDto {
  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  altText?: string; // برای تصاویر، مثل description
}
