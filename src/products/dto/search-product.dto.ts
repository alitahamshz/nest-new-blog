import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsString()
  query: string;
}

// DTO برای تاج دسته (مسیر کامل دسته از ریشه تا فرزند)
export class CategoryPathDto {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

// DTO برای نتیجه جستجوی محصول
export class SearchProductResultDto {
  id: number;
  name: string;
  slug: string;
  mainImage?: string;
  description?: string;
  sku?: string;

  // مسیر کامل دسته‌بندی از ریشه تا فرزند
  categoryPath: CategoryPathDto[];

  // تعداد آفرهای فروشنده
  offerCount: number;

  // کمترین قیمت در میان آفرهای فروشنده
  minPrice?: number;

  // بیشترین قیمت در میان آفرهای فروشنده
  maxPrice?: number;
}

// DTO برای نتیجه جستجوی دسته‌بندی
export class SearchCategoryResultDto {
  id: number;
  name: string;
  slug: string;
  icon?: string;

  // مسیر کامل دسته‌بندی از ریشه تا این دسته (شامل خود دسته)
  categoryPath: CategoryPathDto[];

  // تعداد محصولات در این دسته و تمام فرزندان آن
  productCount: number;
}

// DTO برای پاسخ جستجو (محصولات و دسته‌بندی‌ها)
export class SearchResponseDto {
  products: {
    data: SearchProductResultDto[];
    total: number;
    page: number;
    limit: number;
  };

  categories: {
    data: SearchCategoryResultDto[];
    total: number;
  };
}

// برای backward compatibility
export class SearchProductResponseDto {
  data: SearchProductResultDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
