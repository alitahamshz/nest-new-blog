import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { AdminTagsController, TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from '../entities/tag.entity';
import { Post } from 'src/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, Post])],
  controllers: [TagsController, AdminTagsController],
  providers: [TagsService],
})
export class TagsModule {}
