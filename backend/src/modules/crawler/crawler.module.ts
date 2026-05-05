import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { CrawlerSchedulerService } from './crawler-scheduler.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [CrawlerController],
  providers: [CrawlerService, CrawlerSchedulerService],
  exports: [CrawlerService],
})
export class CrawlerModule {}
