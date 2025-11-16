import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { Product } from './product.entity';

@Entity('product_variant_values')
export class ProductVariantValue {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductVariant, (variant) => variant.values, {
    onDelete: 'CASCADE',
  })
  variant: ProductVariant;

  @ManyToOne(() => Product, (product) => product.variantValues, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column()
  name: string; // مقدار تنوع: سبز، قرمز، S، XL، ...

  @Column({ nullable: true })
  icon: string; // آیکن مقدار

  @Column({ nullable: true })
  image: string; // تصویر مقدار (برای رنگ می‌تونه رنگ نمایان بشه)

  @Column({ nullable: true })
  hexCode: string; // کد رنگ (برای رنگ‌های محصول)
}
