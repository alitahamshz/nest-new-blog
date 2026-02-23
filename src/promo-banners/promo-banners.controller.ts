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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromoBannersService } from './promo-banners.service';
import { CreatePromoBannerDto } from './dto/create-promo-banner.dto';
import { UpdatePromoBannerDto } from './dto/update-promo-banner.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';

/** عمومی */
@ApiTags('Promo Banners')
@Controller('promo-banners')
export class PromoBannersController {
  constructor(private readonly service: PromoBannersService) {}

  @Get('active')
  @ApiOperation({ summary: 'بنرهای پرومو فعال برای صفحه فروشگاه' })
  async findActive() {
    return await this.service.findActive();
  }
}

/** ادمین */
@ApiTags('Admin Promo Banners')
@ApiBearerAuth('access-token')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/promo-banners')
export class AdminPromoBannersController {
  constructor(private readonly service: PromoBannersService) {}

  @Get()
  @ApiOperation({ summary: 'همه پرومو بنرها' })
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreatePromoBannerDto) {
    return await this.service.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePromoBannerDto,
  ) {
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
  }
}
