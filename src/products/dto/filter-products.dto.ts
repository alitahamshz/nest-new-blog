import {
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SortBy {
  NEWEST = 'newest', // جدیدترین
  PRICE_LOW = 'price_low', // ارزان‌ترین
  PRICE_HIGH = 'price_high', // گران‌ترین
  POPULAR = 'popular', // پرفروش‌ترین
  RATING = 'rating', // بهترین امتیاز
  DISCOUNT = 'discount', // بیشترین تخفیف
}

export class FilterProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  // جستجو
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  // فیلتر دسته‌بندی
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  // فیلتر تگ‌ها (می‌تواند چندتایی باشد)
  @IsOptional()
  @Type(() => String)
  @IsString()
  tagIds?: string; // "1,2,3" فرmat

  // فیلتر بازه قیمت (بر اساس بهترین قیمت بین فروشندگان)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  // فیلتر فروشنده
  @IsOptional()
  @Type(() => String)
  @IsString()
  sellerIds?: string; // "1,2,3" format

  // فقط محصولات موجود در انبار
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStockOnly?: boolean;

  // فقط محصولات دارای تخفیف
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  discountedOnly?: boolean;

  // فیلتر وضعیت محصول
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean = true;

  // ترتیب نتایج
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.NEWEST;

  // حداقل امتیاز دهی (برای محصولاتی که system رتینگ دارند)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRating?: number;

  // فقط محصولات دارای warranty
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasWarrantyOnly?: boolean;
}
