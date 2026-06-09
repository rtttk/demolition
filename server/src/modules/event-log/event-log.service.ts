import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EventLogService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    bizType: string,
    bizId: string,
    eventType: string,
    operatorId?: string,
    detail?: any,
    ip?: string,
  }) {
    return this.prisma.eventLog.create({
      data: {
        bizType: params.bizType,
        bizId: params.bizId,
        eventType: params.eventType,
        operatorId: params.operatorId,
        detail: params.detail ? JSON.stringify(params.detail) : Prisma.JsonNull,
        ip: params.ip,
      },
    });
  }

  async getByBiz(bizType: string, bizId: string) {
    return this.prisma.eventLog.findMany({
      where: { bizType, bizId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(startTime: Date, endTime: Date) {
    // 按bizType和eventType分组统计
    const stats = await this.prisma.eventLog.groupBy({
      by: ['bizType', 'eventType'],
      where: {
        createdAt: { gte: startTime, lte: endTime },
      },
      _count: true,
    });
    return stats;
  }
}
