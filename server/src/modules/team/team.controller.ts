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
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('teams')
@UseGuards(AuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  /**
   * POST /teams - 创建团队（服务方）
   */
  @Post()
  @Roles(2)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTeamDto,
  ) {
    return this.teamService.create(userId, dto);
  }

  /**
   * PUT /teams/:id - 编辑团队（服务方）
   */
  @Put(':id')
  @Roles(2)
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') teamId: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamService.update(userId, teamId, dto);
  }

  /**
   * DELETE /teams/:id - 停用团队（服务方）
   */
  @Delete(':id')
  @Roles(2)
  async delete(
    @CurrentUser('id') userId: string,
    @Param('id') teamId: string,
  ) {
    return this.teamService.delete(userId, teamId);
  }

  /**
   * GET /teams/recommend - 获取推荐团队（公开）
   */
  @Public()
  @Get('recommend')
  async getRecommendTeams(@Query() pagination: PaginationDto) {
    return this.teamService.getRecommendTeams(pagination);
  }

  /**
   * GET /teams/list - 我的团队列表（服务方）
   */
  @Get('list')
  @Roles(2)
  async getMyTeams(@CurrentUser('id') userId: string) {
    return this.teamService.getMyTeams(userId);
  }

  /**
   * GET /teams/:id - 团队公开信息（公开）
   */
  @Public()
  @Get(':id')
  async getTeamById(@Param('id') id: string) {
    return this.teamService.getTeamById(id);
  }

  /**
   * GET /teams/:id/cases - 团队案例（公开）
   */
  @Public()
  @Get(':id/cases')
  async getTeamCases(
    @Param('id') teamId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.teamService.getTeamCases(teamId, pagination);
  }

  /**
   * GET /teams/:id/reviews - 团队评价（公开）
   */
  @Public()
  @Get(':id/reviews')
  async getTeamReviews(
    @Param('id') teamId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.teamService.getTeamReviews(teamId, pagination);
  }
}
