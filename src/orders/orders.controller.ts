import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { OrderStatus } from '../entities/order.enums';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'ایجاد سفارش جدید' })
  @ApiResponse({
    status: 201,
    description: 'سفارش با موفقیت ایجاد شد',
  })
  @ApiResponse({
    status: 400,
    description: 'سبد خرید خالی است یا موجودی کافی نیست',
  })
  async create(@Body() createDto: CreateOrderDto, @CurrentUser() user: User) {
    createDto.userId = user.id;
    return await this.ordersService.createOrder(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'دریافت تمام سفارشات' })
  @ApiResponse({
    status: 200,
    description: 'لیست تمام سفارشات',
  })
  async findAll() {
    return await this.ordersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('user/:userId')
  @ApiOperation({ summary: 'دریافت سفارشات یک کاربر' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiQuery({ name: 'page', description: 'شماره صفحه', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'تعداد آیتم‌ها در صفحه', required: false, example: 10 })
  @ApiQuery({ name: 'status', description: 'فیلتر وضعیت سفارش', required: false, enum: OrderStatus })
  @ApiResponse({
    status: 200,
    description: 'لیست سفارشات کاربر',
  })
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus,
    @CurrentUser() user?: User,
  ) {
    if (user?.id !== userId) {
      throw new ForbiddenException('شما دسترسی به سفارشات دیگران را ندارید');
    }
    return await this.ordersService.findByUser(
      userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('seller/:sellerId')
  @ApiOperation({ summary: 'دریافت سفارشات یک فروشنده' })
  @ApiParam({ name: 'sellerId', description: 'شناسه فروشنده' })
  @ApiQuery({ name: 'page', description: 'شماره صفحه', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'تعداد آیتم‌ها در صفحه', required: false, example: 10 })
  @ApiQuery({ name: 'status', description: 'فیلتر وضعیت سفارش', required: false, enum: OrderStatus })
  @ApiResponse({
    status: 200,
    description: 'لیست سفارشات فروشنده',
  })
  async findBySeller(
    @Param('sellerId', ParseIntPipe) sellerId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus,
  ) {
    return await this.ordersService.findBySeller(
      sellerId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('user/:userId/status-counts')
  @ApiOperation({ summary: 'تعداد سفارشات کاربر به تفکیک وضعیت' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiResponse({ status: 200, description: 'آبجکت وضعیت → تعداد' })
  async getUserStatusCounts(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
  ) {
    if (user?.id !== userId) {
      throw new ForbiddenException('شما دسترسی به سفارشات دیگران را ندارید');
    }
    return await this.ordersService.getUserStatusCounts(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('seller/:sellerId/status-counts')
  @ApiOperation({ summary: 'تعداد سفارشات فروشنده به تفکیک وضعیت' })
  @ApiParam({ name: 'sellerId', description: 'شناسه فروشنده' })
  @ApiResponse({ status: 200, description: 'آبجکت وضعیت → تعداد' })
  async getSellerStatusCounts(
    @Param('sellerId', ParseIntPipe) sellerId: number,
  ) {
    return await this.ordersService.getSellerStatusCounts(sellerId);
  }

  @Get('number/:orderNumber')
  @ApiOperation({ summary: 'دریافت سفارش با شماره سفارش' })
  @ApiParam({ name: 'orderNumber', description: 'شماره سفارش' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات سفارش',
  })
  @ApiResponse({
    status: 404,
    description: 'سفارش یافت نشد',
  })
  async findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return await this.ordersService.findByOrderNumber(orderNumber);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک سفارش' })
  @ApiParam({ name: 'id', description: 'شناسه سفارش' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات سفارش',
  })
  @ApiResponse({
    status: 404,
    description: 'سفارش یافت نشد',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const order = await this.ordersService.findOne(id);
    if (order.user.id !== user.id) {
      throw new ForbiddenException('شما دسترسی به این سفارش را ندارید');
    }
    return order;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'بروزرسانی سفارش (کاربر - فقط یادداشت)' })
  @ApiParam({ name: 'id', description: 'شناسه سفارش' })
  @ApiResponse({
    status: 200,
    description: 'سفارش بروزرسانی شد',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderDto,
    @CurrentUser() user: User,
  ) {
    return await this.ordersService.update(id, updateDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/admin/status')
  @ApiOperation({ summary: 'تغییر وضعیت سفارش (ادمین)' })
  @ApiParam({ name: 'id', description: 'شناسه سفارش' })
  @ApiResponse({
    status: 200,
    description: 'وضعیت سفارش تغییر کرد',
  })
  @ApiResponse({
    status: 400,
    description: 'انتقال وضعیت نامعتبر است',
  })
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderDto,
  ) {
    return await this.ordersService.updateOrderStatus(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/admin/shipped')
  @ApiOperation({
    summary: 'علامت‌گذاری سفارش به عنوان ارسال‌شده و ثبت رهگیری',
  })
  @ApiParam({ name: 'id', description: 'شناسه سفارش' })
  @ApiResponse({
    status: 200,
    description: 'سفارش به حالت ارسال‌شده تغییر کرد',
  })
  async markAsShipped(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderDto,
  ) {
    return await this.ordersService.updateOrderStatus(id, {
      status: OrderStatus.SHIPPED,
      trackingNumber: updateDto.trackingNumber,
      carrier: updateDto.carrier,
      adminNote: updateDto.adminNote,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/admin/delivered')
  @ApiOperation({ summary: 'علامت‌گذاری سفارش به عنوان تحویل‌شده' })
  @ApiParam({ name: 'id', description: 'شناسه سفارش' })
  @ApiResponse({
    status: 200,
    description: 'سفارش به حالت تحویل‌شده تغییر کرد',
  })
  async markAsDelivered(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderDto,
  ) {
    return await this.ordersService.updateOrderStatus(id, {
      status: OrderStatus.DELIVERED,
      adminNote: updateDto.adminNote,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'لغو سفارش (کاربر)' })
  @ApiParam({ name: 'id', description: 'شناسه سفارش' })
  @ApiQuery({ name: 'reason', description: 'دلیل لغو', required: true })
  @ApiResponse({
    status: 200,
    description: 'سفارش لغو شد',
  })
  @ApiResponse({
    status: 400,
    description: 'سفارش قابل لغو نیست',
  })
  async cancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @Query('reason') reason: string,
    @CurrentUser() user: User,
  ) {
    return await this.ordersService.cancelOrder(id, reason, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/confirm-payment')
  @ApiOperation({ summary: 'تایید پرداخت سفارش (Webhook)' })
  @ApiParam({ name: 'id', description: 'شناسه سفارش' })
  @ApiQuery({
    name: 'transactionId',
    description: 'شماره تراکنش',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'پرداخت تایید شد',
  })
  async confirmPayment(
    @Param('id', ParseIntPipe) id: number,
    @Query('transactionId') transactionId: string,
    @Body() body: UpdateOrderDto,
    @CurrentUser() user: User,
  ) {
    const txId = transactionId || body?.transactionId || `FAKE-${id}-${Date.now()}`;
    return await this.ordersService.confirmPayment(id, txId, user);
  }

  // ─────────────────────────────── عملیات فروشنده ─────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/seller/confirm')
  @ApiOperation({ summary: 'تأیید سفارش پرداخت‌شده توسط فروشنده → در حال پردازش' })
  async sellerConfirmOrder(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const sellerId = user.seller?.id;
    if (!sellerId) throw new ForbiddenException('شما فروشنده نیستید');
    return await this.ordersService.sellerConfirmOrder(id, sellerId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/seller/reject')
  @ApiOperation({ summary: 'رد سفارش پرداخت‌شده توسط فروشنده → لغو شده' })
  async sellerRejectOrder(
    @Param('id', ParseIntPipe) id: number,
    @Query('reason') reason: string,
    @Body() body: UpdateOrderDto,
    @CurrentUser() user: User,
  ) {
    const sellerId = user.seller?.id;
    if (!sellerId) throw new ForbiddenException('شما فروشنده نیستید');
    const cancelReason = reason || body?.cancelReason || 'رد توسط فروشنده';
    return await this.ordersService.sellerRejectOrder(id, sellerId, cancelReason);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/seller/ship')
  @ApiOperation({ summary: 'علامت‌گذاری سفارش به عنوان ارسال شده → ارسال شده' })
  async sellerShipOrder(
    @Param('id', ParseIntPipe) id: number,
    @Query('trackingNumber') trackingNumber: string,
    @Query('carrier') carrier: string,
    @Body() body: UpdateOrderDto,
    @CurrentUser() user: User,
  ) {
    const sellerId = user.seller?.id;
    if (!sellerId) throw new ForbiddenException('شما فروشنده نیستید');
    const tn = trackingNumber || body?.trackingNumber;
    const cr = carrier || body?.carrier;
    return await this.ordersService.sellerShipOrder(id, sellerId, tn, cr);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/buyer/confirm-delivery')
  @ApiOperation({ summary: 'تأیید دریافت سفارش توسط خریدار → تحویل داده شده' })
  async buyerConfirmDelivery(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return await this.ordersService.buyerConfirmDelivery(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/seller/confirm-delivery')
  @ApiOperation({ summary: 'تأیید تحویل سفارش توسط فروشنده → تحویل داده شده' })
  async sellerConfirmDelivery(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const sellerId = user.seller?.id;
    if (!sellerId) throw new ForbiddenException('شما فروشنده نیستید');
    return await this.ordersService.sellerConfirmDelivery(id, sellerId);
  }
}
