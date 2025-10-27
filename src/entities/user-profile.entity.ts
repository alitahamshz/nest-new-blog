// src/users/user-profile.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Address } from './address.entity';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar: string; // مسیر تصویر پروفایل

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  socialLinks: string; // می‌تونی JSON هم استفاده کنی

  // ========== اطلاعات تماس و آدرس ==========
  @Column({ nullable: true })
  phone: string; // شماره تلفن اصلی

  @Column({ nullable: true })
  alternativePhone: string; // شماره تماس جایگزین

  @Column({ type: 'text', nullable: true })
  address: string; // آدرس کامل

  @Column({ nullable: true })
  city: string; // شهر

  @Column({ nullable: true })
  province: string; // استان

  @Column({ nullable: true })
  postalCode: string; // کد پستی

  @Column({ nullable: true })
  nationalId: string; // کد ملی (برای احراز هویت)

  // ========== رابطه با آدرس‌ها ==========
  @OneToMany(() => Address, (address) => address.userProfile)
  addresses: Address[];
}
