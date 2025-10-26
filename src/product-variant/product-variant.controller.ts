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
import { ProductVariantService } from './product-variant.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@ApiTags('Product Variants')
@Controller('product-variants')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد واریانت جدید برای محصول' })
  @ApiResponse({
    status: 201,
    description: 'واریانت با موفقیت ایجاد شد',
  })
  @ApiResponse({
    status: 404,
    description: 'محصول یافت نشد یا hasVariant فعال نیست',
  })
  async create(@Body() createDto: CreateProductVariantDto) {
    return await this.productVariantService.create(createDto);
  }

  @Post('batch/:productId')
  @ApiOperation({ summary: 'ایجاد چندین واریانت یکجا برای یک محصول' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiResponse({
    status: 201,
    description: 'واریانت‌ها با موفقیت ایجاد شدند',
  })
  async createMany(
    @Param('productId') productId: string,
    @Body() createDtos: CreateProductVariantDto[],
  ) {
    return await this.productVariantService.createMany(+productId, createDtos);
  }

  @Get()
  @ApiOperation({ summary: 'دریافت تمام واریانت‌ها' })
  @ApiResponse({
    status: 200,
    description: 'لیست تمام واریانت‌ها',
  })
  async findAll() {
    return await this.productVariantService.findAll();
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'دریافت واریانت‌های یک محصول' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiResponse({
    status: 200,
    description: 'لیست واریانت‌های محصول',
  })
  async findByProduct(@Param('productId') productId: string) {
    return await this.productVariantService.findByProduct(+productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک واریانت' })
  @ApiParam({ name: 'id', description: 'شناسه واریانت' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات واریانت',
  })
  @ApiResponse({
    status: 404,
    description: 'واریانت یافت نشد',
  })
  async findOne(@Param('id') id: string) {
    return await this.productVariantService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'بروزرسانی واریانت' })
  @ApiParam({ name: 'id', description: 'شناسه واریانت' })
  @ApiResponse({
    status: 200,
    description: 'واریانت با موفقیت بروزرسانی شد',
  })
  @ApiResponse({
    status: 404,
    description: 'واریانت یافت نشد',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductVariantDto,
  ) {
    return await this.productVariantService.update(+id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف واریانت' })
  @ApiParam({ name: 'id', description: 'شناسه واریانت' })
  @ApiResponse({
    status: 204,
    description: 'واریانت با موفقیت حذف شد',
  })
  @ApiResponse({
    status: 404,
    description: 'واریانت یافت نشد یا دارای آفر است',
  })
  async remove(@Param('id') id: string) {
    await this.productVariantService.remove(+id);
  }

  @Delete('product/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف تمام واریانت‌های یک محصول' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiResponse({
    status: 204,
    description: 'تمام واریانت‌های محصول حذف شدند',
  })
  async removeByProduct(@Param('productId') productId: string) {
    await this.productVariantService.removeByProduct(+productId);
  }
}
