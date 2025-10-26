import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { SellerOffer } from './seller-offer.entity';
import { User } from './user.entity';

@Entity('sellers')
export class Seller {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { nullable: false })
  @JoinColumn()
  user: User;

  @Column()
  businessName: string; // نام تجاری/فروشگاه

  @Column({ nullable: true })
  registrationNumber: string; // شماره ثبت شرکت/کسب‌وکار

  @Column({ nullable: true })
  nationalId: string; // کد ملی/شناسه ملی

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  cardNumber: string;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ nullable: true })
  shebaNumber: string; // شماره شبا

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  description: string; // توضیحات درباره فروشگاه

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number; // امتیاز فروشنده (0 تا 5)

  @Column({ default: 0 })
  totalSales: number; // تعداد کل فروش‌ها

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => SellerOffer, (offer) => offer.seller)
  offers: SellerOffer[];
}
