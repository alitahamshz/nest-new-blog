// src/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: TreeRepository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const category = this.categoriesRepository.create({
      name: dto.name,
      slug: dto.slug,
    });

    if (dto.parentId) {
      const parent = await this.categoriesRepository.findOne({
        where: { id: Number(dto.parentId) },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
      category.parent = parent;
    }

    return this.categoriesRepository.save(category);
  }

  findAll() {
    return this.categoriesRepository.findTrees(); // کل درخت رو میده
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
