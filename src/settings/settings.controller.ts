import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { UpdateSettingValueDto } from './dto/update-setting-value.dto';
import { BulkUpdateSettingsDto } from './dto/bulk-update-settings.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';
import { SettingGroup } from '../entities/setting.entity';

/* ═════════════════════════════════════════════
   Public Controller — بدون نیاز به احراز هویت
   ═════════════════════════════════════════════ */
@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'دریافت تمام تنظیمات عمومی' })
  @ApiQuery({ name: 'group', required: false, enum: SettingGroup })
  @ApiResponse({ status: 200 })
  async findPublic(@Query('group') group?: SettingGroup) {
    if (group) {
      return await this.settingsService.findPublicByGroup(group);
    }
    return await this.settingsService.findPublic();
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'دریافت مقدار یک تنظیم عمومی با کلید' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async findByKey(@Param('key') key: string) {
    return await this.settingsService.findPublicByKey(key);
  }
}

/* ═══════════════════════════════════════
   Admin Controller — نیاز به احراز هویت
   ═══════════════════════════════════════ */
@ApiTags('Admin Settings')
@ApiBearerAuth('access-token')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'دریافت تمام تنظیمات (ادمین)' })
  @ApiQuery({ name: 'group', required: false, enum: SettingGroup })
  @ApiResponse({ status: 200 })
  async findAll(@Query('group') group?: SettingGroup) {
    return await this.settingsService.findAll(group);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک تنظیم با آیدی' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.settingsService.findOne(id);
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'دریافت یک تنظیم با کلید' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async findByKey(@Param('key') key: string) {
    return await this.settingsService.findByKey(key);
  }

  @Post()
  @ApiOperation({ summary: 'ایجاد تنظیم جدید' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'تنظیم با این کلید قبلاً وجود دارد' })
  async create(@Body() dto: CreateSettingDto) {
    return await this.settingsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'بروزرسانی یک تنظیم' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSettingDto,
  ) {
    return await this.settingsService.update(id, dto);
  }

  @Patch('key/:key')
  @ApiOperation({ summary: 'بروزرسانی مقدار یک تنظیم با کلید' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async updateByKey(
    @Param('key') key: string,
    @Body() dto: UpdateSettingValueDto,
  ) {
    return await this.settingsService.updateByKey(key, dto.value);
  }

  @Patch('bulk/update')
  @ApiOperation({ summary: 'بروزرسانی گروهی تنظیمات' })
  @ApiResponse({ status: 200 })
  async bulkUpdate(@Body() dto: BulkUpdateSettingsDto) {
    return await this.settingsService.bulkUpdate(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف یک تنظیم' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.settingsService.remove(id);
  }
}
