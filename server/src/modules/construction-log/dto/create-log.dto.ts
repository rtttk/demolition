import { IsInt, IsOptional, IsString, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLogDto {
  @ApiProperty({ description: '订单ID' })
  @IsInt()
  @Type(() => Number)
  orderId: number;

  @ApiProperty({ description: '日志内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '施工进度 0-100' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  progress?: number;

  @ApiPropertyOptional({ description: '图片ID列表', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  imageIds?: number[];

  @ApiPropertyOptional({ description: '视频ID列表', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  videoIds?: number[];
}
