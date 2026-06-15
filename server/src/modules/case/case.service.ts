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
      }),
      this.prisma.case.count({ where }),
    ]);

    // 手动查询关联的 team 和 company 信息
    const teamIds = [...new Set(list.map((c: any) => c.teamId).filter(Boolean))];
    const companyIds = [...new Set(list.map((c: any) => c.companyId).filter(Boolean))];

    const [teams, companies] = await Promise.all([
      teamIds.length > 0 ? this.prisma.team.findMany({
        where: { id: { in: teamIds } },
        select: { id: true, name: true },
      }) : [],
      companyIds.length > 0 ? this.prisma.company.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, name: true },
      }) : [],
    ]);

    const teamMap = new Map<string, any>(teams.map((t: any): [string, any] => [t.id, t]));
    const companyMap = new Map<string, any>(companies.map((c: any): [string, any] => [c.id, c]));

    const resultList = list.map((c: any) => ({
      ...c,
      team: teamMap.get(c.teamId) || null,
      company: companyMap.get(c.companyId) || null,
    }));

    return {
      list: resultList,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * 推荐案例（公开）- 只返回推荐的案例
   */
  async getRecommend(pagination: PaginationDto) {
    const where: any = { status: 1, recommended: true };

    const [list, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      } as any),
      this.prisma.case.count({ where }),
    ]);

    // 手动查询关联的 team 和 company 信息
    const teamIds = [...new Set(list.map((c: any) => c.teamId).filter(Boolean))];
    const companyIds = [...new Set(list.map((c: any) => c.companyId).filter(Boolean))];

    const [teams, companies] = await Promise.all([
      teamIds.length > 0 ? this.prisma.team.findMany({
        where: { id: { in: teamIds } },
        select: { id: true, name: true },
      }) : [],
      companyIds.length > 0 ? this.prisma.company.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, name: true },
      }) : [],
    ]);

    const teamMap = new Map<string, any>(teams.map((t: any): [string, any] => [t.id, t]));
    const companyMap = new Map<string, any>(companies.map((c: any): [string, any] => [c.id, c]));

    // 获取图片URLs
    const allFileIds = new Set<string>();
    list.forEach((c: any) => {
      const beforeIds = (c.beforeImageIds as any[]) || [];
      const afterIds = (c.afterImageIds as any[]) || [];
      beforeIds.forEach((id: any) => allFileIds.add(String(id)));
      afterIds.forEach((id: any) => allFileIds.add(String(id)));
    });

    let fileUrlMap = new Map<string, string>();
    if (allFileIds.size > 0) {
      const files = await this.prisma.file.findMany({
        where: { id: { in: Array.from(allFileIds) } },
        select: { id: true, fileUrl: true },
      });
      files.forEach((f) => fileUrlMap.set(f.id, f.fileUrl));
    }

    const resultList = list.map((c: any) => {
      const beforeIds = (c.beforeImageIds as any[]) || [];
      const afterIds = (c.afterImageIds as any[]) || [];
      const beforeImageUrls = beforeIds.map((id: any) => fileUrlMap.get(String(id))).filter(Boolean);
      const afterImageUrls = afterIds.map((id: any) => fileUrlMap.get(String(id))).filter(Boolean);

      return {
        ...c,
        beforeImageUrls,
        afterImageUrls,
        team: teamMap.get(c.teamId) || null,
        company: companyMap.get(c.companyId) || null,
      };
    });

    return {
      list: resultList,
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
    } as any);

    if (!c) {
      throw new NotFoundException('案例不存在');
    }

    // 手动查询关联的 team 和 company 信息
    const [team, company] = await Promise.all([
      c.teamId ? this.prisma.team.findUnique({
        where: { id: c.teamId },
        select: { id: true, name: true },
      }) : null,
      c.companyId ? this.prisma.company.findUnique({
        where: { id: c.companyId },
        select: { id: true, name: true },
      }) : null,
    ]);

    // 增加浏览量
    await this.prisma.case.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // 获取图片URLs
    const beforeIds = (c.beforeImageIds as any[]) || [];
    const afterIds = (c.afterImageIds as any[]) || [];
    const allFileIds = [...beforeIds, ...afterIds].map((id: any) => String(id));
    let fileUrlMap = new Map<string, string>();
    if (allFileIds.length > 0) {
      const files = await this.prisma.file.findMany({
        where: { id: { in: allFileIds } },
        select: { id: true, fileUrl: true },
      });
      files.forEach((f) => fileUrlMap.set(f.id, f.fileUrl));
    }
    const beforeImageUrls = beforeIds.map((id: any) => fileUrlMap.get(String(id))).filter(Boolean);
    const afterImageUrls = afterIds.map((id: any) => fileUrlMap.get(String(id))).filter(Boolean);

    return {
      ...c,
      beforeImageUrls,
      afterImageUrls,
      team,
      company,
    };
  }
}
