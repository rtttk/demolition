import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DemandService } from './demand.service';
import { CreateDemandDto } from './dto/create-demand.dto';
import { UpdateDemandDto } from './dto/update-demand.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('需求模块')
@Controller('demands')
@UseGuards(AuthGuard)
export class DemandController {
  constructor(private readonly demandService: DemandService) {}

  /**
   * 发布需求（需求方）
   */
  @Post()
  @Roles(1)
  @ApiOperation({ summary: '发布需求' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDemandDto,
  ) {
    return this.demandService.create(userId, dto);
  }

  /**
   * 我的需求列表（需求方）
   */
  @Get('my')
  @Roles(1)
  @ApiOperation({ summary: '我的需求列表' })
  async getMyDemands(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
    @Query('status') status?: number,
  ) {
    return this.demandService.getMyDemands(
      userId,
      pagination,
      status !== undefined ? Number(status) : undefined,
    );
  }

  /**
   * 抢单大厅（服务方）
   */
  @Get('hall')
  @Roles(2)
  @ApiOperation({ summary: '抢单大厅' })
  async getHallList(
    @Query() pagination: PaginationDto,
    @Query('district') district?: string,
    @Query('demoType') demoType?: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.demandService.getHallList(pagination, {
      district,
      demoType: demoType !== undefined ? Number(demoType) : undefined,
      keyword,
    });
  }

  /**
   * 需求详情（登录用户）
   */
  @Get(':id')
  @ApiOperation({ summary: '需求详情' })
  async findById(
    @Param('id') id: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.demandService.findById(id, userId);
  }

  /**
   * 编辑需求（需求方）
   */
  @Put(':id')
  @Roles(1)
  @ApiOperation({ summary: '编辑需求' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') demandId: string,
    @Body() dto: UpdateDemandDto,
  ) {
    return this.demandService.update(userId, demandId, dto);
  }

  /**
   * 取消需求（需求方）
   */
  @Put(':id/cancel')
  @Roles(1)
  @ApiOperation({ summary: '取消需求' })
  async cancel(
    @CurrentUser('id') userId: string,
    @Param('id') demandId: string,
  ) {
    return this.demandService.cancel(userId, demandId);
  }

  /**
   * 需求的报价列表（需求方）
   */
  @Get(':id/quotes')
  @Roles(1)
  @ApiOperation({ summary: '需求的报价列表' })
  async getDemandQuotes(@Param('id') demandId: string) {
    return this.demandService.getDemandQuotes(demandId);
  }

  /**
   * 选择报价（需求方）
   */
  @Put(':id/select-quotes')
  @Roles(1)
  @ApiOperation({ summary: '选择报价' })
  async selectQuotes(
    @CurrentUser('id') userId: string,
    @Param('id') demandId: string,
    @Body('quoteIds') quoteIds: string[],
  ) {
    return this.demandService.selectQuotes(userId, demandId, quoteIds);
  }
}
