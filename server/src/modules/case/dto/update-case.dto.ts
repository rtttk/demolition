import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCaseDto {
  @ApiPropertyOptional({ description: '案例标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '案例类型 1-6' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  @Type(() => Number)
  demoType?: number;

  @ApiPropertyOptional({ description: '案例描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '面积' })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional({ description: '工期(天)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  duration?: number;

  @ApiPropertyOptional({ description: '施工前图片ID列表', type: [Number] })
  @IsOptional()
  beforeImageIds?: number[];

  @ApiPropertyOptional({ description: '施工后图片ID列表', type: [Number] })
  @IsOptional()
  afterImageIds?: number[];
}
