import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDemandDto } from './dto/create-demand.dto';
import { UpdateDemandDto } from './dto/update-demand.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { generateOrderNo } from '../../common/utils/order-no.util';
import { EventLogService } from '../event-log/event-log.service';


@Injectable()
export class DemandService {
  constructor(
    private prisma: PrismaService,
    private eventLog: EventLogService,
  ) {}

  /**
   * 发布需求
   */
  async create(userId: string, data: CreateDemandDto) {
    const demandNo = generateOrderNo('DM');
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 7);

    const demand = await this.prisma.demand.create({
      data: {
        demandNo,
        userId: userId,
        demoType: data.demoType,
        title: data.title,
        communityName: data.communityName || null,
        description: data.description || null,
        address: data.address || null,
        district: data.district || null,
        longitude: data.lng ? new Prisma.Decimal(data.lng) : null,
        latitude: data.lat ? new Prisma.Decimal(data.lat) : null,
        area: data.area !== undefined && data.area !== null ? new Prisma.Decimal(data.area) : null,
        contactName: data.contactName || null,
        contactPhone: data.contactPhone || null,
        budget: data.budget || null,
        expectedTime: data.expectedTime || null,
        imageIds: data.imageIds && data.imageIds.length > 0 ? data.imageIds : Prisma.JsonNull,
        status: 0, // 待抢单
        expiredAt,
      },
    });

