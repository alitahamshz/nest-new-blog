import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BannerSection {
  SHOP = 'shop',
  BLOG = 'blog',
}

/**
 * position = شناسه یکتای جایگاه بنر
 * بلاگ: blog_sidebar_1 | blog_sidebar_2 | post_banner
 * شاپ: shop_hero_1 | shop_hero_2 | ...
 */
@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: BannerSection, default: BannerSection.SHOP })
  section!: BannerSection;

  @Column({ nullable: true, comment: 'شناسه یکتای جایگاه: blog_sidebar_1 | post_banner | shop_hero_1' })
  position!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  subtitle!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  image!: string;

  @Column({ nullable: true })
  link!: string;

  @Column({ nullable: true, default: '' })
  btnText!: string;

  @Column({ nullable: true, default: '#6d28d9' })
  bgColor!: string;

  @Column({ default: 0 })
  order!: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
