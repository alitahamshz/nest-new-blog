import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus, PaymentMethod, PaymentStatus } from './order.enums';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNumber: string; // شماره سفارش یونیک (مثل: ORD-20250127-0001)

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  // اطلاعات قیمت
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number; // جمع قیمت محصولات

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingCost: number; // هزینه ارسال

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number; // تخفیف

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number; // مالیات

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number; // مجموع نهایی

  // وضعیت سفارش
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // اطلاعات پرداخت
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.ONLINE,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true })
  transactionId: string; // شماره تراکنش

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date; // زمان پرداخت

  // اطلاعات ارسال
  @Column({ type: 'text' })
  shippingAddress: string; // آدرس ارسال (JSON یا text)

  @Column({ nullable: true })
  shippingPhone: string;

  @Column({ nullable: true })
  recipientName: string; // نام گیرنده

  @Column({ nullable: true })
  trackingNumber: string; // کد رهگیری

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  // یادداشت‌ها
  @Column({ type: 'text', nullable: true })
  customerNote: string; // یادداشت مشتری

  @Column({ type: 'text', nullable: true })
  adminNote: string; // یادداشت ادمین

  @Column({ nullable: true })
  cancelReason: string; // دلیل لغو

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
