# بررسی سیستم سبد خرید و سفارش

## خلاصه کلی
سیستم شما خوب ساخته شده است و بسیاری از بهترین شیوه‌ها را دنبال می‌کند. اما تعدادی نقطه‌ای برای بهبود وجود دارد.

---

## 🟢 نقاط قوت

### 1. **مدیریت تراکنش‌های ایمن (Transaction Safety)**
- استفاده از `QueryRunner` برای ایجاد سفارش
- استفاده از **Pessimistic Locking** (`pessimistic_write`) برای جلوگیری از oversell
- Rollback خودکار در صورت خطا
- این الگو بسیار خوب است و از مسائل concurrency جلوگیری می‌کند

### 2. **کاهش موجودی درست**
- موجودی هنگام ایجاد سفارش کاهش می‌یابد
- بازگشت موجودی هنگام لغو سفارش پیاده‌سازی شده است

### 3. **ساختار Entity صحیح**
- Entities به خوبی طراحی شده‌اند
- روابط مناسب بین Order، OrderItem، Cart و CartItem

### 4. **تولید شماره سفارش یونیک**
- فرمت منطقی: `ORD-YYYYMMDD-XXXX`
- شامل تاریخ و شماره ترتیبی

### 5. **محاسبات مالیاتی و ارسال**
- منطق محاسبه مالیات (9%)
- هزینه ارسال مشروط (رایگان برای خریدهای بالای ۵۰۰ هزار)

---

## 🟡 نقاط قابل بهبود

