import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新token' })
  @IsNotEmpty({ message: '刷新token不能为空' })
  refreshToken: string;
}
