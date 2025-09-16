/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PostsService } from './posts.service';
import { FilterPostsDto } from './dto/filter-post.dto';
import { GetPostsByCategoriesDto } from './dto/filter-names.dto';

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
  findFiveLatest(@Param('take', ParseIntPipe) take: number) {
    return this.postsService.findLatestPosts(take);
  }

  @Get('multi/category')
  findByCategories(@Query() query: GetPostsByCategoriesDto) {
    console.log('Route hit, query:', query);

    if (!query.names || query.names.length === 0) {
      return { success: false, message: 'حداقل یک دسته لازم است', data: null };
    }

    return this.postsService.findLast10ByCategories(query.names);
  }

  @Get('slug/:slug')
  findPostBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }
}