    // 查询用户信息
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        phone: true,
      },
    });

    await this.eventLog.log({
      bizType: 'demand',
      bizId: demand.id,
      eventType: 'create',
      operatorId: userId,
      detail: { demandNo, title: data.title },
    });

    return { ...demand, user };
  }

  /**
   * 获取需求详情
   */
  async findById(id: string, userId?: string) {
    const demand = await this.prisma.demand.findUnique({
      where: { id },
    });

    if (!demand) {
      throw new NotFoundException('需求不存在');
    }

    // 增加浏览量
    await this.prisma.demand.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // 查询用户信息和报价列表
    const [user, quotes] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: demand.userId },
        select: { id: true, nickname: true, avatarUrl: true, phone: true },
      }),
      this.prisma.quote.findMany({
        where: { demandId: id },
        select: {
          id: true,
          quoteNo: true,
          price: true,
          duration: true,
          planSummary: true,
          status: true,
          createdAt: true,
          teamId: true,
        },
      }),
    ]);

    // 查询团队信息
    const teamIds = [...new Set(quotes.map(q => q.teamId))];
    const teams = await this.prisma.team.findMany({
      where: { id: { in: teamIds } },
      select: { id: true, name: true, companyId: true },
    });
    const teamMap = new Map(teams.map(t => [t.id, t]));

    // 查询公司信息
    const companyIds = [...new Set(teams.map(t => t.companyId))];
    const companies = await this.prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, name: true },
    });
    const companyMap = new Map(companies.map(c => [c.id, c]));

    // 合并报价、团队、公司信息
    const quotesWithTeam = quotes.map(q => {
      const team = teamMap.get(q.teamId);
      const company = team ? companyMap.get(team.companyId) : null;
      return {
        ...q,
        team: team ? { id: team.id, name: team.name, company: company ? { id: company.id, name: company.name } : null } : null,
      };
    });

    return { ...demand, user, quotes: quotesWithTeam };
  }

  /**
   * 我发布的需求列表
   */
  async getMyDemands(userId: string, pagination: PaginationDto, status?: number) {
    const where: any = { userId };
    if (status !== undefined && status !== null) {
      where.status = Number(status);
    }

    const [list, total] = await Promise.all([
      this.prisma.demand.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.demand.count({ where }),
    ]);

    // 查询用户信息
    const userIds = [...new Set(list.map(d => d.userId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nickname: true, avatarUrl: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const listWithUsers = list.map(d => ({
      ...d,
      user: userMap.get(d.userId) || null,
    }));

    return {
      list: listWithUsers,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * 编辑需求（仅待抢单状态可编辑）
   */
  async update(userId: string, demandId: string, data: UpdateDemandDto) {
    const demand = await this.prisma.demand.findUnique({
      where: { id: demandId },
    });

    if (!demand) {
      throw new NotFoundException('需求不存在');
    }

    if (demand.userId !== userId) {
      throw new ForbiddenException('无权编辑此需求');
    }

    if (demand.status !== 0) {
      throw new BadRequestException('仅待抢单状态的需求可以编辑');
    }

    const updateData: any = {};
    if (data.demoType !== undefined) updateData.demoType = data.demoType;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.district !== undefined) updateData.district = data.district;
    if (data.communityName !== undefined) updateData.communityName = data.communityName;
    if (data.lng !== undefined) updateData.longitude = data.lng ? new Prisma.Decimal(data.lng) : null;
    if (data.lat !== undefined) updateData.latitude = data.lat ? new Prisma.Decimal(data.lat) : null;
    if (data.area !== undefined) updateData.area = data.area ? new Prisma.Decimal(data.area) : null;
    if (data.contactName !== undefined) updateData.contactName = data.contactName;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.expectedTime !== undefined) updateData.expectedTime = data.expectedTime;
    if (data.imageIds !== undefined) updateData.imageIds = data.imageIds;

    const updated = await this.prisma.demand.update({
      where: { id: demandId },
      data: updateData,
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nickname: true, avatarUrl: true },
    });

    await this.eventLog.log({
      bizType: 'demand',
      bizId: demandId,
      eventType: 'update',
      operatorId: userId,
      detail: { changes: data },
    });

    return { ...updated, user };
  }

  /**
   * 取消需求
   */
  async cancel(userId: string, demandId: string) {
    const demand = await this.prisma.demand.findUnique({
      where: { id: demandId },
    });

    if (!demand) {
      throw new NotFoundException('需求不存在');
    }

    if (demand.userId !== userId) {
      throw new ForbiddenException('无权取消此需求');
    }

    if (demand.status !== 0) {
      throw new BadRequestException('仅待抢单状态的需求可以取消');
    }

    const updated = await this.prisma.demand.update({
      where: { id: demandId },
      data: { status: -1 }, // -1 = 已取消
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nickname: true, avatarUrl: true },
    });

    await this.eventLog.log({
      bizType: 'demand',
      bizId: demandId,
      eventType: 'cancel',
      operatorId: userId,
    });

    return { ...updated, user };
  }

  /**
   * 抢单大厅需求列表（服务方用，只返回待抢单的需求）
   */
  async getHallList(
    pagination: PaginationDto,
    filters?: {
      district?: string,
      demoType?: number,
      keyword?: string,
    },
  ) {
    const where: any = { status: 0 };

    if (filters?.district) {
      where.district = { contains: filters.district };
    }

    if (filters?.demoType !== undefined && filters?.demoType !== null) {
      where.demoType = Number(filters.demoType);
    }

    if (filters?.keyword) {
      where.title = { contains: filters.keyword };
    }

    const [list, total] = await Promise.all([
      this.prisma.demand.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.demand.count({ where }),
    ]);

    // 查询用户信息
    const userIds = [...new Set(list.map(d => d.userId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nickname: true, avatarUrl: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const listWithUsers = list.map(d => ({
      ...d,
      user: userMap.get(d.userId) || null,
    }));

    return {
      list: listWithUsers,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * 客户选择报价
   */
  async selectQuotes(userId: string, demandId: string, quoteIds: string[]) {
    const demand = await this.prisma.demand.findUnique({
      where: { id: demandId },
    });

    if (!demand) {
      throw new NotFoundException('需求不存在');
    }

    if (demand.userId !== userId) {
      throw new ForbiddenException('无权操作此需求');
    }

    // 验证所有报价都属于此需求且已审核通过
    const quotes = await this.prisma.quote.findMany({
      where: {
        id: { in: quoteIds },
        demandId: demandId,
        status: 1, // 审核通过
      },
    });

    if (quotes.length !== quoteIds.length) {
      throw new BadRequestException('部分报价不存在、不属于此需求或未通过审核');
    }

    const updated = await this.prisma.demand.update({
      where: { id: demandId },
      data: {
        selectedQuoteIds: quoteIds as any,
        status: 5, // 已选团队
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nickname: true, avatarUrl: true },
    });

    await this.eventLog.log({
      bizType: 'demand',
      bizId: demandId,
      eventType: 'select_quotes',
      operatorId: userId,
      detail: { quoteIds },
    });

    return { ...updated, user };
  }

  /**
   * 获取需求的报价列表（只返回审核通过的报价）
   */
  async getDemandQuotes(demandId: string) {
    const demand = await this.prisma.demand.findUnique({
      where: { id: demandId },
    });

    if (!demand) {
      throw new NotFoundException('需求不存在');
    }

    const quotes = await this.prisma.quote.findMany({
      where: {
        demandId: demandId,
        status: 1, // 审核通过
      },
      orderBy: { createdAt: 'desc' },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            specialties: true,
            completedCount: true,
            avgRating: true,
            company: {
              select: {
                id: true,
                name: true,
                verifyStatus: true,
              },
            },
          },
        },
      },
    } as any);

    return quotes;
  }

  /**
   * 检查并过期超时需求（定时任务用）
   */
  async checkExpired() {
    const now = new Date();

    const result = await this.prisma.demand.updateMany({
      where: {
        status: 0, // 待抢单
        expiredAt: { lte: now },
      },
      data: {
        status: -2, // 已过期
      },
    });

    if (result.count > 0) {
      // 记录事件日志（批量）
      const expiredDemands = await this.prisma.demand.findMany({
        where: {
          status: -2,
          expiredAt: { lte: now },
        },
        select: { id: true },
      });

      for (const demand of expiredDemands) {
        await this.eventLog.log({
          bizType: 'demand',
          bizId: demand.id,
          eventType: 'expired',
          detail: { reason: '超过7天未报价，自动过期' },
        });
      }
    }

    return { expiredCount: result.count };
  }
}
