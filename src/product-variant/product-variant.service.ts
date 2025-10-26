import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../entities/product-variant.entity';
import { Product } from '../entities/product.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  /**
   * ایجاد واریانت جدید برای محصول
   */
  async create(createDto: CreateProductVariantDto): Promise<ProductVariant> {
    // بررسی وجود محصول
    const product = await this.productRepo.findOne({
      where: { id: createDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `محصول با شناسه ${createDto.productId} یافت نشد`,
      );
    }

    // بررسی اینکه محصول باید hasVariant = true باشه
    if (!product.hasVariant) {
      throw new NotFoundException(
        'این محصول اجازه داشتن واریانت ندارد. ابتدا hasVariant را فعال کنید',
      );
    }

    const variant = this.variantRepo.create({
      name: createDto.name,
      value: createDto.value,
      sku: createDto.sku,
      product,
    });

    return await this.variantRepo.save(variant);
  }

  /**
   * ایجاد چندین واریانت یکجا
   */
  async createMany(
    productId: number,
    createDtos: CreateProductVariantDto[],
  ): Promise<ProductVariant[]> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`محصول با شناسه ${productId} یافت نشد`);
    }

    if (!product.hasVariant) {
      throw new NotFoundException('این محصول اجازه داشتن واریانت ندارد');
    }

    const variants = createDtos.map((dto) =>
      this.variantRepo.create({
        name: dto.name,
        value: dto.value,
        sku: dto.sku,
        product,
      }),
    );

    return await this.variantRepo.save(variants);
  }

  /**
   * دریافت تمام واریانت‌ها
   */
  async findAll(): Promise<ProductVariant[]> {
    return await this.variantRepo.find({
      relations: ['product'],
      order: { id: 'ASC' },
    });
  }

  /**
   * دریافت واریانت‌های یک محصول
   */
  async findByProduct(productId: number): Promise<ProductVariant[]> {
    return await this.variantRepo.find({
      where: { product: { id: productId } },
      order: { id: 'ASC' },
    });
  }

  /**
   * دریافت یک واریانت
   */
  async findOne(id: number): Promise<ProductVariant> {
    const variant = await this.variantRepo.findOne({
      where: { id },
      relations: ['product', 'offers'],
    });

    if (!variant) {
      throw new NotFoundException(`واریانت با شناسه ${id} یافت نشد`);
    }

    return variant;
  }

  /**
   * بروزرسانی واریانت
   */
  async update(
    id: number,
    updateDto: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    const variant = await this.findOne(id);

    if (updateDto.name !== undefined) variant.name = updateDto.name;
    if (updateDto.value !== undefined) variant.value = updateDto.value;
    if (updateDto.sku !== undefined) variant.sku = updateDto.sku;

    // اگر productId تغییر کرده
    if (updateDto.productId !== undefined) {
      const product = await this.productRepo.findOne({
        where: { id: updateDto.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `محصول با شناسه ${updateDto.productId} یافت نشد`,
        );
      }

      variant.product = product;
    }

    return await this.variantRepo.save(variant);
  }

  /**
   * حذف واریانت
   */
  async remove(id: number): Promise<void> {
    const variant = await this.findOne(id);

    // بررسی اینکه آیا واریانت دارای آفر است
    if (variant.offers && variant.offers.length > 0) {
      throw new NotFoundException(
        'نمی‌توانید واریانتی را که دارای آفر فروشنده است حذف کنید',
      );
    }

    await this.variantRepo.remove(variant);
  }

  /**
   * حذف تمام واریانت‌های یک محصول
   */
  async removeByProduct(productId: number): Promise<void> {
    await this.variantRepo.delete({ product: { id: productId } });
  }
}
