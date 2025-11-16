import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SellerOfferService } from './seller-offer.service';
import { CreateSellerOfferDto } from './dto/create-seller-offer.dto';
import { UpdateSellerOfferDto } from './dto/update-seller-offer.dto';

@ApiTags('Seller Offers')
@Controller('seller-offers')
export class SellerOfferController {
  constructor(private readonly sellerOfferService: SellerOfferService) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد پیشنهاد جدید توسط فروشنده' })
  @ApiResponse({
    status: 201,
    description: 'پیشنهاد با موفقیت ایجاد شد',
  })
  @ApiResponse({
    status: 404,
    description: 'فروشنده یا محصول یافت نشد',
  })
  @ApiResponse({
    status: 409,
    description: 'پیشنهاد تکراری است',
  })
  async create(@Body() createDto: CreateSellerOfferDto) {
    return await this.sellerOfferService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'دریافت تمام پیشنهادات' })
  @ApiResponse({
    status: 200,
    description: 'لیست تمام پیشنهادات',
  })
  async findAll() {
    return await this.sellerOfferService.findAll();
  }

  @Get('seller/:sellerId')
  @ApiOperation({ summary: 'دریافت پیشنهادات یک فروشنده' })
  @ApiParam({ name: 'sellerId', description: 'شناسه فروشنده' })
  @ApiResponse({
    status: 200,
    description: 'لیست پیشنهادات فروشنده',
  })
  async findBySeller(@Param('sellerId', ParseIntPipe) sellerId: number) {
    return await this.sellerOfferService.findBySeller(sellerId);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'دریافت پیشنهادات یک محصول' })
  @ApiParam({ name: 'productId', description: 'شناسه محصول' })
  @ApiResponse({
    status: 200,
    description: 'لیست پیشنهادات محصول (مرتب شده بر اساس قیمت)',
  })
  async findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return await this.sellerOfferService.findByProduct(productId);
  }

  @Get('variant/:variantId')
  @ApiOperation({ summary: 'دریافت پیشنهادات حاوی یک variant value' })
  @ApiParam({ name: 'variantId', description: 'شناسه variant value' })
  @ApiResponse({
    status: 200,
    description: 'لیست پیشنهادات (مرتب شده بر اساس قیمت)',
  })
  async findByVariantValue(@Param('variantId', ParseIntPipe) variantValueId: number) {
    return await this.sellerOfferService.findByVariantValue(variantValueId);
  }

  @Get('best-offer')
  @ApiOperation({ summary: 'دریافت بهترین پیشنهاد (ارزان‌ترین با موجودی)' })
  @ApiQuery({
    name: 'productId',
    required: false,
    description: 'شناسه محصول',
  })
  @ApiQuery({
    name: 'variantValueIds',
    required: false,
    description: 'شناسه‌های variant values (کاما‌جدا‌شده)',
  })
  @ApiResponse({
    status: 200,
    description: 'بهترین پیشنهاد برای محصول یا variant values',
  })
  async findBestOffer(
    @Query('productId') productId?: string,
    @Query('variantValueIds') variantValueIds?: string,
  ) {
    const variantValueIdsArray = variantValueIds
      ? variantValueIds.split(',').map((id) => +id)
      : undefined;

    return await this.sellerOfferService.findBestOffer(
      productId ? +productId : undefined,
      variantValueIdsArray,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک پیشنهاد' })
  @ApiParam({ name: 'id', description: 'شناسه پیشنهاد' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات پیشنهاد',
  })
  @ApiResponse({
    status: 404,
    description: 'پیشنهاد یافت نشد',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.sellerOfferService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'بروزرسانی پیشنهاد' })
  @ApiParam({ name: 'id', description: 'شناسه پیشنهاد' })
  @ApiResponse({
    status: 200,
    description: 'پیشنهاد با موفقیت بروزرسانی شد',
  })
  @ApiResponse({
    status: 404,
    description: 'پیشنهاد یافت نشد',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSellerOfferDto,
  ) {
    return await this.sellerOfferService.update(id, updateDto);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'بروزرسانی موجودی' })
  @ApiParam({ name: 'id', description: 'شناسه پیشنهاد' })
  @ApiResponse({
    status: 200,
    description: 'موجودی بروزرسانی شد',
  })
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('stock', ParseIntPipe) stock: number,
  ) {
    return await this.sellerOfferService.updateStock(id, stock);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'فعال/غیرفعال کردن پیشنهاد' })
  @ApiParam({ name: 'id', description: 'شناسه پیشنهاد' })
  @ApiResponse({
    status: 200,
    description: 'وضعیت پیشنهاد تغییر کرد',
  })
  async toggleActive(@Param('id', ParseIntPipe) id: number) {
    return await this.sellerOfferService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف پیشنهاد' })
  @ApiParam({ name: 'id', description: 'شناسه پیشنهاد' })
  @ApiResponse({
    status: 204,
    description: 'پیشنهاد حذف شد',
  })
  @ApiResponse({
    status: 404,
    description: 'پیشنهاد یافت نشد',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.sellerOfferService.remove(id);
  }
}
