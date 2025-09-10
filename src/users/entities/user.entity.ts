// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // بعدا هش میشه

  @Column()
  name: string;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable() // فقط یک سمت نیاز داره
  roles: Role[];
}
