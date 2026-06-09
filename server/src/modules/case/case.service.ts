import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EventLogService } from '../event-log/event-log.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';


@Injectable()
export class CaseService {
  constructor(
    private prisma: PrismaService,
    private eventLog: EventLogService,
  ) {}

  /**
   * 创建案例
   */
  async create(userId: string, data: CreateCaseDto) {
    // 验证用户有所属团队
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true },
    });

    if (!user || !user.teamId) {
      throw new ForbiddenException('您不属于任何团队');
    }

    // 获取团队的公司信息
    const team = await this.prisma.team.findUnique({
      where: { id: user.teamId },
      select: { companyId: true },
    });

    const c = await this.prisma.case.create({
      data: {
        teamId: user.teamId,
        companyId: team!.companyId,
        title: data.title,
        demoType: data.demoType,
        description: data.description || null,
        address: data.address || null,
        area: data.area ? new Prisma.Decimal(data.area) : null,
        duration: data.duration,
        beforeImageIds: data.beforeImageIds ? data.beforeImageIds as any : Prisma.JsonNull,
        afterImageIds: data.afterImageIds ? data.afterImageIds as any : Prisma.JsonNull,
        status: 0, // 待审核
      },
    });

    await this.eventLog.log({
      bizType: 'case',
      bizId: c.id,
      eventType: 'create',
      operatorId: userId,
      detail: { title: data.title },
    });

    return c;
  }

  /**
   * 案例列表（分页，可选筛选）
   */
  async getList(pagination: PaginationDto, demoType?: number, keyword?: string) {
    const where: any = { status: 1 }; // 只返回已上架的

    if (demoType !== undefined && demoType !== null) {
      where.demoType = Number(demoType);
    }

    if (keyword) {
      where.title = { contains: keyword };
    }

    const [list, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: {
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
      } as any),
      this.prisma.case.count({ where }),
    ]);

    return {
      list,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * 推荐案例（最近5条）
   */
  async getRecommend(pagination: PaginationDto) {
    const where: any = { status: 1 };

    const [list, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: {
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
      } as any),
      this.prisma.case.count({ where }),
    ]);

    return {
      list,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * 案例详情
   */
  async findById(id: string) {
    const c = await this.prisma.case.findUnique({
      where: { id },
      include: {
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
    } as any);

    if (!c) {
      throw new NotFoundException('案例不存在');
    }

    // 增加浏览量
    await this.prisma.case.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return c;
  }
}
