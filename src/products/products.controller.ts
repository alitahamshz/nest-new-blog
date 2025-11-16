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

  @Get()
  @ApiOperation({ summary: 'دریافت لیست تمام محصولات با صفحه‌بندی' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'شماره صفحه (پیش‌فرض: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'تعداد اقلام در هر صفحه (پیش‌فرض: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'لیست محصولات با صفحه‌بندی',
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return await this.productsService.findAll(page || 1, limit || 10);
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف محصول' })
  @ApiParam({ name: 'id', description: 'شناسه محصول' })
  @ApiResponse({
    status: 204,
    description: 'محصول با موفقیت حذف شد',
  })
  @ApiResponse({
    status: 404,
    description: 'محصول یافت نشد',
  })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(+id);
  }
}
