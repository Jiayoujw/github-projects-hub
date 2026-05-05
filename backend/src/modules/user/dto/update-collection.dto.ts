import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCollectionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  groupName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
