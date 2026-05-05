import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CrawlerService } from './crawler.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('数据采集')
@ApiBearerAuth()
@Roles('admin', 'super_admin')
@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post('sync')
  @ApiOperation({ summary: '手动触发 Trending 采集' })
  syncTrending() {
    return this.crawlerService.syncTrending();
  }

  @Post('update')
  @ApiOperation({ summary: '手动触发增量更新' })
  updateProjects() {
    return this.crawlerService.updateExistingProjects();
  }
}
