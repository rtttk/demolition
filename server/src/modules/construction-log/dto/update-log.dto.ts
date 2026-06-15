import { IsOptional, IsString, IsArray, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLogDto {
  @ApiPropertyOptional({ description: '日志内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '施工进度 0-100' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  progress?: number;

  @ApiPropertyOptional({ description: '图片ID列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageIds?: string[];

  @ApiPropertyOptional({ description: '视频ID列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videoIds?: string[];
}
