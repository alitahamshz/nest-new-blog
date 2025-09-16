// src/posts/posts.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Post, PostStatus } from './entities/post.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../category/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostsDto } from './dto/filter-post.dto';
import { TreeRepository } from 'typeorm';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>, // برای کوئری‌های معمولی

    @InjectRepository(Category)
    private readonly treeCategoryRepo: TreeRepository<Category>, // برای متدهای tree

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
    post.seo_title = dto.seo_title ?? '';
    post.meta_description = dto.meta_description ?? '';
    post.excerpt = dto.excerpt ?? '';
    post.content = dto.content ?? '';
    post.inner_tags = dto.inner_tags ?? [];
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
    post.thumbnail = anyDto.thumbnail ?? '';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    post.cover_image = anyDto.cover_image ?? '';

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
    if (dto.inner_tags !== undefined) post.inner_tags = dto.inner_tags;
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
    await this.postRepo.increment({ id }, 'view_count', 1);
    return post;
  }

  async remove(id: number): Promise<{ message: string }> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    await this.postRepo.delete(id);
    return { message: 'Post deleted' };
  }

  async findLatestPosts(take: number) {
    const posts = await this.postRepo.find({
      relations: ['category'],
      order: { createdAt: 'DESC' }, // مرتب‌سازی بر اساس تاریخ ایجاد
      take: take, // فقط ۵ مورد آخر
    });

    if (!posts.length) throw new NotFoundException('مطلبی یافت نشد!');
    return posts;
  }

  async findLast10ByCategory(en_name: string) {
    return this.postRepo.find({
      relations: ['category'],
      where: { category: { en_name } },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async findLast10ByCategories(en_names: string[]) {
    const posts = await this.postRepo.find({
      relations: ['category'],
      where: { category: { en_name: In(en_names) } },
      order: { createdAt: 'DESC' },
    });

    // خروجی به شکل [{ category: 'hair', posts: [...] }, ...]
    return en_names.map((name) => ({
      category: name,
      posts: posts.filter((p) => p.category?.en_name === name).slice(0, 10),
    }));
  }

  async findLast5PostsByParentCategories() {
    // ۱. گرفتن همه‌ی دسته‌بندی‌های والد
    const parentCategories = await this.categoryRepo.find({
      where: { parent: IsNull() },
    });

    // ۲. گرفتن ۵ پست آخر برای هر دسته والد
    const result: Record<string, Post[]> = {};
    for (const parent of parentCategories) {
      const posts = await this.postRepo.find({
        where: { category: { id: parent.id } },
        relations: ['category'],
        order: { createdAt: 'DESC' },
        take: 10,
      });
      result[parent.name || parent.slug] = posts;
    }

    return result;
  }

  // async findBySlug(slug: string): Promise<Post> {
  //   const post = await this.postRepo.findOne({
  //     where: { slug },
  //     relations: ['category'], // اگر میخوای دسته‌بندی هم بیاد
  //   });

  //   if (!post) {
  //     throw new NotFoundException(`پست با slug "${slug}" پیدا نشد`);
  //   }
  //   // await this.postRepo.increment({ id }, 'view_count', 1);
  //   return post;
  // }

  async getCategoryBreadcrumb(categoryId: number) {
    // treeCategoryRepo از نوع TreeRepository<Category> هست
    const category = await this.treeCategoryRepo.findOne({
      where: { id: categoryId },
    });
    if (!category) return [];

    // همه والدها تا ریشه
    const ancestors = await this.treeCategoryRepo.findAncestors(category);

    // خروجی: آرایه‌ای از دسته‌ها از ریشه تا خود دسته
    // مثلا: [مو, آرایش مو, برس]
    return ancestors;
  }

  async findBySlug(slug: string) {
    const post = await this.postRepo.findOne({
      where: { slug },
      relations: ['category'],
    });
    if (!post) throw new NotFoundException('Post not found');
    // افزایش بازدید
    await this.postRepo.increment({ id: post.id }, 'view_count', 1);
    // breadcrumb
    let breadcrumb: Category[] = [];
    if (post.category) {
      breadcrumb = await this.getCategoryBreadcrumb(post.category.id);
    }

    return {
      ...post,
      breadcrumb, // اینو به فرانت می‌فرستی
    };
  }
}
