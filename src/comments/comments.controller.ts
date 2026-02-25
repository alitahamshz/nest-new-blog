import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/guards/roles.decorator';
import { Request } from 'express';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CommentStatus } from 'src/entities/comment.entity';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('access-token')
  @UseInterceptors(ClassSerializerInterceptor)
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request & { user: { id: number } },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = req.user.id;
    return this.commentsService.create(createCommentDto, userId);
  }

  @Get()
  @ApiQuery({ name: 'postId', required: true, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(
    @Query('postId') postId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.commentsService.findAll(Number(postId), Number(page), Number(limit));
  }

  /** دریافت کامنت‌های تایید‌شده یک محصول */
  @Get('product/:productId')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UseInterceptors(ClassSerializerInterceptor)
  findByProduct(
    @Param('productId') productId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.commentsService.findByProduct(
      Number(productId),
      Number(page),
      Number(limit),
    );
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/all')
  @ApiBearerAuth('access-token')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: CommentStatus })
  @ApiQuery({ name: 'type', required: false, enum: ['post', 'product'] })
  @UseInterceptors(ClassSerializerInterceptor)
  findAllAdmin(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: CommentStatus,
    @Query('type') type?: 'post' | 'product',
  ) {
    return this.commentsService.findAllAdmin(
      Number(page),
      Number(limit),
      status,
      type,
    );
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @UseInterceptors(ClassSerializerInterceptor)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: CommentStatus,
  ) {
    return this.commentsService.updateStatus(+id, status);
  }

  // ─────────────────────────────────────────────────────────────────────────

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseInterceptors(ClassSerializerInterceptor)
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(+id, updateCommentDto);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  remove(@Param('id') id: string) {
    return this.commentsService.remove(+id);
  }
}
