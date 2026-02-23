import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannersRepository: Repository<Banner>,
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const banner = this.bannersRepository.create(createBannerDto);
    return await this.bannersRepository.save(banner);
  }

  async findAll(section?: string): Promise<Banner[]> {
    return await this.bannersRepository.find({
      where: section ? { section: section as any } : undefined,
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<Banner[]> {
    return await this.bannersRepository.find({
      where: { isActive: true, section: 'shop' as any },
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findByPosition(position: string): Promise<Banner | null> {
    return await this.bannersRepository.findOne({
      where: { position, isActive: true },
    });
  }

  async findOne(id: number): Promise<Banner> {
    const banner = await this.bannersRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`بنر با شناسه ${id} یافت نشد`);
    }
    return banner;
  }

  async update(id: number, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findOne(id);
    Object.assign(banner, updateBannerDto);
    return await this.bannersRepository.save(banner);
  }

  async remove(id: number): Promise<void> {
    const banner = await this.findOne(id);
    await this.bannersRepository.remove(banner);
  }
}
