import { IsInt, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: '需求ID' })
  @Type(() => String)
  demandId: string;

  @ApiPropertyOptional({ description: '报价ID' })
  @IsOptional()
  @Type(() => String)
  quoteId?: string;
}
