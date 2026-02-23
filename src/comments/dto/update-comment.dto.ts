import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';
import { CommentStatus } from 'src/entities/comment.entity';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiPropertyOptional({ enum: CommentStatus, example: CommentStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;
}
