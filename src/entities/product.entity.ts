import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { Tag } from './tag.entity';
import { Attribute } from './attribute.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';
import { SellerOffer } from './seller-offer.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ nullable: true })
  sku: string; // کد محصول (جهت انبارداری)

  @Column({ nullable: true })
  mainImage: string;

  @Column({ default: false })
  hasVariant: boolean;

  @ManyToOne(() => ProductCategory, (category) => category.products, {
    eager: true,
  })
  category: ProductCategory;

  @ManyToMany(() => Tag, (tag) => tag.products, { cascade: true })
  @JoinTable()
  tags: Tag[];

  @ManyToMany(() => Attribute, { eager: true })
  @JoinTable()
  attributes: Attribute[];

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  gallery: ProductImage[];

  @OneToMany(() => SellerOffer, (offer) => offer.product)
  offers: SellerOffer[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
