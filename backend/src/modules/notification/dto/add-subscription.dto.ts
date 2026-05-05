import { IsString, IsIn, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSubscriptionDto {
  @ApiProperty({ enum: ['language', 'category', 'keyword'] })
  @IsString()
  @IsIn(['language', 'category', 'keyword'])
  type: string;

  @ApiProperty()
  @IsString()
  @MaxLength(128)
  value: string;
}
