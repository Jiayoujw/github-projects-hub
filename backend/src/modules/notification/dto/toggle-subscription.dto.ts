import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleSubscriptionDto {
  @ApiProperty({ description: '是否启用' })
  @IsBoolean()
  enabled: boolean;
}
