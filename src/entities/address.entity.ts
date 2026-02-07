import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { User } from './user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.addresses, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => UserProfile, (profile) => profile.addresses, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  userProfile: UserProfile;

  @Column()
  title: string; // عنوان آدرس (مثلاً: خانه، محل کار، آدرس پدر و مادر)

  @Column()
  recipientName: string; // نام گیرنده

  @Column()
  phone: string; // شماره تماس

  @Column({ nullable: true })
  alternativePhone: string; // شماره جایگزین

  @Column({ type: 'text' })
  address: string; // آدرس کامل

  @Column()
  city: string; // شهر

  @Column()
  province: string; // استان

  @Column({ length: 10 })
  postalCode: string; // کد پستی 10 رقمی

  @Column({ default: false })
  isDefault: boolean; // آیا آدرس پیش‌فرض است؟

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
