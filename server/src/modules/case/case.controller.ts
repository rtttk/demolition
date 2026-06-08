import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CaseService } from './case.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('案例模块')
@Controller('cases')
@UseGuards(AuthGuard)
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  /**
   * 创建案例（服务方）
   */
  @Post()
  @Roles(2)
  @ApiOperation({ summary: '创建案例' })
  async create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateCaseDto,
  ) {
    return this.caseService.create(userId, dto);
  }

  /**
   * 案例列表（公开）
   */
  @Get()
  @Public()
  @ApiOperation({ summary: '案例列表' })
  async getList(
    @Query() pagination: PaginationDto,
    @Query('demoType') demoType?: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.caseService.getList(
      pagination,
      demoType !== undefined ? Number(demoType) : undefined,
      keyword,
    );
  }

  /**
   * 推荐案例（公开）
   */
  @Get('recommend')
  @Public()
  @ApiOperation({ summary: '推荐案例' })
  async getRecommend(@Query() pagination: PaginationDto) {
    return this.caseService.getRecommend(pagination);
  }

  /**
   * 案例详情（公开）
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: '案例详情' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.caseService.findById(id);
  }
}
