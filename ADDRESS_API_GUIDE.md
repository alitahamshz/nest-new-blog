# راهنمای استفاده - سیستم مدیریت آدرس

## نحوه استفاده از API

### 1. ایجاد آدرس (بدون نیاز به پروفایل)
```bash
curl -X POST http://localhost:3000/profile/addresses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "خانه",
    "recipientName": "علی احمدی",
    "phone": "09121234567",
    "alternativePhone": "09121234568",
    "address": "تهران، خیابان ولیعصر، بن بست ۲۲",
    "city": "تهران",
    "province": "تهران",
    "postalCode": "1985831234",
    "isDefault": true
  }'
```

**نتیجه:**
```json
{
  "id": 1,
  "title": "خانه",
  "recipientName": "علی احمدی",
  "phone": "09121234567",
  "address": "تهران، خیابان ولیعصر، بن بست ۲۲",
  "city": "تهران",
  "province": "تهران",
  "postalCode": "1985831234",
  "isDefault": true,
  "createdAt": "2026-02-07T10:30:00Z",
  "updatedAt": "2026-02-07T10:30:00Z"
}
```

### 2. دریافت تمام آدرس‌ها
```bash
curl -X GET http://localhost:3000/profile/addresses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**نتیجه:**
```json
[
  {
    "id": 1,
    "title": "خانه",
    "recipientName": "علی احمدی",
    "isDefault": true,
    ...
  },
  {
    "id": 2,
    "title": "محل کار",
    "recipientName": "علی احمدی",
    "isDefault": false,
    ...
  }
]
```

### 3. دریافت آدرس پیش‌فرض
```bash
curl -X GET http://localhost:3000/profile/addresses/default \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. بروزرسانی آدرس
```bash
curl -X PATCH http://localhost:3000/profile/addresses/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "خانه جدید",
    "phone": "09129999999"
  }'
```

### 5. تنظیم آدرس پیش‌فرض
```bash
curl -X PATCH http://localhost:3000/profile/addresses/2/set-default \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. حذف آدرس
```bash
curl -X DELETE http://localhost:3000/profile/addresses/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## سناریوهای عملی

### سناریو 1: کاربر جدید می‌خواهد فوری آدرس اضافه کند
```typescript
// 1. ثبت نام کاربر
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "محمد"
}

// 2. بلافاصله آدرس اضافه میشود (پروفایل خودکار)
POST /profile/addresses
{
  "title": "آدرس اول",
  "recipientName": "محمد",
  ...
}
// ✅ موفق: پروفایل خودکار ایجاد شده
```

### سناریو 2: کاربر با پروفایل موجود
```typescript
// 1. پروفایل موجود است
User.id = 5
UserProfile.id = 3
UserProfile.userId = 5

// 2. آدرس جدید اضافه میشود
POST /profile/addresses

// ✅ نتیجه:
Address {
  userId: 5,           // ارتباط مستقیم با کاربر
  userProfileId: 3     // ارتباط با پروفایل
}
```

### سناریو 3: حذف آدرس پیش‌فرض
```typescript
// آدرس 1: isDefault = true
// آدرس 2: isDefault = false
// آدرس 3: isDefault = false

DELETE /profile/addresses/1

// ✅ نتیجه:
// آدرس 2 خودکار به isDefault = true تغییر می‌یابد
```

---

## کد مثال - استفاده در TypeScript

### مثال 1: ایجاد آدرس
```typescript
import { Injectable } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressUsageExample {
  constructor(private profileService: UserProfileService) {}

  async createNewAddress(userId: number, dto: CreateAddressDto) {
    // سرویس خودکار:
    // 1. بررسی وجود کاربر
    // 2. ایجاد پروفایل اگر نیاز باشد
    // 3. ایجاد آدرس
    const address = await this.profileService.addAddress(userId, dto);
    return address;
  }
}
```

### مثال 2: مدیریت آدرس‌ها
```typescript
async manageAddresses(userId: number) {
  // دریافت تمام آدرس‌ها
  const allAddresses = await this.profileService.getAddresses(userId);
  
  // دریافت آدرس پیش‌فرض
  const defaultAddress = await this.profileService.getDefaultAddress(userId);
  
  // تنظیم آدرس جدید به عنوان پیش‌فرض
  await this.profileService.setDefaultAddress(userId, 5);
  
  // بروزرسانی آدرس
  await this.profileService.updateAddress(userId, 5, {
    phone: '09999999999'
  });
  
  // حذف آدرس
  await this.profileService.removeAddress(userId, 5);
}
```

---

## خطاهای رایج و حل‌ها

### ❌ خطا: "Profile not found"
**قبل:** وقتی کاربر پروفایل نداشت
**حالا:** خودکار ایجاد می‌شود ✅

### ❌ خطا: "Address not found or not owned by user"
**علت:** آدرس متعلق به کاربر دیگری است
**حل:** بررسی کنید ID آدرس صحیح است

### ❌ خطا: "User not found"
**علت:** `userId` معتبر نیست
**حل:** بررسی توکن JWT خود

---

## Query مثال - دیتابیس

### تمام آدرس‌های کاربر
```sql
SELECT * FROM addresses WHERE "userId" = 5;
```

### آدرس پیش‌فرض
```sql
SELECT * FROM addresses WHERE "userId" = 5 AND "isDefault" = true LIMIT 1;
```

### آدرس‌هایی که پروفایل ندارند
```sql
SELECT * FROM addresses WHERE "userProfileId" IS NULL;
```

### حذف تمام آدرس‌های کاربر (cascade)
```sql
DELETE FROM users WHERE id = 5;
-- تمام addresses و user_profile خودکار حذف می‌شوند
```

---

## نکات مهم ⚠️

1. **JWT Authentication الزامی است**: تمام endpoints نیاز به token دارند
2. **Cascade Delete**: حذف کاربر، تمام آدرس‌های او را حذف می‌کند
3. **تنها یک آدرس پیش‌فرض**: هنگام تنظیم پیش‌فرض، سایر آدرس‌ها تلقائی غیرفعال می‌شوند
4. **متقاضی در ترتیب**: آدرس‌ها براساس `isDefault` (نزولی) و سپس `createdAt` مرتب می‌شوند
5. **پروفایل خودکار**: اگرپروفایل نداشت، بصورت خودکار بدون داده اضافی ایجاد می‌شود

