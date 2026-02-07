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
import { Address } from 'src/entities/address.entity';
import { UserProfile } from 'src/entities/user-profile.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('User Profile')
@Controller('profile')
export class UserProfileController {
  constructor(private readonly profileService: UserProfileService) {}

  @Get()
  @ApiOperation({
    summary: 'دریافت پروفایل کاربر',
    description: 'پروفایل کامل کاربر لاگین‌شده را بر‌می‌گرداند',
  })
  @ApiResponse({
    status: 200,
    description: 'پروفایل کاربر',
    type: UserProfile,
    example: {
      id: 1,
      bio: 'یک برنامه‌نویس',
      avatar: 'http://example.com/avatar.jpg',
      website: 'https://example.com',
      location: 'تهران',
      phone: '09121234567',
      address: 'تهران، خیابان ولیعصر',
      city: 'تهران',
      province: 'تهران',
      postalCode: '1234567890',
      nationalId: '1234567890',
    },
  })
  @ApiNotFoundResponse({
    description: 'کاربر پروفایل ندارد (هنوز ایجاد نشده)',
  })
  @ApiUnauthorizedResponse({ description: 'توکن JWT نامعتبر است' })
  getProfile(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.findOne(req.user.id);
  }

  @Patch()
  @ApiOperation({
    summary: 'بروزرسانی پروفایل کاربر',
    description: 'اطلاعات پروفایل کاربر را به‌روز می‌کند',
  })
  @ApiResponse({
    status: 200,
    description: 'پروفایل با موفقیت به‌روز شد',
    type: UserProfile,
    example: {
      id: 1,
      bio: 'یک توسعه‌دهنده وب',
      avatar: 'http://example.com/avatar-new.jpg',
      website: 'https://mynewsite.com',
      location: 'مشهد',
      phone: '09989999999',
      address: 'مشهد، خیابان فردوسی',
      city: 'مشهد',
      province: 'خراسان رضوی',
      postalCode: '9175698765',
      nationalId: '1234567890',
    },
  })
  @ApiBadRequestResponse({ description: 'داده‌های ارسالی نامعتبر است' })
  @ApiUnauthorizedResponse({ description: 'توکن JWT نامعتبر است' })
  updateProfile(@Req() req, @Body() dto: UpdateUserProfileDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.update(req.user.id, dto);
  }

  // ========== مدیریت آدرس‌ها ==========

  @Get('addresses')
  @ApiOperation({
    summary: 'دریافت تمام آدرس‌های کاربر',
    description: 'لیست تمام آدرس‌های ثبت‌شده کاربر لاگین‌شده را برمی‌گرداند',
  })
  @ApiResponse({
    status: 200,
    description: 'لیست آدرس‌ها با موفقیت دریافت شد',
    type: [Address],
    example: [
      {
        id: 1,
        title: 'خانه',
        recipientName: 'علی احمدی',
        phone: '09121234567',
        alternativePhone: '09129999999',
        address: 'تهران، خیابان ولیعصر، پلاک 123',
        city: 'تهران',
        province: 'تهران',
        postalCode: '1234567890',
        isDefault: true,
        createdAt: '2026-02-07T10:00:00Z',
        updatedAt: '2026-02-07T10:00:00Z',
      },
    ],
  })
  @ApiUnauthorizedResponse({ description: 'توکن JWT نامعتبر است' })
  getAddresses(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.getAddresses(req.user.id);
  }

  @Get('addresses/default')
  @ApiOperation({
    summary: 'دریافت آدرس پیش‌فرض کاربر',
    description: 'آدرسی که به عنوان پیش‌فرض تنظیم شده است را بر‌می‌گرداند',
  })
  @ApiResponse({
    status: 200,
    description: 'آدرس پیش‌فرض',
    type: Address,
    example: {
      id: 1,
      title: 'خانه',
      recipientName: 'علی احمدی',
      phone: '09121234567',
      address: 'تهران، خیابان ولیعصر',
      city: 'تهران',
      province: 'تهران',
      postalCode: '1234567890',
      isDefault: true,
      createdAt: '2026-02-07T10:00:00Z',
      updatedAt: '2026-02-07T10:00:00Z',
    },
  })
  @ApiUnauthorizedResponse({ description: 'توکن JWT نامعتبر است' })
  getDefaultAddress(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.getDefaultAddress(req.user.id);
  }

