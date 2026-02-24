// src/comments/dto/create-comment.dto.ts
import { IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'نظر خیلی خوب بود 👌' })
  @IsNotEmpty()
  content: string;

  /** شناسه پست (برای کامنت پست) */
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  postId?: number;

  /** شناسه محصول (برای کامنت محصول) */
  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsNumber()
  productId?: number;

  /** امتیاز ۱ تا ۵ — فقط برای محصول */
  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  /** ارسال به عنوان ناشناس */
  @ApiProperty({ example: false, required: false })
  @IsOptional()
  isAnonymous?: boolean;
}
