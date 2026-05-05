import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  slug: string;
}
