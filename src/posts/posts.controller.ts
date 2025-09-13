import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete, Patch, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostsDto } from './dto/filter-post.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin', 'editor')
  @Post()
  @ApiBearerAuth('access-token')  // 👈 به Swagger میگه از توکن استفاده کن
  @UseGuards(JwtAuthGuard)
  
  create(@Body() dto: CreatePostDto, @Request() req) {
    return this.postsService.create(dto, req.user.id);
  }
  
  @Get()
  findAll(@Query() filterDto: FilterPostsDto) {
    return this.postsService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')  // 👈 به Swagger میگه از توکن استفاده کن
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
  return this.postsService.update(+id, dto);
}


@Delete(':id')
@ApiBearerAuth('access-token')  // 👈 به Swagger میگه از توکن استفاده کن
@UseGuards(JwtAuthGuard)
remove(@Param('id') id: string) {
  return this.postsService.remove(+id);
}
}