  @Post('addresses')
  @ApiOperation({
    summary: 'افزودن آدرس جدید',
    description:
      'یک آدرس جدید برای کاربر اضافه می‌کند. اگر پروفایل وجود نداشته باشد، خودکار ایجاد می‌شود',
  })
  @ApiResponse({
    status: 201,
    description: 'آدرس با موفقیت اضافه شد',
    type: Address,
    example: {
      id: 3,
      title: 'محل کار',
      recipientName: 'علی احمدی',
      phone: '09121234567',
      address: 'تهران، خیابان قم',
      city: 'تهران',
      province: 'تهران',
      postalCode: '1234567890',
      isDefault: false,
      createdAt: '2026-02-07T11:00:00Z',
      updatedAt: '2026-02-07T11:00:00Z',
    },
  })
  @ApiBadRequestResponse({
    description: 'داده‌های ارسالی نامعتبر است (مثلاً شماره تلفن نادرست)',
  })
  @ApiUnauthorizedResponse({ description: 'توکن JWT نامعتبر است' })
  addAddress(@Req() req: any, @Body() dto: CreateAddressDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.addAddress(req.user.id, dto);
  }

  @Patch('addresses/:id')
  @ApiOperation({
    summary: 'بروزرسانی اطلاعات آدرس',
    description: 'فیلد‌های یک آدرس موجود را به‌روز می‌کند (تنها فیلد‌های نیاز دارند ارسال شوند)',
  })
  @ApiParam({
    name: 'id',
    description: 'شناسه آدرس',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'آدرس با موفقیت به‌روز شد',
    type: Address,
    example: {
      id: 1,
      title: 'خانه جدید',
      recipientName: 'علی احمدی',
      phone: '09129999999',
      address: 'تهران، خیابان ولیعصر - شماره جدید',
      city: 'تهران',
      province: 'تهران',
      postalCode: '1234567890',
      isDefault: true,
      createdAt: '2026-02-07T10:00:00Z',
      updatedAt: '2026-02-07T11:30:00Z',
    },
  })
  @ApiNotFoundResponse({ description: 'آدرس مورد نظر یافت نشد' })
  @ApiBadRequestResponse({ description: 'داده‌های ارسالی نامعتبر است' })
  @ApiUnauthorizedResponse({ description: 'توکن JWT نامعتبر است' })
  updateAddress(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.updateAddress(req.user.id, +id, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({
    summary: 'حذف آدرس',
    description:
      'یک آدرس را حذف می‌کند. اگر آدرس پیش‌فرض باشد، خودکار آدرس دیگری به عنوان پیش‌فرض انتخاب می‌شود',
  })
  @ApiParam({
    name: 'id',
    description: 'شناسه آدرس برای حذف',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'آدرس با موفقیت حذف شد',
    example: { message: 'Address deleted successfully' },
  })
  @ApiNotFoundResponse({ description: 'آدرس مورد نظر یافت نشد' })
  @ApiUnauthorizedResponse({ description: 'توکن JWT نامعتبر است' })
  removeAddress(@Req() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.removeAddress(req.user.id, +id);
  }

  @Patch('addresses/:id/set-default')
  @ApiOperation({
    summary: 'تنظیم آدرس به عنوان پیش‌فرض',
    description:
      'یک آدرس را به عنوان پیش‌فرض تنظیم می‌کند. تمام آدرس‌های دیگر خودکار غیرفعال می‌شوند',
  })
  @ApiParam({
    name: 'id',
    description: 'شناسه آدرسی که باید پیش‌فرض شود',
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: 'آدرس به عنوان پیش‌فرض تنظیم شد',
    type: Address,
    example: {
      id: 2,
      title: 'محل کار',
      recipientName: 'علی احمدی',
      phone: '09121234567',
      address: 'تهران، خیابان قم',
      city: 'تهران',
      province: 'تهران',
      postalCode: '1234567890',
      isDefault: true,
      createdAt: '2026-02-07T11:00:00Z',
      updatedAt: '2026-02-07T12:00:00Z',
    },
  })
  @ApiNotFoundResponse({ description: 'آدرس مورد نظر یافت نشد' })
  @ApiUnauthorizedResponse({ description: 'توکن JWT نامعتبر است' })
  setDefaultAddress(@Req() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.profileService.setDefaultAddress(req.user.id, +id);
  }
}
