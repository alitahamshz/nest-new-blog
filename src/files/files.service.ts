/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

  async saveFile(file: Express.Multer.File): Promise<FileEntity> {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    const newFile = this.fileRepository.create({
      filename: file.filename,
      path: `uploads/${year}/${month}/${file.filename}`,
      url: `https://khoobit.ir/uploads/${year}/${month}/${file.filename}`, // بعداً میشه دامین اصلی
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

  async remove(id: number): Promise<{ message: string }> {
    const file = await this.fileRepository.findOneBy({ id });
    if (!file) throw new NotFoundException('File not found');

    // حذف از هارد
    try {
      unlinkSync(join('/var/www/blog_uploads', file.path)); //مسیر واقعی فایل ها
    } catch (err) {
      console.error('File delete error:', err.message);
    }

    await this.fileRepository.delete(id);
    return { message: 'File deleted successfully' };
  }
}
