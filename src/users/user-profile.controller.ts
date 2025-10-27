// user-profile.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Post,
  Param,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserProfileService } from './user-profile.service';
// import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('User Profile')
@Controller('profile')
export class UserProfileController {
  constructor(private readonly profileService: UserProfileService) {}

  @Get()
  @ApiOperation({ summary: 'دریافت پروفایل کاربر' })
  getProfile(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.findOne(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'بروزرسانی پروفایل کاربر' })
  updateProfile(@Req() req, @Body() dto: UpdateUserProfileDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.update(req.user.id, dto);
  }

  // ========== مدیریت آدرس‌ها ==========

  @Get('addresses')
  @ApiOperation({ summary: 'دریافت تمام آدرس‌های کاربر' })
  getAddresses(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.getAddresses(req.user.id);
  }

  @Get('addresses/default')
  @ApiOperation({ summary: 'دریافت آدرس پیش‌فرض' })
  getDefaultAddress(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.getDefaultAddress(req.user.id);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'افزودن آدرس جدید' })
  addAddress(@Req() req: any, @Body() dto: CreateAddressDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.addAddress(req.user.id, dto);
  }

  @Patch('addresses/:id')
  @ApiOperation({ summary: 'بروزرسانی آدرس' })
  updateAddress(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.updateAddress(req.user.id, +id, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'حذف آدرس' })
  removeAddress(@Req() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.removeAddress(req.user.id, +id);
  }

  @Patch('addresses/:id/set-default')
  @ApiOperation({ summary: 'تنظیم آدرس به عنوان پیش‌فرض' })
  setDefaultAddress(@Req() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.setDefaultAddress(req.user.id, +id);
  }
}
