import { IsString, IsOptional, IsArray, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDemandDto {
  @ApiProperty({ description: '演示类型 1-6', example: 1 })
  @IsInt()
  @Min(1)
  @Max(6)
  @Type(() => Number)
  demoType: number;

  @ApiProperty({ description: '需求标题（自动生成）', required: false })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '小区名称（室内拆除时填写）' })
  @IsOptional()
  @IsString()
  communityName?: string;

  @ApiPropertyOptional({ description: '区域/区县（非室内拆除时填写）' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: '详细地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '经度' })
  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @ApiPropertyOptional({ description: '纬度' })
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @ApiPropertyOptional({ description: '面积（平方米）' })
  @IsOptional()
  @Type(() => Number)
  area?: number;

  @ApiPropertyOptional({ description: '联系人' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: '预算范围标签' })
  @IsOptional()
  @IsString()
  budget?: string;

  @ApiPropertyOptional({ description: '期望施工时间' })
  @IsOptional()
  @IsString()
  expectedTime?: string;

  @ApiPropertyOptional({ description: '需求描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '图片文件ID列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageIds?: string[];
}
