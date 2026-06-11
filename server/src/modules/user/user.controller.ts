import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('用户')
@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.userService.findById(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: '更新用户信息' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, dto);
  }

  @Get('roles')
  @ApiOperation({ summary: '获取用户角色列表' })
  async getUserRoles(@CurrentUser('id') userId: string) {
    return this.userService.getUserRoles(userId);
  }

  @Put('role')
  @ApiOperation({ summary: '切换当前角色' })
  async switchRole(
    @CurrentUser('id') userId: string,
    @Body() dto: SwitchRoleDto,
  ) {
    return this.userService.switchRole(userId, dto.role);
  }

  @Post('phone')
  @ApiOperation({ summary: '绑定手机号' })
  async bindPhone(
    @CurrentUser('id') userId: string,
    @Body('phone') phone: string,
  ) {
    return this.userService.bindPhone(userId, phone);
  }

  @Post('join-team')
  @ApiOperation({ summary: '选择所属团队' })
  async joinTeam(
    @CurrentUser('id') userId: string,
    @Body() dto: JoinTeamDto,
  ) {
    return this.userService.joinTeam(userId, String(dto.teamId));
  }

  @Get('list')
  @ApiOperation({ summary: '获取用户列表（管理用）' })
  @Roles(3)
  async getUserList(
    @Query() pagination: PaginationDto,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('phone') phone?: string,
    @Query('nickname') nickname?: string,
    @Query('teamId') teamId?: string,
  ) {
    const filters: any = {};
    if (role !== undefined) filters.role = role;
    if (status !== undefined) filters.status = status;
    if (phone) filters.phone = phone;
    if (nickname) filters.nickname = nickname;
    if (teamId !== undefined) filters.teamId = teamId;

    return this.userService.getUserList(pagination, filters);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取用户统计信息' })
  async getUserStats(@CurrentUser('id') userId: string) {
    return this.userService.getUserStats(userId);
  }
}
