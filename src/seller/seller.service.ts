import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller } from '../entities/seller.entity';
import { User } from '../entities/user.entity';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepo: Repository<Seller>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * ایجاد فروشنده جدید
   */
  async create(createDto: CreateSellerDto): Promise<Seller> {
    // بررسی وجود کاربر
    const user = await this.userRepo.findOne({
      where: { id: createDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `کاربر با شناسه ${createDto.userId} یافت نشد`,
      );
    }

    // بررسی اینکه کاربر قبلاً فروشنده نشده باشد
    const existingSeller = await this.sellerRepo.findOne({
      where: { user: { id: createDto.userId } },
    });

    if (existingSeller) {
      throw new ConflictException(
        'این کاربر قبلاً به عنوان فروشنده ثبت شده است',
      );
    }

    // ایجاد فروشنده جدید
    const seller = this.sellerRepo.create({
      user,
      businessName: createDto.businessName,
      registrationNumber: createDto.registrationNumber,
      nationalId: createDto.nationalId,
      phone: createDto.phone,
      logo: createDto.logo,
      cardNumber: createDto.cardNumber,
      accountNumber: createDto.accountNumber,
      shebaNumber: createDto.shebaNumber,
      address: createDto.address,
      description: createDto.description,
    });

    return await this.sellerRepo.save(seller);
  }

  /**
   * دریافت تمام فروشندگان
   */
  async findAll(includeInactive: boolean = false): Promise<Seller[]> {
    const query = this.sellerRepo
      .createQueryBuilder('seller')
      .leftJoinAndSelect('seller.user', 'user')
      .select([
        'seller',
        'user.id',
        'user.name',
        'user.email',
        'user.isActive',
      ]);

    if (!includeInactive) {
      query.where('seller.isActive = :isActive', { isActive: true });
    }

    query
      .orderBy('seller.rating', 'DESC')
      .addOrderBy('seller.totalSales', 'DESC');

    return await query.getMany();
  }

  /**
   * دریافت یک فروشنده با شناسه
   */
  async findOne(id: number): Promise<Seller> {
    const seller = await this.sellerRepo
      .createQueryBuilder('seller')
      .leftJoinAndSelect('seller.user', 'user')
      .select(['seller', 'user.id', 'user.name', 'user.email', 'user.isActive'])
      .where('seller.id = :id', { id })
      .getOne();

    if (!seller) {
      throw new NotFoundException(`فروشنده با شناسه ${id} یافت نشد`);
    }

    return seller;
  }

  /**
   * دریافت فروشنده بر اساس userId
   */
  async findByUserId(userId: number): Promise<Seller | null> {
    return await this.sellerRepo
      .createQueryBuilder('seller')
      .leftJoinAndSelect('seller.user', 'user')
      .select(['seller', 'user.id', 'user.name', 'user.email', 'user.isActive'])
      .where('user.id = :userId', { userId })
      .getOne();
  }

  /**
   * بروزرسانی اطلاعات فروشنده
   */
  async update(id: number, updateDto: UpdateSellerDto): Promise<Seller> {
    const seller = await this.findOne(id);

    // بروزرسانی فیلدها
    Object.assign(seller, updateDto);

    return await this.sellerRepo.save(seller);
  }

  /**
   * فعال/غیرفعال کردن فروشنده
   */
  async toggleActive(id: number): Promise<Seller> {
    const seller = await this.findOne(id);
    seller.isActive = !seller.isActive;
    return await this.sellerRepo.save(seller);
  }

  /**
   * بروزرسانی امتیاز فروشنده (معمولاً بعد از هر خرید)
   */
  async updateRating(id: number, newRating: number): Promise<Seller> {
    if (newRating < 0 || newRating > 5) {
      throw new BadRequestException('امتیاز باید بین 0 تا 5 باشد');
    }

    const seller = await this.findOne(id);
    seller.rating = newRating;
    return await this.sellerRepo.save(seller);
  }

  /**
   * افزایش تعداد فروش‌های فروشنده
   */
  async incrementSales(id: number, count: number = 1): Promise<Seller> {
    const seller = await this.findOne(id);
    seller.totalSales += count;
    return await this.sellerRepo.save(seller);
  }

  /**
   * حذف فروشنده (soft delete با غیرفعال کردن)
   */
  async remove(id: number): Promise<void> {
    const seller = await this.findOne(id);
    seller.isActive = false;
    await this.sellerRepo.save(seller);
  }

  /**
   * حذف کامل فروشنده (فقط برای ادمین و در شرایط خاص)
   */
  async hardDelete(id: number): Promise<void> {
    const seller = await this.findOne(id);
    await this.sellerRepo.remove(seller);
  }
}
