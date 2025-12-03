import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SellerOffer } from '../entities/seller-offer.entity';
import { Seller } from '../entities/seller.entity';
import { Product } from '../entities/product.entity';
import { ProductVariantValue } from '../entities/product-variant-value.entity';
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
    @InjectRepository(ProductVariantValue)
    private readonly variantValueRepo: Repository<ProductVariantValue>,
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

    // محصول الزامی است
    if (!createDto.productId) {
      throw new BadRequestException('productId الزامی است');
    }

    // بررسی وجود محصول
    const product = await this.productRepo.findOne({
      where: { id: createDto.productId },
      relations: ['variants', 'variantValues'],
    });

    if (!product) {
      throw new NotFoundException(
        `محصول با شناسه ${createDto.productId} یافت نشد`,
      );
    }

    // بررسی تناسب variantValueIds با محصول
    let variantValues: ProductVariantValue[] = [];

    if (createDto.variantValueIds && createDto.variantValueIds.length > 0) {
      // اگر variantValueIds ارسال شد
      if (!product.hasVariant) {
        throw new BadRequestException(
          'این محصول واریانت ندارد. variantValueIds را حذف کنید',
        );
      }

      // تمام variant value IDs باید به این محصول تعلق داشته باشند
      variantValues = await this.variantValueRepo.find({
        where: { id: In(createDto.variantValueIds) },
        relations: ['variant'],
      });

      if (variantValues.length !== createDto.variantValueIds.length) {
        throw new NotFoundException(
          'یکی یا بیشتر از variant value ID نامعتبر است',
        );
      }

      // بررسی اینکه تمام variant values به همان محصول تعلق دارند
      const productVariantIds = product.variants.map((v) => v.id);
      const invalidValues = variantValues.filter(
        (vv) => !productVariantIds.includes(vv.variant.id),
      );

      if (invalidValues.length > 0) {
        throw new BadRequestException(
          'تمام variant values باید به واریانت‌های محصول تعلق داشته باشند',
        );
      }
    } else {
      // اگر variantValueIds ارسال نشد
      if (product.hasVariant) {
        throw new BadRequestException(
          'این محصول دارای واریانت است. لطفاً variantValueIds را مشخص کنید',
        );
      }
    }

    // بررسی تکراری نبودن پیشنهاد
    // برای محصولات بدون واریانت
    if (!product.hasVariant) {
      const existingOffer = await this.offerRepo.findOne({
        where: {
          seller: { id: createDto.sellerId },
          product: { id: product.id },
        },
      });

      if (existingOffer) {
        throw new ConflictException(
          'این فروشنده قبلاً برای این محصول پیشنهاد ثبت کرده است',
        );
      }
    } else {
      // برای محصولات با واریانت - بررسی اینکه این ترکیب دقیق variant values قبلاً وجود ندارد
      const variantValueIdSet = new Set(createDto.variantValueIds || []);
      const variantValueIdCount = variantValueIdSet.size;

      // تمام افرهای این فروشنده برای این محصول رو بیار
      const existingOffers = await this.offerRepo
        .createQueryBuilder('offer')
        .leftJoinAndSelect('offer.variantValues', 'variantValues')
        .where('offer.sellerId = :sellerId', {
          sellerId: createDto.sellerId,
        })
        .andWhere('offer.productId = :productId', {
          productId: product.id,
        })
        .getMany();

      // چک کن آیا هریک از افرها دقیقاً همین variant values رو داره
      const isDuplicate = existingOffers.some((offer) => {
        const offerVariantIds = new Set(offer.variantValues.map((vv) => vv.id));
        // اگر هر دو set یکسان باشند (تعداد و ID ها یکسان)
        return (
          offerVariantIds.size === variantValueIdCount &&
          Array.from(variantValueIdSet).every((id) => offerVariantIds.has(id))
        );
      });

      if (isDuplicate) {
        throw new ConflictException(
          'این فروشنده قبلاً برای این ترکیب دقیق از variant values پیشنهاد ثبت کرده است',
        );
      }
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
      product: { id: product.id },
      variantValues: variantValues.length > 0 ? variantValues : [],
      price: createDto.price,
      discountPrice,
      discountPercent: createDto.discountPercent || 0,
      stock: createDto.stock,
      minOrder: createDto.minOrder || 1,
      maxOrder: createDto.maxOrder || 0,
      sellerNotes: createDto.sellerNotes,
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
      relations: [
        'seller',
        'product',
        'variantValues',
        'variantValues.variant',
      ],
      order: { discountPrice: 'ASC' },
    });
  }

  /**
   * دریافت پیشنهادات یک فروشنده
   */
  async findBySeller(sellerId: number): Promise<SellerOffer[]> {
    return await this.offerRepo.find({
      where: { seller: { id: sellerId }, isActive: true },
      relations: ['product', 'variantValues', 'variantValues.variant'],
      order: { discountPrice: 'ASC' },
    });
  }

  /**
   * دریافت پیشنهادات یک محصول
   */
  async findByProduct(productId: number): Promise<SellerOffer[]> {
    return await this.offerRepo.find({
      where: { product: { id: productId }, isActive: true },
      relations: ['seller', 'variantValues', 'variantValues.variant'],
      order: { discountPrice: 'ASC' },
    });
  }

  /**
   * دریافت پیشنهادات حاوی یک variant value
   */
  async findByVariantValue(variantValueId: number): Promise<SellerOffer[]> {
    return await this.offerRepo
      .createQueryBuilder('offer')
      .innerJoinAndSelect('offer.variantValues', 'variantValues')
      .where('variantValues.id = :variantValueId', { variantValueId })
      .andWhere('offer.isActive = :isActive', { isActive: true })
      .leftJoinAndSelect('offer.seller', 'seller')
      .leftJoinAndSelect('offer.product', 'product')
      .orderBy('offer.discountPrice', 'ASC')
      .getMany();
  }

  /**
   * دریافت بهترین پیشنهاد (ارزان‌ترین قیمت با موجودی)
   */
  async findBestOffer(
    productId?: number,
    variantValueIds?: number | number[],
  ): Promise<SellerOffer | null> {
    let query = this.offerRepo
      .createQueryBuilder('offer')
      .where('offer.isActive = :isActive', { isActive: true })
      .andWhere('offer.stock > 0')
      .leftJoinAndSelect('offer.seller', 'seller')
      .leftJoinAndSelect('offer.product', 'product')
      .leftJoinAndSelect('offer.variantValues', 'variantValues');

    const variantValueIdsArray = Array.isArray(variantValueIds)
      ? variantValueIds
      : variantValueIds
        ? [variantValueIds]
        : undefined;

    if (variantValueIdsArray && variantValueIdsArray.length > 0) {
      query = query.andWhere('variantValues.id IN (:...variantValueIds)', {
        variantValueIds: variantValueIdsArray,
      });
    } else if (productId) {
      query = query.andWhere('offer.productId = :productId', { productId });
    } else {
      throw new BadRequestException(
        'باید حداقل یکی از productId یا variantValueIds مشخص شود',
      );
    }

    return await query.orderBy('offer.discountPrice', 'ASC').getOne();
  }

  /**
   * دریافت یک پیشنهاد
   */
  async findOne(id: number): Promise<SellerOffer> {
    const offer = await this.offerRepo.findOne({
      where: { id },
      relations: [
        'seller',
        'product',
        'variantValues',
        'variantValues.variant',
      ],
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
