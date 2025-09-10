// src/categories/category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Tree, TreeChildren, TreeParent } from 'typeorm';

@Entity('category')
@Tree('closure-table')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200, unique: true })
  slug: string;

  // دسته‌های فرزند
  @TreeChildren()
  children: Category[];

  // دسته والد
  @TreeParent()
  parent: Category;
}
