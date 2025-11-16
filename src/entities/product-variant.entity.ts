import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductVariantValue } from './product-variant-value.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column()
  name: string; // نام نوع تنوع: رنگ، اندازه، ...

  @Column({ nullable: true })
  icon: string; // آیکن تنوع

  @Column({ nullable: true })
  image: string; // تصویر تنوع

  @Column({ nullable: true })
  sku: string; // کد خاص برای واریانت

  @OneToMany(() => ProductVariantValue, (value) => value.variant, {
    cascade: true,
  })
  values: ProductVariantValue[];
}
