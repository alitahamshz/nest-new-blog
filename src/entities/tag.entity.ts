// src/tags/tag.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Post } from './post.entity';
import { Product } from './product.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true, nullable: true })
  en_name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];

  @ManyToMany(() => Product, (product) => product.tags)
  products: Product[];
}
