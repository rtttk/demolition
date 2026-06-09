import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { QuoteService } from './quote.service';
import { SubmitQuoteDto } from './dto/submit-quote.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('报价模块')
@Controller('quotes')
@UseGuards(AuthGuard)
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  /**
   * 提交报价（服务方）
   */
  @Post()
  @Roles(2)
  @ApiOperation({ summary: '提交报价' })
  async submit(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitQuoteDto,
  ) {
    return this.quoteService.submit(userId, dto);
  }

  /**
   * 我的报价列表（服务方）
   */
  @Get('my')
  @Roles(2)
  @ApiOperation({ summary: '我的报价列表' })
  async getMyQuotes(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
    @Query('status') status?: number,
  ) {
    return this.quoteService.getMyQuotes(
      userId,
      pagination,
      status !== undefined ? Number(status) : undefined,
    );
  }

  /**
   * 报价详情（登录用户）
   */
  @Get(':id')
  @ApiOperation({ summary: '报价详情' })
  async getQuoteById(@Param('id') id: string) {
    return this.quoteService.getQuoteById(id);
  }
}
