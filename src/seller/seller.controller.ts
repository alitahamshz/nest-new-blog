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
import { SellerService } from './seller.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { SellerResponseDto } from './dto/seller-response.dto';
import { plainToClass } from 'class-transformer';

@ApiTags('Sellers')
@Controller('sellers')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Post()
  @ApiOperation({ summary: 'ثبت‌نام فروشنده جدید' })
  @ApiResponse({
    status: 201,
    description: 'فروشنده با موفقیت ایجاد شد',
    type: SellerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'کاربر یافت نشد',
  })
  @ApiResponse({
    status: 409,
    description: 'کاربر قبلاً به عنوان فروشنده ثبت شده است',
  })
  async create(@Body() createDto: CreateSellerDto) {
    const seller = await this.sellerService.create(createDto);
    return plainToClass(SellerResponseDto, seller, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'دریافت لیست فروشندگان' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    description: 'نمایش فروشندگان غیرفعال',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'لیست فروشندگان',
    type: [SellerResponseDto],
  })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const sellers = await this.sellerService.findAll(
      includeInactive === 'true',
    );
    return sellers.map((seller) =>
      plainToClass(SellerResponseDto, seller, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'دریافت اطلاعات فروشنده بر اساس شناسه کاربر' })
  @ApiParam({ name: 'userId', description: 'شناسه کاربر' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات فروشنده',
    type: SellerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'فروشنده یافت نشد',
  })
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    const seller = await this.sellerService.findByUserId(userId);
    if (!seller) {
      return null;
    }
    return plainToClass(SellerResponseDto, seller, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت اطلاعات یک فروشنده' })
  @ApiParam({ name: 'id', description: 'شناسه فروشنده' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات فروشنده',
    type: SellerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'فروشنده یافت نشد',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const seller = await this.sellerService.findOne(id);
    return plainToClass(SellerResponseDto, seller, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'بروزرسانی اطلاعات فروشنده' })
  @ApiParam({ name: 'id', description: 'شناسه فروشنده' })
  @ApiResponse({
    status: 200,
    description: 'فروشنده با موفقیت بروزرسانی شد',
    type: SellerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'فروشنده یافت نشد',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSellerDto,
  ) {
    const seller = await this.sellerService.update(id, updateDto);
    return plainToClass(SellerResponseDto, seller, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'فعال/غیرفعال کردن فروشنده' })
  @ApiParam({ name: 'id', description: 'شناسه فروشنده' })
  @ApiResponse({
    status: 200,
    description: 'وضعیت فروشنده تغییر کرد',
    type: SellerResponseDto,
  })
  async toggleActive(@Param('id', ParseIntPipe) id: number) {
    const seller = await this.sellerService.toggleActive(id);
    return plainToClass(SellerResponseDto, seller, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/rating')
  @ApiOperation({ summary: 'بروزرسانی امتیاز فروشنده' })
  @ApiParam({ name: 'id', description: 'شناسه فروشنده' })
  @ApiResponse({
    status: 200,
    description: 'امتیاز فروشنده بروزرسانی شد',
  })
  async updateRating(
    @Param('id', ParseIntPipe) id: number,
    @Body('rating', ParseIntPipe) rating: number,
  ) {
    return await this.sellerService.updateRating(id, rating);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'غیرفعال کردن فروشنده (soft delete)' })
  @ApiParam({ name: 'id', description: 'شناسه فروشنده' })
  @ApiResponse({
    status: 204,
    description: 'فروشنده غیرفعال شد',
  })
  @ApiResponse({
    status: 404,
    description: 'فروشنده یافت نشد',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.sellerService.remove(id);
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف کامل فروشنده (فقط ادمین)' })
  @ApiParam({ name: 'id', description: 'شناسه فروشنده' })
  @ApiResponse({
    status: 204,
    description: 'فروشنده حذف شد',
  })
  async hardDelete(@Param('id', ParseIntPipe) id: number) {
    await this.sellerService.hardDelete(id);
  }
}
