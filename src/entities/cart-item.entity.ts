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

  @Column({ type: 'int' })
  minOrder: number; // حداقل سفارش

  @Column({ type: 'int' })
  maxOrder: number; // حداکثر سفارش

  @Column({ type: 'int' })
  stock: number; // موجودی

  @Column({ type: 'boolean', default: false })
  hasWarranty: boolean; // آیا گارانتی دارد

  @Column({ type: 'text', nullable: true })
  warrantyDescription: string; // توضیح گارانتی

  @Column({ type: 'jsonb', nullable: true })
  selectedVariants: Record<string, any>; // {variantId: variantValueId}

  @Column({ type: 'jsonb', nullable: true })
  variantNames: Record<string, any>; // نام‌های انتخاب شده

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
