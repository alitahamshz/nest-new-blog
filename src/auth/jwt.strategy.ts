/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const jwtSecret = configService.getOrThrow<string>('MY_SUPER_SECRET');
    console.log({configService})
    if (!jwtSecret) {
      throw new Error('JWT_SECRET_KEY is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, // بهتره از config استفاده کنی
    });
  }

  async validate(payload: any) {
    console.log({payload})
    // user رو از database لود کن تا roles داشته باشد
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['roles', 'seller'],
    });

    if (!user) {
      return null;
    }

    return user;
  }
}
