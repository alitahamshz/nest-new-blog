/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { PaymentLog } from '../entities/payment-log.entity';
import { PaymentStatus } from '../entities/order.enums';

export interface PaymentInitiateResponse {
  authority: string; // کد تراکنش موقت
  paymentUrl: string; // لینک درگاه
}

export interface PaymentVerifyRequest {
  authority: string;
  status: string; // OK or NOOK
}

export interface PaymentVerifyResponse {
  success: boolean;
  message: string;
  refId?: string; // شماره مرجع
  transactionId?: string;
}

@Injectable()
export class PaymentService {
  private readonly ZARINPAL_MERCHANT =
    process.env.ZARINPAL_MERCHANT_ID || 'test';
  private readonly ZARINPAL_INITIATE_URL =
    'https://api.zarinpal.com/rest/web/pay/request.json';
  private readonly ZARINPAL_VERIFY_URL =
    'https://api.zarinpal.com/rest/web/pay/verify.json';
  private readonly CALLBACK_URL =
    process.env.PAYMENT_CALLBACK_URL || 'http://localhost:3000/payments/verify';

  constructor(
    @InjectRepository(PaymentLog)
    private readonly paymentLogRepo: Repository<PaymentLog>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  /**
   * شروع فرایند پرداخت و دریافت لینک درگاه
   */
  async initiatePayment(order: Order): Promise<PaymentInitiateResponse> {
    try {
      const payload = {
        merchant_id: this.ZARINPAL_MERCHANT,
        amount: Math.round(order.total * 100), // تومان به ریال
        description: `پرداخت سفارش ${order.orderNumber}`,
        email: order.user.email || 'user@example.com',
        mobile: order.shippingPhone || '09000000000',
        callback_url: `${this.CALLBACK_URL}?orderId=${order.id}`,
      };

      // 🔴 در محیط توسعه: Mock درگاه
      if (process.env.NODE_ENV === 'development') {
        return this.mockInitiatePayment(order);
      }

      const response = await fetch(this.ZARINPAL_INITIATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.data?.authority) {
        // ثبت درخواست پرداخت
        await this.paymentLogRepo.save({
          order,
          orderId: order.id,
          status: PaymentStatus.PENDING,
          amount: order.total,
          gateway: 'zarinpal',
          referenceCode: data.data.authority,
          gatewayResponse: JSON.stringify(data),
        });

        return {
          authority: data.data.authority,
          paymentUrl: `https://www.zarinpal.com/pg/StartPay/${data.data.authority}`,
        };
      }

      throw new BadRequestException('درگاه پراخت پاسخ نداد');
    } catch (error) {
      throw new InternalServerErrorException(`خطای درگاه: ${error.message}`);
    }
  }

  /**
   * تایید پرداخت (Verification)
   */
  async verifyPayment(
    orderId: number,
    authority: string,
    status: string,
  ): Promise<PaymentVerifyResponse> {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderId },
      });

      if (!order) {
        throw new BadRequestException('سفارش یافت نشد');
      }

      // اگر کاربر Cancel کرد
      if (status !== 'OK') {
        await this.paymentLogRepo.save({
          order,
          orderId,
          status: PaymentStatus.FAILED,
          amount: order.total,
          gateway: 'zarinpal',
          referenceCode: authority,
          errorMessage: 'کاربر پرداخت را لغو کرد',
        });

        return {
          success: false,
          message: 'پرداخت لغو شد',
        };
      }

      // 🔴 در محیط توسعه: Mock تایید
      if (process.env.NODE_ENV === 'development') {
        return this.mockVerifyPayment(orderId, authority);
      }

      const payload = {
        merchant_id: this.ZARINPAL_MERCHANT,
        amount: Math.round(order.total * 100),
        authority,
      };

      const response = await fetch(this.ZARINPAL_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.data?.code === 100 || data.data?.code === 101) {
        // پرداخت موفق
        await this.paymentLogRepo.save({
          order,
          orderId,
          status: PaymentStatus.COMPLETED,
          amount: order.total,
          gateway: 'zarinpal',
          transactionId: data.data.ref_id,
          referenceCode: authority,
          gatewayResponse: JSON.stringify(data),
        });

        return {
          success: true,
          message: 'پرداخت با موفقیت انجام شد',
          refId: data.data.ref_id,
          transactionId: data.data.ref_id,
        };
      } else {
        // پرداخت ناموفق
        await this.paymentLogRepo.save({
          order,
          orderId,
          status: PaymentStatus.FAILED,
          amount: order.total,
          gateway: 'zarinpal',
          referenceCode: authority,
          errorMessage: `کد خطا: ${data.data?.code} - ${data.data?.message}`,
          gatewayResponse: JSON.stringify(data),
        });

        return {
          success: false,
          message: `خطا: ${data.data?.message}`,
        };
      }
    } catch (error) {
      await this.paymentLogRepo.save({
        order: { id: orderId } as any,
        orderId,
        status: PaymentStatus.FAILED,
        amount: 0,
        gateway: 'zarinpal',
        referenceCode: authority,
        errorMessage: error.message,
      });

      throw new InternalServerErrorException(
        `خطای تایید پرداخت: ${error.message}`,
      );
    }
  }

  /**
   * Mock - برای محیط توسعه
   */
  private mockInitiatePayment(order: Order): PaymentInitiateResponse {
    const mockAuthority = `mock-${Date.now()}`;
    return {
      authority: mockAuthority,
      paymentUrl: `http://localhost:3000/dev/mock-payment?authority=${mockAuthority}&orderId=${order.id}`,
    };
  }

  /**
   * Mock - تایید پرداخت
   */
  private async mockVerifyPayment(
    orderId: number,
    authority: string,
  ): Promise<PaymentVerifyResponse> {
    await this.paymentLogRepo.save({
      order: { id: orderId } as any,
      orderId,
      status: PaymentStatus.COMPLETED,
      amount: 0,
      gateway: 'zarinpal-mock',
      transactionId: `mock-ref-${Date.now()}`,
      referenceCode: authority,
    });

    return {
      success: true,
      message: 'پرداخت (Mock) با موفقیت انجام شد',
      refId: `mock-ref-${Date.now()}`,
      transactionId: `mock-ref-${Date.now()}`,
    };
  }

  /**
   * دریافت تاریخچه پرداخت سفارش
   */
  async getPaymentLogs(orderId: number): Promise<PaymentLog[]> {
    return await this.paymentLogRepo.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }
}
