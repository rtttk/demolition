import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

// 角色常量
export const ROLE_MAP = {
  1: '需求方',
  2: '服务方',
  3: '平台运营',
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * 解析用户角色数组
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

  /**
   * 根据ID查找用户，不返回敏感字段（passwordHash, secretKey）
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        openId: true,
        unionId: true,
        phone: true,
        nickname: true,
        avatarUrl: true,
        roles: true,
        currentRole: true,
        realName: true,
        gender: true,
        age: true,
        idCardNo: true,
        idCardImages: true,
        qualificationLevel: true,
        workYears: true,
        teamId: true,
        isTeamAdmin: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 转换 roles 为数组
    return {...user,
      roles: this.parseRoles(user.roles),
    };
  }

  /**
   * 更新用户个人信息
   */
  async updateProfile(id: string, data: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const updateData: any = {};
    if (data.nickname !== undefined) updateData.nickname = data.nickname;
    if (data.realName !== undefined) updateData.realName = data.realName;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.idCardNo !== undefined) updateData.idCardNo = data.idCardNo;
    if (data.idCardImages !== undefined) {
      updateData.idCardImages = typeof data.idCardImages === 'string'
        ? data.idCardImages
        : JSON.stringify(data.idCardImages);
    }
    if (data.qualificationLevel !== undefined) updateData.qualificationLevel = data.qualificationLevel;
    if (data.workYears !== undefined) updateData.workYears = data.workYears;

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nickname: true,
        realName: true,
        gender: true,
        age: true,
        idCardNo: true,
        idCardImages: true,
        qualificationLevel: true,
        workYears: true,
        updatedAt: true,
      },
    });
  }

  /**
   * 获取用户角色列表
   */
  async getUserRoles(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        roles: true,
        currentRole: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const roles = this.parseRoles(user.roles);

    return {id: user.id,
      roles,
      currentRole: user.currentRole,
      roleLabels: roles.map(r => ROLE_MAP[r] || '未知'),
    };
  }

  /**
   * 切换当前角色（只允许在已分配的角色之间切换）
   * role: 1=需求方 2=服务方;
   */
  async switchRole(id: string, role: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 解析用户已分配的角色
    const roles = this.parseRoles(user.roles);

    // 校验：目标角色是否在用户已分配的角色列表中
    if (!roles.includes(role)) {
      throw new BadRequestException('无权切换到该角色，请联系运营人员添加服务方角色');
    }

    // 校验：目标角色是否为有效角色
    if (![1, 2].includes(role)) {
      throw new BadRequestException('无效的角色');
    }

    // 如果切换到的角色不在当前已分配的角色中，也要更新 currentRole
    const updated = await this.prisma.user.update({
      where: { id },
      data: { currentRole: role },
    });

    return {id: updated.id,
      roles: this.parseRoles(updated.roles),
      currentRole: updated.currentRole,
    };
  }

  /**
   * 分配用户角色（后台管理调用）
   * 需求方角色不可移除（所有用户必须拥有需求方角色）
   */
  async assignRoles(id: string, roles: number[]) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 校验角色值
    const validRoles = roles.filter(r => [1, 2, 3].includes(r));
    if (validRoles.length === 0) {
      throw new BadRequestException('无效的角色');
    }

    // 确保需求方角色始终存在（所有用户默认都是需求方）
    if (!validRoles.includes(1)) {
      validRoles.push(1);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { roles: JSON.stringify(validRoles) },
      select: {
        id: true,
        roles: true,
        currentRole: true,
      },
    });

    return {id: updated.id,
      roles: this.parseRoles(updated.roles),
      currentRole: updated.currentRole,
    };
  }

  /**
   * 绑定手机号
   */
  async bindPhone(id: string, phone: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查手机号是否已被其他用户绑定
    const existingUser = await this.prisma.user.findFirst({
      where: { phone, id: { not: id } },
    });
    if (existingUser) {
      throw new BadRequestException('该手机号已被其他用户绑定');
    }

    return this.prisma.user.update({
      where: { id },
      data: { phone },
      select: {
        id: true,
        phone: true,
      },
    });
  }

  /**
   * 员工选择所属团队
   */
  async joinTeam(userId: string, teamId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证团队存在且状态正常
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException('团队不存在');
    }
    if (team.status !== 1) {
      throw new BadRequestException('该团队状态异常，无法加入');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { teamId },
      select: {
        id: true,
        teamId: true,
      },
    });
  }

  /**
   * 获取用户列表（管理用）
   */
  async getUserList(pagination: PaginationDto, filters?: any) {
    const where: any = {};

    // 按角色筛选（支持多个角色）
    if (filters?.roles !== undefined) {
      // 暂时保留 role 字段的筛选逻辑用于兼容
      if (filters.role !== undefined) {
        where.role = Number(filters.role);
      }
    }

    // 按状态筛选
    if (filters?.status !== undefined) {
      where.status = Number(filters.status);
    }

    // 按手机号模糊搜索
    if (filters?.phone) {
      where.phone = { contains: filters.phone }
    }

    // 按昵称模糊搜索
    if (filters?.nickname) {
      where.nickname = { contains: filters.nickname }
    }

    // 按团队ID筛选
    if (filters?.teamId !== undefined) {
      where.teamId = String(filters.teamId);
    }

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          nickname: true,
          avatarUrl: true,
          roles: true,
          currentRole: true,
          realName: true,
          gender: true,
          teamId: true,
          isTeamAdmin: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // 转换 roles 为数组
    const transformedList = list.map(item => ({
      ...item,
      roles: this.parseRoles(item.roles),
    }));

    return {list: transformedList,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(userId: string) {
    const [demandCount, orderCount, reviewCount] = await Promise.all([
      this.prisma.demand.count({ where: { userId } }),
      this.prisma.order.count({ where: { userId } }),
      this.prisma.review.count({ where: { userId } }),
    ]);

    return {
      demandCount,
      orderCount,
      reviewCount,
    };
  }
}
