// user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { UserProfile } from './user-profile.entity';
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

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile: UserProfile;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable() // فقط یک سمت نیاز داره
  roles: Role[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  // ارتباط با پست‌ها
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}
