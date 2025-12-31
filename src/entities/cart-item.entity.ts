import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from './product.entity';
import { SellerOffer } from './seller-offer.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @ManyToOne(() => Product, { nullable: false })
  product: Product;

  @ManyToOne(() => SellerOffer, { nullable: false })
  offer: SellerOffer;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number; // قیمت در زمان افزودن به سبد

  // فیلدهای اضافی برای کاهش joins
  @Column()
  productName: string; // نام محصول

  @Column()
  productSlug: string; // slug محصول

  @Column({ nullable: true })
  productImage: string; // تصویر محصول

  @Column()
  sellerName: string; // نام فروشنده

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discountPrice: number; // قیمت تخفیف‌دار

  @Column({ type: 'int', default: 0 })
  discountPercent: number; // درصد تخفیف

  @Column({ type: 'int', nullable: true })
  minOrder: number | null; // حداقل سفارش

  @Column({ type: 'int', nullable: true })
  maxOrder: number | null; // حداکثر سفارش

  @Column({ type: 'int' })
  stock: number; // موجودی

  @Column({ type: 'boolean', default: false })
  hasWarranty: boolean; // آیا گارانتی دارد

  @Column({ type: 'text', nullable: true })
  warrantyDescription: string; // توضیح گارانتی

  @Column({ type: 'int', nullable: true })
  selectedVariantId: number | null; // شناسه واریانت انتخاب شده

  @Column({ type: 'int', nullable: true })
  selectedVariantValueId: number | null; // شناسه مقدار واریانت انتخاب شده

  @Column({ type: 'jsonb', nullable: true })
  selectedVariantObject: Record<string, any> | null; // object کامل واریانت

  @Column({ type: 'jsonb', nullable: true })
  selectedVariantValueObject: Record<string, any> | null; // object کامل مقدار واریانت

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
