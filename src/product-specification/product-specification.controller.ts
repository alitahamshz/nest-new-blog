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
import { ProductSpecificationService } from './product-specification.service';
import {
  CreateProductSpecificationDto,
  UpdateProductSpecificationDto,
} from './dto';

@ApiTags('Product Specifications')
@Controller('products/:productId/specifications')
export class ProductSpecificationController {
  constructor(
    private readonly specificationService: ProductSpecificationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد مشخصات جدید برای محصول' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiResponse({
    status: 201,
    description: 'مشخصات با موفقیت ایجاد شد',
  })
  async create(
    @Param('productId') productId: string,
    @Body() createDto: CreateProductSpecificationDto,
  ) {
    return await this.specificationService.create(+productId, createDto);
  }

  @Post('batch')
  @ApiOperation({ summary: 'ایجاد چندین مشخصات یکجا برای محصول' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiResponse({
    status: 201,
    description: 'مشخصات با موفقیت ایجاد شدند',
  })
  async createMany(
    @Param('productId') productId: string,
    @Body() createDtos: CreateProductSpecificationDto[],
  ) {
    return await this.specificationService.createMany(+productId, createDtos);
  }

  @Get()
  @ApiOperation({ summary: 'دریافت تمام مشخصات یک محصول' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiResponse({
    status: 200,
    description: 'لیست مشخصات محصول',
  })
  async findAll(@Param('productId') productId: string) {
    return await this.specificationService.findAllByProduct(+productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک مشخصات با شناسه' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiParam({ name: 'id', description: 'شناسه مشخصات' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات مشخصات',
  })
  @ApiResponse({
    status: 404,
    description: 'مشخصات یافت نشد',
  })
  async findOne(@Param('id') id: string) {
    return await this.specificationService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'بروزرسانی مشخصات' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiParam({ name: 'id', description: 'شناسه مشخصات' })
  @ApiResponse({
    status: 200,
    description: 'مشخصات با موفقیت بروزرسانی شد',
  })
  @ApiResponse({
    status: 404,
    description: 'مشخصات یافت نشد',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductSpecificationDto,
  ) {
    return await this.specificationService.update(+id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف یک مشخصات' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiParam({ name: 'id', description: 'شناسه مشخصات' })
  @ApiResponse({
    status: 204,
    description: 'مشخصات با موفقیت حذف شد',
  })
  @ApiResponse({
    status: 404,
    description: 'مشخصات یافت نشد',
  })
  async remove(@Param('id') id: string) {
    await this.specificationService.remove(+id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف تمام مشخصات یک محصول' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiResponse({
    status: 204,
    description: 'تمام مشخصات محصول با موفقیت حذف شدند',
  })
  async removeAll(@Param('productId') productId: string) {
    await this.specificationService.removeAllByProduct(+productId);
  }

  @Post('replace')
  @ApiOperation({ summary: 'جایگزینی کامل مشخصات یک محصول' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiResponse({
    status: 200,
    description: 'مشخصات با موفقیت جایگزین شدند',
  })
  async replaceAll(
    @Param('productId') productId: string,
    @Body() createDtos: CreateProductSpecificationDto[],
  ) {
    return await this.specificationService.replaceAll(+productId, createDtos);
  }
}
