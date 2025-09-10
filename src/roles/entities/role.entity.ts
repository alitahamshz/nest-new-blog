// role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // مثلا: ADMIN, AUTHOR, USER

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
