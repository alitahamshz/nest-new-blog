import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'ali', description: 'نام' })
  @IsNotEmpty()
  name: string;
  @ApiProperty({ example: 'ali@gmail.com', description: 'ایمیل' })
  @IsEmail()
  email: string;
  @ApiProperty({ example: '123456789', description: 'رمز' })
  @MinLength(6)
  password: string;
}