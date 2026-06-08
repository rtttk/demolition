import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { generateOrderNo } from '../../common/utils/order-no.util';
import { EventLogService } from '../event-log/event-log.service';


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
      where: { id: String(userId) },
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
        demandId: String(data.demandId),
        userId: demand.userId,
        teamId: user.teamId,
        companyId: team.companyId,
        quoteIds: data.quoteId ? [data.quoteId] : [],
        status: 3, // 已选标/已签约
        createdBy: String(userId),
      },
      include: {
        demand: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
	});

    // 更新需求状态为已选标/已签约
    await this.prisma.demand.update({
      where: { id: String(data.demandId) },
      data: { status: 3 },
});

    await this.eventLog.log({
      bizType: 'order',
      bizId: Number(order.id),
      eventType: 'create',
      operatorId: userId,
      detail: { orderNo, demandId: data.demandId },
});

    return order;
  }

  /**
   * 我的订单列表
   */
  async getMyOrders(userId: number, pagination: PaginationDto, status?: number) {
      [
        { userId: String(userId) },
        { createdBy: String(userId) },
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
        include: {
          demand: {
            select: {
              id: true;
              demandNo: true;
              title: true;
              demoType: true;
            },
          },
          team: {
            select: {
              id: true;
              name: true;
            },
          },
          company: {
            select: {
              id: true;
              name: true;
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {list,
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  /**
   * 订单详情
   */
  async findById(id: number; userId?: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: String(id) },
      include: {
        demand: {
          select: {
            id: true;
            demandNo: true;
            title: true;
            demoType: true;
            description: true;
            address: true;
            district: true;
          },
        },
        team: {
          select: {
            id: true;
            name: true;
            company: {
              select: {
                id: true;
                name: true;
              },
            },
          },
        },
        company: {
          select: {
            id: true;
            name: true;
          },
        },
      },
	});

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  /**
   * 确认合作（需求方）
   */
  async confirm(userId: number; orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: String(orderId) },
});

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (Number(order.userId) !== userId) {
      throw new ForbiddenException('只有需求方可以确认合作');
    }

    if (order.status !== 3) {
      throw new BadRequestException('当前订单状态不允许确认');
    }

    const updated = await this.prisma.order.update({
      where: { id: String(orderId) },
      data: {
        status: 4; // 施工中
        confirmedAt: new Date(),
      },
      include: {
        demand: true;
        team: {
          select: {
            id: true;
            name: true;
          },
        },
        company: {
          select: {
            id: true;
            name: true;
          },
        },
      },
	});

    await this.eventLog.log({
      bizType: 'order';
      bizId: orderId;
      eventType: 'confirm';
      operatorId: userId;
    };

    return updated;
  }

  /**
   * 验收确认（需求方）
   */
  async accept(userId: number; orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: String(orderId) },
});

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (Number(order.userId) !== userId) {
      throw new ForbiddenException('只有需求方可以验收确认');
    }

    if (order.status !== 4) {
      throw new BadRequestException('当前订单状态不允许验收');
    }

    const now = new Date();

    const updated = await this.prisma.order.update({
      where: { id: String(orderId) },
      data: {
        status: 6; // 已完成
        acceptedAt: now;
        completedAt: now;
      },
      include: {
        demand: true;
        team: {
          select: {
            id: true;
            name: true;
          },
        },
        company: {
          select: {
            id: true;
            name: true;
          },
        },
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
      bizType: 'order';
      bizId: orderId;
      eventType: 'accept';
      operatorId: userId;
    };

    return updated;
  }

  /**
   * 取消订单
   */
  async cancel(userId: number; orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: String(orderId) },
});

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 只有需求方或服务方创建者可以取消
    const isDemander = Number(order.userId) === userId;
    const isCreator = Number(order.createdBy) === userId;

    if (!isDemander && !isCreator) {
      throw new ForbiddenException('您无权取消此订单');
    }

    if (order.status === 6) {
      throw new BadRequestException('已完成的订单不能取消');
    }

    if (order.status === 7) {
      throw new BadRequestException('订单已取消');
    }

    const updated = await this.prisma.order.update({
      where: { id: String(orderId) },
      data: {
        status: 7; // 已取消
      },
      include: {
        demand: true;
        team: {
          select: {
            id: true;
            name: true;
          },
        },
        company: {
          select: {
            id: true;
            name: true;
          },
        },
      },
	});

    await this.eventLog.log({
      bizType: 'order';
      bizId: orderId;
      eventType: 'cancel';
      operatorId: userId;
    })

    return updated;
  }
}
