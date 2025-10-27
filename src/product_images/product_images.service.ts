import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from '../entities/product-image.entity';
import { Product } from '../entities/product.entity';
import { CreateProductImageDto } from './dto/create-product_image.dto';
import { UpdateProductImageDto } from './dto/update-product_image.dto';
import { FilesService } from '../files/files.service';
import { unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly filesService: FilesService,
  ) {}

  /**
   * افزودن تصویر جدید به گالری محصول
   */
  async create(createDto: CreateProductImageDto): Promise<ProductImage> {
    // بررسی وجود محصول
    const product = await this.productRepo.findOne({
      where: { id: createDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `محصول با شناسه ${createDto.productId} یافت نشد`,
      );
    }

    // اگر این تصویر باید اصلی باشد، باید تصویر اصلی قبلی را غیر اصلی کنیم
    if (createDto.isMain) {
      await this.imageRepo.update(
        { product: { id: createDto.productId }, isMain: true },
        { isMain: false },
      );
    }

    const image = this.imageRepo.create({
      product,
      url: createDto.url,
      alt: createDto.alt,
      isMain: createDto.isMain || false,
    });

    return await this.imageRepo.save(image);
  }

  /**
   * افزودن چندین تصویر یکجا
   */
  async createMany(
    productId: number,
    createDtos: CreateProductImageDto[],
  ): Promise<ProductImage[]> {
    // بررسی وجود محصول
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`محصول با شناسه ${productId} یافت نشد`);
    }

    // بررسی اینکه فقط یک تصویر اصلی وجود داشته باشد
    const mainImageCount = createDtos.filter((dto) => dto.isMain).length;
    if (mainImageCount > 1) {
      throw new BadRequestException('فقط یک تصویر می‌تواند اصلی باشد');
    }

    // اگر تصویر اصلی جدیدی هست، قبلی‌ها را غیراصلی کن
    if (mainImageCount === 1) {
      await this.imageRepo.update(
        { product: { id: productId }, isMain: true },
        { isMain: false },
      );
    }

    const images = createDtos.map((dto) =>
      this.imageRepo.create({
        product,
        url: dto.url,
        alt: dto.alt,
        isMain: dto.isMain || false,
      }),
    );

    return await this.imageRepo.save(images);
  }

  /**
   * دریافت تمام تصاویر
   */
  async findAll(): Promise<ProductImage[]> {
    return await this.imageRepo.find({
      relations: ['product'],
      order: { isMain: 'DESC', id: 'ASC' },
    });
  }

  /**
   * دریافت تصاویر یک محصول
   */
  async findByProduct(productId: number): Promise<ProductImage[]> {
    return await this.imageRepo.find({
      where: { product: { id: productId } },
      order: { isMain: 'DESC', id: 'ASC' },
    });
  }

  /**
   * دریافت تصویر اصلی محصول
   */
  async findMainImage(productId: number): Promise<ProductImage | null> {
    return await this.imageRepo.findOne({
      where: { product: { id: productId }, isMain: true },
    });
  }

  /**
   * دریافت یک تصویر
   */
  async findOne(id: number): Promise<ProductImage> {
    const image = await this.imageRepo.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!image) {
      throw new NotFoundException(`تصویر با شناسه ${id} یافت نشد`);
    }

    return image;
  }

  /**
   * بروزرسانی تصویر
   */
  async update(
    id: number,
    updateDto: UpdateProductImageDto,
  ): Promise<ProductImage> {
    const image = await this.findOne(id);

    // اگر این تصویر باید اصلی شود، باقی را غیر اصلی کن
    if (updateDto.isMain && !image.isMain) {
      await this.imageRepo.update(
        { product: { id: image.product.id }, isMain: true },
        { isMain: false },
      );
    }

    Object.assign(image, updateDto);
    return await this.imageRepo.save(image);
  }

  /**
   * تنظیم تصویر اصلی محصول
   */
  async setMainImage(id: number): Promise<ProductImage> {
    const image = await this.findOne(id);

    // همه تصاویر محصول را غیر اصلی کن
    await this.imageRepo.update(
      { product: { id: image.product.id }, isMain: true },
      { isMain: false },
    );

    // این تصویر را اصلی کن
    image.isMain = true;
    return await this.imageRepo.save(image);
  }

  /**
   * حذف تصویر
   */
  async remove(id: number): Promise<void> {
    const image = await this.findOne(id);

    // حذف فایل فیزیکی از دیسک
    try {
      const uploadPathBase = process.env.UPLOADS_DESTINATION || '/app/uploads';
      // استخراج path نسبی از URL
      // مثال: از "http://localhost:3000/uploads/2025/01/product-123.jpg"
      // به "2025/01/product-123.jpg"
      const urlPath = new URL(image.url).pathname; // "/uploads/2025/01/product-123.jpg"
      const relativePath = urlPath.replace('/uploads/', ''); // "2025/01/product-123.jpg"
      const fullPath = join(uploadPathBase, relativePath);

      unlinkSync(fullPath);
      console.log(`✅ فایل حذف شد: ${fullPath}`);
    } catch (err) {
      console.error(
        'خطا در حذف فایل:',
        err instanceof Error ? err.message : String(err),
      );
      // ادامه می‌دهیم حتی اگر فایل پیدا نشد
    }

    // اگر تصویر اصلی بود، اولین تصویر دیگر را اصلی کن
    if (image.isMain) {
      const otherImages = await this.imageRepo.find({
        where: { product: { id: image.product.id } },
        order: { id: 'ASC' },
      });

      const nextImage = otherImages.find((img) => img.id !== id);
      if (nextImage) {
        nextImage.isMain = true;
        await this.imageRepo.save(nextImage);
      }
    }

    await this.imageRepo.remove(image);
  }

  /**
   * حذف تمام تصاویر یک محصول
   */
  async removeByProduct(productId: number): Promise<void> {
    // ابتدا تمام تصاویر رو بگیر
    const images = await this.imageRepo.find({
      where: { product: { id: productId } },
    });

    // حذف فیزیکی تمام فایل‌ها
    const uploadPathBase = process.env.UPLOADS_DESTINATION || '/app/uploads';
    for (const image of images) {
      try {
        const urlPath = new URL(image.url).pathname;
        const relativePath = urlPath.replace('/uploads/', '');
        const fullPath = join(uploadPathBase, relativePath);

        unlinkSync(fullPath);
        console.log(`✅ فایل حذف شد: ${fullPath}`);
      } catch (err) {
        console.error(
          `خطا در حذف فایل ${image.url}:`,
          err instanceof Error ? err.message : String(err),
        );
      }
    }

    // حذف از دیتابیس
    await this.imageRepo.delete({ product: { id: productId } });
  }

  /**
   * آپلود و ذخیره تصویر محصول
   */
  async uploadImage(
    productId: number,
    file: Express.Multer.File,
    isMain: boolean = false,
  ): Promise<ProductImage> {
    // بررسی وجود محصول
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`محصول با شناسه ${productId} یافت نشد`);
    }

    // ذخیره فایل با استفاده از FilesService
    const uploadedFile = await this.filesService.saveFile(
      file,
      process.env.UPLOADS_DESTINATION || '/app/uploads',
    );

    // اگر isMain = true باشه، تمام تصاویر قبلی رو غیر اصلی کن
    if (isMain) {
      await this.imageRepo.update(
        { product: { id: productId }, isMain: true },
        { isMain: false },
      );
    }

    // ایجاد ProductImage
    const productImage = this.imageRepo.create({
      product,
      url: uploadedFile.url,
      alt: file.originalname,
      isMain: isMain,
    });

    return await this.imageRepo.save(productImage);
  }

  /**
   * آپلود چندین تصویر یکجا
   */
  async uploadMultipleImages(
    productId: number,
    files: Express.Multer.File[],
  ): Promise<ProductImage[]> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`محصول با شناسه ${productId} یافت نشد`);
    }

    const uploadedImages: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // ذخیره فایل
      const uploadedFile = await this.filesService.saveFile(
        file,
        process.env.UPLOADS_DESTINATION || '/app/uploads',
      );

      // اولین تصویر رو اصلی کن (اگر محصول تصویر اصلی نداره)
      const existingMain = await this.findMainImage(productId);
      const isMain = i === 0 && !existingMain;

      const productImage = this.imageRepo.create({
        product,
        url: uploadedFile.url,
        alt: file.originalname,
        isMain: isMain,
      });

      uploadedImages.push(await this.imageRepo.save(productImage));
    }

    return uploadedImages;
  }
}
