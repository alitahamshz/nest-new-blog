import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoBanner } from './promo-banner.entity';
import { CreatePromoBannerDto } from './dto/create-promo-banner.dto';
import { UpdatePromoBannerDto } from './dto/update-promo-banner.dto';

@Injectable()
export class PromoBannersService {
  constructor(
    @InjectRepository(PromoBanner)
    private readonly repo: Repository<PromoBanner>,
  ) {}

  async create(dto: CreatePromoBannerDto): Promise<PromoBanner> {
    return await this.repo.save(this.repo.create(dto));
  }

  async findAll(): Promise<PromoBanner[]> {
    return await this.repo.find({ order: { order: 'ASC', createdAt: 'DESC' } });
  }

  async findActive(): Promise<PromoBanner[]> {
    return await this.repo.find({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PromoBanner> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`پرومو بنر با شناسه ${id} یافت نشد`);
    return item;
  }

  async update(id: number, dto: UpdatePromoBannerDto): Promise<PromoBanner> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return await this.repo.save(item);
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(await this.findOne(id));
  }
}
