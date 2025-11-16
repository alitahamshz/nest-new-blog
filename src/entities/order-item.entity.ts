import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { ProductVariantValue } from './product-variant-value.entity';
import { Seller } from './seller.entity';
import { SellerOffer } from './seller-offer.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { nullable: false })
  product: Product;

  @ManyToMany(() => ProductVariantValue, { nullable: true })
  @JoinTable({
    name: 'order_item_variant_values',
    joinColumn: { name: 'orderItemId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'variantValueId', referencedColumnName: 'id' },
  })
  variantValues: ProductVariantValue[] | null;

  @ManyToOne(() => Seller, { nullable: false })
  seller: Seller;

  @ManyToOne(() => SellerOffer, { nullable: false })
  offer: SellerOffer;

  // اطلاعات محصول در زمان خرید (snapshot)
  @Column()
  productName: string;

  @Column({ nullable: true })
  variantValueNames: string; // مثل: "رنگ: مشکی - اندازه: L"

  @Column()
  sellerBusinessName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number; // قیمت واحد در زمان خرید

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number; // price * quantity

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number; // تخفیف این آیتم

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number; // subtotal - discount

  @CreateDateColumn()
  createdAt: Date;
}
