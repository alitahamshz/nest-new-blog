import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Redirect,
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
import { PaymentService } from './payment.service';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * شروع فرایند پرداخت - دریافت لینک درگاه
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':orderId/initiate')
  @ApiOperation({ summary: 'شروع فرایند پرداخت و دریافت لینک درگاه' })
  @ApiParam({ name: 'orderId', description: 'شناسه سفارش' })
  @ApiResponse({
    status: 200,
    description: 'لینک درگاه با موفقیت ایجاد شد',
    schema: {
      example: {
        authority: 'mock-1739146800000',
        paymentUrl:
          'http://localhost:3000/dev/mock-payment?authority=mock-1739146800000&orderId=1',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'سفارش یافت نشد',
  })
  async initiatePayment(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() user: User,
  ) {
    const order = await this.ordersService.findOne(orderId);

    if (order.user.id !== user.id) {
      throw new ForbiddenException('شما این سفارش را مالکیت ندارید');
    }

    return await this.paymentService.initiatePayment(order);
  }

  /**
   * تایید پرداخت (Callback از درگاه)
   */
  @Get('verify')
  @ApiOperation({ summary: 'تایید پرداخت (Callback از درگاه)' })
  @ApiQuery({
    name: 'orderId',
    description: 'شناسه سفارش',
    required: true,
  })
  @ApiQuery({
    name: 'authority',
    description: 'کد تراکنش',
    required: true,
  })
  @ApiQuery({
    name: 'status',
    description: 'وضعیت پرداخت (OK or NOOK)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'پرداخت تایید شد',
  })
  async verifyPayment(
    @Query('orderId', ParseIntPipe) orderId: number,
    @Query('authority') authority: string,
    @Query('status') status: string,
  ) {
    const result = await this.paymentService.verifyPayment(
      orderId,
      authority,
      status,
    );

    if (result.success) {
      // به‌روزرسانی وضعیت سفارش
      await this.ordersService.confirmPayment(
        orderId,
        result.transactionId || result.refId || `success-${Date.now()}`,
      );
      return {
        success: true,
        message: result.message,
        orderId,
        refId: result.refId,
      };
    }

    return {
      success: false,
      message: result.message,
      orderId,
    };
  }

  /**
   * دریافت تاریخچه پرداخت سفارش
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':orderId/logs')
  @ApiOperation({ summary: 'دریافت تاریخچه پرداخت سفارش' })
  @ApiParam({ name: 'orderId', description: 'شناسه سفارش' })
  async getPaymentLogs(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() user: User,
  ) {
    const order = await this.ordersService.findOne(orderId);

    if (order.user.id !== user.id) {
      throw new ForbiddenException('شما این سفارش را مالکیت ندارید');
    }

    return await this.paymentService.getPaymentLogs(orderId);
  }

  /**
   * Mock - صفحه پرداخت موهوم (فقط برای توسعه)
   */
  @Get('dev/mock-payment')
  @Redirect()
  @ApiOperation({ summary: '⚙️ Mock درگاه (توسعه)' })
  mockPayment(
    @Query('authority') authority: string,
    @Query('orderId', ParseIntPipe) orderId: number,
    @Query('success') success: string = 'true',
  ) {
    const verified = success === 'true' ? 'OK' : 'NOOK';
    return {
      url: `/payments/verify?orderId=${orderId}&authority=${authority}&status=${verified}`,
    };
  }
}
