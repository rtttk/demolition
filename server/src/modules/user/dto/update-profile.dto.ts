import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '真实姓名' })
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiPropertyOptional({ description: '性别: 0=未知 1=男 2=女' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  gender?: number;

  @ApiPropertyOptional({ description: '年龄' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;

  @ApiPropertyOptional({ description: '身份证号' })
  @IsOptional()
  @IsString()
  idCardNo?: string;

  @ApiPropertyOptional({ description: '身份证图片ID数组(JSON)' })
  @IsOptional()
  idCardImages?: any; // JSON array of file IDs

  @ApiPropertyOptional({ description: '资质等级: 1=初级 2=中级 3=高级 4=特级' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  qualificationLevel?: number;

  @ApiPropertyOptional({ description: '工作年限' })
  @IsOptional()
  @IsInt()
  @Min(0)
  workYears?: number;
}
