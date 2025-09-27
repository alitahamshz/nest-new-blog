// import {
//   Controller,
//   Post,
//   Get,
//   Delete,
//   Param,
//   UploadedFile,
//   UseInterceptors,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { FilesService } from './files.service';
// import { diskStorage } from 'multer';
// import { extname } from 'path';
// import { ApiTags } from '@nestjs/swagger';
// import { existsSync, mkdirSync } from 'fs';

// function getUploadPath() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = (now.getMonth() + 1).toString().padStart(2, '0');
//   return `/app/uploads/${year}/${month}`; // مسیر واقعی
// }

// @Controller('files')
// export class FilesController {
//   constructor(private readonly filesService: FilesService) {}

//   @ApiTags('upload')
//   @Post('upload')
//   @UseInterceptors(
//     FileInterceptor('file', {
//       storage: diskStorage({
//         destination: (req, file, cb) => {
//           const uploadPath = getUploadPath();
//           cb(null, uploadPath);
//           // ایجاد پوشه در صورت عدم وجود
//           if (!existsSync(uploadPath)) {
//             mkdirSync(uploadPath, { recursive: true });
//           }
//         },
//         filename: (req, file, cb) => {
//           const uniqueSuffix =
//             Date.now() + '-' + Math.round(Math.random() * 1e9);
//           cb(null, uniqueSuffix + extname(file.originalname));
//         },
//       }),
//     }),
//   )
//   async uploadFile(@UploadedFile() file: Express.Multer.File) {
//     return this.filesService.saveFile(file, '/app/uploads');
//   }

//   @Get()
//   async findAll() {
//     return this.filesService.findAll();
//   }

//   @Delete(':id')
//   async remove(@Param('id') id: number) {
//     return this.filesService.remove(id);
//   }
// }

// backend/src/files/files.controller.ts

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'fs';
import { Roles } from 'src/auth/guards/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

// Get the base upload path from environment variables. Default to '/app/uploads' if not set.
const UPLOAD_PATH_BASE = process.env.UPLOADS_DESTINATION || '/app/uploads';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const now = new Date();
          const year = now.getFullYear();
          const month = (now.getMonth() + 1).toString().padStart(2, '0');

          // Construct the full dynamic path
          const uploadPath = join(UPLOAD_PATH_BASE, year.toString(), month);

          // Create directory if it doesn't exist
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
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
    // Pass the base path to the service
    return this.filesService.saveFile(file, UPLOAD_PATH_BASE);
  }

  @Get()
  async findAll() {
    return this.filesService.findAll();
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.filesService.remove(+id);
  }
}
