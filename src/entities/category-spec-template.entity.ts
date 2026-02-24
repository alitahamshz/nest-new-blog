import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { ProductSpecValue } from '../entities/product-spec-value.entity';

export enum SpecType {
  TEXT = 'text',         // متن آزاد
  NUMBER = 'number',     // عدد
  RANGE = 'range',       // بازه (برای فیلتر slider)
  SELECT = 'select',     // انتخاب از لیست (checkbox فیلتر)
  BOOLEAN = 'boolean',   // دارد/ندارد
}

@Entity('category_spec_templates')
export class CategorySpecTemplate {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ProductCategory, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'categoryId' })
  category!: ProductCategory;

  @Column()
  categoryId!: number;

  @Column()
  name!: string;

  @Column()
  key!: string;

  @Column({ type: 'enum', enum: SpecType, default: SpecType.TEXT })
  type!: SpecType;

  @Column({ nullable: true })
  unit!: string;

  @Column({ type: 'simple-array', nullable: true })
  options!: string[];

  @Column({ default: true })
  filterable!: boolean;

  @Column({ default: 0 })
  displayOrder!: number;

  @OneToMany(() => ProductSpecValue, (v: ProductSpecValue) => v.template)
  values!: ProductSpecValue[];
}
