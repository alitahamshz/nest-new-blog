import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  alt: string;

  @Column({ default: false })
  isMain: boolean;

  @ManyToOne(() => Product, (product) => product.gallery, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
