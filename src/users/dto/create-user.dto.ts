// create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsArray } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'ali@gmail.com', description: 'ایمیل' })
  @IsEmail()
  email: string;
  @ApiProperty({ example: '12345678', description: 'رمز' })
  @IsNotEmpty()
  password: string;
  @ApiPropertyOptional({ example: 'ali@gmail.com', description: 'name' })
  @IsNotEmpty()
  name: string;
  @ApiProperty({ example: 'ADMIN', description: 'role' })
  @IsArray()
  roles: string[]; // ['ADMIN', 'AUTHOR']
}
