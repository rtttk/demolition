import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BindPhoneDto {
  @ApiProperty({ description: '微信手机号实时验证 code（getPhoneNumber 返回的 code）' })
  @IsNotEmpty({ message: 'code不能为空' })
  code: string;
}
