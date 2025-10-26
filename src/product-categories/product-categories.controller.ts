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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@ApiTags('Product Categories')
@Controller('product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد دسته‌بندی محصول جدید' })
  @ApiResponse({
    status: 201,
    description: 'دسته‌بندی با موفقیت ایجاد شد',
  })
  @ApiResponse({
    status: 404,
    description: 'دسته‌بندی والد یافت نشد',
  })
  async create(@Body() createDto: CreateProductCategoryDto) {
    return await this.productCategoriesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'دریافت تمام دسته‌بندی‌ها به صورت درختی' })
  @ApiResponse({
    status: 200,
    description: 'ساختار درختی دسته‌بندی‌ها',
  })
  async findAllTree() {
    return await this.productCategoriesService.findAll();
  }

  @Get('flat')
  @ApiOperation({ summary: 'دریافت تمام دسته‌بندی‌ها به صورت لیست مسطح' })
  @ApiResponse({
    status: 200,
    description: 'لیست مسطح دسته‌بندی‌ها',
  })
  async findAllFlat(): Promise<any[]> {
    return await this.productCategoriesService.findAllFlat();
  }

  @Get('parents')
  @ApiOperation({ summary: 'دریافت فقط دسته‌بندی‌های والد' })
  @ApiResponse({
    status: 200,
    description: 'لیست دسته‌بندی‌های والد',
  })
  async findParents() {
    return await this.productCategoriesService.findParents();
  }

  @Get('parents/products/count')
  @ApiOperation({ summary: 'دریافت دسته‌بندی‌های والد با تعداد محصولات' })
  @ApiResponse({
    status: 200,
    description: 'لیست دسته‌بندی‌های والد به همراه تعداد محصولات',
  })
  async findParentsWithProductCount() {
    return await this.productCategoriesService.findParentCategoriesWithProductCount();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'دریافت دسته‌بندی با slug' })
  @ApiParam({ name: 'slug', description: 'Slug دسته‌بندی' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات دسته‌بندی',
  })
  @ApiResponse({
    status: 404,
    description: 'دسته‌بندی یافت نشد',
  })
  async findBySlug(@Param('slug') slug: string) {
    return await this.productCategoriesService.findBySlug(slug);
  }

  @Get('route/:slug')
  @ApiOperation({ summary: 'دریافت مسیر کامل دسته‌بندی (breadcrumb)' })
  @ApiParam({ name: 'slug', description: 'Slug دسته‌بندی' })
  @ApiResponse({
    status: 200,
    description: 'مسیر کامل دسته‌بندی',
  })
  async findCategoryRoute(@Param('slug') slug: string) {
    return await this.productCategoriesService.findCategoryRoute(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک دسته‌بندی با شناسه' })
  @ApiParam({ name: 'id', description: 'شناسه دسته‌بندی' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات دسته‌بندی',
  })
  @ApiResponse({
    status: 404,
    description: 'دسته‌بندی یافت نشد',
  })
  async findOne(@Param('id') id: string) {
    return await this.productCategoriesService.findOne(+id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'دریافت فرزندان یک دسته‌بندی' })
  @ApiParam({ name: 'id', description: 'شناسه دسته‌بندی' })
  @ApiResponse({
    status: 200,
    description: 'لیست فرزندان',
  })
  @ApiResponse({
    status: 404,
    description: 'دسته‌بندی یافت نشد',
  })
  async findChildren(@Param('id') id: string) {
    return await this.productCategoriesService.findChildren(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'بروزرسانی دسته‌بندی' })
  @ApiParam({ name: 'id', description: 'شناسه دسته‌بندی' })
  @ApiResponse({
    status: 200,
    description: 'دسته‌بندی با موفقیت بروزرسانی شد',
  })
  @ApiResponse({
    status: 404,
    description: 'دسته‌بندی یافت نشد',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductCategoryDto,
  ) {
    return await this.productCategoriesService.update(+id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف دسته‌بندی' })
  @ApiParam({ name: 'id', description: 'شناسه دسته‌بندی' })
  @ApiResponse({
    status: 204,
    description: 'دسته‌بندی با موفقیت حذف شد',
  })
  @ApiResponse({
    status: 404,
    description: 'دسته‌بندی یافت نشد یا دارای زیرمجموعه/محصول است',
  })
  async remove(@Param('id') id: string) {
    await this.productCategoriesService.remove(+id);
  }
}
