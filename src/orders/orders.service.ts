/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, Between, DataSource, LessThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CartItem } from '../entities/cart-item.entity';
import { User } from '../entities/user.entity';
import { SellerOffer } from '../entities/seller-offer.entity';
import { Cart } from '../entities/cart.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, PaymentStatus } from '../entities/order.enums';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SellerOffer)
    private readonly offerRepo: Repository<SellerOffer>,
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
  ) {}

  /**
   * ایجاد سفارش جدید از سبد خرید
   */
  async createOrderFromCart(createDto: CreateOrderDto): Promise<Order> {
    // بررسی وجود کاربر
    const user = await this.userRepo.findOne({
      where: { id: createDto.userId },
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    // Use a QueryRunner transaction and pessimistic locking to avoid oversell
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { user: { id: createDto.userId } },
        relations: [
          'items',
          'items.offer',
          'items.product',
          'items.offer.variantValues',
          'items.offer.variantValues.variant',
        ],
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('سبد خرید خالی است');
      }
      // تولید شماره سفارش یونیک
      const orderNumber = await this.generateOrderNumber();

      let subtotal = 0;
      const orderItems: OrderItem[] = [];

      for (const cartItem of cart.items) {
        // Lock only the offer row to avoid PostgreSQL FOR UPDATE limitation with LEFT JOIN
        const lockedOffer = await queryRunner.manager
          .createQueryBuilder(SellerOffer, 'offer')
          .setLock('pessimistic_write')
          .where('offer.id = :id', { id: cartItem.offer.id })
          .getOne();

        if (!lockedOffer || !lockedOffer.isActive) {
          throw new BadRequestException(
            `پیشنهاد ${cartItem.product.name} دیگر فعال نیست`,
          );
        }

        // Load relations after locking (row is already locked)
        const offer = await queryRunner.manager.findOne(SellerOffer, {
          where: { id: lockedOffer.id },
          relations: [
            'seller',
            'product',
            'variantValues',
            'variantValues.variant',
          ],
        });

        if (!offer) {
          throw new BadRequestException('پیشنهاد یافت نشد');
        }

        if (offer.stock < cartItem.quantity) {
          throw new BadRequestException(
            `موجودی ${cartItem.product.name} کافی نیست. موجودی فعلی: ${offer.stock}`,
          );
        }

        const itemSubtotal = cartItem.price * cartItem.quantity;
        subtotal += itemSubtotal;
        const fallbackVariantValue = offer.variantValues?.[0];

        const orderItem = queryRunner.manager.create(OrderItem, {
          product: cartItem.product,
          variantValues: offer.variantValues,
          seller: offer.seller,
          offer: offer,
          productName: cartItem.productName,
          productSlug: cartItem.productSlug,
          productImage: cartItem.productImage,
          variantValueNames: offer.variantValues
            ? offer.variantValues.map((v) => v.name).join(' - ')
            : undefined,
          sellerBusinessName: offer.seller.businessName,
          quantity: cartItem.quantity,
          price: cartItem.price,
          subtotal: itemSubtotal,
          discount: 0,
          total: itemSubtotal,
          minOrder: cartItem.minOrder || offer.minOrder || 1,
          maxOrder: cartItem.maxOrder || offer.maxOrder || 999,
          stock: cartItem.stock,
          discountPrice: cartItem.discountPrice || offer.discountPrice,
          discountPercent: cartItem.discountPercent || 0,
          selectedVariantId:
            cartItem.selectedVariantId ??
            cartItem.selectedVariantObject?.id ??
            fallbackVariantValue?.variant?.id ??
            null,
          selectedVariantValueId:
            cartItem.selectedVariantValueId ??
            cartItem.selectedVariantValueObject?.id ??
            fallbackVariantValue?.id ??
            null,
          selectedVariantObject:
            cartItem.selectedVariantObject ??
            fallbackVariantValue?.variant ??
            null,
          selectedVariantValueObject:
            cartItem.selectedVariantValueObject ?? fallbackVariantValue ?? null,
        });

        orderItems.push(orderItem);

        offer.stock -= cartItem.quantity;
        await queryRunner.manager.save(offer);
      }

      const shippingCost = this.calculateShippingCost(subtotal);
      const tax = this.calculateTax(subtotal);
      const total = subtotal + shippingCost + tax;

      const order = queryRunner.manager.create(Order, {
        orderNumber,
        user,
        items: orderItems,
        subtotal,
        shippingCost,
        discount: 0,
        tax,
        total,
        status: OrderStatus.PENDING,
        paymentMethod: createDto.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        shippingAddress: createDto.shippingAddress || '',
        shippingPhone: createDto.shippingPhone,
        recipientName: createDto.recipientName,
        customerNote: createDto.customerNote,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // حذف تمام آیتم‌های سبد خرید
      await queryRunner.manager.delete(CartItem, { cart: { id: cart.id } });

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * ایجاد سفارش مستقیم (بدون سبد خرید)
   */
  async createOrder(createDto: CreateOrderDto): Promise<Order> {
    if (!createDto.items || createDto.items.length === 0) {
      // اگر آیتم‌های مستقیم نداریم، از سبد خرید استفاده کن
      return await this.createOrderFromCart(createDto);
    }

    // بررسی وجود کاربر
    const user = await this.userRepo.findOne({
      where: { id: createDto.userId },
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    // تولید شماره سفارش
    const orderNumber = await this.generateOrderNumber();

    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    // ایجاد آیتم‌های سفارش
    // For direct order creation, run within a transaction and lock offers
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { user: { id: createDto.userId } },
        relations: ['items', 'items.offer'],
      });

      const cartItemsByOfferId = new Map<number, CartItem[]>();
      for (const cartItem of cart?.items ?? []) {
        const offerId = cartItem.offer?.id;
        if (!offerId) {
          continue;
        }
        const list = cartItemsByOfferId.get(offerId) ?? [];
        list.push(cartItem);
        cartItemsByOfferId.set(offerId, list);
      }

      for (const item of createDto.items) {
        const matchedCartItem = this.popMatchingCartItem(
          cartItemsByOfferId,
          item.offerId,
          item.selectedVariantValueId,
        );

        // Lock only the offer row to avoid PostgreSQL FOR UPDATE limitation with LEFT JOIN
        const lockedOffer = await queryRunner.manager
          .createQueryBuilder(SellerOffer, 'offer')
          .setLock('pessimistic_write')
          .where('offer.id = :id', { id: item.offerId })
          .getOne();

        if (!lockedOffer || !lockedOffer.isActive) {
          throw new BadRequestException('پیشنهاد یافت نشد یا غیرفعال است');
        }

        // Load relations after locking (won't lock these relations, but row is already locked)
        const offer = await queryRunner.manager.findOne(SellerOffer, {
          where: { id: lockedOffer.id },
          relations: [
            'seller',
            'product',
            'variantValues',
            'variantValues.variant',
          ],
        });

        if (!offer) {
          throw new BadRequestException('پیشنهاد یافت نشد');
        }

        if (offer.stock < item.quantity) {
          throw new BadRequestException(
            `موجودی کافی نیست. موجودی فعلی: ${offer.stock}`,
          );
        }

        const itemSubtotal = offer.discountPrice * item.quantity;
        subtotal += itemSubtotal;
        const fallbackVariantValue = offer.variantValues?.[0];
        const selectedVariantId =
          item.selectedVariantId ??
          item.selectedVariantObject?.id ??
          matchedCartItem?.selectedVariantId ??
          matchedCartItem?.selectedVariantObject?.id ??
          fallbackVariantValue?.variant?.id ??
          null;
        const selectedVariantValueId =
          item.selectedVariantValueId ??
          item.selectedVariantValueObject?.id ??
          matchedCartItem?.selectedVariantValueId ??
          matchedCartItem?.selectedVariantValueObject?.id ??
          fallbackVariantValue?.id ??
          null;
        const selectedVariantObject =
          item.selectedVariantObject ??
          matchedCartItem?.selectedVariantObject ??
          fallbackVariantValue?.variant ??
          null;
        const selectedVariantValueObject =
          item.selectedVariantValueObject ??
          matchedCartItem?.selectedVariantValueObject ??
          fallbackVariantValue ??
          null;

        const orderItem = queryRunner.manager.create(OrderItem, {
          product: offer.product,
          variantValues: offer.variantValues,
          seller: offer.seller,
          offer,
          productName: offer.product.name,
          productSlug: offer.product.slug,
          productImage: offer.product.mainImage,
          variantValueNames: offer.variantValues
            ? offer.variantValues.map((v) => v.name).join(' - ')
            : undefined,
          sellerBusinessName: offer.seller.businessName,
          quantity: item.quantity,
          price: offer.discountPrice,
          subtotal: itemSubtotal,
          discount: 0,
          total: itemSubtotal,
          minOrder: offer.minOrder || 1,
          maxOrder: offer.maxOrder || 999,
          stock: offer.stock,
          discountPrice: offer.discountPrice || offer.price,
          discountPercent: offer.discountPercent || 0,
          selectedVariantId,
          selectedVariantValueId,
          selectedVariantObject,
          selectedVariantValueObject,
        });

        orderItems.push(orderItem);

        // decrease stock inside transaction
        offer.stock -= item.quantity;
        await queryRunner.manager.save(offer);
      }

      const shippingCost = this.calculateShippingCost(subtotal);
      const tax = this.calculateTax(subtotal);
      const total = subtotal + shippingCost + tax;

      const order = queryRunner.manager.create(Order, {
        orderNumber,
        user,
        items: orderItems,
        subtotal,
        shippingCost,
        discount: 0,
        tax,
        total,
        status: OrderStatus.PENDING,
        paymentMethod: createDto.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        shippingAddress: createDto.shippingAddress || '',
        shippingPhone: createDto.shippingPhone,
        recipientName: createDto.recipientName,
        customerNote: createDto.customerNote,
      });

      const saved = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private popMatchingCartItem(
    cartItemsByOfferId: Map<number, CartItem[]>,
    offerId: number,
    selectedVariantValueId?: number | null,
  ): CartItem | null {
    const candidates = cartItemsByOfferId.get(offerId);
    if (!candidates || candidates.length === 0) {
      return null;
    }

    if (
      selectedVariantValueId !== undefined &&
      selectedVariantValueId !== null
    ) {
      const index = candidates.findIndex(
        (item) => item.selectedVariantValueId === selectedVariantValueId,
      );
      if (index >= 0) {
        const [matched] = candidates.splice(index, 1);
        return matched;
      }
    }

    return candidates.shift() ?? null;
  }

  /**
   * دریافت تمام سفارشات
   */
  async findAll(): Promise<Order[]> {
    return await this.orderRepo.find({
      relations: ['user', 'items', 'items.product', 'items.seller'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * دریافت سفارشات یک کاربر (با pagination و فیلتر وضعیت)
   */
  async findByUser(
    userId: number,
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
  ): Promise<{ data: Order[]; total: number; page: number; pages: number }> {
    const where: Record<string, unknown> = { user: { id: userId } };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await this.orderRepo.findAndCount({
      where,
      relations: ['items', 'items.product', 'items.seller'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * دریافت سفارشات یک فروشنده (با pagination و فیلتر وضعیت)
   * هر ردیف = یک سفارش کامل، با آیتم‌های فیلترشده برای این فروشنده
   */
  async findBySeller(
    sellerId: number,
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
  ): Promise<{
    data: Order[];
    total: number;
    page: number;
    pages: number;
  }> {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      // فقط سفارش‌هایی که حداقل یک آیتم از این فروشنده دارند
      .innerJoin(
        'order.items',
        'filterItem',
        'filterItem.sellerId = :sellerId',
        { sellerId },
      )
      // اطلاعات خریدار
      .leftJoinAndSelect('order.user', 'user')
      // فقط آیتم‌های همین فروشنده رو load کن
      .innerJoinAndSelect(
        'order.items',
        'items',
        'items.sellerId = :sellerId',
        { sellerId },
      )
      .leftJoinAndSelect('items.product', 'product')
      .orderBy('order.createdAt', 'DESC');

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    const total = await qb.getCount();
    const orders = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * دریافت یک سفارش با شماره سفارش
   */
  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { orderNumber },
      relations: [
        'user',
        'items',
        'items.product',
        'items.variant',
        'items.seller',
      ],
    });

    if (!order) {
      throw new NotFoundException('سفارش یافت نشد');
    }

    return order;
  }

  /**
   * دریافت یک سفارش
   */
  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: [
        'user',
        'items',
        'items.product',
        'items.variant',
        'items.seller',
      ],
    });

    if (!order) {
      throw new NotFoundException('سفارش یافت نشد');
    }

    return order;
  }

  /**
   * بروزرسانی سفارش توسط کاربر (فقط یادداشت)
   */
  async update(
    id: number,
    updateDto: UpdateOrderDto,
    user: User,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // بررسی ownership
    if (order.user.id !== user.id) {
      throw new ForbiddenException('شما این سفارش را مالکیت ندارید');
    }

    // کاربر فقط می‌تونه یادداشت خودش رو آپدیت کنه
    // (ادمین endpoints برای تغییر status)
    if (updateDto.customerNote !== undefined) {
      order.customerNote = updateDto.customerNote;
    }

    return await this.orderRepo.save(order);
  }

  /**
   * تغییر وضعیت سفارش توسط ادمین
   */
  async updateOrderStatus(
    id: number,
    updateDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // Validate status transitions
    if (updateDto.status) {
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
        [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
        [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
        [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
        [OrderStatus.DELIVERED]: [],
        [OrderStatus.CANCELLED]: [],
        [OrderStatus.REFUNDED]: [],
      };

      if (!validTransitions[order.status]?.includes(updateDto.status)) {
        throw new BadRequestException(
          `نمی‌توان سفارش از وضعیت ${order.status} به ${updateDto.status} تغییر داد`,
        );
      }

      order.status = updateDto.status;

      // Set timestamps
      if (updateDto.status === OrderStatus.SHIPPED && !order.shippedAt) {
        order.shippedAt = new Date();
      }

      if (updateDto.status === OrderStatus.DELIVERED && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }
    }

    // Update admin fields
    if (updateDto.trackingNumber) {
      order.trackingNumber = updateDto.trackingNumber;
    }

    if (updateDto.carrier) {
      order.carrier = updateDto.carrier;
    }

    if (updateDto.adminNote) {
      order.adminNote = updateDto.adminNote;
    }

    return await this.orderRepo.save(order);
  }

  /**
   * لغو سفارش
   */
  async cancelOrder(
    id: number,
    cancelReason: string,
    user: User,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // بررسی ownership
    if (order.user.id !== user.id) {
      throw new ForbiddenException('شما این سفارش را مالکیت ندارید');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('سفارش تحویل داده شده قابل لغو نیست');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('این سفارش قبلاً لغو شده است');
    }

    // بازگرداندن موجودی
    for (const item of order.items) {
      const offer = await this.offerRepo.findOne({
        where: { id: item.offer.id },
      });

      if (offer) {
        offer.stock += item.quantity;
        await this.offerRepo.save(offer);
      }
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelReason = cancelReason;

    return await this.orderRepo.save(order);
  }

  /**
   * تایید پرداخت
   */
  async confirmPayment(
    id: number,
    transactionId: string,
    user?: User,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // بررسی ownership (اگر user داده شده باشد)
    if (user && order.user.id !== user.id) {
      throw new ForbiddenException('شما این سفارش را مالکیت ندارید');
    }

    order.paymentStatus = PaymentStatus.COMPLETED;
    order.transactionId = transactionId;
    order.paidAt = new Date();
    order.status = OrderStatus.PAID;

    return await this.orderRepo.save(order);
  }

  /**
   * تولید شماره سفارش یونیک
   */
  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // شمارش سفارشات امروز
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await this.orderRepo.count({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `ORD-${year}${month}${day}-${sequence}`;
  }

  /**
   * محاسبه هزینه ارسال
   */
  private calculateShippingCost(subtotal: number): number {
    // ارسال رایگان برای خریدهای بالای 500 هزار تومان
    if (subtotal >= 500000) {
      return 30000;
    }
    // هزینه ارسال ثابت 30 هزار تومان
    return 30000;
  }

  /**
   * محاسبه مالیات (9%)
   */
  private calculateTax(subtotal: number): number {
    return Math.round(subtotal * 0.1);
  }

  /**
   * حذف خودکار سفارشات Unpaid بعد 15 دقیقه (Cron Job)
   * هر 5 دقیقه یکبار اجرا می‌شود
   */
  @Cron('*/30 * * * *')
  async handleUnpaidOrdersExpiry() {
    try {
      this.logger.debug('شروع Cron: حذف سفارشات منقضی‌شده');

      // محاسبه 15 دقیقه پیش
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

      // یافتن تمام سفارشات Pending قدیمی‌تر از 15 دقیقه
      const expiredOrders = await this.orderRepo.find({
        where: {
          paymentStatus: PaymentStatus.PENDING,
          createdAt: LessThan(fifteenMinsAgo),
        },
        relations: ['items', 'items.offer'],
      });

      if (expiredOrders.length === 0) {
        this.logger.debug('هیچ سفارش منقضی‌شده‌ای یافت نشد');
        return;
      }

      this.logger.log(
        `${expiredOrders.length} سفارش منقضی‌شده برای حذف یافت شد`,
      );

      // حذف و برگرداندن موجودی
      for (const order of expiredOrders) {
        await this.refundOrderStock(order);
        await this.orderRepo.remove(order);

        this.logger.log(`سفارش ${order.orderNumber} حذف و موجودی برگردانده شد`);
      }

      this.logger.log(`${expiredOrders.length} سفارش با موفقیت حذف شد`);
    } catch (error) {
      this.logger.error(
        `خطا در Cron Job حذف سفارشات: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * برگرداندن موجودی محصولات (Refund)
   */
  private async refundOrderStock(order: Order): Promise<void> {
    for (const item of order.items) {
      if (item.offer) {
        item.offer.stock += item.quantity;
        await this.offerRepo.save(item.offer);
      }
    }
  }
}
