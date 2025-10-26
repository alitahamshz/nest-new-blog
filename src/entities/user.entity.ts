import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Role } from 'src/entities/role.entity';
import { Post } from 'src/entities/post.entity';
import { Comment } from 'src/entities/comment.entity';
import { UserProfile } from 'src/entities/user-profile.entity';
import { Seller } from 'src/entities/seller.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string; // بعدا هش میشه

  @Column()
  name: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile: UserProfile;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable() // فقط یک سمت نیاز داره
  roles: Role[];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  // ارتباط با پست‌ها
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  // ارتباط با فروشنده (اختیاری - اگر کاربر فروشنده باشه)
  @OneToOne(() => Seller, (seller) => seller.user)
  seller: Seller;
}
