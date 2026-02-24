import { PartialType } from '@nestjs/swagger';
import { CreateCategorySpecTemplateDto } from './create-category-spec-template.dto';

export class UpdateCategorySpecTemplateDto extends PartialType(
  CreateCategorySpecTemplateDto,
) {}
