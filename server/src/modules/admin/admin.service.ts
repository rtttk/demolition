import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EventLogService } from '../event-log/event-log.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private eventLog: EventLogService,
  ) {}

  // ==================== 用户管理 ====================

  async getUserList(pagination: PaginationDto, filters?: any) {
    const where: any = {};

    if (filters?.status !== undefined) {
      where.status = Number(filters.status);
    }
    if (filters?.phone) {
      where.phone = { contains: filters.phone };
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

    const teamIds = list.map((u) => u.teamId).filter((v): v is string => !!v);
    const teamsMap = new Map<string, any>();
    if (teamIds.length > 0) {
      const teams = await this.prisma.team.findMany({
        where: { id: { in: teamIds } },
        select: { id: true, name: true, companyId: true },
      });
      teams.forEach((t) => teamsMap.set(t.id, t));
    }

    const transformedList = list.map((item) => {
      const parsedRoles = this.parseRoles(item.roles);
      return {
        ...item,
        roles: parsedRoles,
        role: parsedRoles,
        team: item.teamId ? teamsMap.get(item.teamId) || null : null,
      };
    });

    const filtered =
      filters?.role !== undefined
        ? transformedList.filter((u) => u.roles.includes(Number(filters.role)))
        : transformedList;

    return {
      list: filtered,
      total: filtered.length,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  async updateUserStatus(userId: string, targetId: string, status: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: { status },
      select: {
        id: true,
        nickname: true,
        phone: true,
        status: true,
        updatedAt: true,
      },
    });

    await this.eventLog.log({
      bizType: 'user',
      bizId: targetId,
      eventType: 'admin_update_status',
      operatorId: userId,
      detail: { targetId, oldStatus: user.status, newStatus: status },
    });

    return updated;
  }

  async assignUserRoles(userId: string, targetId: string, roles: number[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const validRoles = roles.filter(r => [1, 2, 3].includes(r));
    if (validRoles.length === 0) {
      throw new BadRequestException('无效的角色');
    }

    if (!validRoles.includes(1)) {
      validRoles.push(1);
    }

    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: { roles: JSON.stringify(validRoles) },
      select: {
        id: true,
        roles: true,
        currentRole: true,
      },
    });

    await this.eventLog.log({
      bizType: 'user',
      bizId: targetId,
      eventType: 'admin_assign_roles',
      operatorId: userId,
      detail: { targetId, oldRoles: user.roles, newRoles: validRoles },
    });

    return {
      id: updated.id,
      roles: this.parseRoles(updated.roles),
      currentRole: updated.currentRole,
    };
  }

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

  // ==================== 公司管理 ====================

  async getCompanyList(pagination: PaginationDto, filters?: any) {
    const where: any = {};

    if (filters?.name) {
      where.name = { contains: filters.name };
    }
    if (filters?.verifyStatus !== undefined) {
      where.verifyStatus = Number(filters.verifyStatus);
    }
    if (filters?.status !== undefined) {
      where.status = Number(filters.status);
    }

    const [list, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          contactPerson: true,
          contactPhone: true,
          licenseNo: true,
          licenseImages: true,
          qualification: true,
          qualificationImages: true,
          safetyCertNo: true,
          safetyCertImages: true,
          establishedAt: true,
          description: true,
          serviceArea: true,
          completedCount: true,
          teamCount: true,
          verifyStatus: true,
          verifyRemark: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    const companyIds = list.map((c) => c.id);
    if (companyIds.length > 0) {
      const [teams, admins] = await Promise.all([
        this.prisma.team.findMany({
          where: { companyId: { in: companyIds } },
          select: { id: true, companyId: true, name: true },
        }),
        this.prisma.companyAdmin.findMany({
          where: { companyId: { in: companyIds } },
          select: {
            id: true,
            companyId: true,
            userId: true,
            role: true,
            createdAt: true,
          },
        }),
      ]);

      const adminUserIds = admins.map((a) => a.userId).filter(Boolean);
      let usersMap = new Map<string, any>();
      if (adminUserIds.length > 0) {
        const users = await this.prisma.user.findMany({
          where: { id: { in: adminUserIds } },
          select: { id: true, nickname: true, phone: true },
        });
        users.forEach((u) => usersMap.set(u.id, u));
      }

      const teamsByCompany = new Map<string, any[]>();
      teams.forEach((t) => {
        const arr = teamsByCompany.get(t.companyId) || [];
        arr.push(t);
        teamsByCompany.set(t.companyId, arr);
      });

      const adminsByCompany = new Map<string, any[]>();
      admins.forEach((a) => {
        const arr = adminsByCompany.get(a.companyId) || [];
        arr.push({ ...a, user: usersMap.get(a.userId) });
        adminsByCompany.set(a.companyId, arr);
      });

      return {
        list: list.map((item) => ({
          ...this.transformCompany(item),
          admins: adminsByCompany.get(item.id) || [],
          teamCount: (teamsByCompany.get(item.id) || []).length,
        })),
        total,
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
    }

    return {
      list: list.map((item) => this.transformCompany(item)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  async verifyCompany(
    companyId: string,
    action: 'passed' | 'rejected',
    remark?: string,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException('公司不存在');
    }

    const verifyStatus = action === 'passed' ? 1 : 2;

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        verifyStatus,
        verifyRemark: remark || null,
      },
    });

    await this.eventLog.log({
      bizType: 'company',
      bizId: companyId,
      eventType: 'admin_verify',
      detail: { action, remark },
    });

    return this.transformCompany(updated);
  }

  async getCompanyTeams(companyId: string, pagination: PaginationDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException('公司不存在');
    }

    const [list, total] = await Promise.all([
      this.prisma.team.findMany({
        where: { companyId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          companyId: true,
          name: true,
          teamSize: true,
          specialties: true,
          description: true,
          serviceArea: true,
          completedCount: true,
          avgRating: true,
          reviewCount: true,
          recommended: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.team.count({ where: { companyId } }),
    ]);

    const teamIds = list.map((t) => t.id);
    const teamMembers = new Map<string, { leaders: any[]; memberCount: number }>();
    if (teamIds.length > 0) {
      const members = await this.prisma.user.findMany({
        where: { teamId: { in: teamIds } },
        select: {
          id: true,
          teamId: true,
          nickname: true,
          phone: true,
          isTeamAdmin: true,
          status: true,
        },
      });
      teamIds.forEach((tid) => {
        const teamMemberList = members.filter((m) => m.teamId === tid);
        teamMembers.set(tid, {
          leaders: teamMemberList.filter((m) => m.isTeamAdmin),
          memberCount: teamMemberList.length,
        });
      });
    }

    return {
      list: list.map((item) => {
        const transformed = this.transformTeam(item);
        const members = teamMembers.get(item.id);
        const leaderNames = members?.leaders?.map((l) => l.nickname || l.phone).join('、') || null;
        return {
          ...transformed,
          leaderName: leaderNames,
          leaderNames,
          memberCount: members?.memberCount || 0,
        };
      }),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  // ==================== 团队管理 ====================

  async getTeamList(pagination: PaginationDto, filters?: any) {
    const where: any = {};

    if (filters?.companyId !== undefined) {
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
        select: {
          id: true,
          companyId: true,
          name: true,
          teamSize: true,
          specialties: true,
          description: true,
          serviceArea: true,
          completedCount: true,
          avgRating: true,
          reviewCount: true,
          recommended: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.team.count({ where }),
    ]);

    const teamIds = list.map((t) => t.id);

    // 并行获取企业信息、队长信息、成员数信息
    const [companies, teamMembers] = await Promise.all([
      (async () => {
        const companyIds = list.map((t) => t.companyId).filter(Boolean);
        const companyMap = new Map<string, any>();
        if (companyIds.length > 0) {
          const found = await this.prisma.company.findMany({
            where: { id: { in: companyIds } },
            select: { id: true, name: true },
          });
          found.forEach((c) => companyMap.set(c.id, c));
        }
        return companyMap;
      })(),
      (async () => {
        const result = new Map<string, { leaders: any[]; memberCount: number }>();
        if (teamIds.length > 0) {
          const members = await this.prisma.user.findMany({
            where: { teamId: { in: teamIds } },
            select: {
              id: true,
              teamId: true,
              nickname: true,
              phone: true,
              isTeamAdmin: true,
              status: true,
            },
          });
          teamIds.forEach((tid) => {
            const teamMemberList = members.filter((m) => m.teamId === tid);
            result.set(tid, {
              leaders: teamMemberList.filter((m) => m.isTeamAdmin),
              memberCount: teamMemberList.length,
            });
          });
        }
        return result;
      })(),
    ]);

    return {
      list: list.map((item) => {
        const transformed = this.transformTeam(item);
        const members = teamMembers.get(item.id);
        const leaderNames = members?.leaders?.map((l) => l.nickname || l.phone).join('、') || null;
        return {
          ...transformed,
          company: companies.get(item.companyId) || null,
          companyName: companies.get(item.companyId)?.name || null,
          leaderName: leaderNames,
          leaderNames,
          memberCount: members?.memberCount || 0,
        };
      }),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  async updateTeamStatus(userId: string, teamId: string, status: number) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    const updated = await this.prisma.team.update({
      where: { id: teamId },
      data: { status },
      select: {
        id: true,
        companyId: true,
        name: true,
        leaderAName: true,
        leaderAPhone: true,
        teamSize: true,
        status: true,
        updatedAt: true,
      },
    });

    let companyInfo = null;
    if (updated.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: updated.companyId },
        select: { id: true, name: true },
      });
      companyInfo = company;
    }

    await this.eventLog.log({
      bizType: 'team',
      bizId: teamId,
      eventType: 'admin_update_status',
      operatorId: userId,
      detail: { teamId, oldStatus: team.status, newStatus: status },
    });

    const transformed = this.transformTeam(updated);
    return {
      ...transformed,
      company: companyInfo,
      companyName: companyInfo?.name || null,
    };
  }

  // 设置/取消团队推荐
  async setTeamRecommended(userId: string, teamId: string, recommended: boolean) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    const updated = await this.prisma.team.update({
      where: { id: teamId },
      data: { recommended },
      select: {
        id: true,
        companyId: true,
        name: true,
        teamSize: true,
        specialties: true,
        description: true,
        serviceArea: true,
        completedCount: true,
        avgRating: true,
        reviewCount: true,
        recommended: true,
        status: true,
        updatedAt: true,
      },
    });

    let companyInfo = null;
    if (updated.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: updated.companyId },
        select: { id: true, name: true },
      });
      companyInfo = company;
    }

    await this.eventLog.log({
      bizType: 'team',
      bizId: teamId,
      eventType: recommended ? 'admin_set_recommended' : 'admin_cancel_recommended',
      operatorId: userId,
      detail: { teamId, recommended },
    });

    const transformed = this.transformTeam(updated);
    return {
      ...transformed,
      company: companyInfo,
      companyName: companyInfo?.name || null,
    };
  }

  // 获取所有团队简表（用于下拉选择）
  async getAllTeamsSimple() {
    const teams = await this.prisma.team.findMany({
      where: { status: 1 },
      select: { id: true, name: true, companyId: true },
      orderBy: { createdAt: 'desc' },
    });

    const companyIds = teams.map((t) => t.companyId).filter(Boolean);
    const companyMap = new Map<string, any>();
    if (companyIds.length > 0) {
      const companies = await this.prisma.company.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, name: true },
      });
      companies.forEach((c) => companyMap.set(c.id, c));
    }

    return teams.map((t) => ({
      id: t.id,
      name: t.name,
      companyId: t.companyId,
      companyName: companyMap.get(t.companyId)?.name || null,
    }));
  }

  // 为用户分配/取消团队
  async assignUserTeam(operatorId: string, targetId: string, teamId: string | null) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    let targetTeam = null;
    if (teamId && teamId.trim() !== '') {
      targetTeam = await this.prisma.team.findUnique({
        where: { id: teamId },
      });
      if (!targetTeam) {
        throw new NotFoundException('团队不存在');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: {
        teamId: teamId && teamId.trim() !== '' ? teamId : null,
        isTeamAdmin: teamId && teamId.trim() !== '' ? user.isTeamAdmin : false,
      },
      select: {
        id: true,
        teamId: true,
        isTeamAdmin: true,
        updatedAt: true,
      },
    });

    await this.eventLog.log({
      bizType: 'user',
      bizId: targetId,
      eventType: 'admin_assign_team',
      operatorId,
      detail: {
        targetId,
        oldTeamId: user.teamId,
        newTeamId: updated.teamId,
      },
    });

    return updated;
  }

  // 获取团队成员列表
  async getTeamMembers(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, name: true, companyId: true },
    });
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    const members = await this.prisma.user.findMany({
      where: { teamId },
      select: {
        id: true,
        nickname: true,
        phone: true,
        realName: true,
        avatarUrl: true,
        isTeamAdmin: true,
        status: true,
        createdAt: true,
      },
      orderBy: [{ isTeamAdmin: 'desc' }, { createdAt: 'asc' }],
    });

    return {
      team: {
        id: team.id,
        name: team.name,
        companyId: team.companyId,
      },
      members,
      total: members.length,
    };
  }

  // 设置/取消团队队长
  async setTeamLeader(operatorId: string, teamId: string, userId: string, isLeader: boolean) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.teamId !== teamId) {
      throw new BadRequestException('该用户不属于该团队');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isTeamAdmin: isLeader },
      select: {
        id: true,
        nickname: true,
        phone: true,
        isTeamAdmin: true,
        teamId: true,
        updatedAt: true,
      },
    });

    await this.eventLog.log({
      bizType: 'team',
      bizId: teamId,
      eventType: 'admin_set_leader',
      operatorId,
      detail: {
        teamId,
        userId,
        isLeader,
      },
    });

    return updated;
  }

  // 移除团队成员（清空 teamId）
  async removeTeamMember(operatorId: string, teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.teamId !== teamId) {
      throw new BadRequestException('该用户不属于该团队');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { teamId: null, isTeamAdmin: false },
    });

    await this.eventLog.log({
      bizType: 'team',
      bizId: teamId,
      eventType: 'admin_remove_member',
      operatorId,
      detail: {
        teamId,
        userId,
        userName: user.nickname || user.phone,
      },
    });

    return { success: true };
  }

  // ==================== 需求管理 ====================

  async getDemandList(pagination: PaginationDto, filters?: any) {
    const where: any = {};

    if (filters?.status !== undefined && filters.status !== '') {
      where.status = Number(filters.status);
    }
    if (filters?.district && filters.district.trim() !== '') {
      where.district = { contains: filters.district };
    }
    if (filters?.demoType !== undefined && filters.demoType !== '') {
      where.demoType = Number(filters.demoType);
    }

    const [list, total] = await Promise.all([
      this.prisma.demand.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          demandNo: true,
          userId: true,
          demoType: true,
          title: true,
          description: true,
          address: true,
          district: true,
          longitude: true,
          latitude: true,
          area: true,
          communityName: true,
          contactName: true,
          contactPhone: true,
          budget: true,
          expectedTime: true,
          imageIds: true,
          status: true,
          selectedQuoteIds: true,
          quoteCount: true,
          viewCount: true,
          expiredAt: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.demand.count({ where }),
    ]);

    const userIds = list.map((d) => d.userId).filter(Boolean);
    const userMap = new Map<string, any>();
    if (userIds.length > 0) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, nickname: true, phone: true },
      });
      users.forEach((u) => userMap.set(u.id, u));
    }

    return {
      list: list.map((item) => this.transformDemand({ ...item, user: userMap.get(item.userId) || null })),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  async updateDemandStatus(userId: string, demandId: string, status: number) {
    const demand = await this.prisma.demand.findUnique({
      where: { id: demandId },
    });
    if (!demand) {
      throw new NotFoundException('需求不存在');
    }

    const updated = await this.prisma.demand.update({
      where: { id: demandId },
      data: { status },
      select: {
        id: true,
        demandNo: true,
        userId: true,
        demoType: true,
        title: true,
        status: true,
        quoteCount: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    let userInfo = null;
    if (updated.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: updated.userId },
        select: { id: true, nickname: true, phone: true },
      });
      userInfo = user;
    }

    await this.eventLog.log({
      bizType: 'demand',
      bizId: demandId,
      eventType: 'admin_update_status',
      operatorId: userId,
      detail: { demandId, oldStatus: demand.status, newStatus: status },
    });

    return this.transformDemand({ ...updated, user: userInfo });
  }

  // ==================== 报价管理 ====================

  async getQuoteList(pagination: PaginationDto, filters?: any) {
    const where: any = {};

    if (filters?.status !== undefined && filters.status !== '') {
      where.status = Number(filters.status);
    }
    if (filters?.demandId && filters.demandId.trim() !== '') {
      where.demandId = String(filters.demandId);
    }
    if (filters?.teamId && filters.teamId.trim() !== '') {
      where.teamId = String(filters.teamId);
    }

    const [list, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          quoteNo: true,
          demandId: true,
          teamId: true,
          companyId: true,
          price: true,
          duration: true,
          planSummary: true,
          remark: true,
          status: true,
          reviewRemark: true,
          reviewedAt: true,
          reviewedBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.quote.count({ where }),
    ]);

    const demandIds = list.map((q) => q.demandId).filter(Boolean);
    const teamIds = list.map((q) => q.teamId).filter(Boolean);
    const companyIds = list.map((q) => q.companyId).filter(Boolean);

    const [demands, teams, companies] = await Promise.all([
      demandIds.length > 0
        ? this.prisma.demand.findMany({
            where: { id: { in: demandIds } },
            select: { id: true, demandNo: true, title: true },
          })
        : [],
      teamIds.length > 0
        ? this.prisma.team.findMany({
            where: { id: { in: teamIds } },
            select: { id: true, name: true },
          })
        : [],
      companyIds.length > 0
        ? this.prisma.company.findMany({
            where: { id: { in: companyIds } },
            select: { id: true, name: true },
          })
        : [],
    ]);

    const demandMap = new Map<string, any>();
    demands.forEach((d) => demandMap.set(d.id, d));
    const teamMap = new Map<string, any>();
    teams.forEach((t) => teamMap.set(t.id, t));
    const companyMap = new Map<string, any>();
    companies.forEach((c) => companyMap.set(c.id, c));

    return {
      list: list.map((item) =>
        this.transformQuote({
          ...item,
          demand: demandMap.get(item.demandId) || null,
          team: teamMap.get(item.teamId) || null,
          company: companyMap.get(item.companyId) || null,
        }),
      ),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  async reviewQuote(
    quoteId: string,
    action: 'passed' | 'rejected',
    remark?: string,
    reviewerId?: string,
  ) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
    });
    if (!quote) {
      throw new NotFoundException('报价不存在');
    }

    const status = action === 'passed' ? 1 : 2;

    const updated = await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        status,
        reviewRemark: remark || null,
        reviewedAt: new Date(),
        reviewedBy: reviewerId || null,
      },
      select: {
        id: true,
        quoteNo: true,
        demandId: true,
        teamId: true,
        companyId: true,
        price: true,
        duration: true,
        planSummary: true,
        remark: true,
        status: true,
        reviewRemark: true,
        reviewedAt: true,
        reviewedBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const [demand, team, company] = await Promise.all([
      updated.demandId
        ? this.prisma.demand.findUnique({
            where: { id: updated.demandId },
            select: { id: true, demandNo: true, title: true },
          })
        : null,
      updated.teamId
        ? this.prisma.team.findUnique({
            where: { id: updated.teamId },
            select: { id: true, name: true },
          })
        : null,
      updated.companyId
        ? this.prisma.company.findUnique({
            where: { id: updated.companyId },
            select: { id: true, name: true },
          })
        : null,
    ]);

    await this.eventLog.log({
      bizType: 'quote',
      bizId: quoteId,
      eventType: 'admin_review',
      operatorId: reviewerId,
      detail: { action, remark },
    });

    return this.transformQuote({
      ...updated,
      demand,
      team,
      company,
    });
  }

  // ==================== 订单管理 ====================

  async getOrderList(pagination: PaginationDto, filters?: any) {
    const where: any = {};

    if (filters?.status !== undefined && filters.status !== '') {
      where.status = Number(filters.status);
    }
    if (filters?.teamId && filters.teamId.trim() !== '') {
      where.teamId = String(filters.teamId);
    }
    if (filters?.companyId && filters.companyId.trim() !== '') {
      where.companyId = String(filters.companyId);
    }

    const [list, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNo: true,
          demandId: true,
          userId: true,
          teamId: true,
          companyId: true,
          quoteIds: true,
          finalPrice: true,
          status: true,
          confirmedAt: true,
          startedAt: true,
          completedAt: true,
          acceptedAt: true,
          createdBy: true,
          contractId: true,
          contractStatus: true,
          signedAt: true,
          planStartDate: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const demandIds = list.map((o) => o.demandId).filter(Boolean);
    const userIds = list.map((o) => o.userId).filter(Boolean);
    const teamIds = list.map((o) => o.teamId).filter(Boolean);
    const companyIds = list.map((o) => o.companyId).filter(Boolean);
    const contractIds = list.map((o) => o.contractId).filter(Boolean);

    const [demands, users, teams, companies, contractFiles] = await Promise.all([
      demandIds.length > 0
        ? this.prisma.demand.findMany({
            where: { id: { in: demandIds } },
            select: { id: true, demandNo: true, title: true, demoType: true },
          })
        : [],
      userIds.length > 0
        ? this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, nickname: true, phone: true },
          })
        : [],
      teamIds.length > 0
        ? this.prisma.team.findMany({
            where: { id: { in: teamIds } },
            select: { id: true, name: true },
          })
        : [],
      companyIds.length > 0
        ? this.prisma.company.findMany({
            where: { id: { in: companyIds } },
            select: { id: true, name: true },
          })
        : [],
      contractIds.length > 0
        ? this.prisma.file.findMany({
            where: { id: { in: contractIds } },
            select: { id: true, fileUrl: true, fileName: true },
          })
        : [],
    ]);

    const demandMap = new Map<string, any>();
    demands.forEach((d) => demandMap.set(d.id, d));
    const userMap = new Map<string, any>();
    users.forEach((u) => userMap.set(u.id, u));
    const teamMap = new Map<string, any>();
    teams.forEach((t) => teamMap.set(t.id, t));
    const companyMap = new Map<string, any>();
    companies.forEach((c) => companyMap.set(c.id, c));
    const contractMap = new Map<string, any>();
    contractFiles.forEach((f) => contractMap.set(f.id, f));

    return {
      list: list.map((item) =>
        this.transformOrder({
          ...item,
          demand: demandMap.get(item.demandId) || null,
          user: userMap.get(item.userId) || null,
          team: teamMap.get(item.teamId) || null,
          company: companyMap.get(item.companyId) || null,
          contractFile: contractMap.get(item.contractId) || null,
        }),
      ),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * Admin审核订单通过 (0待审核 → 1待签约)
   */
  async adminApproveOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 0) {
      throw new BadRequestException('当前订单状态不允许审核');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 1, // 待签约
        confirmedAt: new Date(),
      },
    });

    await this.eventLog.log({
      bizType: 'order',
      bizId: orderId,
      eventType: 'admin_approve',
      operatorId: userId,
    });

    return { ...this.transformOrder(updated) };
  }

  /**
   * Admin审核合同通过 (2待开工 → 3施工中 或 保持2待开工)
   * 注意：合同审核通过后，如果开工日期已到则立即进入施工中状态
   */
  async approveContract(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 2 || order.contractStatus !== 1) {
      throw new BadRequestException('当前订单状态不允许审核合同');
    }

    // 检查是否当天即可开工（开工日期 <= 今天），使用日期字符串比较避免时区问题
    const todayStr = new Date().toISOString().split('T')[0];
    const planDateStr = order.planStartDate ? new Date(order.planStartDate).toISOString().split('T')[0] : null;
    const isTodayOrBefore = planDateStr && planDateStr <= todayStr;

    const [updated, contractFile] = await Promise.all([
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          contractStatus: 2, // 已通过
          signedAt: new Date(),
          status: isTodayOrBefore ? 3 : 2, // 当天或之前可开工则进入施工中
          startedAt: isTodayOrBefore ? new Date() : null,
        },
      }),
      order.contractId
        ? this.prisma.file.findUnique({
            where: { id: order.contractId },
            select: { id: true, fileUrl: true, fileName: true },
          })
        : null,
    ]);

    await this.eventLog.log({
      bizType: 'order',
      bizId: orderId,
      eventType: 'approve_contract',
      operatorId: userId,
      detail: { status: updated.status, isTodayOrBefore },
    });

    return { ...this.transformOrder(updated), contractFile };
  }

  // ==================== 施工日志监控 ====================

  async getLogList(pagination: PaginationDto, filters?: any) {
    const where: any = {};

    if (filters?.orderId && filters.orderId.trim() !== '') {
      where.orderId = String(filters.orderId);
    }
    if (filters?.teamId && filters.teamId.trim() !== '') {
      where.teamId = String(filters.teamId);
    }

    const [list, total] = await Promise.all([
      this.prisma.constructionLog.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { logDate: 'desc' },
        select: {
          id: true,
          orderId: true,
          teamId: true,
          logDate: true,
          content: true,
          progress: true,
          workers: true,
          imageIds: true,
          videoIds: true,
          isAbnormal: true,
          abnormalDesc: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.constructionLog.count({ where }),
    ]);

    const orderIds = list.map((l) => l.orderId).filter(Boolean);
    const teamIds = list.map((l) => l.teamId).filter(Boolean);

    const [orders, teams] = await Promise.all([
      orderIds.length > 0
        ? this.prisma.order.findMany({
            where: { id: { in: orderIds } },
            select: { id: true, orderNo: true },
          })
        : [],
      teamIds.length > 0
        ? this.prisma.team.findMany({
            where: { id: { in: teamIds } },
            select: { id: true, name: true },
          })
        : [],
    ]);

    const orderMap = new Map<string, any>();
    orders.forEach((o) => orderMap.set(o.id, o));
    const teamMapForLog = new Map<string, any>();
    teams.forEach((t) => teamMapForLog.set(t.id, t));

    return {
      list: list.map((item) =>
        this.transformConstructionLog({
          ...item,
          order: orderMap.get(item.orderId) || null,
          team: teamMapForLog.get(item.teamId) || null,
        }),
      ),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  // ==================== 案例管理 ====================

  async getCaseList(pagination: PaginationDto, filters?: any) {
    const where: any = {};

    if (filters?.status !== undefined) {
      where.status = Number(filters.status);
    }
    if (filters?.teamId !== undefined && filters.teamId !== '') {
      where.teamId = String(filters.teamId);
    }
    if (filters?.demoType !== undefined) {
      where.demoType = Number(filters.demoType);
    }

    const [list, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          teamId: true,
          companyId: true,
          title: true,
          demoType: true,
          description: true,
          address: true,
          area: true,
          duration: true,
          beforeImageIds: true,
          afterImageIds: true,
          status: true,
          recommended: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.case.count({ where }),
    ]);

    const teamIds = list.map((c) => c.teamId).filter(Boolean);
    const companyIds = list.map((c) => c.companyId).filter(Boolean);

    const [teams, companies] = await Promise.all([
      teamIds.length > 0
        ? this.prisma.team.findMany({
            where: { id: { in: teamIds } },
            select: { id: true, name: true },
          })
        : [],
      companyIds.length > 0
        ? this.prisma.company.findMany({
            where: { id: { in: companyIds } },
            select: { id: true, name: true },
          })
        : [],
    ]);

    const teamMap = new Map<string, any>();
    teams.forEach((t) => teamMap.set(t.id, t));
    const companyMapForCase = new Map<string, any>();
    companies.forEach((c) => companyMapForCase.set(c.id, c));

    // 获取所有图片ID并查询对应的URL
    const allFileIds = new Set<string>();
    list.forEach((c) => {
      const beforeIds = (c.beforeImageIds as any[]) || [];
      const afterIds = (c.afterImageIds as any[]) || [];
      beforeIds.forEach((id) => allFileIds.add(String(id)));
      afterIds.forEach((id) => allFileIds.add(String(id)));
    });

    let fileUrlMap = new Map<string, string>();
    if (allFileIds.size > 0) {
      const files = await this.prisma.file.findMany({
        where: { id: { in: Array.from(allFileIds) } },
        select: { id: true, fileUrl: true },
      });
      files.forEach((f) => fileUrlMap.set(f.id, f.fileUrl));
    }

    return {
      list: list.map((item) => {
        // 添加图片URLs
        const beforeIds = (item.beforeImageIds as any[]) || [];
        const afterIds = (item.afterImageIds as any[]) || [];
        const beforeImageUrls = beforeIds.map((id) => fileUrlMap.get(String(id))).filter(Boolean);
        const afterImageUrls = afterIds.map((id) => fileUrlMap.get(String(id))).filter(Boolean);

        return this.transformCase({
          ...item,
          beforeImageUrls,
          afterImageUrls,
          team: teamMap.get(item.teamId) || null,
          company: companyMapForCase.get(item.companyId) || null,
        });
      }),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  async updateCaseStatus(
    userId: string,
    caseId: string,
    action: 'visible' | 'hidden' | 'passed' | 'rejected',
  ) {
    const caseItem = await this.prisma.case.findUnique({
      where: { id: caseId },
    });
    if (!caseItem) {
      throw new NotFoundException('案例不存在');
    }

    // visible=1 显示, hidden=0 隐藏(软删除)
    let status: number;
    if (action === 'visible') {
      status = 1;
    } else if (action === 'hidden') {
      status = 0;
    } else if (action === 'passed') {
      status = 1;
    } else if (action === 'rejected') {
      status = 0;
    } else {
      throw new BadRequestException('无效的操作');
    }

    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: { status },
      select: {
        id: true,
        teamId: true,
        companyId: true,
        title: true,
        demoType: true,
        description: true,
        address: true,
        area: true,
        duration: true,
        beforeImageIds: true,
        afterImageIds: true,
        status: true,
        recommended: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const [team, company] = await Promise.all([
      updated.teamId
        ? this.prisma.team.findUnique({
            where: { id: updated.teamId },
            select: { id: true, name: true },
          })
        : null,
      updated.companyId
        ? this.prisma.company.findUnique({
            where: { id: updated.companyId },
            select: { id: true, name: true },
          })
        : null,
    ]);

    await this.eventLog.log({
      bizType: 'case',
      bizId: caseId,
      eventType: 'admin_status_change',
      operatorId: userId,
      detail: { action, newStatus: status },
    });

    // 获取图片URLs
    const beforeIds = (updated.beforeImageIds as any[]) || [];
    const afterIds = (updated.afterImageIds as any[]) || [];
    const allFileIds = [...beforeIds, ...afterIds].map((id) => String(id));
    let fileUrlMap = new Map<string, string>();
    if (allFileIds.length > 0) {
      const files = await this.prisma.file.findMany({
        where: { id: { in: allFileIds } },
        select: { id: true, fileUrl: true },
      });
      files.forEach((f) => fileUrlMap.set(f.id, f.fileUrl));
    }
    const beforeImageUrls = beforeIds.map((id) => fileUrlMap.get(String(id))).filter(Boolean);
    const afterImageUrls = afterIds.map((id) => fileUrlMap.get(String(id))).filter(Boolean);

    return this.transformCase({
      ...updated,
      beforeImageUrls,
      afterImageUrls,
      team,
      company,
    });
  }

  /**
   * 创建案例（管理员）
   */
  async createCase(userId: string, data: {
    teamId: string;
    title: string;
    demoType: number;
    description?: string;
    address?: string;
    area?: string;
    duration?: number;
    beforeImageIds?: string[];
    afterImageIds?: string[];
    recommended?: boolean;
  }) {
    // 验证团队存在并获取公司ID
    const team = await this.prisma.team.findUnique({
      where: { id: data.teamId },
      select: { id: true, companyId: true, name: true },
    });

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    const c = await this.prisma.case.create({
      data: {
        teamId: data.teamId,
        companyId: team.companyId,
        title: data.title,
        demoType: data.demoType,
        description: data.description || null,
        address: data.address || null,
        area: data.area ? new Prisma.Decimal(data.area) : null,
        duration: data.duration,
        beforeImageIds: data.beforeImageIds?.length ? data.beforeImageIds as any : Prisma.JsonNull,
        afterImageIds: data.afterImageIds?.length ? data.afterImageIds as any : Prisma.JsonNull,
        status: 0, // 待审核
        recommended: data.recommended || false,
      },
    });

    await this.eventLog.log({
      bizType: 'case',
      bizId: c.id,
      eventType: 'admin_create',
      operatorId: userId,
      detail: { title: data.title, teamId: data.teamId },
    });

    // 获取关联数据后返回
    const [teamResult, company] = await Promise.all([
      this.prisma.team.findUnique({
        where: { id: c.teamId },
        select: { id: true, name: true },
      }),
      this.prisma.company.findUnique({
        where: { id: c.companyId },
        select: { id: true, name: true },
      }),
    ]);

    // 获取图片URLs
    const beforeIds = (c.beforeImageIds as any[]) || [];
    const afterIds = (c.afterImageIds as any[]) || [];
    const allFileIds = [...beforeIds, ...afterIds].map((id) => String(id));
    let fileUrlMap = new Map<string, string>();
    if (allFileIds.length > 0) {
      const files = await this.prisma.file.findMany({
        where: { id: { in: allFileIds } },
        select: { id: true, fileUrl: true },
      });
      files.forEach((f) => fileUrlMap.set(f.id, f.fileUrl));
    }
    const beforeImageUrls = beforeIds.map((id) => fileUrlMap.get(String(id))).filter(Boolean);
    const afterImageUrls = afterIds.map((id) => fileUrlMap.get(String(id))).filter(Boolean);

    return this.transformCase({
      ...c,
      beforeImageUrls,
      afterImageUrls,
      team: teamResult,
      company,
    });
  }

  /**
   * 更新案例（管理员）
   */
  async updateCase(
    userId: string,
    caseId: string,
    data: {
      title?: string;
      demoType?: number;
      description?: string;
      address?: string;
      area?: string;
      duration?: number;
      beforeImageIds?: string[];
      afterImageIds?: string[];
      status?: number;
      recommended?: boolean;
    },
  ) {
    const caseItem = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseItem) {
      throw new NotFoundException('案例不存在');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.demoType !== undefined) updateData.demoType = data.demoType;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.area !== undefined) updateData.area = data.area ? new Prisma.Decimal(data.area) : null;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.beforeImageIds !== undefined) {
      updateData.beforeImageIds = data.beforeImageIds?.length ? data.beforeImageIds as any : Prisma.JsonNull;
    }
    if (data.afterImageIds !== undefined) {
      updateData.afterImageIds = data.afterImageIds?.length ? data.afterImageIds as any : Prisma.JsonNull;
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.recommended !== undefined) updateData.recommended = data.recommended;

    const updated = await this.prisma.case.update({
      where: { id: caseId },
      data: updateData,
    });

    await this.eventLog.log({
      bizType: 'case',
      bizId: caseId,
      eventType: 'admin_update',
      operatorId: userId,
      detail: { fields: Object.keys(data) },
    });

    // 获取关联数据后返回
    const [teamResult, company] = await Promise.all([
      updated.teamId
        ? this.prisma.team.findUnique({
            where: { id: updated.teamId },
            select: { id: true, name: true },
          })
        : null,
      updated.companyId
        ? this.prisma.company.findUnique({
            where: { id: updated.companyId },
            select: { id: true, name: true },
          })
        : null,
    ]);

    // 获取图片URLs
    const beforeIds = (updated.beforeImageIds as any[]) || [];
    const afterIds = (updated.afterImageIds as any[]) || [];
    const allFileIds = [...beforeIds, ...afterIds].map((id) => String(id));
    let fileUrlMap = new Map<string, string>();
    if (allFileIds.length > 0) {
      const files = await this.prisma.file.findMany({
        where: { id: { in: allFileIds } },
        select: { id: true, fileUrl: true },
      });
      files.forEach((f) => fileUrlMap.set(f.id, f.fileUrl));
    }
    const beforeImageUrls = beforeIds.map((id) => fileUrlMap.get(String(id))).filter(Boolean);
    const afterImageUrls = afterIds.map((id) => fileUrlMap.get(String(id))).filter(Boolean);

    return this.transformCase({
      ...updated,
      beforeImageUrls,
      afterImageUrls,
      team: teamResult,
      company,
    });
  }

  // ==================== 合规模板管理 ====================

  async getComplianceList(pagination: PaginationDto, filters?: any) {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    const [list, total] = await Promise.all([
      this.prisma.complianceDoc.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.complianceDoc.count({ where }),
    ]);

    return {
      list: list.map((item) => item),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  async createCompliance(data: {
    title: string,
    category: string,
    description?: string,
    fileId?: number,
    fileUrl?: string,
    sortOrder?: number,
  }) {
    const doc = await this.prisma.complianceDoc.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        fileId: data.fileId,
        fileUrl: data.fileUrl,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return doc;
  }

  async updateCompliance(
    id: string,
    data: {
      title?: string,
      category?: string,
      description?: string,
      fileId?: number,
      fileUrl?: string,
      sortOrder?: number,
      status?: number,
    },
  ) {
    const doc = await this.prisma.complianceDoc.findUnique({
      where: { id },
    });
    if (!doc) {
      throw new NotFoundException('合规模板不存在');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.fileId !== undefined) updateData.fileId = data.fileId;
    if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.status !== undefined) updateData.status = data.status;

    const updated = await this.prisma.complianceDoc.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  async deleteCompliance(id: string) {
    const doc = await this.prisma.complianceDoc.findUnique({
      where: { id },
    });
    if (!doc) {
      throw new NotFoundException('合规模板不存在');
    }

    await this.prisma.complianceDoc.delete({
      where: { id },
    });

    return { success: true };
  }

  // ==================== 数据看板 ====================

  async getDashboard() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      todayUsers,
      todayDemands,
      todayQuotes,
      todayOrders,
      demandStatusStats,
      orderStatusStats,
      companyVerifyStats,
      pendingReviewQuotes,
      pendingReviewCases,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.demand.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.quote.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.demand.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.company.groupBy({
        by: ['verifyStatus'],
        _count: { verifyStatus: true },
      }),
      this.prisma.quote.count({
        where: { status: 0 },
      }),
      this.prisma.case.count({
        where: { status: 0 },
      }),
    ]);

    return {
      todayUsers,
      todayDemands,
      todayQuotes,
      todayOrders,
      demandStatusStats: demandStatusStats.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      orderStatusStats: orderStatusStats.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      companyVerifyStats: companyVerifyStats.map((item) => ({
        status: item.verifyStatus,
        count: item._count.verifyStatus,
      })),
      pendingReviewQuotes,
      pendingReviewCases,
    };
  }

  // ==================== 工具方法 ====================

  private transformCompany(company: any) {
    if (!company) return null;

    const result: any = {
      id: company.id,
      name: company.name,
      contactPerson: company.contactPerson,
      contactPhone: company.contactPhone,
      licenseNo: company.licenseNo,
      licenseImages: company.licenseImages,
      qualification: company.qualification,
      qualificationImages: company.qualificationImages,
      safetyCertNo: company.safetyCertNo,
      safetyCertImages: company.safetyCertImages,
      establishedAt: company.establishedAt,
      description: company.description,
      serviceArea: company.serviceArea,
      completedCount: company.completedCount,
      teamCount: company.teamCount,
      verifyStatus: company.verifyStatus,
      verifyRemark: company.verifyRemark,
      status: company.status,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };

    if (company.admins) {
      result.admins = company.admins.map((a: any) => ({
        id: a.id,
        role: a.role,
        createdAt: a.createdAt,
        user: a.user
          ? {
              id: a.user.id,
              nickname: a.user.nickname,
              phone: a.user.phone,
            }
          : undefined,
      }));
    }

    if (company._count) {
      result.teamCount = company._count.teams;
      result.caseCount = company._count.cases;
    }

    return result;
  }

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
      recommended: team.recommended || false,
      status: team.status,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };

    if (team.company) {
      result.company = {
        id: team.company.id,
        name: team.company.name,
      };
    }

    if (team._count) {
      result.memberCount = team._count.members;
      result.quoteCount = team._count.quotes;
      result.orderCount = team._count.orders;
      result.caseCount = team._count.cases;
    }

    return result;
  }

  private transformDemand(demand: any) {
    if (!demand) return null;

    const result: any = {
      id: demand.id,
      demandNo: demand.demandNo,
      userId: demand.userId,
      demoType: demand.demoType,
      title: demand.title,
      description: demand.description,
      address: demand.address,
      district: demand.district,
      longitude: demand.longitude ? Number(demand.longitude) : null,
      latitude: demand.latitude ? Number(demand.latitude) : null,
      area: demand.area ? Number(demand.area) : null,
      floor: demand.floor,
      expectedTime: demand.expectedTime,
      imageIds: demand.imageIds,
      status: demand.status,
      selectedQuoteIds: demand.selectedQuoteIds,
      quoteCount: demand.quoteCount,
      viewCount: demand.viewCount,
      expiredAt: demand.expiredAt,
      completedAt: demand.completedAt,
      createdAt: demand.createdAt,
      updatedAt: demand.updatedAt,
    };

    if (demand.user) {
      result.user = {
        id: demand.user.id,
        nickname: demand.user.nickname,
        phone: demand.user.phone,
      };
      result.userName = demand.user.nickname;
      result.userPhone = demand.user.phone;
    }

    if (demand._count) {
      result.totalQuotes = demand._count.quotes;
    }

    return result;
  }

  private transformQuote(quote: any) {
    if (!quote) return null;

    const result: any = {
      id: quote.id,
      quoteNo: quote.quoteNo,
      demandId: quote.demandId,
      teamId: quote.teamId,
      companyId: quote.companyId,
      price: quote.price ? Number(quote.price) : null,
      duration: quote.duration,
      planSummary: quote.planSummary,
      remark: quote.remark,
      status: quote.status,
      reviewRemark: quote.reviewRemark,
      reviewedAt: quote.reviewedAt,
      reviewedBy: quote.reviewedBy,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    };

    if (quote.demand) {
      result.demand = {
        id: quote.demand.id,
        demandNo: quote.demand.demandNo,
        title: quote.demand.title,
      };
      result.demandNo = quote.demand.demandNo;
      result.demandTitle = quote.demand.title;
    }

    if (quote.team) {
      result.team = {
        id: quote.team.id,
        name: quote.team.name,
      };
      result.teamName = quote.team.name;
    }

    if (quote.company) {
      result.company = {
        id: quote.company.id,
        name: quote.company.name,
      };
      result.companyName = quote.company.name;
    }

    return result;
  }

  private transformOrder(order: any) {
    if (!order) return null;

    const result: any = {
      id: order.id,
      orderNo: order.orderNo,
      demandId: order.demandId,
      userId: order.userId,
      teamId: order.teamId,
      companyId: order.companyId,
      quoteIds: order.quoteIds,
      finalPrice: order.finalPrice ? Number(order.finalPrice) : null,
      status: order.status,
      confirmedAt: order.confirmedAt,
      startedAt: order.startedAt,
      completedAt: order.completedAt,
      acceptedAt: order.acceptedAt,
      createdBy: order.createdBy,
      contractId: order.contractId,
      contractStatus: order.contractStatus,
      signedAt: order.signedAt,
      planStartDate: order.planStartDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    if (order.demand) {
      result.demand = {
        id: order.demand.id,
        demandNo: order.demand.demandNo,
        title: order.demand.title,
        demoType: order.demand.demoType,
      };
      result.demandNo = order.demand.demandNo;
      result.demandTitle = order.demand.title;
    }

    if (order.user) {
      result.user = {
        id: order.user.id,
        nickname: order.user.nickname,
        phone: order.user.phone,
      };
      result.userName = order.user.nickname;
      result.userPhone = order.user.phone;
    }

    if (order.team) {
      result.team = {
        id: order.team.id,
        name: order.team.name,
      };
      result.teamName = order.team.name;
    }

    if (order.company) {
      result.company = {
        id: order.company.id,
        name: order.company.name,
      };
      result.companyName = order.company.name;
    }

    return result;
  }

  private transformConstructionLog(log: any) {
    if (!log) return null;

    const result: any = {
      id: log.id,
      orderId: log.orderId,
      teamId: log.teamId,
      logDate: log.logDate,
      content: log.content,
      progress: log.progress,
      workers: log.workers,
      imageIds: log.imageIds,
      videoIds: log.videoIds,
      isAbnormal: log.isAbnormal,
      abnormalDesc: log.abnormalDesc,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };

    if (log.order) {
      result.order = {
        id: log.order.id,
        orderNo: log.order.orderNo,
      };
      result.orderNo = log.order.orderNo;
    }

    if (log.team) {
      result.team = {
        id: log.team.id,
        name: log.team.name,
      };
      result.teamName = log.team.name;
    }

    return result;
  }

  private transformCase(caseItem: any) {
    if (!caseItem) return null;

    const result: any = {
      id: caseItem.id,
      teamId: caseItem.teamId,
      companyId: caseItem.companyId,
      title: caseItem.title,
      demoType: caseItem.demoType,
      description: caseItem.description,
      address: caseItem.address,
      area: caseItem.area ? Number(caseItem.area) : null,
      duration: caseItem.duration,
      beforeImageIds: caseItem.beforeImageIds,
      afterImageIds: caseItem.afterImageIds,
      beforeImageUrls: caseItem.beforeImageUrls || [],
      afterImageUrls: caseItem.afterImageUrls || [],
      status: caseItem.status,
      recommended: caseItem.recommended || false,
      viewCount: caseItem.viewCount,
      createdAt: caseItem.createdAt,
      updatedAt: caseItem.updatedAt,
    };

    if (caseItem.team) {
      result.team = {
        id: caseItem.team.id,
        name: caseItem.team.name,
      };
      result.teamName = caseItem.team.name;
    }

    if (caseItem.company) {
      result.company = {
        id: caseItem.company.id,
        name: caseItem.company.name,
      };
      result.companyName = caseItem.company.name;
    }

    return result;
  }
}
