import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecordViewDto {
  @ApiProperty({ description: '项目 ID' })
  @IsString()
  projectId: string;
}
