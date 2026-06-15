import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EventLogService } from '../event-log/event-log.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';


@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private eventLog: EventLogService,
  ) {}

  /**
   * 创建评价
   */
  async create(userId: string, data: CreateReviewDto) {
    // 1. 验证订单存在且属于用户
    const order = await this.prisma.order.findUnique({
      where: { id: String(data.orderId) },
      select: { userId: true, teamId: true, status: true },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('您不是该订单的需求方');
    }

    // 2. 验证订单已完成
    if (order.status !== 5) {
      throw new BadRequestException('只有已完成的订单才能评价');
    }

    // 3. 验证未评价过
    const existingReview = await this.prisma.review.findUnique({
      where: { orderId: String(data.orderId) },
    });

    if (existingReview) {
      throw new BadRequestException('该订单已评价');
    }

    // 创建评价
    const review = await this.prisma.review.create({
      data: {
        orderId: String(data.orderId),
        userId: userId,
        teamId: String(data.teamId),
        rating: data.rating,
        content: data.content || null,
        imageIds: data.imageIds ? data.imageIds as any : Prisma.JsonNull,
      },
    });

    // 更新团队的avgRating（加权平均）
    const team = await this.prisma.team.findUnique({
      where: { id: String(data.teamId) },
      select: { avgRating: true, reviewCount: true },
    });

    const oldAvg = Number(team.avgRating);
    const oldCount = team.reviewCount;
    const newCount = oldCount + 1;
    const newAvg = (oldAvg * oldCount + data.rating) / newCount;

    await this.prisma.team.update({
      where: { id: String(data.teamId) },
      data: {
        avgRating: newAvg,
        reviewCount: newCount,
      },
    });

    await this.eventLog.log({
      bizType: 'review',
      bizId: review.id,
      eventType: 'create',
      operatorId: userId,
      detail: { orderId: data.orderId, rating: data.rating },
    });

    return review;
  }

  /**
   * 评价列表（按团队ID）
   */
  async getList(teamId: string, pagination: PaginationDto) {
    const where: any = { teamId: String(teamId) };

    const [list, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    // 手动查询用户信息
    const userIds = [...new Set(list.map((r) => r.userId).filter(Boolean))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nickname: true, avatarUrl: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const resultList = list.map((r) => ({
      ...r,
      user: userMap.get(r.userId) || null,
    }));

    return {
      list: resultList,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }
}
