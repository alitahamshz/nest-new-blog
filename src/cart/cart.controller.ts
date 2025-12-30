import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { SyncCartDto } from './dto/sync-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':userId')
  @ApiOperation({ summary: 'دریافت سبد خرید کاربر' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiResponse({
    status: 200,
    description: 'سبد خرید کاربر',
  })
  async getCart(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException('شما دسترسی به این سبد خرید را ندارید');
    }
    return await this.cartService.getCart(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':userId/total')
  @ApiOperation({ summary: 'محاسبه مجموع قیمت سبد خرید' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiResponse({
    status: 200,
    description: 'مجموع قیمت و تعداد آیتم‌ها',
  })
  async getCartTotal(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException('شما دسترسی به این سبد خرید را ندارید');
    }
    return await this.cartService.getCartTotal(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':userId/items')
  @ApiOperation({ summary: 'افزودن محصول به سبد خرید' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiResponse({
    status: 201,
    description: 'محصول به سبد خرید اضافه شد',
  })
  @ApiResponse({
    status: 404,
    description: 'پیشنهاد یافت نشد',
  })
  @ApiResponse({
    status: 400,
    description: 'موجودی کافی نیست یا پیشنهاد غیرفعال است',
  })
  async addToCart(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AddToCartDto,
    @CurrentUser() user: User,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException('شما دسترسی به این سبد خرید را ندارید');
    }
    return await this.cartService.addToCart(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':userId/sync')
  @ApiOperation({ summary: 'سینک کردن سبد خرید آفلاین با سبد خرید آنلاین' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiResponse({
    status: 201,
    description: 'سبد خرید سینک شد',
  })
  @ApiResponse({
    status: 400,
    description: 'خطا در سینک کردن',
  })
  async syncCart(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: SyncCartDto,
    @CurrentUser() user: User,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException('شما دسترسی به این سبد خرید را ندارید');
    }
    return await this.cartService.syncCart(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':userId/items/:itemId')
  @ApiOperation({ summary: 'بروزرسانی تعداد آیتم در سبد خرید' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiParam({ name: 'itemId', description: 'شناسه آیتم' })
  @ApiResponse({
    status: 200,
    description: 'تعداد آیتم بروزرسانی شد',
  })
  @ApiResponse({
    status: 404,
    description: 'آیتم یافت نشد',
  })
  async updateCartItem(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: User,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException('شما دسترسی به این سبد خرید را ندارید');
    }
    return await this.cartService.updateCartItem(userId, itemId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':userId/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف آیتم از سبد خرید' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiParam({ name: 'itemId', description: 'شناسه آیتم' })
  @ApiResponse({
    status: 204,
    description: 'آیتم حذف شد',
  })
  async removeCartItem(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @CurrentUser() user: User,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException('شما دسترسی به این سبد خرید را ندارید');
    }
    await this.cartService.removeCartItem(userId, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'خالی کردن سبد خرید' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiResponse({
    status: 204,
    description: 'سبد خرید خالی شد',
  })
  async clearCart(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException('شما دسترسی به این سبد خرید را ندارید');
    }
    await this.cartService.clearCart(userId);
  }
}
