// src/posts/post.entity.ts
import { Category } from 'src/category/entities/category.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
} from 'typeorm';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PENDING = 'pending',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  // عنوان
  @Column({ length: 200 })
  title: string;

  // عنوان سئو
  @Column({ length: 200, nullable: true })
  seo_title: string;

  // اسلاگ (برای آدرس URL)
  @Column({ length: 200, unique: true })
  slug: string;

  // متا دسکریپشن
  @Column({ type: 'varchar', length: 300, nullable: true })
  meta_description: string;

  // خلاصه مقاله
  @Column({ type: 'text', nullable: true })
  excerpt: string;

  // محتوای مقاله
  @Column({ type: 'text' })
  content: string;

  // تگ‌ها (رشته‌ای از کلمات کلیدی جدا شده با ویرگول)
  @Column('text', { array: true, nullable: true })
  inner_tags: string[];

  @Column({ default: 0 })
  view_count: number; // تعداد بازدید

  @ManyToMany(() => Tag, (tag) => tag.posts, { cascade: true })
  @JoinTable({
    name: 'post_tags', // جدول واسط Many-to-Many
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  // اضافه کردن نویسنده
  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  author: User;
  // 🟢 many-to-one with category
  @ManyToOne(() => Category, (category) => category.posts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category | null;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
  // تصویر بندانگشتی
  @Column({ nullable: true })
  thumbnail: string;

  // تصویر کاور
  @Column({ nullable: true })
  cover_image: string;

  // وضعیت مقاله
  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
