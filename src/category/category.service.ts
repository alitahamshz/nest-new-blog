// src/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Category)
    private categoriesTreeRepository: TreeRepository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const category = this.categoriesRepository.create({
      name: dto.name,
      en_name: dto.en_name,
      slug: dto.slug,
    });

    if (dto.parent_id) {
      const parent = await this.categoriesRepository.findOne({
        where: { id: Number(dto.parent_id) },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
      category.parent = parent;
    }

    return this.categoriesRepository.save(category);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // فیلدهای ساده رو آپدیت کن
    category.name = updateCategoryDto.name ?? category.name;
    category.en_name = updateCategoryDto.en_name ?? category.en_name;
    category.slug = updateCategoryDto.slug ?? category.slug;

    // اگر parentId داده شده بود، والد رو آپدیت کن
    if (updateCategoryDto.parent_id) {
      const parent = await this.categoriesRepository.findOne({
        where: { id: updateCategoryDto.parent_id },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      category.parent = parent;
    } else {
      // اگر خالی بود یعنی بدون والد بشه
      category.parent = null;
    }

    return this.categoriesRepository.save(category);
  }

  findAll() {
    return this.categoriesTreeRepository.findTrees(); // کل درخت رو میده
  }
  findAllFlat() {
    return this.categoriesRepository
      .createQueryBuilder('category')
      .leftJoin('category.parent', 'parent')
      .select([
        'category.id AS id',
        'category.name AS name',
        'category.en_name AS en_name',
        'parent.id AS parent_id',
      ])
      .orderBy('category.id', 'ASC')
      .getRawMany();
  }

  findOne(id: number) {
    return this.categoriesRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  remove(id: number) {
    return this.categoriesRepository.delete(id);
  }
}
