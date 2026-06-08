import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  /**
   * 合规文档列表（分页，可选分类筛选）
   */
  async getList(pagination: PaginationDto; category?: string) {
    const where: any = { status: 1 };

    if (category) {
      where.category = category;
    }

    const [list, total] = await Promise.all([
      this.prisma.complianceDoc.findMany({
        where,
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.complianceDoc.count({ where }),
    ]);

    return {list,
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  /**
   * 合规文档详情
   */
  async findById(id: number) {
    const doc = await this.prisma.complianceDoc.findUnique({
      where: { id: String(id) },
});

    if (!doc) {
      throw new NotFoundException('合规文档不存在');
    }

    return doc;
  }
}
