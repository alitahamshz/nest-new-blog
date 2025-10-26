import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSpecification } from '../entities/product-specification.entity';
import {
  CreateProductSpecificationDto,
  UpdateProductSpecificationDto,
} from './dto';

@Injectable()
export class ProductSpecificationService {
  constructor(
    @InjectRepository(ProductSpecification)
    private readonly specificationRepository: Repository<ProductSpecification>,
  ) {}

  /**
   * ایجاد مشخصات جدید برای محصول
   */
  async create(
    productId: number,
    createDto: CreateProductSpecificationDto,
  ): Promise<ProductSpecification> {
    const specification = this.specificationRepository.create({
      ...createDto,
      product: { id: productId },
    });

    return await this.specificationRepository.save(specification);
  }

  /**
   * ایجاد چندین مشخصات یکجا برای محصول
   */
  async createMany(
    productId: number,
    createDtos: CreateProductSpecificationDto[],
  ): Promise<ProductSpecification[]> {
    const specifications = createDtos.map((dto) =>
      this.specificationRepository.create({
        ...dto,
        product: { id: productId },
      }),
    );

    return await this.specificationRepository.save(specifications);
  }

  /**
   * دریافت تمام مشخصات یک محصول
   */
  async findAllByProduct(productId: number): Promise<ProductSpecification[]> {
    return await this.specificationRepository.find({
      where: { product: { id: productId } },
      order: { displayOrder: 'ASC', id: 'ASC' },
    });
  }

  /**
   * دریافت یک مشخصات با ID
   */
  async findOne(id: number): Promise<ProductSpecification> {
    const specification = await this.specificationRepository.findOne({
      where: { id },
    });

    if (!specification) {
      throw new NotFoundException(`مشخصات با شناسه ${id} یافت نشد`);
    }

    return specification;
  }

  /**
   * بروزرسانی مشخصات
   */
  async update(
    id: number,
    updateDto: UpdateProductSpecificationDto,
  ): Promise<ProductSpecification> {
    const specification = await this.findOne(id);

    Object.assign(specification, updateDto);

    return await this.specificationRepository.save(specification);
  }

  /**
   * حذف یک مشخصات
   */
  async remove(id: number): Promise<void> {
    const specification = await this.findOne(id);
    await this.specificationRepository.remove(specification);
  }

  /**
   * حذف تمام مشخصات یک محصول
   */
  async removeAllByProduct(productId: number): Promise<void> {
    await this.specificationRepository.delete({
      product: { id: productId },
    });
  }

  /**
   * جایگزینی کامل مشخصات یک محصول
   * (حذف قبلی‌ها و اضافه کردن جدیدها)
   */
  async replaceAll(
    productId: number,
    createDtos: CreateProductSpecificationDto[],
  ): Promise<ProductSpecification[]> {
    // حذف مشخصات قبلی
    await this.removeAllByProduct(productId);

    // اضافه کردن مشخصات جدید
    return await this.createMany(productId, createDtos);
  }
}
