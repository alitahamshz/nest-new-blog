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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductImagesService } from './product_images.service';
import { CreateProductImageDto } from './dto/create-product_image.dto';
import { UpdateProductImageDto } from './dto/update-product_image.dto';

@ApiTags('Product Images')
@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Post()
  @ApiOperation({ summary: 'افزودن تصویر جدید به گالری محصول' })
  @ApiResponse({
    status: 201,
    description: 'تصویر با موفقیت افزوده شد',
  })
  @ApiResponse({
    status: 404,
    description: 'محصول یافت نشد',
  })
  async create(@Body() createDto: CreateProductImageDto) {
    return await this.productImagesService.create(createDto);
  }

  @Post('batch/:productId')
  @ApiOperation({ summary: 'افزودن چندین تصویر یکجا' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiResponse({
    status: 201,
    description: 'تصاویر با موفقیت افزوده شدند',
  })
  async createMany(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() createDtos: CreateProductImageDto[],
  ) {
    return await this.productImagesService.createMany(productId, createDtos);
  }

  @Get()
  @ApiOperation({ summary: 'دریافت تمام تصاویر' })
  @ApiResponse({
    status: 200,
    description: 'لیست تمام تصاویر',
  })
  async findAll() {
    return await this.productImagesService.findAll();
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'دریافت تصاویر یک محصول' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiResponse({
    status: 200,
    description: 'لیست تصاویر محصول',
  })
  async findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return await this.productImagesService.findByProduct(productId);
  }

  @Get('product/:productId/main')
  @ApiOperation({ summary: 'دریافت تصویر اصلی محصول' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiResponse({
    status: 200,
    description: 'تصویر اصلی محصول',
  })
  async findMainImage(@Param('productId', ParseIntPipe) productId: number) {
    return await this.productImagesService.findMainImage(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک تصویر' })
  @ApiParam({ name: 'id', description: 'شناسه تصویر' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات تصویر',
  })
  @ApiResponse({
    status: 404,
    description: 'تصویر یافت نشد',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productImagesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'بروزرسانی تصویر' })
  @ApiParam({ name: 'id', description: 'شناسه تصویر' })
  @ApiResponse({
    status: 200,
    description: 'تصویر با موفقیت بروزرسانی شد',
  })
  @ApiResponse({
    status: 404,
    description: 'تصویر یافت نشد',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductImageDto,
  ) {
    return await this.productImagesService.update(id, updateDto);
  }

  @Patch(':id/set-main')
  @ApiOperation({ summary: 'تنظیم تصویر به عنوان تصویر اصلی' })
  @ApiParam({ name: 'id', description: 'شناسه تصویر' })
  @ApiResponse({
    status: 200,
    description: 'تصویر به عنوان اصلی تنظیم شد',
  })
  async setMainImage(@Param('id', ParseIntPipe) id: number) {
    return await this.productImagesService.setMainImage(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف تصویر' })
  @ApiParam({ name: 'id', description: 'شناسه تصویر' })
  @ApiResponse({
    status: 204,
    description: 'تصویر حذف شد',
  })
  @ApiResponse({
    status: 404,
    description: 'تصویر یافت نشد',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productImagesService.remove(id);
  }

  @Delete('product/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف تمام تصاویر یک محصول' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiResponse({
    status: 204,
    description: 'تمام تصاویر محصول حذف شدند',
  })
  async removeByProduct(@Param('productId', ParseIntPipe) productId: number) {
    await this.productImagesService.removeByProduct(productId);
  }
}
