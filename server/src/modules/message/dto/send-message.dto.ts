import { IsInt, IsOptional, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: '接收者ID' })
  @IsInt()
  @Type(() => Number)
  receiverId: number;

  @ApiProperty({ description: '消息内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '订单ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  orderId?: number;

  @ApiPropertyOptional({ description: '图片ID列表', type: [Number] })
  @IsOptional()
  @IsArray()
  imageIds?: number[];
}
