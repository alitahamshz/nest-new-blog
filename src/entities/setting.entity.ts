import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  COLOR = 'color',
  SELECT = 'select',
  TEXT = 'text',
  IMAGE = 'image',
}

export enum SettingGroup {
  GENERAL = 'general',
  AI = 'ai',
  THEME = 'theme',
  SHOP_HOMEPAGE = 'shop_homepage',
  BLOG_HOMEPAGE = 'blog_homepage',
  SEO = 'seo',
}

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  key!: string;

  @Column({ type: 'text', default: '' })
  value!: string;

  @Column({ type: 'enum', enum: SettingType, default: SettingType.STRING })
  type!: SettingType;

  @Column({ type: 'enum', enum: SettingGroup, default: SettingGroup.GENERAL })
  group!: SettingGroup;

  @Column()
  label!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ type: 'jsonb', nullable: true })
  options!: Record<string, any> | null;

  @Column({ default: 0 })
  order!: number;

  @Column({ default: false })
  isPublic!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
