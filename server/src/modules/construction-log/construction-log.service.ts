import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EventLogService } from '../event-log/event-log.service';

/**
 * 解析 Prisma Json 类型字段为字符串数组
 * Prisma 的 Json 类型在 TS 中被推断为 JsonValue，需要类型断言
 */
function parseJsonArray(value: unknown): string[] {
  if (!value || !Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}


@Injectable()
export class ConstructionLogService {
  constructor(
    private prisma: PrismaService,
    private eventLog: EventLogService,
  ) {}

  /**
   * 创建施工日志（服务方）
   * 如果当天已有日志则更新
   * 只有施工中(状态3)的订单才能登记日志
   */
  async create(userId: string, data: CreateLogDto) {
    // 查找订单并验证用户是关联团队的人员
    const order = await this.prisma.order.findUnique({
      where: { id: String(data.orderId) },
      select: { teamId: true, status: true },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 检查订单状态，只有施工中(状态3)才能登记日志
    if (order.status !== 3) {
      throw new ForbiddenException('当前订单状态不允许登记施工日志，请等待开工');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true },
    });

    if (!user || user.teamId !== order.teamId) {
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
          content: data.content,
          progress: data.progress,
          imageIds: data.imageIds ? data.imageIds as any : null,
          videoIds: data.videoIds ? data.videoIds as any : null,
        },
      });

      await this.eventLog.log({
        bizType: 'construction_log',
        bizId: updated.id,
        eventType: 'update',
        operatorId: userId,
        detail: { orderId: data.orderId, logDate },
      });

      return updated;
    }

    const log = await this.prisma.constructionLog.create({
      data: {
        orderId: String(data.orderId),
        teamId: order.teamId,
        logDate: new Date(logDate),
        content: data.content,
        progress: data.progress,
        imageIds: data.imageIds ? data.imageIds as any : null,
        videoIds: data.videoIds ? data.videoIds as any : null,
      },
    });

    await this.eventLog.log({
      bizType: 'construction_log',
      bizId: log.id,
      eventType: 'create',
      operatorId: userId,
      detail: { orderId: data.orderId, logDate },
    });

    return log;
  }

  /**
   * 获取施工日志列表
   */
  async getList(orderId: string, pagination: PaginationDto) {
    const where: any = { orderId: orderId };

    const [list, total] = await Promise.all([
      this.prisma.constructionLog.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { logDate: 'desc' },
      }),
      this.prisma.constructionLog.count({ where }),
    ]);

    // 查询所有日志关联的图片信息
    const allImageIds: string[] = [];
    const allVideoIds: string[] = [];
    list.forEach(log => {
      const imageIds = parseJsonArray(log.imageIds);
      const videoIds = parseJsonArray(log.videoIds);
      if (imageIds.length > 0) {
        allImageIds.push(...imageIds);
      }
      if (videoIds.length > 0) {
        allVideoIds.push(...videoIds);
      }
    });

    const [images, videos] = await Promise.all([
      allImageIds.length > 0
        ? this.prisma.file.findMany({
            where: { id: { in: allImageIds } },
            select: { id: true, fileUrl: true },
          })
        : [],
      allVideoIds.length > 0
        ? this.prisma.file.findMany({
            where: { id: { in: allVideoIds } },
            select: { id: true, fileUrl: true },
          })
        : [],
    ]);

    const imageMap = new Map<string, string>((images as { id: string; fileUrl: string }[]).map((img) => [img.id, img.fileUrl] as [string, string]));
    const videoMap = new Map<string, string>((videos as { id: string; fileUrl: string }[]).map((v) => [v.id, v.fileUrl] as [string, string]));

    // 转换数据，添加 imageUrls 和 videoUrls
    const transformedList = list.map(log => {
      const imageIds = parseJsonArray(log.imageIds);
      const videoIds = parseJsonArray(log.videoIds);
      return {
        ...log,
        imageUrls: imageIds.map((id: string) => imageMap.get(id)).filter(Boolean),
        videoUrls: videoIds.map((id: string) => videoMap.get(id)).filter(Boolean),
      };
    });

    return {
      list: transformedList,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * 获取施工日志详情
   */
  async getById(logId: string) {
    const log = await this.prisma.constructionLog.findUnique({
      where: { id: logId },
    });

    if (!log) {
      throw new NotFoundException('施工日志不存在');
    }

    // 查询图片和视频信息
    const imageIds = parseJsonArray(log.imageIds);
    const videoIds = parseJsonArray(log.videoIds);

    const [images, videos] = await Promise.all([
      imageIds.length > 0
        ? this.prisma.file.findMany({
            where: { id: { in: imageIds } },
            select: { id: true, fileUrl: true },
          })
        : [],
      videoIds.length > 0
        ? this.prisma.file.findMany({
            where: { id: { in: videoIds } },
            select: { id: true, fileUrl: true },
          })
        : [],
    ]);

    const imageMap = new Map<string, string>((images as { id: string; fileUrl: string }[]).map((img) => [img.id, img.fileUrl] as [string, string]));
    const videoMap = new Map<string, string>((videos as { id: string; fileUrl: string }[]).map((v) => [v.id, v.fileUrl] as [string, string]));

    return {
      ...log,
      imageUrls: imageIds.map((id: string) => imageMap.get(id)).filter(Boolean),
      videoUrls: videoIds.map((id: string) => videoMap.get(id)).filter(Boolean),
    };
  }

  /**
   * 检查今日是否已提交日志
   */
  async checkToday(orderId: string) {
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = new Date(today + 'T00:00:00.000Z');
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const log = await this.prisma.constructionLog.findFirst({
      where: {
        orderId: orderId,
        logDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    if (!log) {
      return { exists: false, log: null };
    }

    // 查询图片和视频信息
    const imageIds = parseJsonArray(log.imageIds);
    const videoIds = parseJsonArray(log.videoIds);

    const [images, videos] = await Promise.all([
      imageIds.length > 0
        ? this.prisma.file.findMany({
            where: { id: { in: imageIds } },
            select: { id: true, fileUrl: true },
          })
        : [],
      videoIds.length > 0
        ? this.prisma.file.findMany({
            where: { id: { in: videoIds } },
            select: { id: true, fileUrl: true },
          })
        : [],
    ]);

    const imageMap = new Map<string, string>((images as { id: string; fileUrl: string }[]).map((img) => [img.id, img.fileUrl] as [string, string]));
    const videoMap = new Map<string, string>((videos as { id: string; fileUrl: string }[]).map((v) => [v.id, v.fileUrl] as [string, string]));

    return {
      exists: true,
      log: {
        ...log,
        imageUrls: imageIds.map((id: string) => imageMap.get(id)).filter(Boolean),
        videoUrls: videoIds.map((id: string) => videoMap.get(id)).filter(Boolean),
      },
    };
  }

  /**
   * 更新施工日志
   */
  async update(userId: string, logId: string, data: UpdateLogDto) {
    const log = await this.prisma.constructionLog.findUnique({
      where: { id: logId },
    });

    if (!log) {
      throw new NotFoundException('施工日志不存在');
    }

    // 验证用户是关联团队的人员
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true },
    });

    if (!user || user.teamId !== log.teamId) {
      throw new ForbiddenException('您不是该施工日志关联团队的人员');
    }

    const updateData: any = {};
    if (data.content !== undefined) updateData.content = data.content;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.imageIds !== undefined) updateData.imageIds = data.imageIds as any;
    if (data.videoIds !== undefined) updateData.videoIds = data.videoIds as any;

    const updated = await this.prisma.constructionLog.update({
      where: { id: logId },
      data: updateData,
    });

    await this.eventLog.log({
      bizType: 'construction_log',
      bizId: logId,
      eventType: 'update',
      operatorId: userId,
      detail: updateData,
    });

    return updated;
  }
}
