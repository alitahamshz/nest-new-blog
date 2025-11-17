import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ProductVariantValue } from '../entities/product-variant-value.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { Product } from '../entities/product.entity';
import { CreateProductVariantValueDto } from './dto/create-product-variant-value.dto';
import { UpdateProductVariantValueDto } from './dto/update-product-variant-value.dto';

@Injectable()
export class ProductVariantValueService {
  constructor(
    @InjectRepository(ProductVariantValue)
    private readonly valueRepo: Repository<ProductVariantValue>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  /**
   * ایجاد مقدار جدید برای واریانت
   */
  async create(
    createDto: CreateProductVariantValueDto,
  ): Promise<ProductVariantValue> {
    // بررسی وجود واریانت
    const variant = await this.variantRepo.findOne({
      where: { id: createDto.variantId },
      relations: ['product'],
    });

    if (!variant) {
      throw new NotFoundException(
        `واریانت با شناسه ${createDto.variantId} یافت نشد`,
      );
    }

    // بررسی یکتایی نام در این واریانت
    const existing = await this.valueRepo.findOne({
      where: {
        variant: { id: createDto.variantId },
        name: createDto.name,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `مقدار "${createDto.name}" برای این واریانت قبلاً وجود دارد`,
      );
    }

    const value = this.valueRepo.create({
      name: createDto.name,
      icon: createDto.icon,
      image: createDto.image,
      hexCode: createDto.hexCode,
      variant,
      product: variant.product,
    });

    return await this.valueRepo.save(value);
  }

  /**
   * دریافت تمام مقادیر
   */
  async findAll(): Promise<ProductVariantValue[]> {
    return await this.valueRepo.find({
      relations: ['variant', 'product'],
      order: { id: 'ASC' },
    });
  }

  /**
   * دریافت مقادیر یک واریانت
   */
  async findByVariant(variantId: number): Promise<ProductVariantValue[]> {
    return await this.valueRepo.find({
      where: { variant: { id: variantId } },
      order: { id: 'ASC' },
    });
  }

  /**
   * دریافت مقدار واحد
   */
  async findOne(id: number): Promise<ProductVariantValue> {
    const value = await this.valueRepo.findOne({
      where: { id },
      relations: ['variant', 'product'],
    });

    if (!value) {
      throw new NotFoundException(`مقدار با شناسه ${id} یافت نشد`);
    }

    return value;
  }

  /**
   * بروزرسانی مقدار
   */
  async update(
    id: number,
    updateDto: UpdateProductVariantValueDto,
  ): Promise<ProductVariantValue> {
    const value = await this.findOne(id);

    if (updateDto.name !== undefined) {
      // بررسی یکتایی نام جدید
      const existing = await this.valueRepo.findOne({
        where: {
          variant: { id: value.variant.id },
          name: updateDto.name,
          id: Not(id),
        },
      });

      if (existing) {
        throw new BadRequestException(
          `مقدار "${updateDto.name}" برای این واریانت قبلاً وجود دارد`,
        );
      }

      value.name = updateDto.name;
    }

    if (updateDto.icon !== undefined) value.icon = updateDto.icon;
    if (updateDto.image !== undefined) value.image = updateDto.image;
    if (updateDto.hexCode !== undefined) value.hexCode = updateDto.hexCode;

    return await this.valueRepo.save(value);
  }

  /**
   * حذف مقدار
   */
  async remove(id: number): Promise<{ message: string; success: boolean }> {
    const value = await this.findOne(id);
    await this.valueRepo.remove(value);
    return {
      message: `مقدار با شناسه ${id} با موفقیت حذف شد`,
      success: true,
    };
  }
}
