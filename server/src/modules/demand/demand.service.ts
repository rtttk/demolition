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
   * 将 demand 对象中的 Prisma.Decimal 字段转换为 number，并添加 statusName
   */
  private transformDemand(demand: any): any {
    if (!demand) return demand;
    const result: any = { ...demand };
    if (result.longitude !== undefined && result.longitude !== null) {
      result.longitude = Number(result.longitude);
    }
    if (result.latitude !== undefined && result.latitude !== null) {
      result.latitude = Number(result.latitude);
    }
    if (result.area !== undefined && result.area !== null) {
      result.area = Number(result.area);
    }
    // 添加状态名称
    const statusMap: Record<number, string> = {
      0: '待报价',
      1: '报价中',
      2: '已选标',
      3: '已签约',
      4: '施工中',
      5: '待验收',
      6: '已完成',
      7: '已取消',
      8: '已过期',
    };
    result.statusName = statusMap[result.status] || '未知';
    return result;
  }

  private transformDemandList(list: any[]): any[] {
    if (!Array.isArray(list)) return list;
    return list.map((item) => this.transformDemand(item));
  }

  /**
   * 将 quote 对象中的 Prisma.Decimal 字段转换为 number
   */
  private transformQuote(quote: any): any {
    if (!quote) return quote;
    const result: any = { ...quote };
    if (result.price !== undefined && result.price !== null) {
      result.price = Number(result.price);
    }
    if (result.team && result.team.avgRating !== undefined && result.team.avgRating !== null) {
      result.team = { ...result.team, avgRating: Number(result.team.avgRating) };
    }
    return result;
  }

  private transformQuoteList(list: any[]): any[] {
    if (!Array.isArray(list)) return list;
    return list.map((item) => this.transformQuote(item));
  }

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

    return { ...this.transformDemand(demand), user };
  }

  /**
   * 获取需求详情
   * 权限控制：
   * - 需求方（需求发布者）：可以看到所有报价
   * - 服务方（属于某个团队）：只能看到自己团队的报价
   * - 未登录或无团队用户：看不到报价
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

    // 查询需求发布者信息
    const user = await this.prisma.user.findUnique({
      where: { id: demand.userId },
      select: { id: true, nickname: true, avatarUrl: true, phone: true },
    });

    // 查询当前用户信息（判断角色）
    let currentUserTeamId: string | null = null;
    let isDemandOwner = false;

    if (userId) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, teamId: true },
      });
      currentUserTeamId = currentUser?.teamId || null;
      isDemandOwner = userId === demand.userId;
    }

    // 根据权限过滤报价，只展示审核通过的报价(status=1)
    let quoteWhere: any = { demandId: id, status: 1 };
    if (!isDemandOwner && currentUserTeamId) {
      // 服务方：只能看到自己团队的报价
      quoteWhere.teamId = currentUserTeamId;
    } else if (!isDemandOwner && !currentUserTeamId) {
      // 未登录或无团队用户：看不到报价
      quoteWhere = { demandId: id, teamId: 'none', status: 1 }; // 无匹配结果
    }

    const quotes = await this.prisma.quote.findMany({
      where: quoteWhere,
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
    });

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
      return this.transformQuote({
        ...q,
        team: team ? { id: team.id, name: team.name, company: company ? { id: company.id, name: company.name } : null } : null,
      });
    });

    return { ...this.transformDemand(demand), user, quotes: quotesWithTeam };
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
      ...this.transformDemand(d),
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

    return { ...this.transformDemand(updated), user };
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

    return { ...this.transformDemand(updated), user };
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
      ...this.transformDemand(d),
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
  async selectQuotes(userId: string, demandId: string, quoteIds: string | string[]) {
    // 兼容单报价ID和数组两种格式
    const quoteIdArray = Array.isArray(quoteIds) ? quoteIds : [quoteIds];

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
        id: { in: quoteIdArray },
        demandId: demandId,
        status: 1, // 审核通过
      },
    });

    if (quotes.length !== quoteIdArray.length) {
      throw new BadRequestException('部分报价不存在、不属于此需求或未通过审核');
    }

    // 更新需求状态
    const updated = await this.prisma.demand.update({
      where: { id: demandId },
      data: {
        selectedQuoteIds: quoteIdArray as any,
        status: 5, // 已选团队
      },
    });

    // 创建订单 - 状态0待审核
    const orderNo = generateOrderNo('OD');
    const selectedQuote = quotes[0];
    const order = await this.prisma.order.create({
      data: {
        orderNo,
        demandId: demandId,
        userId: demand.userId,
        teamId: selectedQuote.teamId,
        companyId: selectedQuote.companyId,
        quoteIds: quoteIdArray as any,
        finalPrice: selectedQuote.price,
        status: 0, // 待审核
        contractStatus: 0, // 待上传合同
        createdBy: userId,
      },
    });

    await this.eventLog.log({
      bizType: 'demand',
      bizId: demandId,
      eventType: 'select_quotes',
      operatorId: userId,
      detail: { quoteIds: quoteIdArray, orderId: order.id },
    });

    return { ...this.transformDemand(updated), order };
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

    return this.transformQuoteList(quotes);
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
