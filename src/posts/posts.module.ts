import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Tag,User, Category])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
