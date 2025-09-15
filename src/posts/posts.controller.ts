import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Delete,
  Patch,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
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

  @Get()
  findAll(@Query() filterDto: FilterPostsDto) {
    return this.postsService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.postsService.findOne(+id);
  }

@Get('category/:en_name')
findByCategory(@Param('en_name') en_name: string) {
  return this.postsService.findLast10ByCategory(en_name);
}
@Get('latest/:take')
findFiveLatest(@Param('take', ParseIntPipe) take : number) {
  return this.postsService.findLatestPosts(take);
}

@Get('cat/*path')
findByCategories(@Query('names') names?: string) {
  console.log("Route hit");
  if (!names) return []; // یا BadRequest
  const en_names = names.split(',');
  return this.postsService.findLast10ByCategories(en_names);
}

}

@Controller('admin/posts')
export class AdminPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiBearerAuth('access-token') // 👈 به Swagger میگه از توکن استفاده کن
  // @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreatePostDto, @Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.postsService.create(dto, req.user.id);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiBearerAuth('access-token') // 👈 به Swagger میگه از توکن استفاده کن
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(+id, dto);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiBearerAuth('access-token') // 👈 به Swagger میگه از توکن استفاده کن
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(@Query() filterDto: FilterPostsDto) {
    return this.postsService.findAll(filterDto);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.postsService.findOne(+id);
  }
}
