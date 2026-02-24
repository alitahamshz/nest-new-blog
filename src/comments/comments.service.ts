import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Comment, CommentStatus } from 'src/entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  async create(dto: CreateCommentDto, userId: number): Promise<Comment> {
    if (!dto.postId && !dto.productId) {
      throw new BadRequestException('postId ÛŒØ§ productId Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª');
    }

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let post: Post | null = null;
    let product: Product | null = null;

    if (dto.postId) {
      post = await this.postsRepo.findOne({ where: { id: dto.postId } });
      if (!post) throw new NotFoundException('Post not found');
    }

    if (dto.productId) {
      product = await this.productsRepo.findOne({ where: { id: dto.productId } });
      if (!product) throw new NotFoundException('Product not found');
    }

    let parent: Comment | null = null;
    if (dto.parentId) {
      parent = await this.commentsRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    const comment = this.commentsRepo.create({
      content: dto.content,
      post,
      product,
      author: user,
      parent,
      rating: dto.rating ?? null,
      isAnonymous: dto.isAnonymous ?? false,
    });

    return this.commentsRepo.save(comment);
  }

  async findAll(
    postId: number,
    page = 1,
    limit = 10,
  ): Promise<{ data: Comment[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.commentsRepo.findAndCount({
      where: {
        post: { id: postId },
        parent: IsNull(),
        status: CommentStatus.CONFIRMED,
      },
      relations: [
        'author',
        'children',
        'children.author',
        'children.children',
        'children.children.author',
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const filterChildren = (comments: Comment[]): Comment[] =>
      comments
        .filter((c) => c.status === CommentStatus.CONFIRMED)
        .map((c) => ({
          ...c,
          children: c.children ? filterChildren(c.children) : [],
        }));

    return {
      data: filterChildren(data),
      total,
      page,
      limit,
    };
  }

  /** Ú©Ø§Ù…Ù†Øªâ€ŒÙ‡Ø§ÛŒ ØªØ§ÛŒÛŒØ¯â€ŒØ´Ø¯Ù‡ ÛŒÚ© Ù…Ø­ØµÙˆÙ„ */
  async findByProduct(
    productId: number,
    page = 1,
    limit = 10,
  ): Promise<{ data: Comment[]; total: number; page: number; limit: number; avgRating: number | null }> {
    const [data, total] = await this.commentsRepo.findAndCount({
      where: {
        product: { id: productId },
        parent: IsNull(),
        status: CommentStatus.CONFIRMED,
      },
      relations: ['author', 'children', 'children.author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Ù…ÛŒØ§Ù†Ú¯ÛŒÙ† Ø§Ù…ØªÛŒØ§Ø²
    const ratingResult = await this.commentsRepo
      .createQueryBuilder('c')
      .select('AVG(c.rating)', 'avg')
      .where('c.productId = :productId', { productId })
      .andWhere('c.status = :status', { status: CommentStatus.CONFIRMED })
      .andWhere('c.rating IS NOT NULL')
      .getRawOne<{ avg: string }>();

    const avgRating = ratingResult?.avg ? parseFloat(ratingResult.avg) : null;

    const filterChildren = (comments: Comment[]): Comment[] =>
      comments
        .filter((c) => c.status === CommentStatus.CONFIRMED)
        .map((c) => ({ ...c, children: c.children ? filterChildren(c.children) : [] }));

    return { data: filterChildren(data), total, page, limit, avgRating };
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentsRepo.findOne({
      where: { id },
      relations: ['author', 'post', 'product', 'parent', 'children'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async update(id: number, dto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findOne(id);
    if (dto.content !== undefined) comment.content = dto.content;
    if (dto.status !== undefined) comment.status = dto.status;
    return this.commentsRepo.save(comment);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.findOne(id);
    await this.commentsRepo.remove(comment);
  }

  // â”€â”€â”€ Admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async findAllAdmin(
    page = 1,
    limit = 10,
    status?: CommentStatus,
    type?: 'post' | 'product',
  ): Promise<{
    data: Comment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const qb = this.commentsRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.product', 'product');

    if (status) qb.andWhere('comment.status = :status', { status });
    if (type === 'post') qb.andWhere('comment.postId IS NOT NULL');
    if (type === 'product') qb.andWhere('comment.productId IS NOT NULL');

    qb.orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(id: number, status: CommentStatus): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.status = status;
    return this.commentsRepo.save(comment);
  }
}
