import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventLogService } from '../event-log/event-log.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CompanyService } from '../company/company.service';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    private eventLog: EventLogService,
    private companyService: CompanyService,
  ) {}

  /**
   * 创建团队
   * 需验证：1. 是公司管理员 2. 公司已认证 verify_status=1
   */
  async create(userId: string, data: CreateTeamDto) {
    // 验证是公司管理员
    await this.companyService.checkCompanyAdmin(userId, data.companyId);

    // 验证公司已认证
    const company = await this.prisma.company.findUnique({
      where: { id: data.companyId },
    });
    if (!company) {
      throw new NotFoundException('公司不存在');
    }
    if (company.verifyStatus !== 1) {
      throw new BadRequestException('公司尚未通过认证审核，无法创建团队');
    }

    const team = await this.prisma.team.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        leaderAName: data.leaderAName,
        leaderAPhone: data.leaderAPhone,
        leaderBName: data.leaderBName,
        leaderBPhone: data.leaderBPhone,
        teamSize: data.teamSize ?? 1,
        specialties: data.specialties ? JSON.parse(data.specialties) : undefined,
        description: data.description,
        serviceArea: data.serviceArea ? JSON.parse(data.serviceArea) : undefined,
      },
    });

    // 自动更新 company 的 team_count
    await this.prisma.company.update({
      where: { id: String(data.companyId) },
      data: {
        teamCount: {
          increment: 1,
        },
      },
    });

    await this.eventLog.log({
      bizType: 'team',
      bizId: team.id,
      eventType: 'create',
      operatorId: userId,
      detail: {
        teamName: data.name,
        companyId: data.companyId,
      },
    });

    return this.transformTeam(team);
  }

  /**
   * 编辑团队
   */
  async update(userId: string, teamId: string, data: UpdateTeamDto) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 验证是公司管理员
    await this.companyService.checkCompanyAdmin(userId, team.companyId);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.leaderAName !== undefined) updateData.leaderAName = data.leaderAName;
    if (data.leaderAPhone !== undefined) updateData.leaderAPhone = data.leaderAPhone;
    if (data.leaderBName !== undefined) updateData.leaderBName = data.leaderBName;
    if (data.leaderBPhone !== undefined) updateData.leaderBPhone = data.leaderBPhone;
    if (data.teamSize !== undefined) updateData.teamSize = data.teamSize;
    if (data.specialties !== undefined) updateData.specialties = JSON.parse(data.specialties);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.serviceArea !== undefined) updateData.serviceArea = JSON.parse(data.serviceArea);

    const updated = await this.prisma.team.update({
      where: { id: teamId },
      data: updateData,
    });

    await this.eventLog.log({
      bizType: 'team',
      bizId: teamId,
      eventType: 'update',
      operatorId: userId,
      detail: { fields: Object.keys(data) },
    });

    return this.transformTeam(updated);
  }

  /**
   * 停用团队
   */
  async delete(userId: string, teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 验证是公司管理员
    await this.companyService.checkCompanyAdmin(userId, team.companyId);

    if (team.status === 0) {
      throw new BadRequestException('团队已停用');
    }

    const updated = await this.prisma.team.update({
      where: { id: teamId },
      data: { status: 0 },
    });

    // 更新 company 的 team_count
    await this.prisma.company.update({
      where: { id: team.companyId },
      data: {
        teamCount: {
          decrement: 1,
        },
      },
    });

    await this.eventLog.log({
      bizType: 'team',
      bizId: teamId,
      eventType: 'delete',
      operatorId: userId,
      detail: { teamName: team.name },
    });

    return this.transformTeam(updated);
  }

  /**
   * 获取我所在公司的团队列表
   */
  async getMyTeams(userId: string) {
    // 查找用户管理的公司
    const admins = await this.prisma.companyAdmin.findMany({
      where: { userId: userId },
      select: { companyId: true },
    });

    const companyIds = admins.map((a) => a.companyId);

    if (companyIds.length === 0) {
      return [];
    }

    const teams = await this.prisma.team.findMany({
      where: {
        companyId: { in: companyIds },
        status: 1,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { members: true, cases: true, reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    } as any);

    return teams.map((t) => this.transformTeam(t));
  }

  /**
   * 获取团队公开信息（含公司信息、评分、案例数）
   */
  async getTeamById(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 手动查询公司信息
    const company = await this.prisma.company.findUnique({
      where: { id: team.companyId },
      select: {
        id: true,
        name: true,
        qualification: true,
        verifyStatus: true,
      },
    });

    // 手动查询关联数量
    const [caseCount, reviewCount] = await Promise.all([
      this.prisma.case.count({ where: { teamId: id, status: 1 } }),
      this.prisma.review.count({ where: { teamId: id, status: 1 } }),
    ]);

    return this.transformTeam({
      ...team,
      company,
      _count: {
        cases: caseCount,
        reviews: reviewCount,
      },
    });
  }

  /**
   * 获取团队案例
   */
  async getTeamCases(teamId: string, pagination: PaginationDto) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true },
    });
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    const [list, total] = await Promise.all([
      this.prisma.case.findMany({
        where: {
          teamId: teamId,
          status: 1,
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.case.count({
        where: {
          teamId: teamId,
          status: 1,
        },
      }),
    ]);

    return {
      list: list.map((c) => this.transformCase(c)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * 获取团队评价
   */
  async getTeamReviews(teamId: string, pagination: PaginationDto) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true },
    });
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    const [list, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          teamId: teamId,
          status: 1,
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({
        where: {
          teamId: teamId,
          status: 1,
        },
      }),
    ]);

    // 手动查询用户信息
    const userIds = [...new Set(list.map((r) => r.userId).filter(Boolean))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nickname: true, avatarUrl: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const resultList = list.map((r) => ({
      ...r,
      user: userMap.get(r.userId) || null,
    }));

    return {
      list: resultList.map((r) => this.transformReview(r)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * 获取团队列表（管理用）
   */
  async getTeamList(pagination: PaginationDto, filters?: any) {
    const where: any = {};

    if (filters?.companyId) {
      where.companyId = String(filters.companyId);
    }
    if (filters?.name) {
      where.name = { contains: filters.name };
    }
    if (filters?.status !== undefined) {
      where.status = Number(filters.status);
    }

    const [list, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      } as any),
      this.prisma.team.count({ where }),
    ]);

    return {
      list: list.map((t) => this.transformTeam(t)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * 获取推荐团队（公开）
   */
  async getRecommendTeams(pagination: PaginationDto) {
    const where: any = {
      recommended: true,
      status: 1,
    };

    const [list, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      } as any),
      this.prisma.team.count({ where }),
    ]);

    // 手动查询关联的 company 信息
    const companyIds = [...new Set(list.map((t: any) => t.companyId).filter(Boolean))];
    const companies = companyIds.length > 0 ? await this.prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, name: true, verifyStatus: true },
    }) : [];
    const companyMap = new Map<string, any>(companies.map((c: any): [string, any] => [c.id, c]));

    const resultList = list.map((t: any) => ({
      ...this.transformTeam(t),
      company: companyMap.get(t.companyId) || null,
    }));

    return {
      list: resultList,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * 转换团队数据
   */
  private transformTeam(team: any) {
    if (!team) return null;

    const result: any = {
      id: team.id,
      companyId: team.companyId,
      name: team.name,
      leaderAName: team.leaderAName,
      leaderAPhone: team.leaderAPhone,
      leaderBName: team.leaderBName,
      leaderBPhone: team.leaderBPhone,
      teamSize: team.teamSize,
      specialties: team.specialties,
      description: team.description,
      serviceArea: team.serviceArea,
      completedCount: team.completedCount,
      avgRating: team.avgRating ? Number(team.avgRating) : 0,
      reviewCount: team.reviewCount,
      status: team.status,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };

    if (team.company) {
      result.company = {
        id: team.company.id,
        name: team.company.name,
        qualification: team.company.qualification,
        verifyStatus: team.company.verifyStatus,
      };
    }

    if (team._count) {
      result.caseCount = team._count.cases;
      result.reviewCount = team._count.reviews;
    }

    return result;
  }

  /**
   * 转换案例数据
   */
  private transformCase(c: any) {
    return c;
  }

  /**
   * 转换评价数据
   */
  private transformReview(r: any) {
    return r;
  }
}
