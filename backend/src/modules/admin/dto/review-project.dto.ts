import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewProjectDto {
  @ApiProperty({ description: '是否通过审核' })
  @IsBoolean()
  approved: boolean;
}
