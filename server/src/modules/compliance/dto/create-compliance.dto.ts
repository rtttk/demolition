import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateComplianceDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '分类: 备案流程/材料清单/政策法规/施工方案模板' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '文件ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  fileId?: number;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}
