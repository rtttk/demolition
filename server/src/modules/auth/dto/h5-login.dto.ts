import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class H5LoginDto {
  @ApiProperty({ description: '账号（手机号或用户名）' })
  @IsNotEmpty({ message: '账号不能为空' })
  account: string;

  @ApiProperty({ description: '密码' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}
