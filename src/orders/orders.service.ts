import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { User } from '../entities/user.entity';
import { SellerOffer } from '../entities/seller-offer.entity';
import { Cart } from '../entities/cart.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, PaymentStatus } from '../entities/order.enums';

@Injectable()
export class OrdersService {
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
        relations: ['items', 'items.offer', 'items.product', 'items.variantValues'],
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
          relations: ['seller', 'product', 'variantValues'],
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

        const orderItem = queryRunner.manager.create(OrderItem, {
          product: cartItem.product,
          variantValues: cartItem.variantValues,
          seller: offer.seller,
          offer: offer,
          productName: cartItem.product.name,
          variantValueNames: cartItem.variantValues
            ? cartItem.variantValues.map((v) => v.name).join(' - ')
            : undefined,
          sellerBusinessName: offer.seller.businessName,
          quantity: cartItem.quantity,
          price: cartItem.price,
          subtotal: itemSubtotal,
          discount: 0,
          total: itemSubtotal,
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

      // remove cart inside transaction
      await queryRunner.manager.remove(cart);

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
      for (const item of createDto.items) {
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
          relations: ['seller', 'product', 'variantValues'],
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

        const orderItem = queryRunner.manager.create(OrderItem, {
          product: offer.product,
          variantValues: offer.variantValues,
          seller: offer.seller,
          offer,
          productName: offer.product.name,
          variantValueNames: offer.variantValues
            ? offer.variantValues.map((v) => v.name).join(' - ')
            : undefined,
          sellerBusinessName: offer.seller.businessName,
          quantity: item.quantity,
          price: offer.discountPrice,
          subtotal: itemSubtotal,
          discount: 0,
          total: itemSubtotal,
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
   * دریافت سفارشات یک کاربر
   */
  async findByUser(userId: number): Promise<Order[]> {
    return await this.orderRepo.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.variant', 'items.seller'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * دریافت سفارشات یک فروشنده
   */
  async findBySeller(sellerId: number): Promise<OrderItem[]> {
    return await this.orderItemRepo.find({
      where: { seller: { id: sellerId } },
      relations: ['order', 'product', 'variant'],
      order: { createdAt: 'DESC' },
    });
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
   * بروزرسانی سفارش
   */
  async update(id: number, updateDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    // بروزرسانی تاریخ‌های مربوطه
    if (updateDto.paymentStatus === PaymentStatus.COMPLETED && !order.paidAt) {
      order.paidAt = new Date();
    }

    if (updateDto.status === OrderStatus.SHIPPED && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    if (updateDto.status === OrderStatus.DELIVERED && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    Object.assign(order, updateDto);
    return await this.orderRepo.save(order);
  }

  /**
   * لغو سفارش
   */
  async cancelOrder(id: number, cancelReason: string): Promise<Order> {
    const order = await this.findOne(id);

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
  async confirmPayment(id: number, transactionId: string): Promise<Order> {
    const order = await this.findOne(id);

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
      return 0;
    }
    // هزینه ارسال ثابت 30 هزار تومان
    return 30000;
  }

  /**
   * محاسبه مالیات (9%)
   */
  private calculateTax(subtotal: number): number {
    return Math.round(subtotal * 0.09);
  }
}
