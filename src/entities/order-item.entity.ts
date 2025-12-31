import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';
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

  @ManyToOne(() => Seller, { nullable: false })
  seller: Seller;

  @ManyToOne(() => SellerOffer, { nullable: false })
  offer: SellerOffer;

  // اطلاعات محصول در زمان خرید (snapshot)
  @Column()
  productName: string;

  @Column({ nullable: true })
  productSlug: string; // slug محصول

  @Column({ nullable: true })
  productImage: string; // تصویر محصول

  @Column({ nullable: true })
  variantValueNames: string; // مثل: "رنگ: مشکی - اندازه: L"

  @Column()
  sellerBusinessName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discountPrice: number; // قیمت تخفیف‌دار در زمان خرید

  @Column({ type: 'int', default: 0 })
  discountPercent: number; // درصد تخفیف

  @Column({ type: 'int' })
  minOrder: number; // حداقل سفارش

  @Column({ type: 'int' })
  maxOrder: number; // حداکثر سفارش

  @Column({ type: 'int' })
  stock: number; // موجودی در زمان خرید

  @Column({ type: 'boolean', default: false })
  hasWarranty: boolean; // آیا گارانتی داشت

  @Column({ type: 'text', nullable: true })
  warrantyDescription: string; // توضیح گارانتی

  // variant snapshot fields
  @Column({ type: 'int', nullable: true })
  selectedVariantId: number | null;

  @Column({ type: 'int', nullable: true })
  selectedVariantValueId: number | null;

  @Column({ type: 'jsonb', nullable: true })
  selectedVariantObject: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  selectedVariantValueObject: Record<string, any> | null;

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
