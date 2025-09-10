// src/tags/tag.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  private generateSlug(name: string): string {
    return slugify(name, { lower: true, strict: true });
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    let slug = dto.slug || this.generateSlug(dto.name);
    const tag = this.tagRepository.create({ ...dto, slug });
    return this.tagRepository.save(tag);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find();
  }

  async findOne(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async update(id: number, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);
    Object.assign(tag, dto);
    if (dto.name && !dto.slug) {
      tag.slug = this.generateSlug(dto.name);
    }
    return this.tagRepository.save(tag);
  }

  async remove(id: number): Promise<void> {
    await this.tagRepository.delete(id);
  }
}
