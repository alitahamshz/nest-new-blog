import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductVariantValue } from './product-variant-value.entity';
import { Seller } from './seller.entity';

@Entity('seller_offers')
export class SellerOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Seller, (seller) => seller.offers)
  seller: Seller;

  @ManyToOne(() => Product, (product) => product.offers)
  product: Product;

  @ManyToMany(() => ProductVariantValue, { eager: true })
  @JoinTable({
    name: 'offer_variant_values',
    joinColumn: { name: 'offer_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'variant_value_id', referencedColumnName: 'id' },
  })
  variantValues: ProductVariantValue[];

  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @Column('decimal', { precision: 12, scale: 2 })
  discountPrice: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  discountPercent: number;

  @Column({ type: 'integer', nullable: true })
  minOrder: number; // حداقل تعداد سفارش

  @Column({ type: 'integer', nullable: true })
  maxOrder: number; // حداکثر تعداد سفارش

  @Column('text', { nullable: true })
  sellerNotes: string; // نقد و بررسی محصول توسط فروشنده

  @Column('boolean', { nullable: true })
  hasWarranty: boolean;

  @Column('varchar', { nullable: true })
  warrantyDescription: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  isActive: boolean;
}
