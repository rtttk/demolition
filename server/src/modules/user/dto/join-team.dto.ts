import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinTeamDto {
  @ApiProperty({ description: '团队ID' })
  @IsInt()
  teamId: number;
}
