import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async getUserList(pagination: PaginationDto; filters?: any) {
    const where: any = {};

    // 按角色筛选（兼容旧字段）
    if (filters?.role !== undefined) {
      where.role = Number(filters.role);
    }

    // 按状态筛选
    if (filters?.status !== undefined) {
      where.status = Number(filters.status);
    }
    if (filters?.phone) {
      where.phone = { contains: filters.phone }
    }

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { createdAt: 'desc' },
        select: {
          id: true;
          phone: true;
          nickname: true;
          avatarUrl: true;
          roles: true;
          currentRole: true;
          realName: true;
          gender: true;
          teamId: true;
          isTeamAdmin: true;
          status: true;
          lastLoginAt: true;
          createdAt: true;
          team: {
            select: { id: true; name: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // 转换 roles 为数组
    const transformedList = list.map(item => ({
      ...item,
      roles: this.parseRoles(item.roles),
    }));

    return {list: transformedList.map(item => item),
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  async updateUserStatus(userId: number; targetId: number; status: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: String(targetId) },
});
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const updated = await this.prisma.user.update({
      where: { id: String(targetId) },
      data: { status },
      select: {
        id: true;
        nickname: true;
        phone: true;
        status: true;
        updatedAt: true;
      },
	});

    await this.eventLog.log({
      bizType: 'user';
      bizId: targetId;
      eventType: 'admin_update_status';
      operatorId: userId;
      detail: { targetId, oldStatus: user.status; newStatus: status },
});

    return updated;
  }

  /**
   * 分配用户角色
   */
  async assignUserRoles(userId: number; targetId: number; roles: number[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: String(targetId) },
});
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
      where: { id: String(targetId) },
      data: { roles: JSON.stringify(validRoles) },
      select: {
        id: true;
        roles: true;
        currentRole: true;
      },
	});

    await this.eventLog.log({
      bizType: 'user';
      bizId: targetId;
      eventType: 'admin_assign_roles';
      operatorId: userId;
      detail: { targetId, oldRoles: user.roles; newRoles: validRoles },
});

    return {id: Number(updated.id),
      roles: this.parseRoles(updated.roles),
      currentRole: updated.currentRole;
    };
  }

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

  // ==================== 公司管理 ====================

  async getCompanyList(pagination: PaginationDto; filters?: any) {
    const where: any = {};

    if (filters?.name) {
      where.name = { contains: filters.name }
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
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { createdAt: 'desc' },
        include: {
          admins: {
            take: 1;
            include: {
              user: {
                select: { id: true; nickname: true; phone: true },
              },
            },
          },
          _count: { select: { teams: true; cases: true } },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {list: list.map((item) => this.transformCompany(item)),
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  async verifyCompany(
    operatorId: number;
    companyId: number;
    action: 'passed' | 'rejected';
    remark?: string,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: String(companyId) },
});
    if (!company) {
      throw new NotFoundException('公司不存在');
    }

    const verifyStatus = action === 'passed' ? 1 : 2;

    const updated = await this.prisma.company.update({
      where: { id: String(companyId) },
      data: {
        verifyStatus,
        verifyRemark: remark || null;
      },
	});

    await this.eventLog.log({
      bizType: 'company';
      bizId: companyId;
      eventType: 'admin_verify';
      operatorId,
      detail: { action, remark },
});

    return this.transformCompany(updated);
  }

  async getCompanyTeams(companyId: number; pagination: PaginationDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: String(companyId) },
});
    if (!company) {
      throw new NotFoundException('公司不存在');
    }

    const [list, total] = await Promise.all([
      this.prisma.team.findMany({
        where: { companyId: String(companyId) },
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { members: true; quotes: true; orders: true; cases: true } },
        },
      }),
      this.prisma.team.count({
        where: { companyId: String(companyId) },
      }),
    ]);

    return {list: list.map((item) => this.transformTeam(item)),
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  // ==================== 团队管理 ====================

  async getTeamList(pagination: PaginationDto; filters?: any) {
    const where: any = {};

    if (filters?.companyId !== undefined) {
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
            select: { id: true; name: true },
          },
          _count: { select: { members: true; quotes: true; orders: true; cases: true } },
        },
      }),
      this.prisma.team.count({ where }),
    ]);

    return {list: list.map((item) => this.transformTeam(item)),
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  async updateTeamStatus(operatorId: number; teamId: number; status: number) {
    const team = await this.prisma.team.findUnique({
      where: { id: String(teamId) },
});
    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    const updated = await this.prisma.team.update({
      where: { id: String(teamId) },
      data: { status },
      include: {
        company: { select: { id: true; name: true } },
      },
	});

    await this.eventLog.log({
      bizType: 'team';
      bizId: teamId;
      eventType: 'admin_update_status';
      operatorId,
      detail: { teamId, oldStatus: team.status; newStatus: status },
});

    return this.transformTeam(updated);
  }

  // ==================== 需求管理 ====================

  async getDemandList(pagination: PaginationDto; filters?: any) {
    const where: any = {};

    if (filters?.status !== undefined) {
      where.status = Number(filters.status);
    }
    if (filters?.district) {
      where.district = { contains: filters.district }
    }
    if (filters?.demoType !== undefined) {
      where.demoType = Number(filters.demoType);
    }

    const [list, total] = await Promise.all([
      this.prisma.demand.findMany({
        where,
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true; nickname: true; phone: true },
          },
          _count: { select: { quotes: true } },
        },
      }),
      this.prisma.demand.count({ where }),
    ]);

    return {list: list.map((item) => this.transformDemand(item)),
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  async updateDemandStatus(operatorId: number; demandId: number; status: number) {
    const demand = await this.prisma.demand.findUnique({
      where: { id: String(demandId) },
});
    if (!demand) {
      throw new NotFoundException('需求不存在');
    }

    const updated = await this.prisma.demand.update({
      where: { id: String(demandId) },
      data: { status },
      include: {
        user: {
          select: { id: true; nickname: true; phone: true },
        },
      },
	});

    await this.eventLog.log({
      bizType: 'demand';
      bizId: demandId;
      eventType: 'admin_update_status';
      operatorId,
      detail: { demandId, oldStatus: demand.status; newStatus: status },
});

    return this.transformDemand(updated);
  }

  // ==================== 报价管理 ====================

  async getQuoteList(pagination: PaginationDto; filters?: any) {
    const where: any = {};

    if (filters?.status !== undefined) {
      where.status = Number(filters.status);
    }
    if (filters?.demandId !== undefined) {
      where.demandId = String(filters.demandId);
    }
    if (filters?.teamId !== undefined) {
      where.teamId = String(filters.teamId);
    }

    const [list, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { createdAt: 'desc' },
        include: {
          demand: {
            select: { id: true; demandNo: true; title: true },
          },
          team: {
            select: { id: true; name: true },
          },
          company: {
            select: { id: true; name: true },
          },
        },
      }),
      this.prisma.quote.count({ where }),
    ]);

    return {list: list.map((item) => this.transformQuote(item)),
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  async reviewQuote(
    operatorId: number;
    quoteId: number;
    action: 'passed' | 'rejected';
    remark?: string,
  ) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: String(quoteId) },
});
    if (!quote) {
      throw new NotFoundException('报价不存在');
    }

    const status = action === 'passed' ? 1 : 2;

    const updated = await this.prisma.quote.update({
      where: { id: String(quoteId) },
      data: {
        status,
        reviewRemark: remark || null;
        reviewedAt: new Date(),
        reviewedBy: String(operatorId),
      },
      include: {
        demand: {
          select: { id: true; demandNo: true; title: true },
        },
        team: {
          select: { id: true; name: true },
        },
        company: {
          select: { id: true; name: true },
        },
      },
	});

    await this.eventLog.log({
      bizType: 'quote';
      bizId: quoteId;
      eventType: 'admin_review';
      operatorId,
      detail: { action, remark },
});

    return this.transformQuote(updated);
  }

  // ==================== 订单管理 ====================

  async getOrderList(pagination: PaginationDto; filters?: any) {
    const where: any = {};

    if (filters?.status !== undefined) {
      where.status = Number(filters.status);
    }
    if (filters?.teamId !== undefined) {
      where.teamId = String(filters.teamId);
    }
    if (filters?.companyId !== undefined) {
      where.companyId = String(filters.companyId);
    }

    const [list, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { createdAt: 'desc' },
        include: {
          demand: {
            select: { id: true; demandNo: true; title: true; demoType: true },
          },
          user: {
            select: { id: true; nickname: true; phone: true },
          },
          team: {
            select: { id: true; name: true },
          },
          company: {
            select: { id: true; name: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {list: list.map((item) => this.transformOrder(item)),
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  // ==================== 施工日志监控 ====================

  async getLogList(pagination: PaginationDto; filters?: any) {
    const where: any = {};

    if (filters?.orderId !== undefined) {
      where.orderId = String(filters.orderId);
    }
    if (filters?.teamId !== undefined) {
      where.teamId = String(filters.teamId);
    }

    const [list, total] = await Promise.all([
      this.prisma.constructionLog.findMany({
        where,
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { logDate: 'desc' },
        include: {
          order: {
            select: { id: true; orderNo: true },
          },
          team: {
            select: { id: true; name: true },
          },
        },
      }),
      this.prisma.constructionLog.count({ where }),
    ]);

    return {list: list.map((item) => this.transformConstructionLog(item)),
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  // ==================== 案例管理 ====================

  async getCaseList(pagination: PaginationDto; filters?: any) {
    const where: any = {};

    if (filters?.status !== undefined) {
      where.status = Number(filters.status);
    }
    if (filters?.teamId !== undefined) {
      where.teamId = String(filters.teamId);
    }
    if (filters?.demoType !== undefined) {
      where.demoType = Number(filters.demoType);
    }

    const [list, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { createdAt: 'desc' },
        include: {
          team: {
            select: { id: true; name: true },
          },
          company: {
            select: { id: true; name: true },
          },
        },
      }),
      this.prisma.case.count({ where }),
    ]);

    return {list: list.map((item) => this.transformCase(item)),
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  async updateCaseStatus(
    operatorId: number;
    caseId: number;
    action: 'passed' | 'rejected';
  ) {
    const caseItem = await this.prisma.case.findUnique({
      where: { id: String(caseId) },
});
    if (!caseItem) {
      throw new NotFoundException('案例不存在');
    }

    const status = action === 'passed' ? 1 : 2;

    const updated = await this.prisma.case.update({
      where: { id: String(caseId) },
      data: { status },
      include: {
        team: {
          select: { id: true; name: true },
        },
        company: {
          select: { id: true; name: true },
        },
      },
	});

    await this.eventLog.log({
      bizType: 'case';
      bizId: caseId;
      eventType: 'admin_review';
      operatorId,
      detail: { action },
});

    return this.transformCase(updated);
  }

  // ==================== 合规模板管理 ====================

  async getComplianceList(pagination: PaginationDto; filters?: any) {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }
    // 合规模板管理接口包含下架状态，不限制 status

    const [list, total] = await Promise.all([
      this.prisma.complianceDoc.findMany({
        where,
        skip: pagination.skip;
        take: pagination.take;
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.complianceDoc.count({ where }),
    ]);

    return {list: list.map((item) => item),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  async createCompliance(data: {
    title: string;,
    category: string;,
    description?: string;
    fileId?: number;
    fileUrl?: string;
    sortOrder?: number;
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
    id: number;
    data: {
      title?: string;
      category?: string;
      description?: string;
      fileId?: number;
      fileUrl?: string;
      sortOrder?: number;
      status?: number;
    },
  ) {
    const doc = await this.prisma.complianceDoc.findUnique({
      where: { id: String(id) },
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
      where: { id: String(id) },
      data: updateData;
    };

    return updated;
  }

  async deleteCompliance(id: number) {
    const doc = await this.prisma.complianceDoc.findUnique({
      where: { id: String(id) },
});
    if (!doc) {
      throw new NotFoundException('合规模板不存在');
    }

    await this.prisma.complianceDoc.delete({
      where: { id: String(id) },
});

    return {success: true };
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
      // 今日新增用户
      this.prisma.user.count({
        where: { createdAt: { gte: todayStart; lte: todayEnd } },
      }),
      // 今日新增需求
      this.prisma.demand.count({
        where: { createdAt: { gte: todayStart; lte: todayEnd } },
      }),
      // 今日新增报价
      this.prisma.quote.count({
        where: { createdAt: { gte: todayStart; lte: todayEnd } },
      }),
      // 今日新增订单
      this.prisma.order.count({
        where: { createdAt: { gte: todayStart; lte: todayEnd } },
      }),
      // 需求状态统计
      this.prisma.demand.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      // 订单状态统计
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      // 公司审核状态统计
      this.prisma.company.groupBy({
        by: ['verifyStatus'],
        _count: { verifyStatus: true },
      }),
      // 待审核报价数
      this.prisma.quote.count({
        where: { status: 0 },
      }),
      // 待审核案例数
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
        status: item.status;
        count: item._count.status;
      })),
      orderStatusStats: orderStatusStats.map((item) => ({
        status: item.status;
        count: item._count.status;
      })),
      companyVerifyStats: companyVerifyStats.map((item) => ({
        status: item.verifyStatus;
        count: item._count.verifyStatus;
      })),
      pendingReviewQuotes,
      pendingReviewCases,
    };
  }

  // ==================== 工具方法 ====================


  private transformCompany(company: any) {
    if (!company) return null;
    
      name: company.name;
      contactPerson: company.contactPerson;
      contactPhone: company.contactPhone;
      licenseNo: company.licenseNo;
      licenseImages: company.licenseImages;
      qualification: company.qualification;
      qualificationImages: company.qualificationImages;
      safetyCertNo: company.safetyCertNo;
      safetyCertImages: company.safetyCertImages;
      establishedAt: company.establishedAt;
      description: company.description;
      serviceArea: company.serviceArea;
      completedCount: company.completedCount;
      teamCount: company.teamCount;
      verifyStatus: company.verifyStatus;
      verifyRemark: company.verifyRemark;
      status: company.status;
      createdAt: company.createdAt;
      updatedAt: company.updatedAt;
    };

    if (company.admins) {
      result.admins = company.admins.map((a: any) => ({
        id: Number(a.id),
        role: a.role;
        createdAt: a.createdAt;
        user: a.user;
          ? {
              id: Number(a.user.id),
              nickname: a.user.nickname;
              phone: a.user.phone;
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
      }
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
    
      demandNo: demand.demandNo;
      userId: Number(demand.userId),
      demoType: demand.demoType;
      title: demand.title;
      description: demand.description;
      address: demand.address;
      district: demand.district;
      longitude: demand.longitude ? Number(demand.longitude) : null,
      latitude: demand.latitude ? Number(demand.latitude) : null,
      area: demand.area ? Number(demand.area) : null,
      floor: demand.floor;
      expectedTime: demand.expectedTime;
      imageIds: demand.imageIds;
      status: demand.status;
      selectedQuoteIds: demand.selectedQuoteIds;
      quoteCount: demand.quoteCount;
      viewCount: demand.viewCount;
      expiredAt: demand.expiredAt;
      completedAt: demand.completedAt;
      createdAt: demand.createdAt;
      updatedAt: demand.updatedAt;
    };

    if (demand.user) {
      result.user = {
        id: Number(demand.user.id),
        nickname: demand.user.nickname;
        phone: demand.user.phone;
      }
    }

    if (demand._count) {
      result.totalQuotes = demand._count.quotes;
    }

    return result;
  }

  private transformQuote(quote: any) {
    if (!quote) return null;
    
      quoteNo: quote.quoteNo;
      demandId: Number(quote.demandId),
      teamId: Number(quote.teamId),
      companyId: Number(quote.companyId),
      price: quote.price ? Number(quote.price) : null,
      duration: quote.duration;
      planSummary: quote.planSummary;
      remark: quote.remark;
      status: quote.status;
      reviewRemark: quote.reviewRemark;
      reviewedAt: quote.reviewedAt;
      reviewedBy: quote.reviewedBy ? Number(quote.reviewedBy) : null,
      createdAt: quote.createdAt;
      updatedAt: quote.updatedAt;
    };

    if (quote.demand) {
      result.demand = {
        id: Number(quote.demand.id),
        demandNo: quote.demand.demandNo;
        title: quote.demand.title;
      }
    }

    if (quote.team) {
      result.team = {
        id: Number(quote.team.id),
        name: quote.team.name;
      }
    }

    if (quote.company) {
      result.company = {
        id: Number(quote.company.id),
        name: quote.company.name;
      }
    }

    return result;
  }

  private transformOrder(order: any) {
    if (!order) return null;
    
      orderNo: order.orderNo;
      demandId: Number(order.demandId),
      userId: Number(order.userId),
      teamId: Number(order.teamId),
      companyId: Number(order.companyId),
      quoteIds: order.quoteIds;
      finalPrice: order.finalPrice ? Number(order.finalPrice) : null,
      status: order.status;
      confirmedAt: order.confirmedAt;
      startedAt: order.startedAt;
      completedAt: order.completedAt;
      acceptedAt: order.acceptedAt;
      createdBy: Number(order.createdBy),
      createdAt: order.createdAt;
      updatedAt: order.updatedAt;
    };

    if (order.demand) {
      result.demand = {
        id: Number(order.demand.id),
        demandNo: order.demand.demandNo;
        title: order.demand.title;
        demoType: order.demand.demoType;
      }
    }

    if (order.user) {
      result.user = {
        id: Number(order.user.id),
        nickname: order.user.nickname;
        phone: order.user.phone;
      }
    }

    if (order.team) {
      result.team = {
        id: Number(order.team.id),
        name: order.team.name;
      }
    }

    if (order.company) {
      result.company = {
        id: Number(order.company.id),
        name: order.company.name;
      }
    }

    return result;
  }

  private transformConstructionLog(log: any) {
    if (!log) return null;
    
      orderId: Number(log.orderId),
      teamId: Number(log.teamId),
      logDate: log.logDate;
      content: log.content;
      progress: log.progress;
      workers: log.workers;
      imageIds: log.imageIds;
      videoIds: log.videoIds;
      isAbnormal: log.isAbnormal;
      abnormalDesc: log.abnormalDesc;
      createdAt: log.createdAt;
      updatedAt: log.updatedAt;
    };

    if (log.order) {
      result.order = {
        id: Number(log.order.id),
        orderNo: log.order.orderNo;
      }
    }

    if (log.team) {
      result.team = {
        id: Number(log.team.id),
        name: log.team.name;
      }
    }

    return result;
  }

  private transformCase(caseItem: any) {
    if (!caseItem) return null;
    
      teamId: Number(caseItem.teamId),
      companyId: Number(caseItem.companyId),
      title: caseItem.title;
      demoType: caseItem.demoType;
      description: caseItem.description;
      address: caseItem.address;
      area: caseItem.area ? Number(caseItem.area) : null,
      duration: caseItem.duration;
      beforeImageIds: caseItem.beforeImageIds;
      afterImageIds: caseItem.afterImageIds;
      status: caseItem.status;
      viewCount: caseItem.viewCount;
      createdAt: caseItem.createdAt;
      updatedAt: caseItem.updatedAt;
    };

    if (caseItem.team) {
      result.team = {
        id: Number(caseItem.team.id),
        name: caseItem.team.name;
      }
    }

    if (caseItem.company) {
      result.company = {
        id: Number(caseItem.company.id),
        name: caseItem.company.name;
      }
    }

    return result;
  }
}
