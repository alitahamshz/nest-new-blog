// src/posts/post.entity.ts
import { Tag } from 'src/tags/entities/tag.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  REVIEW = 'review',
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
  seoTitle: string;

  // اسلاگ (برای آدرس URL)
  @Column({ length: 200, unique: true })
  slug: string;

  // متا دسکریپشن
  @Column({ type: 'varchar', length: 300, nullable: true })
  metaDescription: string;

  // خلاصه مقاله
  @Column({ type: 'text', nullable: true })
  excerpt: string;

  // محتوای مقاله
  @Column({ type: 'text' })
  content: string;

  // تگ‌ها (رشته‌ای از کلمات کلیدی جدا شده با ویرگول)
  @Column('simple-array', { nullable: true })
  inner_tags: string[];

  @ManyToMany(() => Tag, (tag) => tag.posts, { cascade: true })
  @JoinTable({
    name: 'post_tags', // جدول واسط Many-to-Many
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
  // دسته‌بندی (فعلاً رشته، بعداً میشه رابطه جداگانه درست کرد)
  @Column({ nullable: true })
  category: string;

  // تصویر بندانگشتی
  @Column({ nullable: true })
  thumbnail: string;

  // تصویر کاور
  @Column({ nullable: true })
  coverImage: string;

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
