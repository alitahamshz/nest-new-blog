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
import { SellerOffer } from '../entities/seller-offer.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto, SortBy } from './dto/filter-products.dto';
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
    @InjectRepository(SellerOffer)
    private readonly offerRepo: Repository<SellerOffer>,
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
   * دریافت لیست محصولات با فیلتر‌های پیشرفته
   */
  async findAllWithFilters(filterDto: FilterProductsDto): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    minPrice?: number;
    maxPrice?: number;
  }> {
    const query = this.productRepo.createQueryBuilder('product');

    // روابط ضروری
    query
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.specifications', 'specifications')
      .leftJoinAndSelect('product.gallery', 'gallery')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.values', 'variantValues')
      .innerJoinAndSelect('product.offers', 'offers')
      .innerJoinAndSelect('offers.seller', 'seller');

    // فیلتر: جستجو در نام و sku
    if (filterDto.search) {
      query.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: `%${filterDto.search}%` },
      );
    }

    if (filterDto.sku) {
      query.andWhere('LOWER(product.sku) LIKE LOWER(:sku)', {
        sku: `%${filterDto.sku}%`,
      });
    }

    // فیلتر: دسته‌بندی (شامل تمام دسته‌های فرزند)
    if (filterDto.categoryId) {
      const categoryIds = await this.getAllDescendantCategoryIds(
        filterDto.categoryId,
      );
      query.andWhere('product.categoryId IN (:...categoryIds)', {
        categoryIds,
      });
    }

    // فیلتر: تگ‌ها (چندتایی)
    if (filterDto.tagIds) {
      const tagIds = filterDto.tagIds
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));

      if (tagIds.length > 0) {
        query.andWhere('tags.id IN (:...tagIds)', { tagIds });
      }
    }

    // فیلتر: وضعیت محصول
    if (filterDto.isActive !== undefined) {
      query.andWhere('product.isActive = :isActive', {
        isActive: filterDto.isActive,
      });
    }

    // اگر فیلتر قیمت، موجودی، تخفیف یا فروشنده درخواست شده است
    // باید offers را معمولاً join کنیم
    const hasOfferFilters =
      filterDto.minPrice !== undefined ||
      filterDto.maxPrice !== undefined ||
      filterDto.inStockOnly ||
      filterDto.discountedOnly ||
      filterDto.sellerIds ||
      filterDto.hasWarrantyOnly;

    if (hasOfferFilters) {
      // فیلتر: قیمت (بر اساس discountPrice اگر وجود داشت، وگرنه price)
      if (
        filterDto.minPrice !== undefined ||
        filterDto.maxPrice !== undefined
      ) {
        const priceQuery =
          '(CASE WHEN offers.discountPrice > 0 THEN offers.discountPrice ELSE offers.price END)';
        if (
          filterDto.minPrice !== undefined &&
          filterDto.maxPrice !== undefined
        ) {
          query.andWhere(`${priceQuery} BETWEEN :minPrice AND :maxPrice`, {
            minPrice: filterDto.minPrice,
            maxPrice: filterDto.maxPrice,
          });
        } else if (filterDto.minPrice !== undefined) {
          query.andWhere(`${priceQuery} >= :minPrice`, {
            minPrice: filterDto.minPrice,
          });
        } else if (filterDto.maxPrice !== undefined) {
          query.andWhere(`${priceQuery} <= :maxPrice`, {
            maxPrice: filterDto.maxPrice,
          });
        }
      }

      // فیلتر: موجودی
      if (filterDto.inStockOnly) {
        query.andWhere('offers.stock > :zeroStock', { zeroStock: 0 });
      }

      // فیلتر: تخفیف
      if (filterDto.discountedOnly) {
        query.andWhere('offers.discountPercent > :zeroDiscount', {
          zeroDiscount: 0,
        });
      }

      // فیلتر: فروشنده (چندتایی)
      if (filterDto.sellerIds) {
        const sellerIds = filterDto.sellerIds
          .split(',')
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id));

        if (sellerIds.length > 0) {
          query.andWhere('offers.sellerId IN (:...sellerIds)', { sellerIds });
        }
      }

      // فیلتر: گارانتی
      if (filterDto.hasWarrantyOnly) {
        query.andWhere('offers.hasWarranty = :hasWarranty', {
          hasWarranty: true,
        });
      }
    }

    // شمارش کل نتایج قبل از صفحه‌بندی (برای grouping)
    // اگر offers استفاده شده، باید distinct استفاده کنیم
    if (hasOfferFilters) {
      query.distinct(true);
    }

    const originQuery = query.clone();

    // ترتیب نتایج
    switch (filterDto.sortBy) {
      case SortBy.PRICE_LOW:
        // کارنترین قیمت
        query.orderBy(
          'CASE WHEN offers.discountPrice > 0 THEN offers.discountPrice ELSE offers.price END',
          'ASC',
        );
        query.addOrderBy('product.createdAt', 'DESC');
        break;

      case SortBy.PRICE_HIGH:
        // گران‌ترین قیمت
        query.orderBy(
          'CASE WHEN offers.discountPrice > 0 THEN offers.discountPrice ELSE offers.price END',
          'DESC',
        );
        query.addOrderBy('product.createdAt', 'DESC');
        break;

      case SortBy.DISCOUNT:
        // بیشترین تخفیف
        query.orderBy('offers.discountPercent', 'DESC');
        query.addOrderBy('product.createdAt', 'DESC');
        break;

      case SortBy.POPULAR:
        // پرفروش‌ترین (بر اساس تعداد offers/sellers)
        query.orderBy('COUNT(offers.id)', 'DESC');
        query.addOrderBy('product.createdAt', 'DESC');
        break;

      case SortBy.RATING:
        // بهترین امتیاز (اگر rating system داشتیم - برای حال کماندو‌های تگ استفاده می‌کنیم)
        query.orderBy('product.createdAt', 'DESC');
        break;

      case SortBy.NEWEST:
      default:
        query.orderBy('product.createdAt', 'DESC');
        break;
    }

    // صفحه‌بندی
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [products, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    // محاسبه بازه قیمت برای اطلاعات بیشتر
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (hasOfferFilters || !filterDto.minPrice) {
      const priceQuery = originQuery
        .select(
          'MIN(CASE WHEN offers.discountPrice > 0 THEN offers.discountPrice ELSE offers.price END)',
          'minPrice',
        )
        .addSelect(
          'MAX(CASE WHEN offers.discountPrice > 0 THEN offers.discountPrice ELSE offers.price END)',
          'maxPrice',
        );

      const priceResult = (await priceQuery.getRawOne()) as Record<
        string,
        string | undefined
      >;
      minPrice = priceResult?.minPrice
        ? parseFloat(priceResult.minPrice)
        : undefined;
      maxPrice = priceResult?.maxPrice
        ? parseFloat(priceResult.maxPrice)
        : undefined;
    }

    return {
      data: products,
      total,
      page,
      limit,
      totalPages,
      minPrice,
      maxPrice,
    };
  }

  /**
   * دریافت تمام محصولات (بدون فیلتر offers) - برای Dashboard فروشندگان
   */
  async findAllProducts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    categoryId?: number,
    isActive?: boolean,
    sortBy?: string,
  ): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.productRepo.createQueryBuilder('product');

    // روابط
    query
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.specifications', 'specifications')
      .leftJoinAndSelect('product.gallery', 'gallery')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.values', 'variantValues')
      .leftJoinAndSelect('product.offers', 'offers')
      .leftJoinAndSelect('offers.seller', 'seller');

    // فیلتر: جستجو
    if (search) {
      query.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // فیلتر: دسته‌بندی
    if (categoryId) {
      const categoryIds = await this.getAllDescendantCategoryIds(categoryId);
      query.andWhere('product.categoryId IN (:...categoryIds)', {
        categoryIds,
      });
    }

    // فیلتر: وضعیت
    if (isActive !== undefined) {
      query.andWhere('product.isActive = :isActive', { isActive });
    }

    // ترتیب نتایج
    if (sortBy === 'price_low') {
      query.orderBy('MIN(offers.price)', 'ASC');
    } else if (sortBy === 'price_high') {
      query.orderBy('MAX(offers.price)', 'DESC');
    } else if (sortBy === 'popular') {
      query.orderBy('COUNT(offers.id)', 'DESC');
    } else {
      query.orderBy('product.createdAt', 'DESC');
    }

    // صفحه‌بندی
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

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
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo
      .createQueryBuilder('product')
      .where('product.slug = :slug', { slug })
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.specifications', 'specifications')
      .leftJoinAndSelect('product.gallery', 'gallery')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.values', 'variantValues')
      .leftJoinAndSelect('product.variantValues', 'productVariantValues')
      .leftJoinAndSelect('product.offers', 'offers')
      .leftJoinAndSelect('offers.seller', 'seller', 'TRUE')
      .leftJoinAndSelect('offers.variantValues', 'offerVariantValues')
      .addSelect('seller.businessName')
      .getOne();

    if (!product) {
      throw new NotFoundException(`محصول با slug "${slug}" یافت نشد`);
    }

    // حذف فیلدهای غیر ضروری از seller
    if (product.offers && product.offers.length > 0) {
      const productAny = product as any;
      productAny.offers = product.offers.map((offer) => {
        const { businessName } = offer.seller;
        return {
          ...offer,
          seller: { businessName } as any,
          variantValues: offer.variantValues || [],
        };
      });
    }

    return product;
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

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
    return await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.gallery', 'gallery')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.values', 'variantValues')
      .innerJoinAndSelect('product.offers', 'offers')
      .innerJoinAndSelect('offers.seller', 'seller')
      .where('product.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.createdAt', 'DESC')
      .getMany();
  }

  /**
   * دریافت محصولات با تگ خاص
   */
  async findByTag(tagId: number): Promise<Product[]> {
    return await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.gallery', 'gallery')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.values', 'variantValues')
      .innerJoinAndSelect('product.offers', 'offers')
      .innerJoinAndSelect('offers.seller', 'seller')
      .where('tags.id = :tagId', { tagId })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.createdAt', 'DESC')
      .getMany();
  }

  /**
   * دریافت مسیر کامل دسته‌بندی از ریشه تا فرزند
   */
  async getCategoryPath(categoryId: number): Promise<any[]> {
    const path: any[] = [];
    let currentCategory = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: ['parent'],
    });

    while (currentCategory) {
      path.unshift({
        id: currentCategory.id,
        name: currentCategory.name,
        slug: currentCategory.slug,
        icon: currentCategory.icon || null,
      });
      if (currentCategory.parent) {
        currentCategory = await this.categoryRepo.findOne({
          where: { id: currentCategory.parent.id },
          relations: ['parent'],
        });
      } else {
        currentCategory = null;
      }
    }

    return path;
  }

  /**
   * جستجوی محصول بر اساس نام
   * فقط محصولاتی را برمی‌گرداند که حداقل یک آفر فروشنده دارند
   */
  async searchProducts(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // جستجو تنها بر اساس نام محصول
    const [products, total] = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.gallery', 'gallery')
      .innerJoinAndSelect('product.offers', 'offers')
      .innerJoinAndSelect('offers.seller', 'seller')
      .where('LOWER(product.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.createdAt', 'DESC')
      .distinct(true)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // تحویل نتایج با مسیر کامل دسته‌بندی
    const resultsWithCategoryPath = await Promise.all(
      products.map(async (product) => {
        const categoryPath = await this.getCategoryPath(product.category.id);

        // محاسبه حداقل و حداکثر قیمت از آفرها
        const prices = product.offers.map((offer) =>
          offer.discountPrice && offer.discountPrice > 0
            ? offer.discountPrice
            : offer.price,
        );

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          mainImage: product.mainImage,
          description: product.description,
          sku: product.sku,
          categoryPath,
          offerCount: product.offers.length,
          minPrice: prices.length > 0 ? Math.min(...prices) : undefined,
          maxPrice: prices.length > 0 ? Math.max(...prices) : undefined,
        };
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: resultsWithCategoryPath,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * جستجوی دسته‌بندی بر اساس نام
   */
  async searchCategories(query: string) {
    const categories = await this.categoryRepo
      .createQueryBuilder('category')
      .where('LOWER(category.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .orderBy('category.name', 'ASC')
      .getMany();

    return categories;
  }

  /**
   * دریافت تعداد محصولات در یک دسته (شامل تمام فرزندان آن)
   */
  async getProductCountInCategory(categoryId: number): Promise<number> {
    const categoryIds = await this.getAllDescendantCategoryIds(categoryId);
    const count = await this.productRepo.count({
      where: {
        category: {
          id: In(categoryIds),
        },
        isActive: true,
      },
    });
    return count;
  }

  /**
   * جستجوی ترکیبی محصول و دسته‌بندی
   * صفحه‌بندی فقط برای محصولات است
   * دسته‌بندی‌ها بدون صفحه‌بندی برگردانده می‌شوند
   */
  async searchCombined(query: string, page: number = 1, limit: number = 20) {
    // جستجو در محصولات (با صفحه‌بندی)
    const productsResult = await this.searchProducts(query, page, limit);

    // جستجو در دسته‌بندی‌ها (بدون صفحه‌بندی - همه نتایج)
    const searchedCategories = await this.searchCategories(query);

    // افزودن مسیر کامل برای هر دسته و تعداد محصولات
    const categoriesWithPath = await Promise.all(
      searchedCategories.map(async (category) => {
        const categoryPath = await this.getCategoryPath(category.id);
        const productCount = await this.getProductCountInCategory(category.id);

        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.icon || null,
          categoryPath,
          productCount,
        };
      }),
    );

    return {
      products: {
        data: productsResult.data,
        total: productsResult.total,
        page: productsResult.page,
        limit: productsResult.limit,
      },
      categories: {
        data: categoriesWithPath,
        total: categoriesWithPath.length,
      },
    };
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
