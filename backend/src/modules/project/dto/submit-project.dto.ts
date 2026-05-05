import { IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitProjectDto {
  @ApiProperty({ description: 'GitHub 仓库 URL', example: 'https://github.com/facebook/react' })
  @IsString()
  @Matches(/github\.com\/[^/]+\/[^/]+/, { message: '无效的 GitHub 项目链接' })
  githubUrl: string;

  @ApiProperty({ required: false, description: '提交备注' })
  @IsOptional()
  @IsString()
  note?: string;
}
