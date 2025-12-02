import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, MinLength, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ali@gmail.com', description: 'ایمیل' })
  @IsEmail()
  email: string;
  @ApiProperty({ example: '123456789', description: 'رمز' })
  @MinLength(6)
  password: string;
  @ApiPropertyOptional({
    example: 'seller',
    description: 'نقش مورد نظر (seller, user, admin, etc)',
  })
  @IsOptional()
  @IsString()
  role?: string;
}
