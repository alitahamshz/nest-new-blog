// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Post } from 'src/posts/entities/post.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // بعدا هش میشه

  @Column()
  name: string;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable() // فقط یک سمت نیاز داره
  roles: Role[];

   // ارتباط با پست‌ها
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}
