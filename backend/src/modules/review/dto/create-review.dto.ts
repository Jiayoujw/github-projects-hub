import { IsInt, IsOptional, IsString, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: '评分 1-5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false, enum: ['学习', '个人', '团队', '企业', '开源'] })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  usageScenario?: string;
}
