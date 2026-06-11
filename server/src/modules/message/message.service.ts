import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EventLogService } from '../event-log/event-log.service';
import { SendMessageDto } from './dto/send-message.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';


@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private eventLog: EventLogService,
  ) {}

  /**
   * 发送消息
   */
  async send(userId: string, data: SendMessageDto) {
    const message = await this.prisma.message.create({
      data: {
        orderId: data.orderId ? String(data.orderId) : null,
        senderId: userId,
        senderRole: 0,
        receiverId: String(data.receiverId),
        content: data.content || null,
        imageIds: data.imageIds ? data.imageIds as any : Prisma.JsonNull,
      },
    });

    // 查询发送者和接收者信息
    const [sender, receiver] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, nickname: true, avatarUrl: true },
      }),
      this.prisma.user.findUnique({
        where: { id: String(data.receiverId) },
        select: { id: true, nickname: true, avatarUrl: true },
      }),
    ]);

    await this.eventLog.log({
      bizType: 'message',
      bizId: message.id,
      eventType: 'send',
      operatorId: userId,
      detail: { receiverId: data.receiverId },
    });

    return { ...message, sender, receiver };
  }

  /**
   * 消息列表（当前用户发送或接收的消息）
   */
  async getList(userId: string, pagination: PaginationDto, type?: string) {
    const where = {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    };

    const [list, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.message.count({ where }),
    ]);

    // 收集所有需要查询的用户ID
    const userIds = [...new Set(list.flatMap(m => [m.senderId, m.receiverId]))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nickname: true, avatarUrl: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    // 合并消息和用户信息
    const listWithUsers = list.map(m => ({
      ...m,
      sender: userMap.get(m.senderId) || null,
      receiver: userMap.get(m.receiverId) || null,
    }));

    return {
      list: listWithUsers,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  /**
   * 未读消息数
   */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return { count };
  }

  /**
   * 标记单条消息已读
   */
  async markRead(id: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('消息不存在');
    }

    const updated = await this.prisma.message.update({
      where: { id },
      data: { isRead: true },
    });

    return updated;
  }

  /**
   * 全部标记已读
   */
  async markAllRead(userId: string) {
    const result = await this.prisma.message.updateMany({
      where: {
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { count: result.count };
  }
}
