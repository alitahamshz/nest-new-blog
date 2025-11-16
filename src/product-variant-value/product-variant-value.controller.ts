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
import { ProductVariantValueService } from './product-variant-value.service';
import { CreateProductVariantValueDto } from './dto/create-product-variant-value.dto';
import { UpdateProductVariantValueDto } from './dto/update-product-variant-value.dto';

@ApiTags('Product Variant Values')
@Controller('product-variant-values')
export class ProductVariantValueController {
  constructor(
    private readonly variantValueService: ProductVariantValueService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد مقدار جدید برای واریانت' })
  @ApiResponse({
    status: 201,
    description: 'مقدار با موفقیت ایجاد شد',
  })
  @ApiResponse({
    status: 404,
    description: 'واریانت یافت نشد',
  })
  async create(@Body() createDto: CreateProductVariantValueDto) {
    return await this.variantValueService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'دریافت تمام مقادیر' })
  @ApiResponse({
    status: 200,
    description: 'لیست تمام مقادیر',
  })
  async findAll() {
    return await this.variantValueService.findAll();
  }

  @Get('variant/:variantId')
  @ApiOperation({ summary: 'دریافت مقادیر یک واریانت' })
  @ApiParam({ name: 'variantId', description: 'شناسه واریانت' })
  @ApiResponse({
    status: 200,
    description: 'لیست مقادیر واریانت',
  })
  async findByVariant(@Param('variantId') variantId: string) {
    return await this.variantValueService.findByVariant(+variantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک مقدار' })
  @ApiParam({ name: 'id', description: 'شناسه مقدار' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات مقدار',
  })
  @ApiResponse({
    status: 404,
    description: 'مقدار یافت نشد',
  })
  async findOne(@Param('id') id: string) {
    return await this.variantValueService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'بروزرسانی مقدار' })
  @ApiParam({ name: 'id', description: 'شناسه مقدار' })
  @ApiResponse({
    status: 200,
    description: 'مقدار با موفقیت بروزرسانی شد',
  })
  @ApiResponse({
    status: 404,
    description: 'مقدار یافت نشد',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductVariantValueDto,
  ) {
    return await this.variantValueService.update(+id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف مقدار' })
  @ApiParam({ name: 'id', description: 'شناسه مقدار' })
  @ApiResponse({
    status: 204,
    description: 'مقدار با موفقیت حذف شد',
  })
  @ApiResponse({
    status: 404,
    description: 'مقدار یافت نشد',
  })
  async remove(@Param('id') id: string) {
    await this.variantValueService.remove(+id);
  }
}
