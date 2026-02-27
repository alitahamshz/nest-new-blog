import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin/stats')
  @ApiOperation({ summary: 'آمار کلی داشبورد مدیر' })
  async getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('seller/:sellerId/stats')
  @ApiOperation({ summary: 'آمار داشبورد فروشنده' })
  async getSellerStats(@Param('sellerId', ParseIntPipe) sellerId: number) {
    return this.dashboardService.getSellerStats(sellerId);
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'آمار داشبورد کاربر' })
  async getUserStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.dashboardService.getUserStats(userId);
  }
}
