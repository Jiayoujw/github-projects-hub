import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CrawlerService } from './crawler.service';

@Injectable()
export class CrawlerSchedulerService {
  private readonly logger = new Logger(CrawlerSchedulerService.name);

  constructor(private readonly crawlerService: CrawlerService) {}

  @Cron('0 */6 * * *')
  async handleTrendingSync() {
    this.logger.log('定时采集：同步 Trending 项目');
    try {
      const result = await this.crawlerService.syncTrending();
      this.logger.log(`定时采集完成：新增 ${result.created}，更新 ${result.updated}`);
    } catch (err) {
      this.logger.error(`定时采集失败: ${err.message}`);
    }
  }

  @Cron('0 * * * *')
  async handleIncrementalUpdate() {
    this.logger.log('定时更新：增量刷新已有项目');
    try {
      const result = await this.crawlerService.updateExistingProjects();
      this.logger.log(`定时更新完成：${result.updated} 个项目`);
    } catch (err) {
      this.logger.error(`定时更新失败: ${err.message}`);
    }
  }
}
