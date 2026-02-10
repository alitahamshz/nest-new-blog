import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { PaymentStatus } from './order.enums';

@Entity('payment_logs')
export class PaymentLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, { nullable: false, onDelete: 'CASCADE' })
  order: Order;

  @Column()
  orderId: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus; // PENDING, COMPLETED, FAILED, REFUNDED

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  transactionId: string; // شماره تراکنش از درگاه

  @Column({ nullable: true })
  gateway: string; // نام درگاه (Zarinpal, IDPay, etc.)

  @Column({ nullable: true })
  gatewayResponse: string; // پاسخ خام درگاه (JSON)

  @Column({ type: 'text', nullable: true })
  errorMessage: string; // پیام خطا درصورت شکست

  @Column({ nullable: true })
  referenceCode: string; // کد مرجع درگاه

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
