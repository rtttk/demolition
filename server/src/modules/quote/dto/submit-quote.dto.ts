import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitQuoteDto {
  @ApiProperty({ description: '需求ID', example: 'cmq7nwxgm00029phral1vfe5y' })
  @IsString()
  demandId: string;

  @ApiProperty({ description: '报价金额', example: 50000.00 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ description: '工期（天）', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  duration?: number;

  @ApiPropertyOptional({ description: '方案概述' })
  @IsOptional()
  @IsString()
  planSummary?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
