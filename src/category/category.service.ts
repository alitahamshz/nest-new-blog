// src/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, TreeRepository } from 'typeorm';
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

  findParents() {
    return this.categoriesRepository.find({
      where: {
        parent: IsNull(),
      },
    });
  }

  // category.service.ts
  async findParentCategoriesWithPostCount() {
    const categories = await this.categoriesRepository
      .createQueryBuilder('category')
      .leftJoin('category.posts', 'post')
      .where('category.parent IS NULL')
      .loadRelationCountAndMap('category.postsCount', 'category.posts')
      .getMany();

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      en_name: cat.en_name,
      slug: cat.slug,
      postsCount: (cat as any).postsCount,
    }));
  }

  async findParentCategoriesWithPostCountRecursive() {
    return this.categoriesRepository
      .createQueryBuilder('parent')
      .leftJoin('parent.posts', 'post')
      .leftJoin('category_closure', 'closure', 'closure.descendant = parent.id')
      .select('parent.id', 'id')
      .addSelect('parent.name', 'name')
      .addSelect('parent.en_name', 'en_name')
      .addSelect('parent.slug', 'slug')
      .addSelect(
        `(SELECT COUNT(*) 
        FROM category AS c
        LEFT JOIN post AS p ON p.categoryId = c.id
        WHERE c.id = parent.id OR c.id IN (
          SELECT descendant 
          FROM category_closure 
          WHERE ancestor = parent.id
        )
      )`,
        'postsCount',
      )
      .where('parent.parent IS NULL')
      .getRawMany();
  }

  // async getPostCountForCategoryAndDescendants(
  //   categoryId: number,
  // ): Promise<{ categoryId: number; totalPosts: number }> {
  //   // مرحله ۱: دسته‌بندی اصلی را پیدا می‌کنیم
  //   const parentCategory = await this.categoriesRepository.findOneBy({ id: categoryId });

  //   if (!parentCategory) {
  //     throw new NotFoundException(`دسته بندی با ID ${categoryId} یافت نشد.`);
  //   }

  //   // مرحله ۲: با استفاده از متد findDescendants، خود دسته‌بندی و تمام زیرشاخه‌های آن را پیدا می‌کنیم
  //   // این متد یک آرایه flat (مسطح) از تمام فرزندان و نوه‌ها و ... برمی‌گرداند
  //   const categoriesTree = await this.categoriesRepository.findDescendants(parentCategory);

  //   // اگر هیچ دسته‌بندی‌ای پیدا نشد (که حداقل باید خود والد باشد)، صفر برمی‌گردانیم
  //   if (categoriesTree.length === 0) {
  //     return { categoryId, totalPosts: 0 };
  //   }

  //   // مرحله ۳: فقط ID های این دسته‌بندی‌ها را استخراج می‌کنیم
  //   const categoryIds = categoriesTree.map((category) => category.id);

  //   // مرحله ۴: تعداد پست‌هایی که categoryId آنها در لیست IDهای ما قرار دارد را می‌شماریم
  //   // استفاده از اپراتور In باعث می‌شود TypeORM یک کوئری `WHERE category.id IN (...)` بهینه ایجاد کند
  //   const totalPosts = await this.postRepository.count({
  //     where: {
  //       category: {
  //         id: In(categoryIds),
  //       },
  //     },
  //   });

  //   return {
  //     categoryId,
  //     totalPosts,
  //   };
  // }

  remove(id: number) {
    return this.categoriesRepository.delete(id);
  }
}
