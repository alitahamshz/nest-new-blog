import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from './product.entity';
import { ProductVariantValue } from './product-variant-value.entity';
import { SellerOffer } from './seller-offer.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @ManyToOne(() => Product, { nullable: false })
  product: Product;

  @ManyToMany(() => ProductVariantValue, { nullable: true })
  @JoinTable({
    name: 'cart_item_variant_values',
    joinColumn: { name: 'cartItemId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'variantValueId', referencedColumnName: 'id' },
  })
  variantValues: ProductVariantValue[] | null;

  @ManyToOne(() => SellerOffer, { nullable: false })
  offer: SellerOffer;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number; // قیمت در زمان افزودن به سبد

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
