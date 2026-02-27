import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { Seller } from '../entities/seller.entity';
import { SellerOffer } from '../entities/seller-offer.entity';
import { Post } from '../entities/post.entity';
import { Comment } from '../entities/comment.entity';
import { OrderStatus, PaymentStatus } from '../entities/order.enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Seller)
    private readonly sellerRepo: Repository<Seller>,
    @InjectRepository(SellerOffer)
    private readonly offerRepo: Repository<SellerOffer>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  /* ═══════════════════════════════════════════════════════
   *  ADMIN STATS
   * ═══════════════════════════════════════════════════════ */
  async getAdminStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // کل سفارشات و درآمد
    const [totalOrders, totalRevenue, monthOrders, monthRevenue, lastMonthRevenue] =
      await Promise.all([
        this.orderRepo.count(),
        this.orderRepo
          .createQueryBuilder('o')
          .select('COALESCE(SUM(o.total), 0)', 'sum')
          .where('o.paymentStatus = :ps', { ps: PaymentStatus.COMPLETED })
          .getRawOne()
          .then((r) => Number(r.sum)),
        this.orderRepo.count({
          where: { createdAt: MoreThanOrEqual(startOfMonth) },
        }),
        this.orderRepo
          .createQueryBuilder('o')
          .select('COALESCE(SUM(o.total), 0)', 'sum')
          .where('o.paymentStatus = :ps', { ps: PaymentStatus.COMPLETED })
          .andWhere('o.createdAt >= :start', { start: startOfMonth })
          .getRawOne()
          .then((r) => Number(r.sum)),
        this.orderRepo
          .createQueryBuilder('o')
          .select('COALESCE(SUM(o.total), 0)', 'sum')
          .where('o.paymentStatus = :ps', { ps: PaymentStatus.COMPLETED })
          .andWhere('o.createdAt BETWEEN :s AND :e', {
            s: startOfLastMonth,
            e: endOfLastMonth,
          })
          .getRawOne()
          .then((r) => Number(r.sum)),
      ]);

    // تعداد کاربران، محصولات، فروشندگان، مقالات، نظرات
    const [totalUsers, totalProducts, totalSellers, totalPosts, totalComments] =
      await Promise.all([
        this.userRepo.count(),
        this.productRepo.count(),
        this.sellerRepo.count(),
        this.postRepo.count(),
        this.commentRepo.count(),
      ]);

    // تعداد سفارشات در انتظار
    const pendingOrders = await this.orderRepo.count({
      where: { status: OrderStatus.PENDING },
    });

    // نمودار درآمد ۷ روز اخیر
    const revenueChart = await this.getRevenueChart(7);

    // نمودار وضعیت سفارشات
    const orderStatusChart = await this.getOrderStatusDistribution();

    // آخرین ۵ سفارش
    const recentOrders = await this.orderRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user'],
    });

    // پرفروش‌ترین محصولات
    const topProducts = await this.getTopSellingProducts(5);

    return {
      cards: {
        totalOrders,
        monthOrders,
        totalRevenue,
        monthRevenue,
        lastMonthRevenue,
        revenueChange: lastMonthRevenue > 0
          ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
          : monthRevenue > 0 ? 100 : 0,
        totalUsers,
        totalProducts,
        totalSellers,
        totalPosts,
        totalComments,
        pendingOrders,
      },
      revenueChart,
      orderStatusChart,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
        userName: o.user?.name || o.user?.email || '-',
      })),
      topProducts,
    };
  }

  /* ═══════════════════════════════════════════════════════
   *  SELLER STATS
   * ═══════════════════════════════════════════════════════ */
  async getSellerStats(sellerId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // درآمد فروشنده
    const [totalRevenue, monthRevenue] = await Promise.all([
      this.orderItemRepo
        .createQueryBuilder('oi')
        .select('COALESCE(SUM(oi.total), 0)', 'sum')
        .innerJoin('oi.order', 'o')
        .where('oi.seller.id = :sid', { sid: sellerId })
        .andWhere('o.paymentStatus = :ps', { ps: PaymentStatus.COMPLETED })
        .getRawOne()
        .then((r) => Number(r.sum)),
      this.orderItemRepo
        .createQueryBuilder('oi')
        .select('COALESCE(SUM(oi.total), 0)', 'sum')
        .innerJoin('oi.order', 'o')
        .where('oi.seller.id = :sid', { sid: sellerId })
        .andWhere('o.paymentStatus = :ps', { ps: PaymentStatus.COMPLETED })
        .andWhere('o.createdAt >= :start', { start: startOfMonth })
        .getRawOne()
        .then((r) => Number(r.sum)),
    ]);

    // تعداد آفرهای فعال
    const activeOffers = await this.offerRepo.count({
      where: { seller: { id: sellerId }, isActive: true },
    });

    // تعداد سفارشات فروشنده
    const totalOrders = await this.orderItemRepo
      .createQueryBuilder('oi')
      .select('COUNT(DISTINCT oi.order.id)', 'cnt')
      .where('oi.seller.id = :sid', { sid: sellerId })
      .getRawOne()
      .then((r) => Number(r.cnt));

    // وضعیت سفارشات فروشنده
    const sellerOrderStatus = await this.orderItemRepo
      .createQueryBuilder('oi')
      .select('o.status', 'status')
      .addSelect('COUNT(DISTINCT o.id)', 'count')
      .innerJoin('oi.order', 'o')
      .where('oi.seller.id = :sid', { sid: sellerId })
      .groupBy('o.status')
      .getRawMany()
      .then((rows) =>
        rows.map((r) => ({ status: r.status, count: Number(r.count) })),
      );

    // نمودار درآمد ۷ روز اخیر فروشنده
    const revenueChart = await this.getSellerRevenueChart(sellerId, 7);

    // آخرین سفارشات فروشنده
    const recentOrders = await this.orderItemRepo
      .createQueryBuilder('oi')
      .select([
        'oi.id',
        'oi.productName',
        'oi.quantity',
        'oi.total',
        'oi.createdAt',
      ])
      .addSelect(['o.id', 'o.orderNumber', 'o.status', 'o.createdAt'])
      .innerJoin('oi.order', 'o')
      .where('oi.seller.id = :sid', { sid: sellerId })
      .orderBy('oi.createdAt', 'DESC')
      .take(5)
      .getMany();

    // پرفروش‌ترین محصولات فروشنده
    const topProducts = await this.orderItemRepo
      .createQueryBuilder('oi')
      .select('oi.productName', 'name')
      .addSelect('SUM(oi.quantity)', 'totalSold')
      .addSelect('SUM(oi.total)', 'totalRevenue')
      .innerJoin('oi.order', 'o')
      .where('oi.seller.id = :sid', { sid: sellerId })
      .andWhere('o.paymentStatus = :ps', { ps: PaymentStatus.COMPLETED })
      .groupBy('oi.productName')
      .orderBy('"totalSold"', 'DESC')
      .limit(5)
      .getRawMany()
      .then((rows) =>
        rows.map((r) => ({
          name: r.name,
          totalSold: Number(r.totalSold),
          totalRevenue: Number(r.totalRevenue),
        })),
      );

    return {
      cards: {
        totalRevenue,
        monthRevenue,
        activeOffers,
        totalOrders,
      },
      orderStatusChart: sellerOrderStatus,
      revenueChart,
      recentOrders: recentOrders.map((oi) => ({
        id: oi.id,
        orderNumber: oi.order?.orderNumber,
        productName: oi.productName,
        quantity: oi.quantity,
        total: oi.total,
        status: oi.order?.status,
        createdAt: oi.createdAt,
      })),
      topProducts,
    };
  }

  /* ═══════════════════════════════════════════════════════
   *  USER STATS
   * ═══════════════════════════════════════════════════════ */
  async getUserStats(userId: number) {
    // تعداد سفارشات کاربر
    const totalOrders = await this.orderRepo.count({
      where: { user: { id: userId } },
    });

    // کل هزینه خریدها
    const totalSpent = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'sum')
      .where('o.user.id = :uid', { uid: userId })
      .andWhere('o.paymentStatus = :ps', { ps: PaymentStatus.COMPLETED })
      .getRawOne()
      .then((r) => Number(r.sum));

    // وضعیت سفارشات
    const orderStatusChart = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('o.user.id = :uid', { uid: userId })
      .groupBy('o.status')
      .getRawMany()
      .then((rows) =>
        rows.map((r) => ({ status: r.status, count: Number(r.count) })),
      );

    // در انتظار بررسی
    const pendingOrders = await this.orderRepo.count({
      where: { user: { id: userId }, status: OrderStatus.PENDING },
    });

    // تعداد تحویل شده
    const deliveredOrders = await this.orderRepo.count({
      where: { user: { id: userId }, status: OrderStatus.DELIVERED },
    });

    // آخرین سفارشات
    const recentOrders = await this.orderRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // نمودار خرید ۶ ماه اخیر
    const spendingChart = await this.getUserSpendingChart(userId, 6);

    return {
      cards: {
        totalOrders,
        totalSpent,
        pendingOrders,
        deliveredOrders,
      },
      orderStatusChart,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      })),
      spendingChart,
    };
  }

  /* ═══════════════════════════════════════════════════════
   *  HELPER METHODS
   * ═══════════════════════════════════════════════════════ */

  /** نمودار درآمد n روز اخیر (admin) */
  private async getRevenueChart(days: number) {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select("TO_CHAR(o.createdAt, 'MM/DD')", 'date')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .addSelect('COUNT(*)', 'orders')
      .where('o.paymentStatus = :ps', { ps: PaymentStatus.COMPLETED })
      .andWhere('o.createdAt >= NOW() - :interval::interval', {
        interval: `${days} days`,
      })
      .groupBy("TO_CHAR(o.createdAt, 'MM/DD')")
      .orderBy("TO_CHAR(o.createdAt, 'MM/DD')", 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    }));
  }

  /** توزیع وضعیت سفارشات (admin) */
  private async getOrderStatusDistribution() {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.status')
      .getRawMany();

    return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
  }

  /** پرفروش‌ترین محصولات (admin) */
  private async getTopSellingProducts(limit: number) {
    const rows = await this.orderItemRepo
      .createQueryBuilder('oi')
      .select('oi.productName', 'name')
      .addSelect('SUM(oi.quantity)', 'totalSold')
      .addSelect('SUM(oi.total)', 'totalRevenue')
      .innerJoin('oi.order', 'o')
      .where('o.paymentStatus = :ps', { ps: PaymentStatus.COMPLETED })
      .groupBy('oi.productName')
      .orderBy('"totalSold"', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((r) => ({
      name: r.name,
      totalSold: Number(r.totalSold),
      totalRevenue: Number(r.totalRevenue),
    }));
  }

  /** نمودار درآمد فروشنده n روز اخیر */
  private async getSellerRevenueChart(sellerId: number, days: number) {
    const rows = await this.orderItemRepo
      .createQueryBuilder('oi')
      .select("TO_CHAR(oi.createdAt, 'MM/DD')", 'date')
      .addSelect('COALESCE(SUM(oi.total), 0)', 'revenue')
      .innerJoin('oi.order', 'o')
      .where('oi.seller.id = :sid', { sid: sellerId })
      .andWhere('o.paymentStatus = :ps', { ps: PaymentStatus.COMPLETED })
      .andWhere('oi.createdAt >= NOW() - :interval::interval', {
        interval: `${days} days`,
      })
      .groupBy("TO_CHAR(oi.createdAt, 'MM/DD')")
      .orderBy("TO_CHAR(oi.createdAt, 'MM/DD')", 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
    }));
  }

  /** نمودار خرید کاربر n ماه اخیر */
  private async getUserSpendingChart(userId: number, months: number) {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select("TO_CHAR(o.createdAt, 'YYYY/MM')", 'month')
      .addSelect('COALESCE(SUM(o.total), 0)', 'spent')
      .addSelect('COUNT(*)', 'orders')
      .where('o.user.id = :uid', { uid: userId })
      .andWhere('o.paymentStatus = :ps', { ps: PaymentStatus.COMPLETED })
      .andWhere('o.createdAt >= NOW() - :interval::interval', {
        interval: `${months} months`,
      })
      .groupBy("TO_CHAR(o.createdAt, 'YYYY/MM')")
      .orderBy("TO_CHAR(o.createdAt, 'YYYY/MM')", 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      month: r.month,
      spent: Number(r.spent),
      orders: Number(r.orders),
    }));
  }
}
