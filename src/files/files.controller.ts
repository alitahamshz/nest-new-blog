import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'fs';

function getUploadPath() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `/var/www/blog_uploads/${year}/${month}`; // مسیر واقعی
}

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiTags('upload')
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = getUploadPath();
          cb(null, uploadPath);
          // ایجاد پوشه در صورت عدم وجود
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.saveFile(file);
  }

  @Get()
  async findAll() {
    return this.filesService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.filesService.remove(id);
  }
}
