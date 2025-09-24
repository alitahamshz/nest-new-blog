import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Comment } from 'src/entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateCommentDto, userId: number): Promise<Comment> {
    const post = await this.postsRepo.findOne({ where: { id: dto.postId } });
    if (!post) throw new NotFoundException('Post not found');

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let parent: Comment | null = null;
    if (dto.parentId) {
      parent = await this.commentsRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    const comment = this.commentsRepo.create({
      content: dto.content,
      post,
      author: user,
      parent,
    });

    // 👇 صراحتاً مشخص می‌کنیم که خروجی یک کامنت تکی هست
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
        parent: IsNull(), // فقط ریشه‌ها (کامنت‌های سطح بالا)
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

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentsRepo.findOne({
      where: { id },
      relations: ['author', 'post', 'parent', 'children'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async update(id: number, dto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.content = dto.content ?? comment.content;
    return this.commentsRepo.save(comment);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.findOne(id);
    await this.commentsRepo.remove(comment);
  }
}
