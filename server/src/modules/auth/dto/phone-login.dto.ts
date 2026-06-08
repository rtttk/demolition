import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PhoneLoginDto {
  @ApiProperty({ description: '微信手机号授权code（getPhoneNumber 返回）' })
  @IsNotEmpty({ message: '手机号授权code不能为空' })
  code: string;

  @ApiPropertyOptional({ description: '微信登录code（wx.login 返回，用于获取 openId）' })
  @IsOptional()
  loginCode?: string;
}
