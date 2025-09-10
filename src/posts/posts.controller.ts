import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin', 'editor')
  @Post()
  create(@Body() dto: CreatePostDto, @Request() req) {
    return this.postsService.create(dto, req.user.id);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.postsService.findOne(id);
  }
}
