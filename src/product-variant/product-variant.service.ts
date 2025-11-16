import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductVariantValue } from '../entities/product-variant-value.entity';
import { Product } from '../entities/product.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductVariantValue)
    private readonly variantValueRepo: Repository<ProductVariantValue>,
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

    // ایجاد واریانت
    const variant = this.variantRepo.create({
      name: createDto.name,
      icon: createDto.icon,
      image: createDto.image,
      sku: createDto.sku,
      product,
    });

    const savedVariant = await this.variantRepo.save(variant);

    // ایجاد مقادیر واریانت
    if (createDto.values && createDto.values.length > 0) {
      const values = createDto.values.map((valueDto) =>
        this.variantValueRepo.create({
          name: valueDto.name,
          icon: valueDto.icon,
          image: valueDto.image,
          hexCode: valueDto.hexCode,
          variant: savedVariant,
          product,
        }),
      );
      await this.variantValueRepo.save(values);
    }

    return this.findOne(savedVariant.id);
  }

  /**
   * دریافت تمام واریانت‌ها
   */
  async findAll(): Promise<ProductVariant[]> {
    return await this.variantRepo.find({
      relations: ['product', 'values'],
      order: { id: 'ASC' },
    });
  }

  /**
   * دریافت واریانت‌های یک محصول
   */
  async findByProduct(productId: number): Promise<ProductVariant[]> {
    return await this.variantRepo.find({
      where: { product: { id: productId } },
      relations: ['values'],
      order: { id: 'ASC' },
    });
  }

  /**
   * دریافت یک واریانت
   */
  async findOne(id: number): Promise<ProductVariant> {
    const variant = await this.variantRepo.findOne({
      where: { id },
      relations: ['product', 'values'],
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
    if (updateDto.icon !== undefined) variant.icon = updateDto.icon;
    if (updateDto.image !== undefined) variant.image = updateDto.image;
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

    await this.variantRepo.save(variant);

    // بروزرسانی مقادیر واریانت
    if (updateDto.values !== undefined) {
      // حذف مقادیم قدیمی
      await this.variantValueRepo.delete({ variant: { id } });

      // اضافه کردن مقادیر جدید
      if (updateDto.values.length > 0) {
        const values = updateDto.values.map((valueDto) =>
          this.variantValueRepo.create({
            name: valueDto.name,
            icon: valueDto.icon,
            image: valueDto.image,
            hexCode: valueDto.hexCode,
            variant,
            product: variant.product,
          }),
        );
        await this.variantValueRepo.save(values);
      }
    }

    return this.findOne(id);
  }

  /**
   * حذف واریانت و تمام مقادیر آن
   */
  async remove(id: number): Promise<void> {
    const variant = await this.findOne(id);
    // CASCADE delete خودکار مقادیر را حذف خواهد کرد
    await this.variantRepo.remove(variant);
  }

  /**
   * حذف تمام واریانت‌های یک محصول
   */
  async removeByProduct(productId: number): Promise<void> {
    await this.variantRepo.delete({ product: { id: productId } });
  }
}
