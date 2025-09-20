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
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard) // 👈 فقط یوزر لاگین کرده می‌تونه کامنت بذاره
  @Post()
  @ApiBearerAuth('access-token') // 👈 به Swagger میگه از توکن استفاده کن
  @UseInterceptors(ClassSerializerInterceptor)
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request & { user: { id: number } },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = req.user.id; // 👈 از JWT استخراج میشه
    return this.commentsService.create(createCommentDto, userId);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(@Query('postId') postId: number) {
    return this.commentsService.findAll(Number(postId));
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  remove(@Param('id') id: string) {
    return this.commentsService.remove(+id);
  }
}
