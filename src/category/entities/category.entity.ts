// src/categories/category.entity.ts
import { Post } from 'src/posts/entities/post.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Tree,
  TreeChildren,
  TreeParent,
  OneToMany,
} from 'typeorm';

@Entity('category')
@Tree('closure-table')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  en_name?: string | null;

  @Column({ length: 200, unique: true })
  slug: string;

  // دسته‌های فرزند
  @TreeChildren()
  children: Category[];

  // دسته والد
  @TreeParent()
  parent: Category | null;

  // 🟢 one-to-many with posts
  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];
}
