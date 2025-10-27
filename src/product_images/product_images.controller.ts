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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
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

  /**
   * آپلود یک تصویر برای محصول
   */
  @Post('upload/:productId')
  @ApiOperation({ summary: 'آپلود تصویر محصول' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        isMain: {
          type: 'boolean',
          default: false,
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const now = new Date();
          const year = now.getFullYear();
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const uploadPath = process.env.UPLOADS_DESTINATION || '/app/uploads';
          const fullPath = `${uploadPath}/${year}/${month}`;

          // ایجاد پوشه اگر وجود نداشته باشد
          if (!existsSync(fullPath)) {
            mkdirSync(fullPath, { recursive: true });
          }

          cb(null, fullPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `product-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('isMain') isMain?: string,
  ) {
    const isMainBool = isMain === 'true';
    return this.productImagesService.uploadImage(productId, file, isMainBool);
  }

  /**
   * آپلود چندین تصویر یکجا
   */
  @Post('upload-multiple/:productId')
  @ApiOperation({ summary: 'آپلود چندین تصویر برای محصول' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const now = new Date();
          const year = now.getFullYear();
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const uploadPath = process.env.UPLOADS_DESTINATION || '/app/uploads';
          const fullPath = `${uploadPath}/${year}/${month}`;

          if (existsSync(fullPath)) {
            mkdirSync(fullPath, { recursive: true });
          }

          cb(null, fullPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `product-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
      },
    }),
  )
  async uploadMultipleImages(
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productImagesService.uploadMultipleImages(productId, files);
  }
}
