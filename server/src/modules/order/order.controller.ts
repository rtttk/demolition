import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('订单模块')
@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 创建订单（服务方）
   */
  @Post()
  @Roles(2)
  @ApiOperation({ summary: '创建订单' })
  async create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.create(userId, dto);
  }

  /**
   * 我的订单列表
   */
  @Get('my')
  @ApiOperation({ summary: '我的订单列表' })
  async getMyOrders(
    @CurrentUser('id') userId: number,
    @Query() pagination: PaginationDto,
    @Query('status') status?: number,
  ) {
    return this.orderService.getMyOrders(
      userId,
      pagination,
      status !== undefined ? Number(status) : undefined,
    );
  }

  /**
   * 订单详情
   */
  @Get(':id')
  @ApiOperation({ summary: '订单详情' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId?: number,
  ) {
    return this.orderService.findById(id, userId);
  }

  /**
   * 确认合作（需求方）
   */
  @Put(':id/confirm')
  @Roles(1)
  @ApiOperation({ summary: '确认合作' })
  async confirm(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.orderService.confirm(userId, id);
  }

  /**
   * 验收确认（需求方）
   */
  @Put(':id/accept')
  @Roles(1)
  @ApiOperation({ summary: '验收确认' })
  async accept(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.orderService.accept(userId, id);
  }

  /**
   * 取消订单
   */
  @Put(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.orderService.cancel(userId, id);
  }
}
