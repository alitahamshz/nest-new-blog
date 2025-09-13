// user-profile.controller.ts
import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserProfileService } from './user-profile.service';
// import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class UserProfileController {
  constructor(private readonly profileService: UserProfileService) {}

  @Get()
  getProfile(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.findOne(req.user.id);
  }

  @Patch()
  updateProfile(@Req() req, @Body() dto: UpdateUserProfileDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.update(req.user.id, dto);
  }
}
