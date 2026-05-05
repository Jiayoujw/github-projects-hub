import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: ['user', 'admin', 'super_admin'] })
  @IsString()
  @IsIn(['user', 'admin', 'super_admin'])
  role: string;
}
