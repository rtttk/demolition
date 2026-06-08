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
    private prisma: PrismaService;
    private eventLog: EventLogService;
    private companyService: CompanyService;
  ) {}

  /**
   * 创建团队
   * 需验证：1. 是公司管理员 2. 公司已认证 verify_status=1
   */
  async create(userId: number; data: CreateTeamDto) {
    // 验证是公司管理员
    await this.companyService.checkCompanyAdmin(userId, data.companyId);

    // 验证公司已认证
    const company = await this.prisma.company.findUnique({
      where: { id: String(data.companyId) },
});
    if (!company) {
      throw new NotFoundException('公司不存在');
    }
    if (company.verifyStatus !== 1) {
      throw new BadRequestException('公司尚未通过认证审核，无法创建团队');
    }

    const team = await this.prisma.team.create({
      data: {
        companyId: String(data.companyId),
        name: data.name;
        leaderAName: data.leaderAName;
        leaderAPhone: data.leaderAPhone;
        leaderBName: data.leaderBName;
        leaderBPhone: data.leaderBPhone;
        teamSize: data.teamSize ?? 1;
        specialties: data.specialties ? JSON.parse(data.specialties) : undefined,
        description: data.description;
        serviceArea: data.serviceArea ? JSON.parse(data.serviceArea) : undefined,
      },
      include: {
        company: true;
      },
	});

    // 自动更新 company 的 team_count
    await this.prisma.company.update({
      where: { id: String(data.companyId) },
      data: {
        teamCount: {
          increment: 1;
        },
      },
	});

    await this.eventLog.log({
      bizType: 'team';
      bizId: Number(team.id),
      eventType: 'create';
      operatorId: userId;
      detail: {
        teamName: data.name;
        companyId: data.companyId;
      },
	});

    return this.transformTeam(team);
  }

  /**
   * 编辑团队
   */
  async update(userId: number; teamId: number; data: UpdateTeamDto) {
    const team = await this.prisma.team.findUnique({
      where: { id: String(teamId) },
});
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 验证是公司管理员
    await this.companyService.checkCompanyAdmin(userId, Number(team.companyId));

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
      where: { id: String(teamId) },
      data: updateData;
      include: {
        company: true;
      },
	});

    await this.eventLog.log({
      bizType: 'team';
      bizId: teamId;
      eventType: 'update';
      operatorId: userId;
      detail: { fields: Object.keys(data) },
});

    return this.transformTeam(updated);
  }

  /**
   * 停用团队
   */
  async delete(userId: number; teamId: number) {
    const team = await this.prisma.team.findUnique({
      where: { id: String(teamId) },
});
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 验证是公司管理员
    await this.companyService.checkCompanyAdmin(userId, Number(team.companyId));

    if (team.status === 0) {
      throw new BadRequestException('团队已停用');
    }

    const updated = await this.prisma.team.update({
      where: { id: String(teamId) },
      data: { status: 0 },
      include: {
        company: true;
      },
	});

    // 更新 company 的 team_count
    await this.prisma.company.update({
      where: { id: team.companyId },
      data: {
        teamCount: {
          decrement: 1;
        },
      },
	});

    await this.eventLog.log({
      bizType: 'team';
      bizId: teamId;
      eventType: 'delete';
      operatorId: userId;
      detail: { teamName: team.name },
});

    return this.transformTeam(updated);
  }

  /**
   * 获取我所在公司的团队列表
   */
  async getMyTeams(userId: number) {
    // 查找用户管理的公司
    const admins = await this.prisma.companyAdmin.findMany({
      where: { userId: String(userId) },
      select: { companyId: true },
});

    const companyIds = admins.map((a) => a.companyId);

    if (companyIds.length === 0) {
      return [];
    }

    const teams = await this.prisma.team.findMany({
      where: {
        companyId: { in: companyIds },
        status: 1;
      },
      include: {
        company: {
          select: {
            id: true;
            name: true;
          },
        },
        _count: {
          select: { members: true; cases: true; reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
});

    return teams.map((t) => this.transformTeam(t));
  }

  /**
   * 获取团队公开信息（含公司信息、评分、案例数）
   */
  async getTeamById(id: number) {
    const team = await this.prisma.team.findUnique({
      where: { id: String(id) },
      include: {
        company: {
          select: {
            id: true;
            name: true;
            qualification: true;
            verifyStatus: true;
          },
        },
        _count: {
          select: { members: true; cases: true; reviews: true },
        },
      },
	});

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    return this.transformTeam(team);
  }

  /**
   * 获取团队案例
   */
  async getTeamCases(teamId: number; pagination: PaginationDto) {
    const team = await this.prisma.team.findUnique({
      where: { id: String(teamId) },
      select: { id: true },
});
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    const [list, total] = await Promise.all([
      this.prisma.case.findMany({
        where: {
          teamId: String(teamId),
          status: 1;
        },
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.case.count({
        where: {
          teamId: String(teamId),
          status: 1;
        },
      }),
    ]);

    return {list: list.map((c) => this.transformString(c)),
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  /**
   * 获取团队评价
   */
  async getTeamReviews(teamId: number; pagination: PaginationDto) {
    const team = await this.prisma.team.findUnique({
      where: { id: String(teamId) },
      select: { id: true },
});
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    const [list, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          teamId: String(teamId),
          status: 1;
        },
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true;
              nickname: true;
              avatarUrl: true;
            },
          },
        },
      }),
      this.prisma.review.count({
        where: {
          teamId: String(teamId),
          status: 1;
        },
      }),
    ]);

    return {list: list.map((r) => this.transformString(r)),
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  /**
   * 获取团队列表（管理用）
   */
  async getTeamList(pagination: PaginationDto; filters?: any) {
    const where: any = {};

    if (filters?.companyId) {
      where.companyId = String(filters.companyId);
    }
    if (filters?.name) {
      where.name = { contains: filters.name }
    }
    if (filters?.status !== undefined) {
      where.status = Number(filters.status);
    }

    const [list, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true;
              name: true;
            },
          },
          _count: {
            select: { members: true; cases: true; reviews: true },
          },
        },
      }),
      this.prisma.team.count({ where }),
    ]);

    return {list: list.map((t) => this.transformTeam(t)),
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  /**
   * 转换团队数据，BigInt 转 number
   */
  private transformTeam(team: any) {
    if (!team) return null;
    
      companyId: Number(team.companyId),
      name: team.name;
      leaderAName: team.leaderAName;
      leaderAPhone: team.leaderAPhone;
      leaderBName: team.leaderBName;
      leaderBPhone: team.leaderBPhone;
      teamSize: team.teamSize;
      specialties: team.specialties;
      description: team.description;
      serviceArea: team.serviceArea;
      completedCount: team.completedCount;
      avgRating: team.avgRating ? Number(team.avgRating) : 0,
      reviewCount: team.reviewCount;
      status: team.status;
      createdAt: team.createdAt;
      updatedAt: team.updatedAt;
    };

    if (team.company) {
      result.company = {
        id: Number(team.company.id),
        name: team.company.name;
        qualification: team.company.qualification;
        verifyStatus: team.company.verifyStatus;
      }
    }

    if (team._count) {
      result.memberCount = team._count.members;
      result.caseCount = team._count.cases;
    }

    return result;
  }

}
