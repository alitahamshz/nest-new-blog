import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategorySpecTemplate } from '../entities/category-spec-template.entity';
import { CategorySpecTemplateService } from './category-spec-template.service';
import { CategorySpecTemplateController } from './category-spec-template.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategorySpecTemplate])],
  controllers: [CategorySpecTemplateController],
  providers: [CategorySpecTemplateService],
  exports: [CategorySpecTemplateService],
})
export class CategorySpecTemplateModule {}
