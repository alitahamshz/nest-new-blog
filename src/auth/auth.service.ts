/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// auth.service.ts
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/users.service';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Role } from 'src/entities/role.entity';
import { Seller } from 'src/entities/seller.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(user: any, selectedRole?: string) {
    // اگر نقش خاصی انتخاب شده
    let roles = user.roles.map((r) => r.name);

    if (selectedRole) {
      // بررسی اینکه کاربر این نقش رو داره
      if (!roles.includes(selectedRole)) {
        throw new UnauthorizedException(
          `کاربر نقش "${selectedRole}" ندارد. نقش‌های موجود: ${roles.join(', ')}`,
        );
      }
      // فقط نقش انتخاب شده رو برگردان
      roles = [selectedRole];
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: roles,
    };

    // اگر نقش seller است، seller ID رو هم بیار
    let sellerId: number | null = null;
    if (roles.includes('seller')) {
      const seller = await this.sellerRepository.findOne({
        where: { user: { id: user.id } },
      });
      if (seller) {
        sellerId = seller.id;
      }
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: roles,
        sellerId: sellerId,
      },
    };
  }
  async register(email: string, password: string, name: string) {
    // چک ایمیل تکراری
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('این ایمیل قبلا استفاده شده است');
    }

    // هش کردن پسورد
    const hashedPassword = await bcrypt.hash(password, 10);

    // نقش user رو از دیتابیس بیار
    let userRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });

    // اگه وجود نداشت، بسازش
    if (!userRole) {
      userRole = this.roleRepository.create({ name: 'user' });
      await this.roleRepository.save(userRole);
    }

    // ساخت کاربر جدید
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      roles: [userRole], // 👈 دیفالت نقش user
    });

    await this.userRepository.save(user);

    // ساخت payload برای توکن
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.name),
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((r) => r.name),
      },
    };
  }
}
