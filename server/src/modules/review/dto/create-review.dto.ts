import { IsInt, IsOptional, IsString, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: '订单ID' })
  @IsInt()
  @Type(() => Number)
  orderId: number;

  @ApiProperty({ description: '团队ID' })
  @IsInt()
  @Type(() => Number)
  teamId: number;

  @ApiProperty({ description: '评分 1-5' })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @ApiPropertyOptional({ description: '评价内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '图片ID列表', type: [Number] })
  @IsOptional()
  @IsArray()
  imageIds?: number[];
}
