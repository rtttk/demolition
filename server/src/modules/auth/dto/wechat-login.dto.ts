import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录code' })
  @IsNotEmpty({ message: '微信登录code不能为空' })
  code: string;
}
