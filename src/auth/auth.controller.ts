// auth.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
// import { Roles } from './guards/roles.decorator';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  } 
   
    // @UseGuards(JwtAuthGuard)
    // @Roles('admin')
    @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.email, registerDto.password, registerDto.name);
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('logout')
  // async logout(@Req() req) {
  //   return this.authService.logout(req.user.id);
  // }
}
