import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategorySpecTemplate } from '../entities/category-spec-template.entity';
import { CreateCategorySpecTemplateDto } from './dto/create-category-spec-template.dto';
import { UpdateCategorySpecTemplateDto } from './dto/update-category-spec-template.dto';

@Injectable()
export class CategorySpecTemplateService {
  constructor(
    @InjectRepository(CategorySpecTemplate)
    private readonly repo: Repository<CategorySpecTemplate>,
  ) {}

  async create(dto: CreateCategorySpecTemplateDto): Promise<CategorySpecTemplate> {
    // key باید در یک دسته یکتا باشه
    const existing = await this.repo.findOne({
      where: { categoryId: dto.categoryId, key: dto.key },
    });
    if (existing) {
      throw new ConflictException(
        `ویژگی با کلید "${dto.key}" برای این دسته‌بندی وجود دارد`,
      );
    }

    const template = this.repo.create(dto);
    return this.repo.save(template);
  }

  // گرفتن همه قالب‌های یک دسته‌بندی
  async findByCategory(categoryId: number, filterableOnly = false): Promise<CategorySpecTemplate[]> {
    const where: { categoryId: number; filterable?: boolean } = { categoryId };
    if (filterableOnly) where.filterable = true;

    return this.repo.find({
      where,
      order: { displayOrder: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<CategorySpecTemplate> {
    const template = await this.repo.findOne({ where: { id } });
    if (!template) throw new NotFoundException(`قالب ویژگی ${id} یافت نشد`);
    return template;
  }

  async update(id: number, dto: UpdateCategorySpecTemplateDto): Promise<CategorySpecTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, dto);
    return this.repo.save(template);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'قالب ویژگی حذف شد' };
  }
}
