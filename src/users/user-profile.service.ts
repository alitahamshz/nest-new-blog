// user-profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from 'src/entities/user-profile.entity';
import { Address } from 'src/entities/address.entity';
import { User } from 'src/entities/user.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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

  // ========== مدیریت آدرس‌ها ==========

  /**
   * دریافت تمام آدرس‌های کاربر (بدون نیاز به پروفایل)
   */
  async getAddresses(userId: number): Promise<Address[]> {
    const addresses = await this.addressRepo.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
    return addresses || [];
  }

  /**
   * دریافت آدرس پیش‌فرض کاربر (بدون نیاز به پروفایل)
   */
  async getDefaultAddress(userId: number): Promise<Address | null> {
    return await this.addressRepo.findOne({
      where: { user: { id: userId }, isDefault: true },
    });
  }

  /**
   * افزودن آدرس جدید (بدون نیاز به پروفایل)
   * اگر پروفایل وجود نداشت، خودکار آن را ایجاد می‌کند
   */
  async addAddress(userId: number, dto: CreateAddressDto): Promise<Address> {
    // بررسی وجود کاربر
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['addresses'],
    });
    if (!user) throw new NotFoundException('User not found');

    // بررسی وجود پروفایل و ایجاد آن در صورت عدم وجود
    let profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) {
      profile = this.profileRepo.create({ user: { id: userId } });
      await this.profileRepo.save(profile);
    }

    // اگر این اولین آدرس هست یا کاربر خواسته پیش‌فرض باشه
    if (dto.isDefault || !user.addresses || user.addresses.length === 0) {
      // همه آدرس‌های قبلی رو غیرپیش‌فرض کن
      await this.addressRepo.update(
        { user: { id: userId } },
        { isDefault: false },
      );
    }

    const address = this.addressRepo.create({
      ...dto,
      user: { id: userId },
      userProfile: profile,
      isDefault: dto.isDefault || (user.addresses && user.addresses.length === 0),
    });

    return await this.addressRepo.save(address);
  }

  /**
   * بروزرسانی آدرس (بدون نیاز به پروفایل)
   */
  async updateAddress(
    userId: number,
    addressId: number,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.addressRepo.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address)
      throw new NotFoundException('Address not found or not owned by user');

    // اگر میخواد این آدرس رو پیش‌فرض کنه
    if (dto.isDefault && !address.isDefault) {
      await this.addressRepo.update(
        { user: { id: userId } },
        { isDefault: false },
      );
    }

    Object.assign(address, dto);
    return await this.addressRepo.save(address);
  }

  /**
   * حذف آدرس (بدون نیاز به پروفایل)
   */
  async removeAddress(userId: number, addressId: number): Promise<void> {
    const address = await this.addressRepo.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address)
      throw new NotFoundException('Address not found or not owned by user');

    const wasDefault = address.isDefault;
    await this.addressRepo.remove(address);

    // اگر آدرس پیش‌فرض حذف شد، اولین آدرس رو پیش‌فرض کن
    if (wasDefault) {
      const firstAddress = await this.addressRepo.findOne({
        where: { user: { id: userId } },
        order: { id: 'ASC' },
      });
      if (firstAddress) {
        firstAddress.isDefault = true;
        await this.addressRepo.save(firstAddress);
      }
    }
  }

  /**
   * تنظیم آدرس پیش‌فرض (بدون نیاز به پروفایل)
   */
  async setDefaultAddress(userId: number, addressId: number): Promise<Address> {
    const address = await this.addressRepo.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address)
      throw new NotFoundException('Address not found or not owned by user');

    // همه آدرس‌ها رو غیرپیش‌فرض کن
    await this.addressRepo.update(
      { user: { id: userId } },
      { isDefault: false },
    );

    // این آدرس رو پیش‌فرض کن
    address.isDefault = true;
    return await this.addressRepo.save(address);
  }
}
