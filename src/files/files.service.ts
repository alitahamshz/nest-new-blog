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
import { DataSource, Repository } from 'typeorm';
import { FileEntity } from '../entities/file.entity';
import { unlinkSync } from 'fs';
import { join } from 'path';

export type FileWithUsage = FileEntity & { isUsed: boolean };

export interface PaginatedFiles {
  data: FileWithUsage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly dataSource: DataSource,
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

  private readonly USED_URLS_SUBQUERY = `
    SELECT url FROM (
      SELECT thumbnail   AS url FROM posts                     WHERE thumbnail   IS NOT NULL
      UNION
      SELECT cover_image AS url FROM posts                     WHERE cover_image IS NOT NULL
      UNION
      SELECT "mainImage" AS url FROM products                  WHERE "mainImage" IS NOT NULL
      UNION
      SELECT url                FROM product_images
      UNION
      SELECT image       AS url FROM product_variants          WHERE image       IS NOT NULL
      UNION
      SELECT image       AS url FROM product_variant_values    WHERE image       IS NOT NULL
    ) AS t
  `;

  async findAll(
    page = 1,
    limit = 20,
    isUsed?: boolean,
  ): Promise<PaginatedFiles> {
    const skip = (page - 1) * limit;

    if (isUsed === undefined) {
      // بدون فیلتر — همه فایل‌ها + annotate isUsed
      const [files, total] = await this.fileRepository.findAndCount({
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      if (files.length === 0) {
        return { data: [], total, page, limit, totalPages: 0 };
      }

      const urls = files.map((f) => f.url);
      const usedRows = await this.dataSource.query<{ url: string }[]>(
        `SELECT DISTINCT url FROM (${this.USED_URLS_SUBQUERY}) AS all_used WHERE url = ANY($1)`,
        [urls],
      );
      const usedSet = new Set(usedRows.map((r) => r.url));

      return {
        data: files.map((f) => ({ ...f, isUsed: usedSet.has(f.url) })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    // فیلتر بر اساس isUsed
    const inOrNot = isUsed ? 'IN' : 'NOT IN';
    const countResult = await this.dataSource.query<[{ count: string }]>(
      `SELECT COUNT(*) FROM files WHERE url ${inOrNot} (${this.USED_URLS_SUBQUERY})`,
    );
    const total = parseInt(countResult[0].count, 10);

    const rows = await this.dataSource.query<FileEntity[]>(
      `SELECT * FROM files WHERE url ${inOrNot} (${this.USED_URLS_SUBQUERY})
       ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`,
      [limit, skip],
    );

    return {
      data: rows.map((f) => ({ ...f, isUsed })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async remove(id: number): Promise<{ message: 'File deleted successfully' }> {
    const file = await this.fileRepository.findOneBy({ id });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    // اگر path با "uploads/" شروع شه، فایل لوکال است (saveFileLocal)
    // پس مسیر واقعی = process.cwd() + path
    // اگر نه، فایل داکر است (saveFile) = UPLOADS_DESTINATION + path
    let fullPath: string;
    if (file.path.startsWith('uploads/') || file.path.startsWith('uploads\\')) {
      fullPath = join(process.cwd(), file.path);
    } else {
      const uploadPathBase = process.env.UPLOADS_DESTINATION || '/app/uploads';
      fullPath = join(uploadPathBase, file.path);
    }

    try {
      unlinkSync(fullPath);
    } catch (err) {
      // لاگ کن ولی ادامه بده تا رکورد از DB حذف بشه
      console.error(
        `File delete error [${fullPath}]:`,
        err instanceof Error ? err.message : String(err),
      );
    }

    await this.fileRepository.delete(id);
    return { message: 'File deleted successfully' };
  }

  async removeByUrl(url: string): Promise<{ message: 'File deleted successfully' }> {
    const file = await this.fileRepository.findOneBy({ url });
    if (!file) {
      // فایل در دیتابیس نیست — با خیال راحت ignore کن
      return { message: 'File deleted successfully' };
    }
    return this.remove(file.id);
  }
}
