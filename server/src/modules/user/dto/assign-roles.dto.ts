import { IsArray, IsInt, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesDto {
  @ApiProperty({ description: '角色数组，如 [1] 或 [1,2]', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  roles: number[];
}
