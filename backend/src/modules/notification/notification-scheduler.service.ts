import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Cron('0 3 * * *')
  async handleCleanup() {
    this.logger.log('清理 90 天前的已读通知');
    try {
      const count = await this.notificationService.cleanupOldNotifications(90);
      this.logger.log(`清理完成：已删除 ${count} 条通知`);
    } catch (err) {
      this.logger.error(`通知清理失败: ${err.message}`);
    }
  }
}
