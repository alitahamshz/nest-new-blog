import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';
import { SellerOffer } from './seller-offer.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column()
  name: string; // مثلاً رنگ یا سایز

  @Column()
  value: string; // مثلاً "قرمز" یا "XL"

  @Column({ nullable: true })
  sku: string; // کد خاص برای واریانت

  @OneToMany(() => SellerOffer, (offer) => offer.variant)
  offers: SellerOffer[];
}
