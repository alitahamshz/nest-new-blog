import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { CategorySpecTemplate } from './category-spec-template.entity';

@Entity('product_spec_values')
@Index(['productId', 'templateId'], { unique: true })
export class ProductSpecValue {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (p) => p.specValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  @ManyToOne(() => CategorySpecTemplate, (t) => t.values, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'templateId' })
  template: CategorySpecTemplate;

  @Column()
  templateId: number;

  @Column({ type: 'text' })
  value: string; // مقدار به صورت string — "6.7"، "Samsung"، "true"
}
