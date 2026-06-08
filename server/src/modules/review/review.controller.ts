import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('评价模块')
@Controller('reviews')
@UseGuards(AuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * 创建评价（需求方）
   */
  @Post()
  @Roles(1)
  @ApiOperation({ summary: '创建评价' })
  async create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.create(userId, dto);
  }

  /**
   * 评价列表（按团队ID，公开）
   */
  @Get()
  @Public()
  @ApiOperation({ summary: '评价列表' })
  async getList(
    @Query('teamId', ParseIntPipe) teamId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.reviewService.getList(teamId, pagination);
  }
}
