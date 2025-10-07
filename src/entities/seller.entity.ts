import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SellerOffer } from './seller-offer.entity';

@Entity('sellers')
export class Seller {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => SellerOffer, (offer) => offer.seller)
  offers: SellerOffer[];
}
