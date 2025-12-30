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
    const existingItem = cart.items.find(
      (item) => item.offer.id === dto.offerId,
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
        productImage: offer?.product?.mainImage || '',
        sellerName: offer.seller.businessName,
        discountPrice: offer.discountPrice,
        discountPercent: offer.discountPercent || 0,
        minOrder: offer.minOrder || 1,
        maxOrder: offer.maxOrder || 999,
        stock: offer.stock,
        hasWarranty: offer.hasWarranty || false,
        warrantyDescription: offer.warrantyDescription,
        selectedVariants: {}, // برای بعداً
        variantNames: {}, // برای بعداً
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
      const existingItem = cart.items.find(
        (item) => item.offer.id === offlineItem.offerId,
      );

      // بررسی وجود پیشنهاد برای دریافت آخرین اطلاعات
      const offer = await this.offerRepo.findOne({
        where: { id: offlineItem.offerId },
        relations: ['product', 'seller'],
      });

      if (!offer) {
        // اگر پیشنهاد حذف شده، در این مورد می‌تواند آیتم را نادیده بگیریم یا تجاهل کنیم
        continue;
      }

      if (!offer.isActive) {
        // اگر پیشنهاد غیرفعال است، نادیده بگیریم
        continue;
      }

      // بررسی موجودی کافی برای تعداد درخواست شده
      const totalQuantityNeeded = existingItem
        ? existingItem.quantity + offlineItem.quantity
        : offlineItem.quantity;

      if (offer.stock < totalQuantityNeeded) {
        // اگر موجودی کافی نیست، از موجودی موجود استفاده کنیم
        const availableQuantity = offer.stock;
        if (availableQuantity === 0) {
          continue; // اگر موجودی صفر است، نادیده بگیریم
        }

        if (existingItem) {
          existingItem.quantity = availableQuantity;
        } else {
          // آیتم جدید ایجاد کنیم
          const cartItem = this.cartItemRepo.create({
            cart,
            product: offer.product,
            offer,
            quantity: availableQuantity,
            price: offer.discountPrice || offer.price,
            // اطلاعات snapshot از آفلاین
            productName: offlineItem.productName,
            productSlug: offlineItem.productSlug,
            productImage: offlineItem.productImage,
            sellerName: offlineItem.sellerName,
            discountPrice: offlineItem.discountPrice || offer.discountPrice,
            discountPercent: offlineItem.discountPercent || 0,
            minOrder: offlineItem.minOrder,
            maxOrder: offlineItem.maxOrder,
            stock: offer.stock, // آخرین موجودی
            hasWarranty: offlineItem.hasWarranty,
            warrantyDescription: offlineItem.warrantyDescription,
            selectedVariants: offlineItem.selectedVariants,
            variantNames: offlineItem.variantNames,
          });

          await this.cartItemRepo.save(cartItem);
          continue;
        }
      }

      if (existingItem) {
        // اگر آیتم وجود داشت، تعداد را ادغام کنیم
        existingItem.quantity = totalQuantityNeeded;
        // اطلاعات را به‌روزرسانی کنیم از آخرین اطلاعات
        existingItem.price = offer.discountPrice || offer.price;
        existingItem.productName = offlineItem.productName;
        existingItem.productSlug = offlineItem.productSlug;
        existingItem.productImage =
          offlineItem.productImage || existingItem.productImage;
        existingItem.sellerName = offlineItem.sellerName;
        existingItem.discountPrice =
          offlineItem.discountPrice || offer.discountPrice;
        existingItem.discountPercent = offlineItem.discountPercent || 0;
        existingItem.stock = offer.stock;
        existingItem.hasWarranty = offlineItem.hasWarranty;
        existingItem.warrantyDescription =
          offlineItem.warrantyDescription || existingItem.warrantyDescription;
        existingItem.selectedVariants = offlineItem.selectedVariants || {};
        existingItem.variantNames = offlineItem.variantNames || {};

        await this.cartItemRepo.save(existingItem);
      } else {
        // اگر آیتم وجود نداشت، جدید بساز
        const cartItem = this.cartItemRepo.create({
          cart,
          product: offer.product,
          offer,
          quantity: offlineItem.quantity,
          price: offer.discountPrice || offer.price,
          // اطلاعات snapshot
          productName: offlineItem.productName,
          productSlug: offlineItem.productSlug,
          productImage: offlineItem.productImage,
          sellerName: offlineItem.sellerName,
          discountPrice: offlineItem.discountPrice || offer.discountPrice,
          discountPercent: offlineItem.discountPercent || 0,
          minOrder: offlineItem.minOrder,
          maxOrder: offlineItem.maxOrder,
          stock: offer.stock,
          hasWarranty: offlineItem.hasWarranty,
          warrantyDescription: offlineItem.warrantyDescription,
          selectedVariants: offlineItem.selectedVariants,
          variantNames: offlineItem.variantNames,
        });

        await this.cartItemRepo.save(cartItem);
      }
    }

    return await this.getOrCreateCart(userId);
  }
}
