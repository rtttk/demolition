import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('后台管理')
@Controller('admin')
@UseGuards(AuthGuard)
@Roles(3)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== 数据看板 ====================

  @Get('dashboard')
  @ApiOperation({ summary: '获取数据看板统计' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  // ==================== 用户管理 ====================

  @Get('users')
  @ApiOperation({ summary: '用户列表' })
  async getUserList(
    @Query() pagination: PaginationDto,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('phone') phone?: string,
  ) {
    const filters: any = {};
    if (role !== undefined && role !== '' && role !== null) filters.role = role;
    if (status !== undefined && status !== '' && status !== null) filters.status = status;
    if (phone && phone.trim() !== '') filters.phone = phone;

    return this.adminService.getUserList(pagination, filters);
  }

  @Put('users/:id/status')
  @ApiOperation({ summary: '启用/禁用用户' })
  async updateUserStatus(
    @CurrentUser('id') userId: string,
    @Param('id') targetId: string,
    @Body('status') status: number,
  ) {
    return this.adminService.updateUserStatus(userId, targetId, status);
  }

  @Put('users/:id/roles')
  @ApiOperation({ summary: '分配用户角色' })
  async assignUserRoles(
    @CurrentUser('id') userId: string,
    @Param('id') targetId: string,
    @Body('roles') roles: number[],
  ) {
    return this.adminService.assignUserRoles(userId, targetId, roles);
  }

  @Put('users/:id/team')
  @ApiOperation({ summary: '为用户关联/取消关联团队' })
  async assignUserTeam(
    @CurrentUser('id') userId: string,
    @Param('id') targetId: string,
    @Body('teamId') teamId: string,
  ) {
    return this.adminService.assignUserTeam(userId, targetId, teamId);
  }

  // ==================== 公司管理 ====================

  @Get('companies')
  @ApiOperation({ summary: '公司列表' })
  async getCompanyList(
    @Query() pagination: PaginationDto,
    @Query('name') name?: string,
    @Query('verifyStatus') verifyStatus?: string,
    @Query('status') status?: string,
  ) {
    const filters: any = {};
    if (name && name.trim() !== '') filters.name = name;
    if (verifyStatus !== undefined && verifyStatus !== '' && verifyStatus !== null)
      filters.verifyStatus = verifyStatus;
    if (status !== undefined && status !== '' && status !== null) filters.status = status;

    return this.adminService.getCompanyList(pagination, filters);
  }

  @Put('companies/:id/verify')
  @ApiOperation({ summary: '审核公司资质' })
  async verifyCompany(
    @CurrentUser('id') userId: string,
    @Param('id') companyId: string,
    @Body() body: { action: 'passed' | 'rejected'; remark?: string },
  ) {
    return this.adminService.verifyCompany(
      companyId,
      body.action,
      body.remark,
    );
  }

  @Get('companies/:id/teams')
  @ApiOperation({ summary: '查看公司下属团队' })
  async getCompanyTeams(
    @Param('id') companyId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.adminService.getCompanyTeams(companyId, pagination);
  }

  // ==================== 团队管理 ====================

  @Get('teams')
  @ApiOperation({ summary: '团队列表' })
  async getTeamList(
    @Query() pagination: PaginationDto,
    @Query('companyId') companyId?: string,
    @Query('name') name?: string,
    @Query('status') status?: string,
  ) {
    const filters: any = {};
    if (companyId && companyId.trim() !== '') filters.companyId = companyId;
    if (name && name.trim() !== '') filters.name = name;
    if (status !== undefined && status !== '' && status !== null) filters.status = status;

    return this.adminService.getTeamList(pagination, filters);
  }

  @Put('teams/:id/status')
  @ApiOperation({ summary: '启用/禁用团队' })
  async updateTeamStatus(
    @CurrentUser('id') userId: string,
    @Param('id') teamId: string,
    @Body('status') status: number,
  ) {
    return this.adminService.updateTeamStatus(userId, teamId, status);
  }

  @Get('teams/all')
  @ApiOperation({ summary: '获取所有团队简表（用于下拉选择）' })
  async getAllTeamsSimple() {
    return this.adminService.getAllTeamsSimple();
  }

  @Get('teams/:id/members')
  @ApiOperation({ summary: '获取团队成员列表' })
  async getTeamMembers(@Param('id') teamId: string) {
    return this.adminService.getTeamMembers(teamId);
  }

  @Put('teams/:id/members/:userId/leader')
  @ApiOperation({ summary: '设置/取消团队队长' })
  async setTeamLeader(
    @CurrentUser('id') operatorId: string,
    @Param('id') teamId: string,
    @Param('userId') userId: string,
    @Body('isLeader') isLeader: boolean,
  ) {
    return this.adminService.setTeamLeader(operatorId, teamId, userId, isLeader);
  }

  @Delete('teams/:id/members/:userId')
  @ApiOperation({ summary: '移除团队成员' })
  async removeTeamMember(
    @CurrentUser('id') operatorId: string,
    @Param('id') teamId: string,
    @Param('userId') userId: string,
  ) {
    return this.adminService.removeTeamMember(operatorId, teamId, userId);
  }

  @Put('teams/:id/recommended')
  @ApiOperation({ summary: '设置/取消团队推荐' })
  async setTeamRecommended(
    @CurrentUser('id') userId: string,
    @Param('id') teamId: string,
    @Body('recommended') recommended: boolean,
  ) {
    return this.adminService.setTeamRecommended(userId, teamId, recommended);
  }

  // ==================== 需求管理 ====================

  @Get('demands')
  @ApiOperation({ summary: '需求列表' })
  async getDemandList(
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('district') district?: string,
    @Query('demoType') demoType?: string,
  ) {
    const filters: any = {};
    if (status !== undefined) filters.status = status;
    if (district) filters.district = district;
    if (demoType !== undefined) filters.demoType = demoType;

    return this.adminService.getDemandList(pagination, filters);
  }

  @Put('demands/:id/status')
  @ApiOperation({ summary: '审核需求（下架等操作）' })
  async updateDemandStatus(
    @CurrentUser('id') userId: string,
    @Param('id') demandId: string,
    @Body('status') status: number,
  ) {
    return this.adminService.updateDemandStatus(userId, demandId, status);
  }

  // ==================== 报价管理 ====================

  @Get('quotes')
  @ApiOperation({ summary: '报价列表' })
  async getQuoteList(
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('demandId') demandId?: string,
    @Query('teamId') teamId?: string,
  ) {
    const filters: any = {};
    if (status !== undefined) filters.status = status;
    if (demandId !== undefined) filters.demandId = demandId;
    if (teamId !== undefined) filters.teamId = teamId;

    return this.adminService.getQuoteList(pagination, filters);
  }

  @Put('quotes/:id/review')
  @ApiOperation({ summary: '审核报价' })
  async reviewQuote(
    @CurrentUser('id') userId: string,
    @Param('id') quoteId: string,
    @Body() body: { action: 'passed' | 'rejected'; remark?: string },
  ) {
    return this.adminService.reviewQuote(quoteId, body.action, body.remark, userId);
  }

  // ==================== 订单管理 ====================

  @Get('orders')
  @ApiOperation({ summary: '订单列表' })
  async getOrderList(
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('teamId') teamId?: string,
    @Query('companyId') companyId?: string,
  ) {
    const filters: any = {};
    if (status !== undefined) filters.status = status;
    if (teamId !== undefined) filters.teamId = teamId;
    if (companyId !== undefined) filters.companyId = companyId;

    return this.adminService.getOrderList(pagination, filters);
  }

  @Put('orders/:id/approve')
  @ApiOperation({ summary: '审核订单通过' })
  async approveOrder(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return this.adminService.adminApproveOrder(orderId, userId);
  }

  @Put('orders/:id/approve-contract')
  @ApiOperation({ summary: '审核合同通过' })
  async approveContract(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return this.adminService.approveContract(orderId, userId);
  }

  // ==================== 施工日志监控 ====================

  @Get('logs')
  @ApiOperation({ summary: '施工日志列表' })
  async getLogList(
    @Query() pagination: PaginationDto,
    @Query('orderId') orderId?: string,
    @Query('teamId') teamId?: string,
  ) {
    const filters: any = {};
    if (orderId !== undefined) filters.orderId = orderId;
    if (teamId !== undefined) filters.teamId = teamId;

    return this.adminService.getLogList(pagination, filters);
  }

  // ==================== 案例管理 ====================

  @Get('cases')
  @ApiOperation({ summary: '案例列表' })
  async getCaseList(
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('teamId') teamId?: string,
    @Query('demoType') demoType?: string,
  ) {
    const filters: any = {};
    if (status !== undefined) filters.status = status;
    if (teamId !== undefined) filters.teamId = teamId;
    if (demoType !== undefined) filters.demoType = demoType;

    return this.adminService.getCaseList(pagination, filters);
  }

  @Put('cases/:id/status')
  @ApiOperation({ summary: '更新案例状态' })
  async updateCaseStatus(
    @CurrentUser('id') userId: string,
    @Param('id') caseId: string,
    @Body() body: { action: 'visible' | 'hidden' | 'passed' | 'rejected' },
  ) {
    return this.adminService.updateCaseStatus(userId, caseId, body.action);
  }

  @Post('cases')
  @ApiOperation({ summary: '新增案例' })
  async createCase(
    @CurrentUser('id') userId: string,
    @Body() body: {
      teamId: string;
      title: string;
      demoType: number;
      description?: string;
      address?: string;
      area?: string;
      duration?: number;
      beforeImageIds?: string[];
      afterImageIds?: string[];
      recommended?: boolean;
    },
  ) {
    return this.adminService.createCase(userId, body);
  }

  @Put('cases/:id')
  @ApiOperation({ summary: '更新案例' })
  async updateCase(
    @CurrentUser('id') userId: string,
    @Param('id') caseId: string,
    @Body() body: {
      title?: string;
      demoType?: number;
      description?: string;
      address?: string;
      area?: string;
      duration?: number;
      beforeImageIds?: string[];
      afterImageIds?: string[];
      status?: number;
      recommended?: boolean;
    },
  ) {
    return this.adminService.updateCase(userId, caseId, body);
  }

  // ==================== 合规模板管理 ====================

  @Get('compliance')
  @ApiOperation({ summary: '合规模板列表' })
  async getComplianceList(
    @Query() pagination: PaginationDto,
    @Query('category') category?: string,
  ) {
    const filters: any = {};
    if (category) filters.category = category;

    return this.adminService.getComplianceList(pagination, filters);
  }

  @Post('compliance')
  @ApiOperation({ summary: '新增合规模板' })
  async createCompliance(
    @Body() body: {
      title: string;
      category: string;
      description?: string;
      fileId?: number;
      fileUrl?: string;
      sortOrder?: number;
    },
  ) {
    return this.adminService.createCompliance(body);
  }

  @Put('compliance/:id')
  @ApiOperation({ summary: '编辑合规模板' })
  async updateCompliance(
    @Param('id') id: string,
    @Body() body: {
      title?: string;
      category?: string;
      description?: string;
      fileId?: number;
      fileUrl?: string;
      sortOrder?: number;
      status?: number;
    },
  ) {
    return this.adminService.updateCompliance(id, body);
  }

  @Delete('compliance/:id')
  @ApiOperation({ summary: '删除合规模板' })
  async deleteCompliance(@Param('id') id: string) {
    return this.adminService.deleteCompliance(id);
  }
}
