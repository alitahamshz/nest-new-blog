import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_specifications')
export class ProductSpecification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.specifications, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column()
  key: string; // نام ویژگی: "کشور سازنده"، "جنس"، "وزن"، "ابعاد"

  @Column('text')
  value: string; // مقدار: "ایران"، "پنبه"، "500 گرم"

  @Column({ nullable: true })
  unit: string; // واحد اندازه‌گیری: "گرم"، "سانتی‌متر"، "کیلوگرم" (اختیاری)

  @Column({ default: 0 })
  displayOrder: number; // ترتیب نمایش
}
