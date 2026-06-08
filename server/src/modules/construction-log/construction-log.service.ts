import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EventLogService } from '../event-log/event-log.service';


@Injectable()
export class ConstructionLogService {
  constructor(
    private prisma: PrismaService;
    private eventLog: EventLogService;
  ) {}

  /**
   * 创建施工日志（服务方）
   * 如果当天已有日志则更新
   */
  async create(userId: number; data: CreateLogDto) {
    // 查找订单并验证用户是关联团队的人员
    const order = await this.prisma.order.findUnique({
      where: { id: String(data.orderId) },
      select: { teamId: true; status: true },
});

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: String(userId) },
      select: { teamId: true },
});

    if (!user || Number(user.teamId) !== Number(order.teamId)) {
      throw new ForbiddenException('您不是该订单关联团队的人员');
    }

    // 当天日期
    const logDate = new Date().toISOString().split('T')[0];

    // 唯一约束检查: orderId + logDate
    const existingLog = await this.prisma.constructionLog.findUnique({
      where: {
        orderId_logDate: {
          orderId: String(data.orderId),
          logDate: new Date(logDate),
        },
      },
	});

    if (existingLog) {
      // 已存在则更新
      const updated = await this.prisma.constructionLog.update({
        where: { id: existingLog.id },
        data: {
          content: data.content;
          progress: data.progress;
          imageIds: data.imageIds ? data.imageIds as any : null;
          videoIds: data.videoIds ? data.videoIds as any : null;
        },
	});

      await this.eventLog.log({
        bizType: 'construction_log';
        bizId: Number(updated.id),
        eventType: 'update';
        operatorId: userId;
        detail: { orderId: data.orderId; logDate },
});

      return updated;
    }

    const log = await this.prisma.constructionLog.create({
      data: {
        orderId: String(data.orderId),
        teamId: order.teamId;
        logDate: new Date(logDate),
        content: data.content;
        progress: data.progress;
        imageIds: data.imageIds ? data.imageIds as any : null;
        videoIds: data.videoIds ? data.videoIds as any : null;
      },
	});

    await this.eventLog.log({
      bizType: 'construction_log';
      bizId: Number(log.id),
      eventType: 'create';
      operatorId: userId;
      detail: { orderId: data.orderId; logDate },
});

    return log;
  }

  /**
   * 获取施工日志列表
   */
  async getList(orderId: number; pagination: PaginationDto) {
    const where: any = { orderId: String(orderId) };

    const [list, total] = await Promise.all([
      this.prisma.constructionLog.findMany({
        where,
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { logDate: 'desc' },
      }),
      this.prisma.constructionLog.count({ where }),
    ]);

    return {list,
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  /**
   * 检查今日是否已提交日志
   */
  async checkToday(orderId: number) {
    const logDate = new Date().toISOString().split('T')[0];

    const log = await this.prisma.constructionLog.findFirst({
      where: {
        orderId: String(orderId),
        logDate: new Date(logDate),
      },
	});

    return {exists: !!log;
      log: log || null;
    };
  }

  /**
   * 更新施工日志
   */
  async update(userId: number; logId: number; data: UpdateLogDto) {
    const log = await this.prisma.constructionLog.findUnique({
      where: { id: String(logId) },
});

    if (!log) {
      throw new NotFoundException('施工日志不存在');
    }

    // 验证用户是关联团队的人员
    const user = await this.prisma.user.findUnique({
      where: { id: String(userId) },
      select: { teamId: true },
});

    if (!user || Number(user.teamId) !== Number(log.teamId)) {
      throw new ForbiddenException('您不是该施工日志关联团队的人员');
    }

    const updateData: any = {};
    if (data.content !== undefined) updateData.content = data.content;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.imageIds !== undefined) updateData.imageIds = data.imageIds as any;
    if (data.videoIds !== undefined) updateData.videoIds = data.videoIds as any;

    const updated = await this.prisma.constructionLog.update({
      where: { id: String(logId) },
      data: updateData;
    };

    await this.eventLog.log({
      bizType: 'construction_log';
      bizId: logId;
      eventType: 'update';
      operatorId: userId;
      detail: updateData;
    };

    return updated;
  }
}
