// src/posts/posts.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post, PostStatus } from './entities/post.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../category/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostsDto } from './dto/filter-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Create post.
   * - برای فیلدهای اختیاری مقدار پیش‌فرض می‌ذاریم تا خطای تایپ پیش نیاد
   */
  async create(dto: CreatePostDto, authorId: number): Promise<Post> {
    // basic checks
    if (!dto.title || !dto.slug || !dto.content) {
      throw new BadRequestException('title, slug and content are required');
    }

    const post = this.postRepo.create();

    post.title = dto.title;
    post.slug = dto.slug;
    post.seo_title = dto.seoTitle ?? '';
    post.meta_description = dto.metaDescription ?? '';
    post.excerpt = dto.excerpt ?? '';
    post.content = dto.content ?? '';
    post.status = dto.status ?? PostStatus.DRAFT;

    // tags (if provided)
    if (dto.tags && Array.isArray(dto.tags) && dto.tags.length > 0) {
      post.tags = await this.tagRepo.find({
        where: { id: In(dto.tags) },
      });
    } else {
      post.tags = [];
    }

    // category (if provided)
    if (dto.category_id !== undefined && dto.category_id !== null) {
      const category = await this.categoryRepo.findOne({
        where: { id: dto.category_id },
      });
      if (!category) throw new NotFoundException('Category not found');
      post.category = category;
    } else {
      post.category = null;
    }

    // thumbnail & coverImage (support both camelCase and snake_case from client)
    // client ممکنه thumbnail یا thumbnail_url یا cover_image بفرسته
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const anyDto: any = dto as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    post.thumbnail = anyDto.thumbnail ?? anyDto.thumbnail_url ?? '';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    post.cover_image = anyDto.coverImage ?? anyDto.cover_image ?? '';

    // author
    const author = await this.userRepo.findOne({ where: { id: authorId } });
    if (!author) throw new NotFoundException('Author not found');
    post.author = author;

    return this.postRepo.save(post);
  }

  /**
   * Update post.
   * - فقط فیلدهایی رو که در dto ارسال شده تغییر میدیم.
   */
  async update(id: number, dto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['tags', 'category', 'author'],
    });
    if (!post) throw new NotFoundException('Post not found');

    // update only provided fields
    if (dto.title !== undefined) post.title = dto.title;
    if (dto.slug !== undefined) post.slug = dto.slug;
    if (dto.seo_title !== undefined) post.seo_title = dto.seo_title;
    if (dto.meta_description !== undefined)
      post.meta_description = dto.meta_description;
    if (dto.excerpt !== undefined) post.excerpt = dto.excerpt;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.status !== undefined) post.status = dto.status;

    // tags: if dto.tags is provided (even empty array) -> update association
    if (dto.tags !== undefined) {
      if (Array.isArray(dto.tags) && dto.tags.length > 0) {
        post.tags = await this.tagRepo.find({
          where: { id: In(dto.tags) },
        });
      } else {
        // empty array means remove all tags
        post.tags = [];
      }
    }

    // category: allow setting to null (remove category)
    if (dto.category_id !== undefined) {
      if (dto.category_id === null) {
        post.category = null;
      } else {
        const category = await this.categoryRepo.findOne({
          where: { id: dto.category_id },
        });
        if (!category) throw new NotFoundException('Category not found');
        post.category = category;
      }
    }

    // thumbnail & coverImage
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const anyDto: any = dto as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (anyDto.thumbnail !== undefined || anyDto.thumbnail_url !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      post.thumbnail =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        anyDto.thumbnail ?? anyDto.thumbnail_url ?? post.thumbnail;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (anyDto.coverImage !== undefined || anyDto.cover_image !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,
      post.cover_image =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        anyDto.coverImage ?? anyDto.cover_image ?? post.cover_image;
    }

    return this.postRepo.save(post);
  }

  async findAll(filterDto: FilterPostsDto) {
    const { page = 1, limit = 10, title, author, status } = filterDto;

    const query = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags')
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (title) {
      query.andWhere('post.title ILIKE :title', { title: `%${title}%` });
    }

    if (author) {
      query.andWhere('author.name ILIKE :author', { author: `%${author}%` });
    }

    if (status) {
      query.andWhere('post.status = :status', { status });
    }

    const [items, total] = await query.getManyAndCount();

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author', 'tags', 'category'],
    });
    if (!post) throw new NotFoundException('Post not found');
    await this.postRepo.increment({ id }, 'views', 1);
    return post;
  }

  async remove(id: number): Promise<{ message: string }> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    await this.postRepo.delete(id);
    return { message: 'Post deleted' };
  }
}
