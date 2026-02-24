import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CategorySpecTemplateService } from './category-spec-template.service';
import { CreateCategorySpecTemplateDto } from './dto/create-category-spec-template.dto';
import { UpdateCategorySpecTemplateDto } from './dto/update-category-spec-template.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';

@ApiTags('Category Spec Templates')
@Controller('category-spec-templates')
export class CategorySpecTemplateController {
  constructor(private readonly service: CategorySpecTemplateService) {}

  // --- Admin endpoints ---

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'ایجاد قالب ویژگی برای دسته‌بندی' })
  create(@Body() dto: CreateCategorySpecTemplateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'ویرایش قالب ویژگی' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategorySpecTemplateDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'حذف قالب ویژگی' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // --- Public endpoint (فرانت فیلتر + فرم محصول) ---

  @Get('by-category/:categoryId')
  @ApiOperation({ summary: 'گرفتن قالب‌های ویژگی یک دسته‌بندی' })
  @ApiQuery({ name: 'filterableOnly', required: false, type: Boolean })
  findByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('filterableOnly') filterableOnly?: string,
  ) {
    return this.service.findByCategory(
      categoryId,
      filterableOnly === 'true',
    );
  }
}
