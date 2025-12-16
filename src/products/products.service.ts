import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductImage } from '../entities/product-image.entity';
import { ProductSpecification } from '../entities/product-specification.entity';
import { Tag } from '../entities/tag.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
    @InjectRepository(ProductSpecification)
    private readonly specificationRepo: Repository<ProductSpecification>,
  ) {}

  /**
   * ایجاد محصول جدید با تمام روابط
   */
  async create(createDto: CreateProductDto): Promise<Product> {
    // بررسی وجود category
    const category = await this.categoryRepo.findOne({
      where: { id: createDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `دسته‌بندی با شناسه ${createDto.categoryId} یافت نشد`,
      );
    }

    // تولید slug اگر وجود نداره
    const slug = createDto.slug || this.generateSlug(createDto.name);

    // بررسی یکتا بودن slug
    const existingProduct = await this.productRepo.findOne({
      where: { slug },
    });
    if (existingProduct) {
      throw new BadRequestException(`محصولی با slug "${slug}" قبلاً وجود دارد`);
    }

    // پردازش tags
    let tags: Tag[] = [];
    if (createDto.tagIds && createDto.tagIds.length > 0) {
      tags = await this.tagRepo.findBy({ id: In(createDto.tagIds) });
      if (tags.length !== createDto.tagIds.length) {
        throw new NotFoundException('برخی از تگ‌ها یافت نشدند');
      }
    }

    // ساخت محصول
    const product = this.productRepo.create({
      name: createDto.name,
      slug,
      description: createDto.description,
      metaDescription: createDto.metaDescription,
      sku: createDto.sku,
      mainImage: createDto.mainImage,
      hasVariant: createDto.hasVariant || false,
      category,
      tags,
    });

    const savedProduct = await this.productRepo.save(product);

    // اضافه کردن specifications
    if (createDto.specifications && createDto.specifications.length > 0) {
      const specifications = createDto.specifications.map((spec) =>
        this.specificationRepo.create({
          ...spec,
          product: savedProduct,
        }),
      );
      await this.specificationRepo.save(specifications);
    }

    // اضافه کردن gallery images
    if (createDto.galleryUrls && createDto.galleryUrls.length > 0) {
      const images = createDto.galleryUrls.map((url, index) =>
        this.imageRepo.create({
          url,
          isMain: index === 0,
          product: savedProduct,
        }),
      );
      await this.imageRepo.save(images);
    }

    return this.findOne(savedProduct.id);
  }

  /**
   * دریافت تمام ID های دسته‌های فرزند به صورت recursive
   */
  private async getAllDescendantCategoryIds(
    categoryId: number,
  ): Promise<number[]> {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: ['children'],
    });

    if (!category) {
      return [categoryId];
    }

    let allIds = [categoryId];

    // برای هر فرزند، تمام نوادگان را به صورت recursive دریافت کن
    if (category.children && category.children.length > 0) {
      for (const child of category.children) {
        const descendantIds = await this.getAllDescendantCategoryIds(child.id);
        allIds = [...allIds, ...descendantIds];
      }
    }

    return allIds;
  }

  /**
   * دریافت لیست محصولات با صفحه‌بندی و فیلتر
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    categoryId?: number,
    isActive?: boolean,
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.productRepo.createQueryBuilder('product');

    // روابط
    query.leftJoinAndSelect('product.category', 'category');
    query.leftJoinAndSelect('product.tags', 'tags');
    query.leftJoinAndSelect('product.specifications', 'specifications');
    query.leftJoinAndSelect('product.gallery', 'gallery');
    query.leftJoinAndSelect('product.variants', 'variants');
    query.leftJoinAndSelect('variants.values', 'variantValues');
    query.leftJoinAndSelect('product.offers', 'offers');
    query.leftJoinAndSelect('offers.seller', 'seller');
    query.leftJoinAndSelect('offers.variantValues', 'offerVariantValues');

    // جستجو در نام و کد محصول
    if (search) {
      query.where(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.sku) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // فیلتر بر اساس دسته (شامل تمام دسته‌های فرزند)
    if (categoryId) {
      const categoryIds = await this.getAllDescendantCategoryIds(categoryId);
      query.andWhere('product.categoryId IN (:...categoryIds)', {
        categoryIds,
      });
    }

    // فیلتر بر اساس وضعیت
    if (isActive !== undefined) {
      query.andWhere('product.isActive = :isActive', { isActive });
    }

    // ترتیب و صفحه‌بندی
    query.orderBy('product.createdAt', 'DESC');
    query.skip((page - 1) * limit);
    query.take(limit);

    const [products, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * دریافت یک محصول با تمام روابط
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: [
        'category',
        'tags',
        'specifications',
        'gallery',
        'variants',
        'variants.values',
        'variantValues',
        'offers',
        'offers.seller',
        'offers.variantValues',
      ],
    });

    if (!product) {
      throw new NotFoundException(`محصول با شناسه ${id} یافت نشد`);
    }

    return product;
  }

  /**
   * پیدا کردن محصول با slug
   */
  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { slug },
      relations: [
        'category',
        'tags',
        'specifications',
        'gallery',
        'variants',
        'variants.values',
        'variantValues',
        'offers',
      ],
    });

    if (!product) {
      throw new NotFoundException(`محصول با slug "${slug}" یافت نشد`);
    }

    return product;
  }

  /**
   * بروزرسانی محصول
   */
  async update(id: number, updateDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // بروزرسانی فیلدهای ساده
    if (updateDto.name !== undefined) product.name = updateDto.name;
    if (updateDto.slug !== undefined) {
      // بررسی یکتا بودن slug جدید
      const existing = await this.productRepo.findOne({
        where: { slug: updateDto.slug },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `محصولی با slug "${updateDto.slug}" قبلاً وجود دارد`,
        );
      }
      product.slug = updateDto.slug;
    }
    if (updateDto.description !== undefined)
      product.description = updateDto.description;
    if (updateDto.metaDescription !== undefined)
      product.metaDescription = updateDto.metaDescription;
    if (updateDto.sku !== undefined) product.sku = updateDto.sku;
    if (updateDto.mainImage !== undefined)
      product.mainImage = updateDto.mainImage;
    if (updateDto.hasVariant !== undefined)
      product.hasVariant = updateDto.hasVariant;
    if (updateDto.isActive !== undefined) product.isActive = updateDto.isActive;

    // بروزرسانی category
    if (updateDto.categoryId !== undefined) {
      const category = await this.categoryRepo.findOne({
        where: { id: updateDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `دسته‌بندی با شناسه ${updateDto.categoryId} یافت نشد`,
        );
      }
      product.category = category;
    }

    // بروزرسانی tags
    if (updateDto.tagIds !== undefined) {
      if (updateDto.tagIds.length > 0) {
        const tags = await this.tagRepo.findBy({ id: In(updateDto.tagIds) });
        if (tags.length !== updateDto.tagIds.length) {
          throw new NotFoundException('برخی از تگ‌ها یافت نشدند');
        }
        product.tags = tags;
      } else {
        product.tags = [];
      }
    }

    await this.productRepo.save(product);

    // بروزرسانی specifications
    if (updateDto.specifications !== undefined) {
      // حذف specifications قبلی
      await this.specificationRepo.delete({ product: { id } });

      // اضافه کردن جدید
      if (updateDto.specifications.length > 0) {
        const specifications = updateDto.specifications.map((spec) =>
          this.specificationRepo.create({
            ...spec,
            product,
          }),
        );
        await this.specificationRepo.save(specifications);
      }
    }

    // بروزرسانی gallery
    if (updateDto.galleryUrls !== undefined) {
      // حذف تصاویر قبلی
      await this.imageRepo.delete({ product: { id } });

      // اضافه کردن جدید
      if (updateDto.galleryUrls.length > 0) {
        const images = updateDto.galleryUrls.map((url, index) =>
          this.imageRepo.create({
            url,
            isMain: index === 0,
            product,
          }),
        );
        await this.imageRepo.save(images);
      }
    }

    return this.findOne(id);
  }

  /**
   * حذف محصول
   */
  async remove(id: number): Promise<{ message: string; success: boolean }> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    return {
      message: `محصول با شناسه ${id} با موفقیت حذف شد`,
      success: true,
    };
  }

  /**
   * غیرفعال کردن محصول (soft delete)
   */
  async deactivate(id: number): Promise<Product> {
    const product = await this.findOne(id);
    product.isActive = false;
    return await this.productRepo.save(product);
  }

  /**
   * فعال کردن محصول
   */
  async activate(id: number): Promise<Product> {
    const product = await this.findOne(id);
    product.isActive = true;
    return await this.productRepo.save(product);
  }

  /**
   * دریافت محصولات یک دسته‌بندی (شامل تمام دسته‌های فرزند)
   */
  async findByCategory(categoryId: number): Promise<Product[]> {
    const categoryIds = await this.getAllDescendantCategoryIds(categoryId);
    return await this.productRepo.find({
      where: {
        category: { id: In(categoryIds) },
        isActive: true,
      },
      relations: ['category', 'tags', 'gallery', 'variants', 'variants.values'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * دریافت محصولات با تگ خاص
   */
  async findByTag(tagId: number): Promise<Product[]> {
    return await this.productRepo.find({
      where: { tags: { id: tagId }, isActive: true },
      relations: ['category', 'tags', 'gallery', 'variants', 'variants.values'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * تولید slug از نام محصول
   */
  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      locale: 'fa',
    });
  }
}
