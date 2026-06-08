import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';

/**
 * 统一认证守卫
 * - @Public() 装饰的接口完全跳过校验
 * - 支持 JWT 和 SessionToken 两种认证方式
 * - 向后兼容：同时支持 role（旧）和 roles（新）字段
 */
@Injectable()
export class AuthGuard {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  /**
   * 解析角色数组（兼容新旧格式）
   */
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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. @Public() 装饰的接口直接放行
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // 2. 获取请求对象
    const request = context.switchToHttp().getRequest();

    // 3. 优先尝试 JWT
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = this.jwtService.verify(token);
        const roles = payload.roles || [payload.role || 1]; // 新格式优先
        const currentRole = payload.currentRole ?? roles[0];
        request.user = {
          id: payload.userId,
          roles: this.parseRoles(roles),
          role: payload.role, // 保留旧字段兼容
          currentRole: currentRole,
        };
        return true;
      } catch {
        // JWT 无效，继续尝试 sessionToken
      }
    }

    // 4. 尝试 Redis sessionToken
    const sessionToken = request.headers['x-session-token'];
    if (sessionToken && sessionToken.startsWith('sess_')) {
      const redisKey = `miniapp:session:${sessionToken}`;
      const data = await this.redis.get(redisKey);
      if (data) {
        try {
          const session = JSON.parse(data);
          const roles = session.roles || [session.role || 1]; // 新格式优先
          const currentRole = session.currentRole ?? roles[0];
          request.user = {
            id: session.userId,
            roles: this.parseRoles(roles),
            role: session.role, // 保留旧字段兼容
            currentRole: currentRole,
            phone: session.phone,
          };
          return true;
        } catch {
          // 解析失败
        }
      }
    }

    throw new UnauthorizedException('请先登录');
  }
}
