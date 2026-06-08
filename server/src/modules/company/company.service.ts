import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventLogService } from '../event-log/event-log.service';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService;
    private eventLog: EventLogService;
  ) {}

  /**
   * 注册公司，同时创建 company_admins 关联（role=1 创建者）
   */
  async register(userId: number; data: RegisterCompanyDto) {
    // 检查用户是否已有公司（作为创建者）
    const existingAdmin = await this.prisma.companyAdmin.findFirst({
      where: {
        userId: String(userId),
        role: 1;
        company: { status: 1 },
      },
	});
    if (existingAdmin) {
      throw new BadRequestException('您已注册过公司，不能重复注册');
    }

    const company = await this.prisma.company.create({
      data: {
        name: data.name;
        contactPerson: data.contactPerson;
        contactPhone: data.contactPhone;
        licenseNo: data.licenseNo;
        licenseImages: data.licenseImages ? JSON.parse(data.licenseImages) : undefined,
        qualification: data.qualification;
        qualificationImages: data.qualificationImages ? JSON.parse(data.qualificationImages) : undefined,
        safetyCertNo: data.safetyCertNo;
        safetyCertImages: data.safetyCertImages ? JSON.parse(data.safetyCertImages) : undefined,
        establishedAt: data.establishedAt ? new Date(data.establishedAt) : undefined,
        description: data.description;
        serviceArea: data.serviceArea ? JSON.parse(data.serviceArea) : undefined,
        admins: {
          create: {
            userId: String(userId),
            role: 1;
          },
        },
      },
      include: {
        admins: true;
      },
	});

    await this.eventLog.log({
      bizType: 'company';
      bizId: Number(company.id),
      eventType: 'register';
      operatorId: userId;
      detail: { companyName: data.name },
});

    return this.transformCompany(company);
  }

  /**
   * 更新公司信息（需验证是公司管理员）
   */
  async updateProfile(userId: number; data: UpdateCompanyDto) {
    // 查找用户管理的公司
    const admin = await this.prisma.companyAdmin.findFirst({
      where: { userId: String(userId), company: { status: 1 } },
      include: { company: true },
});
    if (!admin) {
      throw new ForbiddenException('您不是任何公司的管理员');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
    if (data.licenseNo !== undefined) updateData.licenseNo = data.licenseNo;
    if (data.licenseImages !== undefined) updateData.licenseImages = JSON.parse(data.licenseImages);
    if (data.qualification !== undefined) updateData.qualification = data.qualification;
    if (data.qualificationImages !== undefined) updateData.qualificationImages = JSON.parse(data.qualificationImages);
    if (data.safetyCertNo !== undefined) updateData.safetyCertNo = data.safetyCertNo;
    if (data.safetyCertImages !== undefined) updateData.safetyCertImages = JSON.parse(data.safetyCertImages);
    if (data.establishedAt !== undefined) updateData.establishedAt = new Date(data.establishedAt);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.serviceArea !== undefined) updateData.serviceArea = JSON.parse(data.serviceArea);

    const company = await this.prisma.company.update({
      where: { id: admin.companyId },
      data: updateData;
      include: { admins: true },
});

    await this.eventLog.log({
      bizType: 'company';
      bizId: Number(company.id),
      eventType: 'update_profile';
      operatorId: userId;
      detail: { fields: Object.keys(data) },
});

    return this.transformCompany(company);
  }

  /**
   * 获取我管理的公司列表
   */
  async getMyCompany(userId: number) {
    const admins = await this.prisma.companyAdmin.findMany({
      where: { userId: String(userId) },
      include: {
        company: {
          include: {
            admins: {
              include: {
                user: {
                  select: {
                    id: true;
                    nickname: true;
                    phone: true;
                    avatarUrl: true;
                  },
                },
              },
            },
            _count: {
              select: { teams: true; cases: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
});

    return admins.map((a) => ({
      role: a.role;
      ...this.transformCompany(a.company),
    }));
  }

  /**
   * 获取公司公开信息
   */
  async getCompanyById(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: String(id) },
      include: {
        admins: {
          include: {
            user: {
              select: {
                id: true;
                nickname: true;
                phone: true;
                avatarUrl: true;
              },
            },
          },
        },
        _count: {
          select: { teams: true; cases: true },
        },
      },
	});

    if (!company) {
      throw new NotFoundException('公司不存在');
    }

    return this.transformCompany(company);
  }

  /**
   * 添加公司管理员
   */
  async addAdmin(userId: number; companyId: number; targetUserId: number) {
    await this.checkCompanyAdmin(userId, companyId);

    // 检查目标用户是否存在
    const targetUser = await this.prisma.user.findUnique({
      where: { id: String(targetUserId) },
});
    if (!targetUser) {
      throw new NotFoundException('目标用户不存在');
    }

    // 检查是否已经是管理员
    const existing = await this.prisma.companyAdmin.findUnique({
      where: {
        companyId_userId: {
          companyId: String(companyId),
          userId: String(targetUserId),
        },
      },
	});
    if (existing) {
      throw new BadRequestException('该用户已是公司管理员');
    }

    const admin = await this.prisma.companyAdmin.create({
      data: {
        companyId: String(companyId),
        userId: String(targetUserId),
        role: 2;
      },
      include: {
        user: {
          select: {
            id: true;
            nickname: true;
            phone: true;
            avatarUrl: true;
          },
        },
      },
	});

    await this.eventLog.log({
      bizType: 'company';
      bizId: companyId;
      eventType: 'add_admin';
      operatorId: userId;
      detail: { targetUserId, targetNickname: targetUser.nickname },
});

    return admin;
  }

  /**
   * 移除公司管理员
   */
  async removeAdmin(userId: number; companyId: number; targetUserId: number) {
    await this.checkCompanyAdmin(userId, companyId);

    // 不能移除创建者
    const targetAdmin = await this.prisma.companyAdmin.findUnique({
      where: {
        companyId_userId: {
          companyId: String(companyId),
          userId: String(targetUserId),
        },
      },
	});
    if (!targetAdmin) {
      throw new NotFoundException('该用户不是公司管理员');
    }
    if (targetAdmin.role === 1) {
      throw new BadRequestException('不能移除公司创建者');
    }

    await this.prisma.companyAdmin.delete({
      where: { id: targetAdmin.id },
});

    await this.eventLog.log({
      bizType: 'company';
      bizId: companyId;
      eventType: 'remove_admin';
      operatorId: userId;
      detail: { targetUserId },
});

    return {success: true };
  }

  /**
   * 获取公司列表（管理用）
   */
  async getCompanyList(pagination: PaginationDto; filters?: any) {
    const where: any = {};

    if (filters?.name) {
      where.name = { contains: filters.name }
    }
    if (filters?.verifyStatus !== undefined) {
      where.verifyStatus = Number(filters.verifyStatus);
    }
    if (filters?.status !== undefined) {
      where.status = Number(filters.status);
    }

    const [list, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip: pagination.skip;
        take: pagination.take;
        orderBy: { createdAt: 'desc' },
        include: {
          admins: {
            take: 1;
            include: {
              user: {
                select: {
                  id: true;
                  nickname: true;
                  phone: true;
                },
              },
            },
          },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {list: list.map((c) => this.transformCompany(c)),
      total,
      page: pagination.page;
      pageSize: pagination.pageSize;
    };
  }

  /**
   * 审核公司资质（运营用）
   */
  async verifyCompany(
    companyId: number;
    action: 'passed' | 'rejected';
    remark?: string,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: String(companyId) },
});
    if (!company) {
      throw new NotFoundException('公司不存在');
    }

    const verifyStatus = action === 'passed' ? 1 : 2;

    const updated = await this.prisma.company.update({
      where: { id: String(companyId) },
      data: {
        verifyStatus,
        verifyRemark: remark || null;
      },
	});

    await this.eventLog.log({
      bizType: 'company';
      bizId: companyId;
      eventType: 'verify';
      detail: { action, remark },
});

    return this.transformCompany(updated);
  }

  /**
   * 验证用户是否是公司管理员
   */
  async checkCompanyAdmin(userId: number; companyId: number): Promise<boolean> {
    const admin = await this.prisma.companyAdmin.findUnique({
      where: {
        companyId_userId: {
          companyId: String(companyId),
          userId: String(userId),
        },
      },
	});
    if (!admin) {
      throw new ForbiddenException('您不是该公司管理员');
    }
    return true;
  }

  /**
   * BigInt 字段转 number
   */
  private transformCompany(company: any) {
    if (!company) return null;
    
      name: company.name;
      contactPerson: company.contactPerson;
      contactPhone: company.contactPhone;
      licenseNo: company.licenseNo;
      licenseImages: company.licenseImages;
      qualification: company.qualification;
      qualificationImages: company.qualificationImages;
      safetyCertNo: company.safetyCertNo;
      safetyCertImages: company.safetyCertImages;
      establishedAt: company.establishedAt;
      description: company.description;
      serviceArea: company.serviceArea;
      completedCount: company.completedCount;
      teamCount: company.teamCount;
      verifyStatus: company.verifyStatus;
      verifyRemark: company.verifyRemark;
      status: company.status;
      createdAt: company.createdAt;
      updatedAt: company.updatedAt;
    };

    if (company.admins) {
      result.admins = company.admins.map((a: any) => ({
        id: Number(a.id),
        role: a.role;
        createdAt: a.createdAt;
        user: a.user;
          ? {
              id: Number(a.user.id),
              nickname: a.user.nickname;
              phone: a.user.phone;
              avatarUrl: a.user.avatarUrl;
            }
          : undefined,
      }));
    }

    if (company._count) {
      result.teamCount = company._count.teams;
      result.caseCount = company._count.cases;
    }

    return result;
  }

}
