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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('消息模块')
@Controller('messages')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * 发送消息
   */
  @Post()
  @ApiOperation({ summary: '发送消息' })
  async send(
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messageService.send(userId, dto);
  }

  /**
   * 消息列表
   */
  @Get()
  @ApiOperation({ summary: '消息列表' })
  async getList(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
    @Query('type') type?: string,
  ) {
    return this.messageService.getList(userId, pagination, type);
  }

  /**
   * 未读消息数
   */
  @Get('unread-count')
  @ApiOperation({ summary: '未读消息数' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    return this.messageService.getUnreadCount(userId);
  }

  /**
   * 标记单条消息已读
   */
  @Put(':id/read')
  @ApiOperation({ summary: '标记消息已读' })
  async markRead(@Param('id') id: string) {
    return this.messageService.markRead(id);
  }

  /**
   * 全部标记已读
   */
  @Put('read-all')
  @ApiOperation({ summary: '全部标记已读' })
  async markAllRead(@CurrentUser('id') userId: string) {
    return this.messageService.markAllRead(userId);
  }
}
