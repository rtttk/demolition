import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  userId: string;
  role: number; // 旧格式，保留兼容
  roles?: number[]; // 新格式：角色数组
  currentRole: number;
}

/**
 * 解析角色数组（兼容新旧格式）
 */
function parseRoles(roles: any): number[] {
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

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.userId) {
      throw new UnauthorizedException('无效的token载荷');
    }
    // 新格式优先，否则使用旧格式
    const roles = payload.roles || [payload.role || 1];
    const currentRole = payload.currentRole ?? roles[0];

    return {
      userId: payload.userId,
      roles: parseRoles(roles),
      role: payload.role, // 保留旧字段兼容
      currentRole: currentRole,
    };
  }
}
