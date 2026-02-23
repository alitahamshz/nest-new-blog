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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';

/** ?????: ??? ????? ?????? ???? */
@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  /** GET /banners/active — ?????? ???? ???? ???? ??????? */
  @Get('active')
  @ApiOperation({ summary: '?????? ?????? ???? ???? ????? ?? ????' })
  @ApiResponse({ status: 200 })
  async findActive() {
    return await this.bannersService.findActive();
  }

  /** GET /banners/position/:position — بنر فعال یک جایگاه مشخص */
  @Get('position/:position')
  @ApiOperation({ summary: 'بازگشت بنر فعال یک جایگاه مشخص (blog_sidebar_1, post_banner, ...)' })
  @ApiResponse({ status: 200 })
  async findByPosition(@Param('position') position: string) {
    return await this.bannersService.findByPosition(position);
  }
}

/** ?????: CRUD ???? */
@ApiTags('Admin Banners')
@ApiBearerAuth('access-token')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/banners')
export class AdminBannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'برگشت همه بنرها' })
  async findAll(@Query('section') section?: string) {
    return await this.bannersService.findAll(section);
  }

  @Get(':id')
  @ApiOperation({ summary: '?????? ?? ???' })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.bannersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '????? ??? ????' })
  @ApiResponse({ status: 201 })
  async create(@Body() createBannerDto: CreateBannerDto) {
    return await this.bannersService.create(createBannerDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '?????? ???' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerDto: UpdateBannerDto,
  ) {
    return await this.bannersService.update(id, updateBannerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '??? ???' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.bannersService.remove(id);
  }
}
