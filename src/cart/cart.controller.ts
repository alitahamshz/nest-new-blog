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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'دریافت سبد خرید کاربر' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiResponse({
    status: 200,
    description: 'سبد خرید کاربر',
  })
  async getCart(@Param('userId', ParseIntPipe) userId: number) {
    return await this.cartService.getCart(userId);
  }

  @Get(':userId/total')
  @ApiOperation({ summary: 'محاسبه مجموع قیمت سبد خرید' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiResponse({
    status: 200,
    description: 'مجموع قیمت و تعداد آیتم‌ها',
  })
  async getCartTotal(@Param('userId', ParseIntPipe) userId: number) {
    return await this.cartService.getCartTotal(userId);
  }

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
  ) {
    return await this.cartService.addToCart(userId, dto);
  }

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
  ) {
    return await this.cartService.updateCartItem(userId, itemId, dto);
  }

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
  ) {
    await this.cartService.removeCartItem(userId, itemId);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'خالی کردن سبد خرید' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiResponse({
    status: 204,
    description: 'سبد خرید خالی شد',
  })
  async clearCart(@Param('userId', ParseIntPipe) userId: number) {
    await this.cartService.clearCart(userId);
  }
}
