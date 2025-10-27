import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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
  async create(@Body() createDto: CreateOrderDto) {
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

  @Get('user/:userId')
  @ApiOperation({ summary: 'دریافت سفارشات یک کاربر' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiResponse({
    status: 200,
    description: 'لیست سفارشات کاربر',
  })
  async findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return await this.ordersService.findByUser(userId);
  }

  @Get('seller/:sellerId')
  @ApiOperation({ summary: 'دریافت سفارشات یک فروشنده' })
  @ApiParam({ name: 'sellerId', description: 'شناسه فروشنده' })
  @ApiResponse({
    status: 200,
    description: 'لیست سفارشات فروشنده',
  })
  async findBySeller(@Param('sellerId', ParseIntPipe) sellerId: number) {
    return await this.ordersService.findBySeller(sellerId);
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
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'بروزرسانی سفارش' })
  @ApiParam({ name: 'id', description: 'شناسه سفارش' })
  @ApiResponse({
    status: 200,
    description: 'سفارش بروزرسانی شد',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderDto,
  ) {
    return await this.ordersService.update(id, updateDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'لغو سفارش' })
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
  ) {
    return await this.ordersService.cancelOrder(id, reason);
  }

  @Patch(':id/confirm-payment')
  @ApiOperation({ summary: 'تایید پرداخت سفارش' })
  @ApiParam({ name: 'id', description: 'شناسه سفارش' })
  @ApiQuery({
    name: 'transactionId',
    description: 'شماره تراکنش',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'پرداخت تایید شد',
  })
  async confirmPayment(
    @Param('id', ParseIntPipe) id: number,
    @Query('transactionId') transactionId: string,
  ) {
    return await this.ordersService.confirmPayment(id, transactionId);
  }
}
