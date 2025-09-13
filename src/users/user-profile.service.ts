// user-profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
  ) {}

  async create(
    userId: number,
    dto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    const profile = this.profileRepo.create({ ...dto, user: { id: userId } });
    return this.profileRepo.save(profile);
  }

  async update(
    userId: number,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    Object.assign(profile, dto);
    return this.profileRepo.save(profile);
  }

  async findOne(userId: number): Promise<UserProfile> {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }
}
