import {
  IsString,
  IsOptional,
  IsInt,
  IsJSON,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ description: '公司ID' })
  @Type(() => Number)
  @IsInt()
  companyId: number;

  @ApiProperty({ description: '团队名称' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '负责人A姓名' })
  @IsString()
  @Length(1, 50)
  leaderAName: string;

  @ApiProperty({ description: '负责人A电话' })
  @IsString()
  @Length(1, 20)
  leaderAPhone: string;

  @ApiPropertyOptional({ description: '负责人B姓名' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  leaderBName?: string;

  @ApiPropertyOptional({ description: '负责人B电话' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  leaderBPhone?: string;

  @ApiPropertyOptional({ description: '团队人数' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  teamSize?: number;

  @ApiPropertyOptional({ description: '专业特长JSON' })
  @IsOptional()
  @IsJSON()
  specialties?: string;

  @ApiPropertyOptional({ description: '团队描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '服务区域JSON' })
  @IsOptional()
  @IsJSON()
  serviceArea?: string;
}
