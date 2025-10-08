import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Tree,
  TreeChildren,
  TreeParent,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_categories')
@Tree('closure-table')
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  icon: string;

  @TreeChildren()
  children: ProductCategory[];

  @TreeParent()
  parent: ProductCategory;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
