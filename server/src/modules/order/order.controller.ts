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
   * 我的订单列表
   */
  @Get('my')
  @ApiOperation({ summary: '我的订单列表' })
  async getMyOrders(
    @CurrentUser('id') userId: string,
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
    @Param('id') id: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.orderService.findById(id, userId);
  }

  /**
   * 服务方上传合同并设置开工日期
   */
  @Post(':id/contract')
  @Roles(2)
  @ApiOperation({ summary: '上传合同' })
  async uploadContract(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { contractId: string; planStartDate: string },
  ) {
    return this.orderService.uploadContract(
      userId,
      id,
      body.contractId,
      new Date(body.planStartDate),
    );
  }

  /**
   * 验收确认（需求方）
   */
  @Put(':id/accept')
  @Roles(1)
  @ApiOperation({ summary: '验收确认' })
  async accept(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orderService.accept(userId, id);
  }

  /**
   * 完工申请（服务方）
   */
  @Put(':id/complete')
  @Roles(2)
  @ApiOperation({ summary: '完工申请' })
  async complete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orderService.complete(userId, id);
  }

  /**
   * 取消订单
   */
  @Put(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orderService.cancel(userId, id);
  }
}
