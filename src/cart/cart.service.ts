import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { User } from '../entities/user.entity';
import { SellerOffer } from '../entities/seller-offer.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { SyncCartDto } from './dto/sync-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SellerOffer)
    private readonly offerRepo: Repository<SellerOffer>,
  ) {}

  /**
   * دریافت یا ایجاد سبد خرید کاربر
   */
  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: [
        'items',
        'items.product',
        'items.variantValues',
        'items.offer',
        'items.offer.seller',
      ],
    });

    if (!cart) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('کاربر یافت نشد');
      }

      cart = this.cartRepo.create({ user, items: [] });
      cart = await this.cartRepo.save(cart);
    }

    return cart;
  }

  /**
   * افزودن محصول به سبد خرید
   */
  async addToCart(userId: number, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    // بررسی وجود پیشنهاد
    const offer = await this.offerRepo.findOne({
      where: { id: dto.offerId },
      relations: ['product', 'seller'],
    });

    if (!offer) {
      throw new NotFoundException('پیشنهاد یافت نشد');
    }

    if (!offer.isActive) {
      throw new BadRequestException('این پیشنهاد غیرفعال است');
    }

    // بررسی موجودی
    if (offer.stock < dto.quantity) {
      throw new BadRequestException(
        `موجودی کافی نیست. موجودی فعلی: ${offer.stock}`,
      );
    }

    // بررسی اینکه آیا این آیتم قبلاً در سبد وجود دارد
    // اگر محصول تنوع دارد، به selectedVariantValueId نگاه کنیم
    const existingItem = cart.items.find(
      (item) =>
        item.offer.id === dto.offerId &&
        (dto.selectedVariantValueId === undefined ||
          item.selectedVariantValueId === dto.selectedVariantValueId),
    );

    if (existingItem) {
      // اگر وجود داشت، تعداد را افزایش بده
      const newQuantity = existingItem.quantity + dto.quantity;

      if (offer.stock < newQuantity) {
        throw new BadRequestException(
          `موجودی کافی نیست. موجودی فعلی: ${offer.stock}`,
        );
      }

      existingItem.quantity = newQuantity;
      existingItem.price = offer.discountPrice || offer.price;
      existingItem.discountPrice = offer.discountPrice;
      existingItem.discountPercent = offer.discountPercent || 0;
      existingItem.stock = offer.stock;
      await this.cartItemRepo.save(existingItem);
    } else {
      // اگر وجود نداشت، آیتم جدید بساز
      const cartItem = this.cartItemRepo.create({
        cart,
        product: offer.product,
        offer,
        quantity: dto.quantity,
        price: offer.discountPrice || offer.price,
        // فیلدهای snapshot
        productName: offer.product.name,
        productSlug: offer.product.slug,
        productImage: offer.product.mainImage || '',
        sellerName: offer.seller.businessName,
        discountPrice: offer.discountPrice,
        discountPercent: offer.discountPercent || 0,
        minOrder: offer.minOrder || 1,
        maxOrder: offer.maxOrder || 999,
        stock: offer.stock,
        hasWarranty: offer.hasWarranty || false,
        warrantyDescription: offer.warrantyDescription,
        selectedVariantId: dto.selectedVariantId,
        selectedVariantValueId: dto.selectedVariantValueId,
        selectedVariantObject: dto.selectedVariantObject,
        selectedVariantValueObject: dto.selectedVariantValueObject,
      });

      await this.cartItemRepo.save(cartItem);
    }

    return await this.getOrCreateCart(userId);
  }

  /**
   * بروزرسانی تعداد یک آیتم در سبد
   */
  async updateCartItem(
    userId: number,
    itemId: number,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('آیتم در سبد خرید یافت نشد');
    }

    // بررسی موجودی و دریافت قیمت فعلی
    const offer = await this.offerRepo.findOne({
      where: { id: item.offer.id },
    });

    if (!offer) {
      throw new NotFoundException('پیشنهاد یافت نشد');
    }

    if (offer.stock < dto.quantity) {
      throw new BadRequestException(
        `موجودی کافی نیست. موجودی فعلی: ${offer.stock}`,
      );
    }

    item.quantity = dto.quantity;
    item.price = offer.discountPrice; // به‌روزرسانی قیمت به مقدار فعلی
    await this.cartItemRepo.save(item);

    return await this.getOrCreateCart(userId);
  }

  /**
   * حذف آیتم از سبد خرید
   */
  async removeCartItem(userId: number, itemId: number): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('آیتم در سبد خرید یافت نشد');
    }

    await this.cartItemRepo.remove(item);

    return await this.getOrCreateCart(userId);
  }

  /**
   * خالی کردن سبد خرید
   */
  async clearCart(userId: number): Promise<void> {
    const cart = await this.getOrCreateCart(userId);

    if (cart.items.length > 0) {
      await this.cartItemRepo.remove(cart.items);
    }
  }

  /**
   * دریافت سبد خرید کاربر
   */
  async getCart(userId: number): Promise<Cart> {
    return await this.getOrCreateCart(userId);
  }

  /**
   * محاسبه مجموع قیمت سبد خرید
   */
  async getCartTotal(userId: number): Promise<{
    subtotal: number;
    itemsCount: number;
  }> {
    const cart = await this.getOrCreateCart(userId);

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const itemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, itemsCount };
  }

  /**
   * سینک کردن سبد خرید آفلاین با سبد خرید آنلاین
   * اگر کاربر آفلاین بود و سبد خرید ایجاد کرد، هنگام آنلاین شدن سبد‌ها ادغام می‌شوند
   */
  async syncCart(userId: number, syncDto: SyncCartDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    // برای هر آیتم در سبد آفلاین
    for (const offlineItem of syncDto.items) {
      // بررسی اینکه این آیتم قبلاً در سبد آنلاین وجود دارد یا نه
      // اگر محصول تنوع دارد، به selectedVariantValueId نگاه کنیم
      const existingItem = cart.items.find(
        (item) =>
          item.offer.id === offlineItem.offerId &&
          // اگر محصول تنوع دارد، باید variant value هم یکسان باشد
          (offlineItem.selectedVariantValueId === undefined ||
            item.selectedVariantValueId === offlineItem.selectedVariantValueId),
      );

      // بررسی وجود پیشنهاد برای دریافت آخرین اطلاعات
      const offer = await this.offerRepo.findOne({
        where: { id: offlineItem.offerId },
        relations: ['product', 'seller'],
      });

      if (!offer) {
        continue;
      }

      if (!offer.isActive) {
        continue;
      }

      // بررسی موجودی کافی برای تعداد درخواست شده
      const totalQuantityNeeded = existingItem
        ? existingItem.quantity + offlineItem.quantity
        : offlineItem.quantity;

      if (offer.stock < totalQuantityNeeded) {
        const availableQuantity = offer.stock;
        if (availableQuantity === 0) {
          continue;
        }

        if (existingItem) {
          existingItem.quantity = availableQuantity;
        } else {
          // آیتم جدید ایجاد کنیم
          const cartItem = this.cartItemRepo.create({
            cart: { id: cart.id },
            product: { id: offer.product.id },
            offer,
            quantity: availableQuantity,
            price: offlineItem.discountPrice || offlineItem.price,
            // اطلاعات snapshot از آفلاین
            productName: offlineItem.productName,
            productSlug: offlineItem.productSlug,
            productImage: offlineItem.productImage,
            sellerName: offlineItem.sellerName,
            discountPrice: offlineItem.discountPrice,
            discountPercent: offlineItem.discountPercent || 0,
            minOrder: offlineItem.minOrder || null,
            maxOrder: offlineItem.maxOrder || null,
            stock: offer.stock,
            hasWarranty: offlineItem.hasWarranty,
            warrantyDescription: offlineItem.warrantyDescription,
            selectedVariantId: offlineItem.selectedVariantId || null,
            selectedVariantValueId: offlineItem.selectedVariantValueId || null,
            selectedVariantObject: offlineItem.selectedVariantObject || null,
            selectedVariantValueObject:
              offlineItem.selectedVariantValueObject || null,
          });

          await this.cartItemRepo.save(cartItem);
          continue;
        }
      }

      if (existingItem) {
        // اگر آیتم وجود داشت، تعداد را ادغام کنیم
        existingItem.quantity = totalQuantityNeeded;
        existingItem.price = offlineItem.discountPrice || offlineItem.price;
        existingItem.productName = offlineItem.productName;
        existingItem.productSlug = offlineItem.productSlug;
        existingItem.productImage = offlineItem.productImage || '';
        existingItem.sellerName = offlineItem.sellerName;
        existingItem.discountPrice = offlineItem.discountPrice || 0;
        existingItem.discountPercent = offlineItem.discountPercent || 0;
        existingItem.minOrder = offlineItem.minOrder || null;
        existingItem.maxOrder = offlineItem.maxOrder || null;
        existingItem.stock = offer.stock;
        existingItem.hasWarranty = offlineItem.hasWarranty;
        existingItem.warrantyDescription =
          offlineItem.warrantyDescription || '';
        existingItem.selectedVariantId = offlineItem.selectedVariantId || null;
        existingItem.selectedVariantValueId =
          offlineItem.selectedVariantValueId || null;
        existingItem.selectedVariantObject =
          offlineItem.selectedVariantObject || {};
        existingItem.selectedVariantValueObject =
          offlineItem.selectedVariantValueObject || {};

        await this.cartItemRepo.save(existingItem);
      } else {
        // اگر آیتم وجود نداشت، جدید بساز
        const cartItem = this.cartItemRepo.create({
          cart: { id: cart.id },
          product: { id: offer.product.id },
          offer,
          quantity: offlineItem.quantity,
          price: offlineItem.discountPrice || offlineItem.price,
          productName: offlineItem.productName,
          productSlug: offlineItem.productSlug,
          productImage: offlineItem.productImage,
          sellerName: offlineItem.sellerName,
          discountPrice: offlineItem.discountPrice,
          discountPercent: offlineItem.discountPercent || 0,
          minOrder: offlineItem.minOrder || null,
          maxOrder: offlineItem.maxOrder || null,
          stock: offer.stock,
          hasWarranty: offlineItem.hasWarranty,
          warrantyDescription: offlineItem.warrantyDescription,
          selectedVariantId: offlineItem.selectedVariantId || null,
          selectedVariantValueId: offlineItem.selectedVariantValueId || null,
          selectedVariantObject: offlineItem.selectedVariantObject || null,
          selectedVariantValueObject:
            offlineItem.selectedVariantValueObject || null,
        });

        await this.cartItemRepo.save(cartItem);
      }
    }

    return await this.getOrCreateCart(userId);
  }
}
