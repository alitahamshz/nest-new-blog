// user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) {}

  async create(dto: CreateUserDto) {
    const roles = await this.roleRepo.findBy({ name: dto.roles as any });

    const user = this.userRepo.create({
      email: dto.email,
      password: dto.password, // بعدا hash می‌کنیم
      name: dto.name,
      roles,
    });

    return this.userRepo.save(user);
  }

  findAll() {
    return this.userRepo.find({ relations: ['roles'] });
  }
  async findByEmail(email: string) {
  return this.userRepo.findOne({
    where: { email },
    relations: ['roles'],
  });
}
}
