import { IsInt, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwitchRoleDto {
  @ApiProperty({ description: '目标角色', enum: [1, 2] })
  @IsInt()
  @IsIn([1, 2])
  role: number;
}
