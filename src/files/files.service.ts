// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { FileEntity } from '../entities/file.entity';
// import { unlinkSync } from 'fs';
// import { join } from 'path';

// @Injectable()
// export class FilesService {
//   constructor(
//     @InjectRepository(FileEntity)
//     private readonly fileRepository: Repository<FileEntity>,
//   ) {}

//   async saveFile(file: Express.Multer.File, basePath : string): Promise<FileEntity> {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = (now.getMonth() + 1).toString().padStart(2, '0');

//     const newFile = this.fileRepository.create({
//       filename: file.filename,
//       path: `uploads/${year}/${month}/${file.filename}`,
//       url: `https://khoobit.ir/uploads/${year}/${month}/${file.filename}`, // بعداً میشه دامین اصلی
//       mimeType: file.mimetype,
//       size: file.size,
//     });
//     return this.fileRepository.save(newFile);
//   }

//   async findAll(): Promise<FileEntity[]> {
//     return this.fileRepository.find({
//       order: { createdAt: 'DESC' },
//     });
//   }

//   async remove(id: number): Promise<{ message: string }> {
//     const file = await this.fileRepository.findOneBy({ id });
//     if (!file) throw new NotFoundException('File not found');

//     // حذف از هارد
//     try {
//       unlinkSync(join('/var/www/blog_uploads', file.path)); //مسیر واقعی فایل ها
//     } catch (err) {
//       console.error('File delete error:', err.message);
//     }

//     await this.fileRepository.delete(id);
//     return { message: 'File deleted successfully' };
//   }
// }

// backend/src/files/files.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '../entities/file.entity';
import { unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async saveFile(
    file: Express.Multer.File,
    basePath: string,
  ): Promise<FileEntity> {
    // Get relative path: e.g., '2023/12/image.jpg'
    const relativePath = file.path
      .replace(basePath + '/', '')
      .replace(/\\/g, '/');

    const newFile = this.fileRepository.create({
      filename: file.filename,
      path: relativePath, // Store the RELATIVE path in the database
      url: `${process.env.APP_URL}/uploads/${relativePath}`, // Construct full URL
      mimeType: file.mimetype,
      size: file.size,
    });
    return this.fileRepository.save(newFile);
  }

  /**
   * Save file with local path (for development/testing)
   * Stores files in project's uploads/ folder with correct relative paths
   */
  async saveFileLocal(
    file: Express.Multer.File,
    basePath: string,
  ): Promise<FileEntity> {
    // Extract relative path from full path (e.g., 'uploads/2025/11/filename.jpg')
    const relativePath = file.path
      .replace(basePath, 'uploads')
      .replace(/\\/g, '/');

    const newFile = this.fileRepository.create({
      filename: file.filename,
      path: relativePath,
      url: `${process.env.APP_URL}/${relativePath}`, // Local URL without double /uploads
      mimeType: file.mimetype,
      size: file.size,
    });
    return this.fileRepository.save(newFile);
  }

  async findAll(): Promise<FileEntity[]> {
    return this.fileRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: number): Promise<{ message: 'File deleted successfully' }> {
    const file = await this.fileRepository.findOneBy({ id });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const uploadPathBase = process.env.UPLOADS_DESTINATION || '/app/uploads';
    const fullPath = join(uploadPathBase, file.path);

    try {
      unlinkSync(fullPath);
    } catch (err) {
      console.error(
        'File delete error:',
        err instanceof Error ? err.message : String(err),
      );
      // You might not want to throw an error here, just log it.
    }

    await this.fileRepository.delete(id);
    return { message: 'File deleted successfully' };
  }
}
