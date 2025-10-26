/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, TreeRepository } from 'typeorm';
import { ProductCategory } from '../entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
    @InjectRepository(ProductCategory)
    private readonly categoryTreeRepo: TreeRepository<ProductCategory>,
  ) {}

  /**
   * ایجاد دسته‌بندی جدید
   */
  async create(dto: CreateProductCategoryDto): Promise<ProductCategory> {
    const category = this.categoryRepo.create({
      name: dto.name,
      slug: dto.slug,
      icon: dto.icon,
    });

    // اگر parent_id داده شده، والد رو پیدا کن و متصل کن
    if (dto.parent_id) {
      const parent = await this.categoryRepo.findOne({
        where: { id: dto.parent_id },
      });
      if (!parent) {
        throw new NotFoundException(
          `دسته‌بندی والد با شناسه ${dto.parent_id} یافت نشد`,
        );
      }
      category.parent = parent;
    }

    return await this.categoryRepo.save(category);
  }

  /**
   * بروزرسانی دسته‌بندی
   */
  async update(
    id: number,
    updateDto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`دسته‌بندی با شناسه ${id} یافت نشد`);
    }

    // آپدیت فیلدهای ساده
    if (updateDto.name !== undefined) category.name = updateDto.name;
    if (updateDto.slug !== undefined) category.slug = updateDto.slug;
    if (updateDto.icon !== undefined) category.icon = updateDto.icon;

    // آپدیت والد
    if (updateDto.parent_id !== undefined) {
      if (updateDto.parent_id === null) {
        category.parent = null;
      } else {
        const parent = await this.categoryRepo.findOne({
          where: { id: updateDto.parent_id },
        });
        if (!parent) {
          throw new NotFoundException(
            `دسته‌بندی والد با شناسه ${updateDto.parent_id} یافت نشد`,
          );
        }
        category.parent = parent;
      }
    }

    return await this.categoryRepo.save(category);
  }

  /**
   * دریافت تمام دسته‌بندی‌ها به صورت درختی (Tree)
   */
  async findAll(): Promise<ProductCategory[]> {
    return await this.categoryTreeRepo.findTrees();
  }

  /**
   * دریافت تمام دسته‌بندی‌ها به صورت لیست مسطح (Flat)
   */
  async findAllFlat(): Promise<any[]> {
    return await this.categoryRepo
      .createQueryBuilder('category')
      .leftJoin('category.parent', 'parent')
      .select([
        'category.id AS id',
        'category.name AS name',
        'category.slug AS slug',
        'category.icon AS icon',
        'parent.id AS parent_id',
        'parent.name AS parent_name',
      ])
      .orderBy('category.id', 'ASC')
      .getRawMany();
  }

  /**
   * دریافت یک دسته‌بندی با روابط
   */
  async findOne(id: number): Promise<ProductCategory> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['parent', 'children', 'products'],
    });

    if (!category) {
      throw new NotFoundException(`دسته‌بندی با شناسه ${id} یافت نشد`);
    }

    return category;
  }

  /**
   * پیدا کردن دسته‌بندی با slug
   */
  async findBySlug(slug: string): Promise<ProductCategory> {
    const category = await this.categoryRepo.findOne({
      where: { slug },
      relations: ['parent', 'children', 'products'],
    });

    if (!category) {
      throw new NotFoundException(`دسته‌بندی با slug "${slug}" یافت نشد`);
    }

    return category;
  }

  /**
   * دریافت فقط دسته‌بندی‌های والد (بدون parent)
   */
  async findParents(): Promise<ProductCategory[]> {
    return await this.categoryRepo.find({
      where: { parent: IsNull() },
      relations: ['children'],
    });
  }

  /**
   * دریافت دسته‌بندی‌های والد با تعداد محصولات
   */
  async findParentCategoriesWithProductCount(): Promise<
    {
      id: number;
      name: string;
      slug: string;
      icon: string;
      productsCount: number;
    }[]
  > {
    const categories = await this.categoryRepo
      .createQueryBuilder('category')
      .leftJoin('category.children', 'child')
      .leftJoin('child.children', 'grandchild')
      .leftJoin('category.products', 'product')
      .leftJoin('child.products', 'childProduct')
      .leftJoin('grandchild.products', 'grandchildProduct')
      .where('category.parent IS NULL')
      .select('category.id', 'id')
      .addSelect('category.name', 'name')
      .addSelect('category.slug', 'slug')
      .addSelect('category.icon', 'icon')
      .addSelect(
        'COUNT(DISTINCT product.id) + COUNT(DISTINCT childProduct.id) + COUNT(DISTINCT grandchildProduct.id)',
        'productsCount',
      )
      .groupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('category.slug')
      .addGroupBy('category.icon')
      .getRawMany();

    return categories.map((row: any) => ({
      id: Number(row?.id || 0),
      name: String(row?.name || ''),
      slug: String(row?.slug || ''),
      icon: String(row?.icon || ''),
      productsCount: Number(row?.productsCount || 0),
    }));
  }

  /**
   * دریافت مسیر کامل دسته‌بندی (breadcrumb)
   */
  async findCategoryRoute(slug: string): Promise<ProductCategory> {
    const category = await this.categoryRepo.findOne({
      where: { slug },
      relations: ['parent', 'parent.parent', 'parent.parent.parent'],
    });

    if (!category) {
      throw new NotFoundException(`دسته‌بندی با slug "${slug}" یافت نشد`);
    }

    return category;
  }

  /**
   * دریافت فرزندان یک دسته‌بندی
   */
  async findChildren(id: number): Promise<ProductCategory[]> {
    const parent = await this.categoryRepo.findOne({ where: { id } });
    if (!parent) {
      throw new NotFoundException(`دسته‌بندی با شناسه ${id} یافت نشد`);
    }

    return await this.categoryTreeRepo.findDescendants(parent);
  }

  /**
   * حذف دسته‌بندی
   */
  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    // بررسی اینکه آیا دسته‌بندی فرزند دارد یا نه
    if (category.children && category.children.length > 0) {
      throw new NotFoundException(
        'نمی‌توانید دسته‌بندی‌ای را که دارای زیرمجموعه است حذف کنید',
      );
    }

    // بررسی اینکه آیا دسته‌بندی محصول دارد یا نه
    if (category.products && category.products.length > 0) {
      throw new NotFoundException(
        'نمی‌توانید دسته‌بندی‌ای را که دارای محصول است حذف کنید',
      );
    }

    await this.categoryRepo.delete(id);
  }
}