### 1. **Cart را بعد از ایجاد سفارش حذف کردن**
**موقعیت:** [src/orders/orders.service.ts](src/orders/orders.service.ts#L130)

```typescript
// در createOrderFromCart و createOrder
await queryRunner.manager.remove(cart);
```

**مسئله:**
- کل Cart object حذف می‌شود، نه تنها items
- بهتر است که CartItems را حذف کنید تا Cart خالی بماند

**راه حل:**
```typescript
// به جای:
await queryRunner.manager.remove(cart);

// استفاده کنید:
await queryRunner.manager.remove(cart.items);
// یا
await queryRunner.createQueryBuilder()
  .delete()
  .from(CartItem)
  .where('cartId = :cartId', { cartId: cart.id })
  .execute();
```

---

### 2. **Authentication Guard کی‌وارد نشده**
**موقعیت:** Controllers (`cart.controller.ts`, `orders.controller.ts`)

**مسئله:**
- هیچ احراز هویتی بر روی endpoints نیست
- هر کاربری می‌تواند سفارش دیگران را ببیند یا بروزرسانی کند

**راه حل مورد نیاز:**
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Get(':userId')
async getCart(
  @Param('userId', ParseIntPipe) userId: number,
  @CurrentUser() user: User
) {
  // بررسی کنید که userId === user.id
  if (userId !== user.id) {
    throw new ForbiddenException('دسترسی غیرمجاز');
  }
  return await this.cartService.getCart(userId);
}
```

---

### 3. **عدم محدودیت در UpdateOrderDto**
**موقعیت:** [src/orders/dto/update-order.dto.ts](src/orders/dto/update-order.dto.ts)

**مسئله:**
- کاربران می‌توانند تمام فیلدهای سفارش را تغییر دهند
- نباید کاربر بتواند `subtotal`, `total`, `tax` را تغییر دهد

**راه حل:**
```typescript
// UpdateOrderDto باید تنها فیلدهای مجاز را بپذیرد
export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  adminNote?: string;

  // فیلدهای غیرمجاز را حذف کنید: subtotal, total, tax, discount
}
```

---

### 4. **عدم بررسی موجودی در AddToCart**
**موقعیت:** [src/cart/cart.service.ts](src/cart/cart.service.ts#L55)

**مسئله:**
- موجودی را فقط در زمان ایجاد سفارش بررسی می‌کند
- میان‌افزار درست نیست:
  - کاربر ۱ محصول با موجودی ۱۰ به سبد اضافه می‌کند
  - موجودی تغییر می‌کند (۵ مورد فروخته می‌شود)
  - کاربر ۲ محصول اضافی اضافه می‌کند → oversell ممکن است

**راه حل:**
فقط موجودی را در زمان ایجاد سفارش بررسی کنید (مانند الگوی الان)

---

### 5. **عدم بررسی isActive در AddToCart**
**موقعیت:** [src/cart/cart.service.ts](src/cart/cart.service.ts#L64)

**مسئله:**
- فروشنده پیشنهاد را غیرفعال می‌کند
- محصول هنوز در سبد خریدی است
- سفارش در زمان checkout ایجاد می‌شود و خطا می‌دهد

**راه حل:**
```typescript
async addToCart(userId: number, dto: AddToCartDto): Promise<Cart> {
  // ... existing code ...
  
  if (!offer.isActive) {
    throw new BadRequestException('این پیشنهاد غیرفعال است');
  }
  
  // ... rest of code ...
}
```
✅ این قبلاً پیاده‌سازی شده است!

---

### 6. **عدم Validation در CreateOrderDto**
**موقعیت:** [src/orders/dto/create-order.dto.ts](src/orders/dto/create-order.dto.ts#L1)

**مسئله:**
```typescript
// موجود نیست:
// - Validation برای paymentMethod
// - Validation برای shippingPhone (format)
// - items array می‌تواند خالی باشد
```

**راه حل:**
```typescript
export class CreateOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsPhoneNumber('IR') // نیاز به library libphonenumber-js
  shippingPhone?: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsArray()
  @ArrayMinSize(0)
  items?: OrderItemDto[];

  @IsOptional()
  @IsString()
  customerNote?: string;
}
```

---

### 7. **cancelReason بدون Validation**
**موقعیت:** [src/orders/orders.controller.ts](src/orders/orders.controller.ts#L118)

**مسئله:**
```typescript
@Query('reason') reason: string,
```

این می‌تواند empty string یا null باشد.

**راه حل:**
```typescript
@Query('reason', new ValidationPipe({ 
  whitelist: true,
  forbidNonWhitelisted: true 
}))
@IsNotEmpty()
cancelReason: string,
```

---

### 8. **عدم بررسی Order Ownership برای Update/Cancel**
**موقعیت:** [src/orders/orders.service.ts](src/orders/orders.service.ts#L290-L310)

**مسئله:**
- هر کسی می‌تواند سفارش دیگران را لغو یا تغییر دهد
- پیش‌نیاز مجوز آدمین یا صاحب سفارش نیست

**راه حل:**
```typescript
async update(id: number, updateDto: UpdateOrderDto, userId: number): Promise<Order> {
  const order = await this.findOne(id);
  
  // بررسی مالکیت
  if (order.user.id !== userId) {
    throw new ForbiddenException('شما این سفارش را مالکیت ندارید');
  }
  
  // ... rest of code ...
}
```

---

### 9. **عدم Pagination در findAll و findByUser**
**موقعیت:** [src/orders/orders.service.ts](src/orders/orders.service.ts#L262-L272)

**مسئله:**
- اگر هزاران سفارش باشد، تمام آنها لود می‌شود
- Performance issue برای production

**راه حل:**
```typescript
async findByUser(
  userId: number, 
  page: number = 1, 
  limit: number = 10
): Promise<{ data: Order[], total: number, page: number, pages: number }> {
  const [orders, total] = await this.orderRepo.findAndCount({
    where: { user: { id: userId } },
    relations: ['items', 'items.product', 'items.seller'],
    order: { createdAt: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: orders,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}
```

---

### 10. **CartItem Price قدیمی شو می‌شود**
**موقعیت:** [src/cart/cart.service.ts](src/cart/cart.service.ts#L103)

**مسئله:**
```typescript
price: offer.discountPrice,
```

اگر فروشنده قیمت را تغییر دهد، CartItem قدیمی می‌ماند.

**راه حل:**
```typescript
// هنگام بروزرسانی سبد، قیمت را دوباره load کنید
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

  // قیمت فعلی را دوباره load کنید
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
  item.price = offer.discountPrice; // به‌روزرسانی قیمت
  await this.cartItemRepo.save(item);

  return await this.getOrCreateCart(userId);
}
```

---

## 📋 خلاصه تغییرات مورد نیاز

| اولویت | موضوع | نوع مسئله | راه حل |
|------|------|---------|-------|
| 🔴 **بسیار مهم** | Guard احراز هویت | Security | اضافه کردن JwtAuthGuard و بررسی ownership |
| 🔴 **بسیار مهم** | Ownership Validation | Security | بررسی user.id در تمام عملیات |
| 🟡 **متوسط** | UpdateOrderDto Validation | Business Logic | محدود کردن فیلدهای قابل بروزرسانی |
| 🟡 **متوسط** | Pagination | Performance | اضافه کردن pagination به findAll |
| 🟡 **متوسط** | Price Update | Data Consistency | به‌روزرسانی قیمت در updateCartItem |
| 🟠 **کم** | CartItem حذف | Data Cleanup | تغییر حذف Cart به حذف CartItems |
| 🟠 **کم** | Validation بهتر | Code Quality | اضافه کردن validation دقیق‌تر |

---

## 🚀 نتیجه‌گیری

**کوئالیتی کد: 7.5/10**

✅ مثبت‌ها:
- Transaction handling خوب
- Locking strategy صحیح
- Entity relationships درست

❌ منفی‌ها:
- Security issues (بدون Authentication/Authorization)
- Data validation ضعیف
- Performance issues (بدون pagination)
- Data consistency issues

**توصیه:** با ترتیب اولویت بالا، security issues را اول حل کنید.
