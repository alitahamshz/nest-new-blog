import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto, SortBy } from './dto/filter-products.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد محصول جدید' })
  @ApiResponse({
    status: 201,
    description: 'محصول با موفقیت ایجاد شد',
  })
  @ApiResponse({
    status: 400,
    description: 'داده‌های ارسالی نامعتبر است',
  })
  @ApiResponse({
    status: 404,
    description: 'دسته‌بندی یا تگ یافت نشد',
  })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get('search')
  @ApiOperation({
    summary:
      'جستجوی محصول و دسته‌بندی - صفحه‌بندی فقط برای محصولات، دسته‌بندی‌ها بدون صفحه‌بندی',
    description:
      'جستجو بر اساس کلیدواژه در نام محصول و دسته‌بندی. نتایج محصولات فقط شامل محصولاتی هستند که حداقل یک آفر فروشنده دارند. محصولات صفحه‌بندی شده‌اند اما دسته‌بندی‌ها همه نتایج را بدون صفحه‌بندی برمی‌گردانند.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'متن جستجو (نام محصول یا دسته‌بندی)',
    example: 'گوشی',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'شماره صفحه برای محصولات فقط (پیش‌فرض: 1)',
    example: 1,
    type: 'integer',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'تعداد نتایج محصولات در هر صفحه (پیش‌فرض: 20)',
    example: 20,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description:
      'نتایج جستجو - محصولات دارای صفحه‌بندی و دسته‌بندی‌ها بدون صفحه‌بندی',
    schema: {
      example: {
        products: {
          data: [
            {
              id: 1,
              name: 'گوشی هوشمند نوکیا',
              slug: 'nokia-smartphone',
              mainImage: 'https://...',
              description: 'توضیحات...',
              sku: 'NOKIA-001',
              categoryPath: [
                {
                  id: 1,
                  name: 'الکترونیک',
                  slug: 'electronics',
                  icon: null,
                },
                {
                  id: 2,
                  name: 'تلفن همراه',
                  slug: 'mobile',
                  icon: null,
                },
              ],
              offerCount: 3,
              minPrice: 5000000,
              maxPrice: 7500000,
            },
          ],
          total: 15,
          page: 1,
          limit: 20,
        },
        categories: {
          data: [
            {
              id: 2,
              name: 'تلفن همراه',
              slug: 'mobile',
              icon: null,
              categoryPath: [
                {
                  id: 1,
                  name: 'الکترونیک',
                  slug: 'electronics',
                  icon: null,
                },
                {
                  id: 2,
                  name: 'تلفن همراه',
                  slug: 'mobile',
                  icon: null,
                },
              ],
              productCount: 245,
            },
          ],
          total: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'کلیدواژه‌ی جستجو خالی است',
  })
  async search(
    @Query('q') query?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    if (!query || query.trim().length === 0) {
      return {
        products: {
          data: [],
          total: 0,
          page: page || 1,
          limit: limit || 20,
        },
        categories: {
          data: [],
          total: 0,
        },
      };
    }

    return await this.productsService.searchCombined(
      query.trim(),
      page || 1,
      limit || 20,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'دریافت لیست تمام محصولات با فیلتر‌های پیشرفته و صفحه‌بندی',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'شماره صفحه (پیش‌فرض: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'تعداد اقلام در هر صفحه (پیش‌فرض: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'جستجو در نام محصول یا توضیحات',
  })
  @ApiQuery({
    name: 'sku',
    required: false,
    description: 'جستجو در کد محصول',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'فیلتر بر اساس شناسه دسته (شامل تمام دسته‌های فرزند)',
    type: Number,
  })
  @ApiQuery({
    name: 'tagIds',
    required: false,
    description: 'فیلتر بر اساس تگ‌ها (فرمت: "1,2,3")',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'حداقل قیمت',
    type: Number,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'حداکثر قیمت',
    type: Number,
  })
  @ApiQuery({
    name: 'sellerIds',
    required: false,
    description: 'فیلتر بر اساس فروشنده (فرمت: "1,2,3")',
  })
  @ApiQuery({
    name: 'inStockOnly',
    required: false,
    description: 'فقط محصولات موجود در انبار (true/false)',
    type: Boolean,
  })
  @ApiQuery({
    name: 'discountedOnly',
    required: false,
    description: 'فقط محصولات با تخفیف (true/false)',
    type: Boolean,
  })
  @ApiQuery({
    name: 'hasWarrantyOnly',
    required: false,
    description: 'فقط محصولات دارای گارانتی (true/false)',
    type: Boolean,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description:
      'ترتیب نتایج: newest|price_low|price_high|popular|rating|discount',
    enum: SortBy,
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'فیلتر بر اساس وضعیت فعال (true/false)',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'لیست محصولات با صفحه‌بندی',
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('sku') sku?: string,
    @Query('categoryId', new ParseIntPipe({ optional: true }))
    categoryId?: number,
    @Query('tagIds') tagIds?: string,
    @Query('minPrice', new ParseIntPipe({ optional: true }))
    minPrice?: number,
    @Query('maxPrice', new ParseIntPipe({ optional: true }))
    maxPrice?: number,
    @Query('sellerIds') sellerIds?: string,
    @Query('inStockOnly') inStockOnly?: string,
    @Query('discountedOnly') discountedOnly?: string,
    @Query('hasWarrantyOnly') hasWarrantyOnly?: string,
    @Query('sortBy') sortBy?: SortBy,
    @Query('minRating', new ParseIntPipe({ optional: true }))
    minRating?: number,
    @Query('isActive') isActive?: string,
  ) {
    const filterDto: FilterProductsDto = {
      page: page || 1,
      limit: limit || 10,
      search: search || undefined,
      sku: sku || undefined,
      categoryId,
      tagIds,
      minPrice,
      maxPrice,
      sellerIds,
      inStockOnly:
        inStockOnly === 'true'
          ? true
          : inStockOnly === 'false'
            ? false
            : undefined,
      discountedOnly:
        discountedOnly === 'true'
          ? true
          : discountedOnly === 'false'
            ? false
            : undefined,
      hasWarrantyOnly:
        hasWarrantyOnly === 'true'
          ? true
          : hasWarrantyOnly === 'false'
            ? false
            : undefined,
      sortBy: sortBy || SortBy.NEWEST,
      minRating,
      isActive: isActive === 'false' ? false : true,
    };

    return this.productsService.findAllWithFilters(filterDto);
  }

  @Get('all')
  @ApiOperation({
    summary:
      'دریافت تمام محصولات (بدون فیلتر offers) - برای Dashboard فروشندگان',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'شماره صفحه (پیش‌فرض: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'تعداد اقلام در هر صفحه (پیش‌فرض: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'جستجو در نام محصول',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'فیلتر بر اساس دسته‌بندی',
    type: Number,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'ترتیب: newest|price_low|price_high|popular',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'فیلتر وضعیت (true/false)',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'تمام محصولات (شامل آنهایی بدون offer)',
  })
  async findAllUnfiltered(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('categoryId', new ParseIntPipe({ optional: true }))
    categoryId?: number,
    @Query('sortBy') sortBy?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBoolean =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    return this.productsService.findAllProducts(
      page || 1,
      limit || 10,
      search,
      categoryId,
      isActiveBoolean,
      sortBy,
    );
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'دریافت محصولات یک دسته‌بندی' })
  @ApiParam({ name: 'categoryId', description: 'شناسه دسته‌بندی' })
  @ApiResponse({
    status: 200,
    description: 'لیست محصولات دسته‌بندی',
  })
  async findByCategory(@Param('categoryId') categoryId: string) {
    return await this.productsService.findByCategory(+categoryId);
  }

  @Get('tag/:tagId')
  @ApiOperation({ summary: 'دریافت محصولات با تگ خاص' })
  @ApiParam({ name: 'tagId', description: 'شناسه تگ' })
  @ApiResponse({
    status: 200,
    description: 'لیست محصولات با این تگ',
  })
  async findByTag(@Param('tagId') tagId: string) {
    return await this.productsService.findByTag(+tagId);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'دریافت محصول با slug' })
  @ApiParam({ name: 'slug', description: 'Slug محصول' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات محصول',
  })
  @ApiResponse({
    status: 404,
    description: 'محصول یافت نشد',
  })
  async findBySlug(@Param('slug') slug: string) {
    return await this.productsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک محصول با شناسه' })
  @ApiParam({ name: 'id', description: 'شناسه محصول' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات محصول',
  })
  @ApiResponse({
    status: 404,
    description: 'محصول یافت نشد',
  })
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'بروزرسانی محصول' })
  @ApiParam({ name: 'id', description: 'شناسه محصول' })
  @ApiResponse({
    status: 200,
    description: 'محصول با موفقیت بروزرسانی شد',
  })
  @ApiResponse({
    status: 404,
    description: 'محصول یافت نشد',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(+id, updateProductDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'غیرفعال کردن محصول' })
  @ApiParam({ name: 'id', description: 'شناسه محصول' })
  @ApiResponse({
    status: 200,
    description: 'محصول غیرفعال شد',
  })
  async deactivate(@Param('id') id: string) {
    return await this.productsService.deactivate(+id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'فعال کردن محصول' })
  @ApiParam({ name: 'id', description: 'شناسه محصول' })
  @ApiResponse({
    status: 200,
    description: 'محصول فعال شد',
  })
  async activate(@Param('id') id: string) {
    return await this.productsService.activate(+id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف محصول' })
  @ApiParam({ name: 'id', description: 'شناسه محصول' })
  @ApiResponse({
    status: 200,
    description: 'محصول با موفقیت حذف شد',
  })
  @ApiResponse({
    status: 404,
    description: 'محصول یافت نشد',
  })
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(+id);
  }
}
