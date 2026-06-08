import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { H5LoginDto } from './dto/h5-login.dto';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { BindPhoneDto } from './dto/bind-phone.dto';
import { Request } from 'express';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('wechat-login')
  @ApiOperation({ summary: '微信小程序登录（Step 1：微信身份认证）' })
  async wechatLogin(@Body() dto: WechatLoginDto) {
    return this.authService.wechatLogin(dto.code);
  }

  @Public()
  @Post('phone-login')
  @ApiOperation({ summary: '微信手机号快速登录（旧版，保留兼容）' })
  async phoneLogin(@Body() dto: PhoneLoginDto) {
    return this.authService.phoneLogin(dto.code);
  }

  @UseGuards(AuthGuard)
  @Post('bind-phone')
  @ApiOperation({ summary: '微信用户绑定手机号' })
  async bindPhoneForNewUser(
    @CurrentUser('userId') userId: number,
    @Req() req: Request,
    @Body() dto: BindPhoneDto,
  ) {
    // 从请求头获取 sessionToken，用于刷新 Redis 中的 needPhone 字段
    const sessionToken = req.headers['x-session-token'] as string;
    return this.authService.bindPhoneForNewUser(userId, dto.code, sessionToken);
  }

  @Public()
  @Post('admin/login')
  @ApiOperation({ summary: '运营人员登录' })
  async adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto.username, dto.password);
  }

  @Public()
  @Post('h5-login')
  @ApiOperation({ summary: 'H5账号密码登录' })
  async h5Login(@Body() dto: H5LoginDto) {
    return this.authService.h5Login(dto.account, dto.password);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '刷新token' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
