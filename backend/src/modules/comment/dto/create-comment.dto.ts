import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: '评论内容' })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @ApiProperty({ required: false, description: '父评论 ID（回复时使用）' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
