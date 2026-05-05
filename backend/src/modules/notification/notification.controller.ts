import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AddSubscriptionDto } from './dto/add-subscription.dto';
import { ToggleSubscriptionDto } from './dto/toggle-subscription.dto';

@ApiTags('通知与订阅')
@ApiBearerAuth()
@Controller('users/me')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('notifications')
  @ApiOperation({ summary: '获取通知列表' })
  getNotifications(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.notificationService.getNotifications(
      userId,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
  }

  @Get('notifications/unread-count')
  @ApiOperation({ summary: '未读通知数' })
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Put('notifications/:id/read')
  @ApiOperation({ summary: '标记已读' })
  markRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notificationService.markRead(userId, id);
  }

  @Put('notifications/read-all')
  @ApiOperation({ summary: '全部标记已读' })
  markAllRead(@CurrentUser('id') userId: string) {
    return this.notificationService.markAllRead(userId);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: '获取订阅列表' })
  getSubscriptions(@CurrentUser('id') userId: string) {
    return this.notificationService.getSubscriptions(userId);
  }

  @Post('subscriptions')
  @ApiOperation({ summary: '添加订阅' })
  addSubscription(
    @CurrentUser('id') userId: string,
    @Body() body: AddSubscriptionDto,
  ) {
    return this.notificationService.addSubscription(userId, body.type, body.value);
  }

  @Put('subscriptions/:id')
  @ApiOperation({ summary: '切换订阅状态' })
  toggleSubscription(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: ToggleSubscriptionDto,
  ) {
    return this.notificationService.toggleSubscription(userId, id, body.enabled);
  }

  @Delete('subscriptions/:id')
  @ApiOperation({ summary: '删除订阅' })
  removeSubscription(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notificationService.removeSubscription(userId, id);
  }
}
