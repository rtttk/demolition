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
import { ConstructionLogService } from './construction-log.service';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('施工日志模块')
@Controller('construction-logs')
@UseGuards(AuthGuard)
export class ConstructionLogController {
  constructor(private readonly constructionLogService: ConstructionLogService) {}

  /**
   * 创建施工日志（服务方）
   */
  @Post()
  @Roles(2)
  @ApiOperation({ summary: '创建施工日志' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateLogDto,
  ) {
    return this.constructionLogService.create(userId, dto);
  }

  /**
   * 获取施工日志列表
   */
  @Get()
  @ApiOperation({ summary: '获取施工日志列表' })
  async getList(
    @Query('orderId') orderId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.constructionLogService.getList(orderId, pagination);
  }

  /**
   * 检查今日是否已提交日志
   */
  @Get('check')
  @ApiOperation({ summary: '检查今日是否已提交日志' })
  async checkToday(
    @Query('orderId') orderId: string,
  ) {
    return this.constructionLogService.checkToday(orderId);
  }

  /**
   * 更新施工日志
   */
  @Put(':id')
  @Roles(2)
  @ApiOperation({ summary: '更新施工日志' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLogDto,
  ) {
    return this.constructionLogService.update(userId, id, dto);
  }
}
