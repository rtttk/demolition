import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitQuoteDto } from './dto/submit-quote.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { generateOrderNo } from '../../common/utils/order-no.util';
import { EventLogService } from '../event-log/event-log.service';


@Injectable()
export class QuoteService {
  constructor(
    private prisma: PrismaService,
    private eventLog: EventLogService,
  ) {}

  /**
   * 提交报价
   * 验证：1.需求存在且状态为待抢单 2.用户有所属团队 3.团队所属公司已认证
   */
  async submit(userId: string, data: SubmitQuoteDto) {
    // 1. 验证需求存在且状态为待抢单（status=0）或报价审核中（status=1）
    const demand = await this.prisma.demand.findUnique({
      where: { id: String(data.demandId) },
    });

    if (!demand) {
      throw new NotFoundException('需求不存在');
    }

    if (demand.status !== 0 && demand.status !== 1) {
      throw new BadRequestException('该需求当前状态不允许报价');
    }

    // 2. 验证用户有所属团队
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        teamId: true,
        team: {
          select: {
            id: true,
            name: true,
            companyId: true,
            company: {
              select: {
                id: true,
                name: true,
                verifyStatus: true,
              },
            } as any,
          } as any,
        },
      },
    });

    if (!user || !user.teamId) {
      throw new BadRequestException('请先加入团队后再报价');
    }

    // 3. 验证团队所属公司已认证（verifyStatus=2 表示已认证）
    const company = null;
    if (!company || company.verifyStatus !== 2) {
      throw new BadRequestException('所属公司尚未通过认证，无法报价');
    }

    // 检查是否已对该需求报过价
    const existingQuote = await this.prisma.quote.findFirst({
      where: {
        demandId: String(data.demandId),
        teamId: user.teamId,
      },
    });

    if (existingQuote) {
      throw new BadRequestException('您的团队已对该需求报过价');
    }

    const quoteNo = generateOrderNo('QT');

    const quote = await this.prisma.quote.create({
      data: {
        quoteNo,
        demandId: String(data.demandId),
        teamId: user.teamId,
        companyId: String(company.id),
        price: data.price,
        duration: data.duration,
        planSummary: data.planSummary ?? null,
        remark: data.remark,
        status: 0, // 待审核
      },
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
        demand: {
          select: {
            id: true,
            demandNo: true,
            title: true,
          },
        },
      },
    } as any);

    // 更新需求的 quote_count
    const isFirstQuote = demand.quoteCount === 0;
    await this.prisma.demand.update({
      where: { id: String(data.demandId) },
      data: {
        quoteCount: { increment: 1 },
        // 首个报价时从待抢单(0) -> 报价审核中(1)
        ...(isFirstQuote && demand.status === 0 ? { status: 1 } : {}),
      },
    });

    await this.eventLog.log({
      bizType: 'quote',
      bizId: quote.id,
      eventType: 'submit',
      operatorId: userId,
      detail: {
        quoteNo,
        demandId: data.demandId,
        teamId: user.teamId,
        price: data.price,
      },
    });

    return quote;
  }

  /**
   * 我的报价列表
   */
  async getMyQuotes(userId: string, pagination: PaginationDto, status?: number) {
    // 查找用户所属团队
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true },
    });

    if (!user || !user.teamId) {
      return {
        list: [],
        total: 0,
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
    }

    const where: any = { teamId: user.teamId };
    if (status !== undefined && status !== null) {
      where.status = Number(status);
    }

    const [list, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: {
          demand: {
            select: {
              id: true,
              demandNo: true,
              title: true,
              demoType: true,
              address: true,
              district: true,
              status: true,
            },
          },
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
      this.prisma.quote.count({ where }),
    ]);

    return {
      list,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * 报价详情
   */
  async getQuoteById(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        demand: {
          select: {
            id: true,
            demandNo: true,
            title: true,
            demoType: true,
            address: true,
            district: true,
            status: true,
            user: {
              select: {
                id: true,
                nickname: true,
                avatarUrl: true,
                phone: true,
              },
            },
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            specialties: true,
            completedCount: true,
            avgRating: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            verifyStatus: true,
          },
        },
      },
    } as any);

    if (!quote) {
      throw new NotFoundException('报价不存在');
    }

    return quote;
  }

  /**
   * 审核报价（运营用）
   * 如果所有报价都审核完毕且有通过的，更新demands.status为已推荐报价(3)
   */
  async reviewQuote(
    quoteId: string,
    action: 'passed' | 'rejected',
    remark?: string,
    reviewerId?: string,
  ) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      throw new NotFoundException('报价不存在');
    }

    if (quote.status !== 0) {
      throw new BadRequestException('该报价已审核，不能重复审核');
    }

    const newStatus = action === 'passed' ? 1 : 2; // 1=通过 2=拒绝

    const updated = await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: newStatus,
        reviewRemark: remark || null,
        reviewedAt: new Date(),
        reviewedBy: reviewerId || null,
      },
      include: {
        demand: {
          select: {
            id: true,
            demandNo: true,
            title: true,
            status: true,
          },
        },
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

    await this.eventLog.log({
      bizType: 'quote',
      bizId: quoteId,
      eventType: action === 'passed' ? 'review_passed' : 'review_rejected',
      operatorId: reviewerId,
      detail: {
        quoteId,
        action,
        remark,
      },
    });

    // 检查该需求的所有报价是否都已审核完毕
    const allQuotes = await this.prisma.quote.findMany({
      where: { demandId: quote.demandId },
      select: { id: true, status: true },
    });

    const allReviewed = allQuotes.every((q) => q.status !== 0);
    const hasPassed = allQuotes.some((q) => q.status === 1);

    if (allReviewed && hasPassed) {
      // 所有报价审核完毕且有通过的 -> 更新需求状态为已推荐报价(3)
      await this.prisma.demand.update({
        where: { id: quote.demandId },
        data: { status: 3 },
      });

      await this.eventLog.log({
        bizType: 'demand',
        bizId: quote.demandId,
        eventType: 'quotes_reviewed',
        operatorId: reviewerId,
        detail: {
          totalQuotes: allQuotes.length,
          passedQuotes: allQuotes.filter((q) => q.status === 1).length,
        },
      });
    } else if (allReviewed && !hasPassed) {
      // 所有报价审核完毕但全部被拒绝 -> 更新需求状态为报价未通过(4)
      await this.prisma.demand.update({
        where: { id: quote.demandId },
        data: { status: 4 },
      });

      await this.eventLog.log({
        bizType: 'demand',
        bizId: quote.demandId,
        eventType: 'quotes_all_rejected',
        operatorId: reviewerId,
        detail: {
          totalQuotes: allQuotes.length,
        },
      });
    }

    return updated;
  }

  /**
   * 报价列表（管理用）
   */
  async getQuoteList(pagination: PaginationDto, filters?: any) {
    const where: any = {};

    if (filters?.status !== undefined && filters?.status !== null) {
      where.status = Number(filters.status);
    }

    if (filters?.demandId) {
      where.demandId = String(filters.demandId);
    }

    if (filters?.teamId) {
      where.teamId = String(filters.teamId);
    }

    if (filters?.companyId) {
      where.companyId = String(filters.companyId);
    }

    if (filters?.keyword) {
      where.quoteNo = { contains: filters.keyword };
    }

    const [list, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: {
          demand: {
            select: {
              id: true,
              demandNo: true,
              title: true,
              demoType: true,
              status: true,
              user: {
                select: {
                  id: true,
                  nickname: true,
                  phone: true,
                },
              },
            },
          },
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
      this.prisma.quote.count({ where }),
    ]);

    return {
      list,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }
}
