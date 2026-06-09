import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CompanyService } from './company.service';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('companies')
@UseGuards(AuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * POST /companies/register - 注册公司（服务方）
   */
  @Post('register')
  @Roles(2)
  async register(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterCompanyDto,
  ) {
    return this.companyService.register(userId, dto);
  }

  /**
   * PUT /companies/profile - 更新公司信息（服务方）
   */
  @Put('profile')
  @Roles(2)
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companyService.updateProfile(userId, dto);
  }

  /**
   * GET /companies/my - 获取我的公司列表（服务方）
   */
  @Get('my')
  @Roles(2)
  async getMyCompany(@CurrentUser('id') userId: string) {
    return this.companyService.getMyCompany(userId);
  }

  /**
   * GET /companies/:id - 获取公司公开信息（公开）
   */
  @Public()
  @Get(':id')
  async getCompanyById(@Param('id') id: string) {
    return this.companyService.getCompanyById(id);
  }

  /**
   * POST /companies/:id/admin - 添加管理员（服务方）
   */
  @Post(':id/admin')
  @Roles(2)
  async addAdmin(
    @CurrentUser('id') userId: string,
    @Param('id') companyId: string,
    @Body('targetUserId') targetUserId: string,
  ) {
    return this.companyService.addAdmin(userId, companyId, targetUserId);
  }

  /**
   * DELETE /companies/:id/admin/:userId - 移除管理员（服务方）
   */
  @Delete(':id/admin/:userId')
  @Roles(2)
  async removeAdmin(
    @CurrentUser('id') userId: string,
    @Param('id') companyId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.companyService.removeAdmin(userId, companyId, targetUserId);
  }
}
