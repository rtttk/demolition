import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { generateOrderNo } from '../../common/utils/order-no.util';
import { EventLogService } from '../event-log/event-log.service';
import { log } from '../../common/utils/logger.util';


@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private eventLog: EventLogService,
  ) {}

  /**
   * 创建订单（服务方）
   */
  async create(userId: string, data: CreateOrderDto) {
    // 查找需求
    const demand = await this.prisma.demand.findUnique({
      where: { id: String(data.demandId) },
});

    if (!demand) {
      throw new NotFoundException('需求不存在');
    }

    // 验证需求尚未创建订单
    const existingOrder = await this.prisma.order.findUnique({
      where: { demandId: String(data.demandId) },
});

    if (existingOrder) {
      throw new BadRequestException('该需求已创建订单');
    }

    // 获取用户所属团队
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true },
});

    if (!user || !user.teamId) {
      throw new ForbiddenException('您不属于任何团队，无法创建订单');
    }

    // 获取团队的公司信息
    const team = await this.prisma.team.findUnique({
      where: { id: user.teamId },
      select: { companyId: true },
});

    // 生成订单号
    const orderNo = generateOrderNo('OD');

    const order = await this.prisma.order.create({
      data: {
        orderNo,
        demandId: data.demandId,
        userId: demand.userId,
        teamId: user.teamId,
        companyId: team!.companyId,
        quoteIds: data.quoteId ? [data.quoteId] : [],
        status: 3, // 已选标/已签约
        createdBy: userId,
      },
    } as any);

    // 更新需求状态为已选标/已签约
    await this.prisma.demand.update({
      where: { id: String(data.demandId) },
      data: { status: 3 },
});

    await this.eventLog.log({
      bizType: 'order',
      bizId: order.id,
      eventType: 'create',
      operatorId: userId,
      detail: { orderNo, demandId: data.demandId },
});

    return order;
  }

  /**
   * 我的订单列表
   */
  async getMyOrders(userId: string, pagination: PaginationDto, status?: number) {
    const where: any = {
      OR: [
        { userId: userId },
        { createdBy: userId },
      ],
    };

    if (status !== undefined && status !== null) {
      where.status = Number(status);
    }

    const [list, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    // 查询所有订单的需求信息、合同文件和评价信息
    const demandIds = list.map(o => o.demandId).filter(Boolean);
    const contractIds = list.map(o => o.contractId).filter(Boolean);
    const orderIds = list.map(o => o.id);
    const demands = demandIds.length > 0
      ? await this.prisma.demand.findMany({
          where: { id: { in: demandIds } },
          select: { id: true, title: true, demoType: true, area: true },
        })
      : [];
    const contractFiles = contractIds.length > 0
      ? await this.prisma.file.findMany({
          where: { id: { in: contractIds } },
          select: { id: true, fileUrl: true, fileName: true },
        })
      : [];
    const reviews = orderIds.length > 0
      ? await this.prisma.review.findMany({
          where: { orderId: { in: orderIds } },
          select: { orderId: true },
        })
      : [];
    const reviewedMap = new Map(reviews.map(r => [r.orderId, true]));

    const demandMap = new Map(demands.map(d => [d.id, d]));
    const contractMap = new Map(contractFiles.map(f => [f.id, f]));

    // 转换数据
    const transformedList = list.map(order => {
      const demand = demandMap.get(order.demandId);
      const contractFile = contractMap.get(order.contractId) || null;
      return {
        ...this.transformOrder(order),
        demandTitle: demand?.title || '',
        demoTypeName: this.getDemoTypeName(demand?.demoType),
        area: demand?.area ? Number(demand.area) : null,
        createTime: order.createdAt,
        startedAt: order.startedAt,
        contractFile,
        reviewed: reviewedMap.has(order.id) || false,
      };
    });

    return {
      list: transformedList,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  private getDemoTypeName(demoType?: number): string {
    const map: Record<number, string> = {
      1: '室内拆除',
      2: '建筑拆除',
      3: '厂房拆除',
      4: '其他拆除',
    };
    return demoType !== undefined ? (map[demoType] || '--') : '--';
  }

  /**
   * 订单详情
   */
  async findById(id: string, userId?: string) {
    // 先检查并更新订单状态（开工日期到达则自动进入施工中）
    await this.checkAndUpdateOrderStatus();

    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 手动查询关联数据
    const [demand, team, company, contractFile, review] = await Promise.all([
      this.prisma.demand.findUnique({
        where: { id: order.demandId },
        select: { 
          id: true, 
          demandNo: true, 
          title: true, 
          demoType: true, 
          description: true, 
          address: true, 
          district: true,
          contactName: true,
          contactPhone: true,
          area: true,
        },
      }),
      this.prisma.team.findUnique({
        where: { id: order.teamId },
        select: { id: true, name: true, companyId: true },
      }),
      this.prisma.company.findUnique({
        where: { id: order.companyId },
        select: { id: true, name: true },
      }),
      order.contractId
        ? this.prisma.file.findUnique({
            where: { id: order.contractId },
            select: { id: true, fileUrl: true, fileName: true },
          })
        : null,
      this.prisma.review.findUnique({
        where: { orderId: id },
        select: { id: true },
      }),
    ]);

    // 查询公司信息（如果团队有公司）
    let teamCompany = null;
    if (team?.companyId) {
      teamCompany = await this.prisma.company.findUnique({
        where: { id: team.companyId },
        select: { id: true, name: true },
      });
    }

    // 添加 demoTypeName
    const demoTypeMap: Record<number, string> = {
      1: '室内拆除',
      2: '建筑拆除',
      3: '厂房拆除',
      4: '其他拆除',
    };
    const demoTypeName = demand?.demoType ? demoTypeMap[demand.demoType] || '--' : '--';

    return {
      ...this.transformOrder(order),
      demoTypeName,
      demand,
      team: team ? { id: team.id, name: team.name, company: teamCompany } : null,
      company,
      contractFile,
      reviewed: !!review,
    };
  }

  private transformOrder(order: any): any {
    if (!order) return order;
    const result: any = { ...order };
    if (result.finalPrice !== undefined && result.finalPrice !== null) {
      result.finalPrice = Number(result.finalPrice);
      result.amount = Number(result.finalPrice); // 前端期望的字段名
    }
    // 转换时间字段
    if (result.createdAt) {
      result.createTime = result.createdAt;
    }
    if (result.startedAt) {
      result.startedAt = result.startedAt;
    }
    if (result.planStartDate) {
      result.planStartDate = result.planStartDate;
    }
    return result;
  }

  /**
   * Admin审核订单通过 (0待审核 → 1待签约)
   */
  async adminApprove(userId: string, orderId: string) {
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
   * 服务方上传合同并设置开工日期 (1待签约 → 2待开工)
   */
  async uploadContract(userId: string, orderId: string, contractId: string, planStartDate: Date) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 1) {
      throw new BadRequestException('当前订单状态不允许上传合同');
    }

    // 验证用户是订单关联团队的人员
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true },
    });

    if (!user || user.teamId !== order.teamId) {
      throw new ForbiddenException('您不是该订单关联团队的人员');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        contractId,
        contractStatus: 1, // 待审核
        planStartDate,
        status: 2, // 待开工（合同审核通过后才会判定是否立即开工）
      },
    });

    await this.eventLog.log({
      bizType: 'order',
      bizId: orderId,
      eventType: 'upload_contract',
      operatorId: userId,
      detail: { contractId, planStartDate },
    });

    return { ...this.transformOrder(updated) };
  }

  /**
   * Admin审核合同通过 (2待开工 → 3施工中 或 保持2待开工)
   * 注意：合同审核通过后，如果开工日期已到则立即进入施工中状态
   */
  async approveContract(userId: string, orderId: string) {
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
    log(`[审核合同] orderId=${orderId}, planDateStr=${planDateStr}, todayStr=${todayStr}, isTodayOrBefore=${isTodayOrBefore}`);

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        contractStatus: 2, // 已通过
        signedAt: new Date(), // 签约时间
        status: isTodayOrBefore ? 3 : 2, // 当天或之前可开工则进入施工中
        startedAt: isTodayOrBefore ? new Date() : null,
      },
    });

    await this.eventLog.log({
      bizType: 'order',
      bizId: orderId,
      eventType: 'approve_contract',
      operatorId: userId,
      detail: { status: updated.status, isTodayOrBefore, planDateStr, todayStr },
    });

    return { ...this.transformOrder(updated) };
  }

  /**
   * 验收确认（需求方）(4待验收 → 5已完成)
   */
  async accept(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('只有需求方可以验收确认');
    }

    if (order.status !== 4) {
      throw new BadRequestException('当前订单状态不允许验收');
    }

    const now = new Date();

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 5, // 已完成
        acceptedAt: now,
        completedAt: now,
      },
    });

    // 更新团队完成数
    await this.prisma.team.update({
      where: { id: order.teamId },
      data: { completedCount: { increment: 1 } },
    });

    // 更新需求完成时间
    await this.prisma.demand.update({
      where: { id: order.demandId },
      data: { completedAt: now },
    });

    await this.eventLog.log({
      bizType: 'order',
      bizId: orderId,
      eventType: 'accept',
      operatorId: userId,
    });

    return { ...this.transformOrder(updated) };
  }

  /**
   * 完工申请（服务方）(3施工中 → 4待验收)
   */
  async complete(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 3) {
      throw new BadRequestException('当前订单状态不允许完工申请');
    }

    // 验证用户是关联团队的人员
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true },
    });

    if (!user || user.teamId !== order.teamId) {
      throw new ForbiddenException('您不是该订单关联团队的人员');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 4, // 待验收
      },
    });

    await this.eventLog.log({
      bizType: 'order',
      bizId: orderId,
      eventType: 'complete',
      operatorId: userId,
    });

    return { ...this.transformOrder(updated) };
  }

  /**
   * 取消订单 (只能取消 0待审核、1待签约、2待开工状态的订单)
   */
  async cancel(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 只有需求方或服务方创建者可以取消
    const isDemander = order.userId === userId;
    const isCreator = order.createdBy === userId;

    if (!isDemander && !isCreator) {
      throw new ForbiddenException('您无权取消此订单');
    }

    if (order.status === 5) {
      throw new BadRequestException('已完成的订单不能取消');
    }

    if (order.status === 6) {
      throw new BadRequestException('订单已取消');
    }

    if (order.status === 3 || order.status === 4) {
      throw new BadRequestException('施工中或待验收的订单无法取消，请联系运营');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 6, // 已取消
      },
    });

    await this.eventLog.log({
      bizType: 'order',
      bizId: orderId,
      eventType: 'cancel',
      operatorId: userId,
    });

    return { ...this.transformOrder(updated) };
  }

  /**
   * 定时任务：每天凌晨1点检查并更新已到开工日期的订单状态 (2待开工 → 3施工中)
   */
  // @Cron('0 0 1 * * *')
  @Cron('0 18 11 * * *')
  async handleOrderStatusCron() {
    log('[定时任务] 开始检查订单开工状态...');
    const result = await this.checkAndUpdateOrderStatus();
    log(`[定时任务] 订单开工状态检查完成，更新了 ${result.updated} 个订单`);
  }

  /**
   * 检查并更新已到开工日期的订单状态 (2待开工 → 3施工中)
   * 由定时任务或手动调用
   */
  async checkAndUpdateOrderStatus() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 查找所有待开工且开工日期 <= 今天的订单
    const orders = await this.prisma.order.findMany({
      where: {
        status: 2, // 待开工
        contractStatus: 2, // 合同已通过
        planStartDate: {
          lte: today,
        },
      },
    });

    for (const order of orders) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 3, // 施工中
          startedAt: new Date(),
        },
      });

      await this.eventLog.log({
        bizType: 'order',
        bizId: order.id,
        eventType: 'start_construction',
        operatorId: 'system',
      });
    }

    return { updated: orders.length };
  }
}
