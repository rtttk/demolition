import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { REDIS_CLIENT } from '../../common/redis/redis.module';
import Redis from 'ioredis';

interface TokenResult {
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
}

interface WechatSessionResult {
  openid: string,
  session_key: string,
  unionid?: string,
  errcode?: number,
  errmsg?: string,
}

interface WechatStableAccessTokenResult {
  errcode?: number,
  errmsg?: string,
  access_token?: string,
  expires_in?: number,
}

@Injectable()
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'wechat:stable_access_token';
  private readonly ACCESS_TOKEN_EXPIRY = 7000;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  private parseRoles(roles: any): number[] {
    if (!roles) return [1];
    if (typeof roles === 'string') {
      try {
        return JSON.parse(roles);
      } catch {
        return [1];
      }
    }
    if (Array.isArray(roles)) return roles;
    return [1];
  }

  private async getStableAccessToken(): Promise<string> {
    const appId = this.configService.get<string>('WECHAT_APP_ID');
    const appSecret = this.configService.get<string>('WECHAT_APP_SECRET');

    if (!appId || !appSecret) {
      throw new BadRequestException('微信小程序配置缺失');
    }

    const cached = await this.redis.hgetall(this.ACCESS_TOKEN_KEY);

    if (cached && cached.access_token && cached.expires_at) {
      const expiresAt = parseInt(cached.expires_at, 10);
      const now = Math.floor(Date.now() / 1000);
      if (expiresAt - now > 300) {
        return cached.access_token;
      }
    }

    const url = 'https://api.weixin.qq.com/cgi-bin/stable_token';
    const body = {
      grant_type: 'client_credential',
      appid: appId,
      secret: appSecret,
    };

    let result: WechatStableAccessTokenResult;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      result = await res.json();
    } catch (error) {
      throw new BadRequestException('调用微信 Stable AccessToken 接口失败');
    }

    if (result.errcode && result.errcode !== 0) {
      throw new BadRequestException('获取 Stable AccessToken 失败: ' + (result.errmsg || '未知错误'));
    }

    const accessToken = result.access_token as string;
    const expiresIn = result.expires_in as number;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    await this.redis.hset(this.ACCESS_TOKEN_KEY, {
      access_token: accessToken,
      expires_at: String(expiresAt),
    });
    await this.redis.expire(this.ACCESS_TOKEN_KEY, expiresIn - 200);

    return accessToken;
  }

  async wechatLogin(code: string) {
    const appId = this.configService.get<string>('WECHAT_APP_ID');
    const appSecret = this.configService.get<string>('WECHAT_APP_SECRET');

    if (!appId || !appSecret) {
      throw new BadRequestException('微信小程序配置缺失');
    }

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

    let sessionResult: WechatSessionResult;
    try {
      const response = await fetch(url);
      sessionResult = await response.json();
    } catch (error) {
      throw new BadRequestException('调用微信接口失败');
    }

    if (sessionResult.errcode) {
      throw new UnauthorizedException(
        `微信登录失败: ${sessionResult.errmsg || '未知错误'}`,
      );
    }

    const { openid, unionid } = sessionResult;

    let user = await this.prisma.user.findUnique({
      where: { openId: openid },
    });

    const needPhone = !user || !user.phone;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          openId: openid,
          unionId: unionid || undefined,
          nickname: `用户_${openid?.slice(-6) || Date.now()}`,
          roles: JSON.stringify([1]),
          currentRole: 1,
          status: 1,
          lastLoginAt: new Date(),
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    const userRoles = this.parseRoles(user.roles);

    const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const redisKey = `miniapp:session:${sessionToken}`;
    const sessionData = JSON.stringify({
      userId: user.id,
      roles: userRoles,
      currentRole: user.currentRole,
      phone: user.phone,
      needPhone,
    });

    await this.redis.set(redisKey, sessionData, 'EX', 7 * 24 * 3600);

    return {
      userId: user.id,
      roles: userRoles,
      currentRole: user.currentRole,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      needPhone,
      sessionToken,
    };
  }

  async bindPhoneForNewUser(userId: string, phoneCode: string, sessionToken?: string) {
    const user = await this.validateUser(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    let accessToken: string;
    try {
      accessToken = await this.getStableAccessToken();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('获取微信 access_token 失败');
    }

    const phoneUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
    let phoneNumber = '';
    try {
      const phoneRes = await fetch(phoneUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: phoneCode }),
      });
      const phoneData = await phoneRes.json();
      if (phoneData.errcode !== 0) {
        throw new BadRequestException('获取手机号失败: ' + (phoneData.errmsg || '未知错误'));
      }
      phoneNumber = phoneData.phone_info.phoneNumber;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('获取手机号接口调用失败');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { phone: phoneNumber },
    });

    if (sessionToken && sessionToken.startsWith('sess_')) {
      const redisKey = `miniapp:session:${sessionToken}`;
      const sessionData = await this.redis.get(redisKey);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        parsed.phone = phoneNumber;
        parsed.needPhone = false;
        await this.redis.set(redisKey, JSON.stringify(parsed), 'EX', 7 * 24 * 3600);
      }
    }

    const userRoles = this.parseRoles(updatedUser.roles);

    return {
      userId: updatedUser.id,
      roles: userRoles,
      currentRole: updatedUser.currentRole,
      nickname: updatedUser.nickname,
      realName: updatedUser.realName,
      avatarUrl: updatedUser.avatarUrl,
      phone: updatedUser.phone,
    };
  }

  async phoneLogin(code: string) {
    const appId = this.configService.get<string>('WECHAT_APP_ID');
    const appSecret = this.configService.get<string>('WECHAT_APP_SECRET');

    if (!appId || !appSecret) {
      throw new BadRequestException('微信小程序配置缺失');
    }

    let accessToken: string;
    try {
      accessToken = await this.getStableAccessToken();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('获取微信 access_token 失败');
    }

    const phoneUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
    let phoneNumber = '';
    try {
      const phoneRes = await fetch(phoneUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const phoneData = await phoneRes.json();
      if (phoneData.errcode !== 0) {
        throw new BadRequestException('获取手机号失败: ' + (phoneData.errmsg || '未知错误'));
      }
      phoneNumber = phoneData.phone_info.phoneNumber;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('获取手机号接口调用失败');
    }

    let user = await this.prisma.user.findFirst({
      where: { phone: phoneNumber },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: phoneNumber,
          nickname: phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
          roles: JSON.stringify([1]),
          currentRole: 1,
          status: 1,
          lastLoginAt: new Date(),
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    const userRoles = this.parseRoles(user.roles);

    const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const redisKey = `miniapp:session:${sessionToken}`;
    const sessionData = JSON.stringify({
      userId: user.id,
      roles: userRoles,
      currentRole: user.currentRole,
      phone: user.phone,
    });

    await this.redis.set(redisKey, sessionData, 'EX', 7 * 24 * 3600);

    return {
      userId: user.id,
      roles: userRoles,
      currentRole: user.currentRole,
      nickname: user.nickname,
      realName: user.realName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      sessionToken,
    };
  }

  async getSessionByToken(sessionToken: string) {
    if (!sessionToken || !sessionToken.startsWith('sess_')) {
      return null;
    }
    const redisKey = `miniapp:session:${sessionToken}`;
    const data = await this.redis.get(redisKey);
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async h5Login(account: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        status: 1,
        OR: [
          { phone: account },
          { nickname: account },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('该账号未设置密码，请先设置');
    }

    if (user.passwordHash !== password) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const userRoles = this.parseRoles(user.roles);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = this.generateTokens(
      user.id,
      userRoles[0] || 1,
      user.currentRole,
    );

    return {
      userId: user.id,
      roles: userRoles,
      currentRole: user.currentRole,
      nickname: user.nickname,
      realName: user.realName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      ...tokens,
    };
  }

  async adminLogin(username: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        nickname: username,
        status: 1,
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const userRoles = this.parseRoles(user.roles);
    if (!userRoles.includes(3)) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.passwordHash !== password) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = this.generateTokens(
      user.id,
      3,
      user.currentRole,
    );

    return {
      userId: user.id,
      roles: userRoles,
      currentRole: user.currentRole,
      nickname: user.nickname,
      realName: user.realName,
      ...tokens,
    };
  }

  generateTokens(userId: string, role: number, currentRole?: number): TokenResult {
    const payload = {
      userId,
      role,
      currentRole: currentRole ?? role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const expiresIn = this.parseExpireTime(
      this.configService.get<string>('JWT_EXPIRES_IN', '2h'),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.validateUser(payload.userId);
      if (!user) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      const tokens = this.generateTokens(
        payload.userId,
        payload.role,
        payload.currentRole,
      );

      return {
        userId: payload.userId,
        role: payload.role,
        currentRole: payload.currentRole,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('刷新token无效或已过期');
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status !== 1) {
      return null;
    }

    return user;
  }

  private parseExpireTime(expireIn: string): number {
    const match = expireIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7200;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 7200;
    }
  }
}
