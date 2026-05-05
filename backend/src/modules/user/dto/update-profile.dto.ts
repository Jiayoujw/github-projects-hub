import { IsOptional, IsString, IsObject, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  username?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-]*$/, { message: 'GitHub 用户名只能包含字母、数字和连字符' })
  githubUsername?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}
