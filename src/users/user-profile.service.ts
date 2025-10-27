// user-profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from 'src/entities/user-profile.entity';
import { Address } from 'src/entities/address.entity';
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
   * دریافت تمام آدرس‌های کاربر
   */
  async getAddresses(userId: number): Promise<Address[]> {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
      relations: ['addresses'],
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile.addresses || [];
  }

  /**
   * دریافت آدرس پیش‌فرض کاربر
   */
  async getDefaultAddress(userId: number): Promise<Address | null> {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    return await this.addressRepo.findOne({
      where: { userProfile: { id: profile.id }, isDefault: true },
    });
  }

  /**
   * افزودن آدرس جدید
   */
  async addAddress(userId: number, dto: CreateAddressDto): Promise<Address> {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
      relations: ['addresses'],
    });
    if (!profile) throw new NotFoundException('Profile not found');

    // اگر این اولین آدرس هست یا کاربر خواسته پیش‌فرض باشه
    if (dto.isDefault || !profile.addresses || profile.addresses.length === 0) {
      // همه آدرس‌های قبلی رو غیرپیش‌فرض کن
      await this.addressRepo.update(
        { userProfile: { id: profile.id } },
        { isDefault: false },
      );
    }

    const address = this.addressRepo.create({
      ...dto,
      userProfile: profile,
      isDefault: dto.isDefault || profile.addresses.length === 0, // اولین آدرس همیشه پیش‌فرض
    });

    return await this.addressRepo.save(address);
  }

  /**
   * بروزرسانی آدرس
   */
  async updateAddress(
    userId: number,
    addressId: number,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const address = await this.addressRepo.findOne({
      where: { id: addressId, userProfile: { id: profile.id } },
    });
    if (!address)
      throw new NotFoundException('Address not found or not owned by user');

    // اگر میخواد این آدرس رو پیش‌فرض کنه
    if (dto.isDefault && !address.isDefault) {
      await this.addressRepo.update(
        { userProfile: { id: profile.id } },
        { isDefault: false },
      );
    }

    Object.assign(address, dto);
    return await this.addressRepo.save(address);
  }

  /**
   * حذف آدرس
   */
  async removeAddress(userId: number, addressId: number): Promise<void> {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
      relations: ['addresses'],
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const address = await this.addressRepo.findOne({
      where: { id: addressId, userProfile: { id: profile.id } },
    });
    if (!address)
      throw new NotFoundException('Address not found or not owned by user');

    const wasDefault = address.isDefault;
    await this.addressRepo.remove(address);

    // اگر آدرس پیش‌فرض حذف شد، اولین آدرس رو پیش‌فرض کن
    if (wasDefault && profile.addresses.length > 1) {
      const firstAddress = await this.addressRepo.findOne({
        where: { userProfile: { id: profile.id } },
        order: { id: 'ASC' },
      });
      if (firstAddress) {
        firstAddress.isDefault = true;
        await this.addressRepo.save(firstAddress);
      }
    }
  }

  /**
   * تنظیم آدرس پیش‌فرض
   */
  async setDefaultAddress(userId: number, addressId: number): Promise<Address> {
    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const address = await this.addressRepo.findOne({
      where: { id: addressId, userProfile: { id: profile.id } },
    });
    if (!address)
      throw new NotFoundException('Address not found or not owned by user');

    // همه آدرس‌ها رو غیرپیش‌فرض کن
    await this.addressRepo.update(
      { userProfile: { id: profile.id } },
      { isDefault: false },
    );

    // این آدرس رو پیش‌فرض کن
    address.isDefault = true;
    return await this.addressRepo.save(address);
  }
}
