import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { SellerOffer } from '../entities/seller-offer.entity';
import { Seller } from '../entities/seller.entity';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { CreateSellerOfferDto } from './dto/create-seller-offer.dto';
import { UpdateSellerOfferDto } from './dto/update-seller-offer.dto';

@Injectable()
export class SellerOfferService {
  constructor(
    @InjectRepository(SellerOffer)
    private readonly offerRepo: Repository<SellerOffer>,
    @InjectRepository(Seller)
    private readonly sellerRepo: Repository<Seller>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  /**
   * ایجاد پیشنهاد جدید
   */
  async create(createDto: CreateSellerOfferDto): Promise<SellerOffer> {
    // بررسی وجود فروشنده
    const seller = await this.sellerRepo.findOne({
      where: { id: createDto.sellerId },
    });

    if (!seller) {
      throw new NotFoundException(
        `فروشنده با شناسه ${createDto.sellerId} یافت نشد`,
      );
    }

    if (!seller.isActive) {
      throw new BadRequestException('فروشنده غیرفعال است');
    }

    // باید حداقل یکی از productId یا variantId وجود داشته باشد
    if (!createDto.productId && !createDto.variantId) {
      throw new BadRequestException(
        'باید حداقل یکی از productId یا variantId مشخص شود',
      );
    }

    let product: Product | null = null;
    let variant: ProductVariant | null = null;

    // بررسی وجود محصول
    if (createDto.productId) {
      product = await this.productRepo.findOne({
        where: { id: createDto.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `محصول با شناسه ${createDto.productId} یافت نشد`,
        );
      }

      // اگر محصول واریانت دارد، باید variantId هم ارسال شود
      if (product.hasVariant && !createDto.variantId) {
        throw new BadRequestException(
          'این محصول دارای واریانت است. لطفاً variantId را نیز مشخص کنید',
        );
      }

      // اگر محصول واریانت ندارد، نباید variantId ارسال شود
      if (!product.hasVariant && createDto.variantId) {
        throw new BadRequestException(
          'این محصول واریانت ندارد. variantId را حذف کنید',
        );
      }
    }

    // بررسی وجود واریانت
    if (createDto.variantId) {
      variant = await this.variantRepo.findOne({
        where: { id: createDto.variantId },
        relations: ['product'],
      });

      if (!variant) {
        throw new NotFoundException(
          `واریانت با شناسه ${createDto.variantId} یافت نشد`,
        );
      }

      product = variant.product;
    }

    // بررسی تکراری نبودن پیشنهاد
    const existingOffer = await this.offerRepo.findOne({
      where: {
        seller: { id: createDto.sellerId },
        ...(variant
          ? { variant: { id: variant.id } }
          : { product: { id: product!.id } }),
      },
    });

    if (existingOffer) {
      throw new ConflictException(
        'این فروشنده قبلاً برای این محصول/واریانت پیشنهاد ثبت کرده است',
      );
    }

    // محاسبه قیمت تخفیف‌خورده اگر درصد تخفیف داده شده
    let discountPrice = createDto.discountPrice || createDto.price;
    if (createDto.discountPercent && createDto.discountPercent > 0) {
      discountPrice =
        createDto.price - (createDto.price * createDto.discountPercent) / 100;
    }

    // ایجاد پیشنهاد
    const offer = this.offerRepo.create({
      seller: { id: seller.id },
      product: product ? { id: product.id } : undefined,
      variant: variant ? { id: variant.id } : undefined,
      price: createDto.price,
      discountPrice,
      discountPercent: createDto.discountPercent || 0,
      stock: createDto.stock,
      hasWarranty: createDto.hasWarranty || false,
      warrantyDescription: createDto.warrantyDescription,
      isDefault: createDto.isDefault || false,
    });

    return await this.offerRepo.save(offer);
  }

  /**
   * دریافت تمام پیشنهادات
   */
  async findAll(): Promise<SellerOffer[]> {
    return await this.offerRepo.find({
      relations: ['seller', 'product', 'variant'],
      order: { discountPrice: 'ASC' },
    });
  }

  /**
   * دریافت پیشنهادات یک فروشنده
   */
  async findBySeller(sellerId: number): Promise<SellerOffer[]> {
    return await this.offerRepo.find({
      where: { seller: { id: sellerId }, isActive: true },
      relations: ['product', 'variant'],
      order: { discountPrice: 'ASC' },
    });
  }

  /**
   * دریافت پیشنهادات یک محصول
   */
  async findByProduct(productId: number): Promise<SellerOffer[]> {
    return await this.offerRepo.find({
      where: { product: { id: productId }, isActive: true },
      relations: ['seller', 'variant'],
      order: { discountPrice: 'ASC' },
    });
  }

  /**
   * دریافت پیشنهادات یک واریانت
   */
  async findByVariant(variantId: number): Promise<SellerOffer[]> {
    return await this.offerRepo.find({
      where: { variant: { id: variantId }, isActive: true },
      relations: ['seller', 'product'],
      order: { discountPrice: 'ASC' },
    });
  }

  /**
   * دریافت بهترین پیشنهاد (ارزان‌ترین قیمت با موجودی)
   */
  async findBestOffer(
    productId?: number,
    variantId?: number,
  ): Promise<SellerOffer | null> {
    interface WhereCondition {
      isActive: boolean;
      variant?: { id: number };
      product?: { id: number };
    }

    const where: WhereCondition = { isActive: true };

    if (variantId) {
      where.variant = { id: variantId };
    } else if (productId) {
      where.product = { id: productId };
    } else {
      throw new BadRequestException(
        'باید حداقل یکی از productId یا variantId مشخص شود',
      );
    }

    return await this.offerRepo.findOne({
      where: {
        ...where,
        stock: MoreThan(0), // فقط موجودی‌های موجود
      },
      relations: ['seller', 'product', 'variant'],
      order: { discountPrice: 'ASC' },
    });
  }

  /**
   * دریافت یک پیشنهاد
   */
  async findOne(id: number): Promise<SellerOffer> {
    const offer = await this.offerRepo.findOne({
      where: { id },
      relations: ['seller', 'product', 'variant'],
    });

    if (!offer) {
      throw new NotFoundException(`پیشنهاد با شناسه ${id} یافت نشد`);
    }

    return offer;
  }

  /**
   * بروزرسانی پیشنهاد
   */
  async update(
    id: number,
    updateDto: UpdateSellerOfferDto,
  ): Promise<SellerOffer> {
    const offer = await this.findOne(id);

    // محاسبه مجدد قیمت تخفیف‌خورده اگر لازم باشد
    if (updateDto.price || updateDto.discountPercent !== undefined) {
      const price = updateDto.price || offer.price;
      const discountPercent =
        updateDto.discountPercent !== undefined
          ? updateDto.discountPercent
          : offer.discountPercent;

      if (discountPercent > 0) {
        updateDto.discountPrice = price - (price * discountPercent) / 100;
      }
    }

    Object.assign(offer, updateDto);
    return await this.offerRepo.save(offer);
  }

  /**
   * بروزرسانی موجودی
   */
  async updateStock(id: number, stock: number): Promise<SellerOffer> {
    if (stock < 0) {
      throw new BadRequestException('موجودی نمی‌تواند منفی باشد');
    }

    const offer = await this.findOne(id);
    offer.stock = stock;
    return await this.offerRepo.save(offer);
  }

  /**
   * کاهش موجودی (هنگام خرید)
   */
  async decreaseStock(id: number, quantity: number): Promise<SellerOffer> {
    const offer = await this.findOne(id);

    if (offer.stock < quantity) {
      throw new BadRequestException('موجودی کافی نیست');
    }

    offer.stock -= quantity;
    return await this.offerRepo.save(offer);
  }

  /**
   * فعال/غیرفعال کردن پیشنهاد
   */
  async toggleActive(id: number): Promise<SellerOffer> {
    const offer = await this.findOne(id);
    offer.isActive = !offer.isActive;
    return await this.offerRepo.save(offer);
  }

  /**
   * حذف پیشنهاد
   */
  async remove(id: number): Promise<void> {
    const offer = await this.findOne(id);
    await this.offerRepo.remove(offer);
  }
}
