import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { Seller } from './seller.entity';

@Entity('seller_offers')
export class SellerOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Seller, (seller) => seller.offers)
  seller: Seller;

  @ManyToOne(() => Product, (product) => product.offers, { nullable: true })
  product: Product;

  @ManyToOne(() => ProductVariant, (variant) => variant.offers, {
    nullable: true,
  })
  variant: ProductVariant;

  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @Column('decimal', { precision: 12, scale: 2 })
  discountPrice: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  discountPercent: number;

  @Column('boolean', { nullable: true })
  hasWarranty: boolean;

  @Column('varchar', { nullable: true })
  warrantyDescription: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  isActive: boolean;
}
