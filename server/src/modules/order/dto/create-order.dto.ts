import { IsInt, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: '需求ID' })
  @IsInt()
  @Type(() => Number)
  demandId: number;

  @ApiPropertyOptional({ description: '报价ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  quoteId?: number;
}
