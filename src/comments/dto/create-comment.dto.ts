// src/comments/dto/create-comment.dto.ts
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'نظر خیلی خوب بود 👌' })
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  postId: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}
