import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ComplianceService } from './compliance.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('合规知识模块')
@Controller('compliance-docs')
@UseGuards(AuthGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  /**
   * 合规文档列表（公开）
   */
  @Get()
  @Public()
  @ApiOperation({ summary: '合规文档列表' })
  async getList(
    @Query() pagination: PaginationDto,
    @Query('category') category?: string,
  ) {
    return this.complianceService.getList(pagination, category);
  }

  /**
   * 合规文档详情（公开）
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: '合规文档详情' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.complianceService.findById(id);
  }
}
