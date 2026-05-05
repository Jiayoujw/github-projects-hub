import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TrendingService } from './trending.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('趋势排行')
@Controller('trending')
@Public()
export class TrendingController {
  constructor(private readonly trendingService: TrendingService) {}

  @Get('daily')
  @ApiOperation({ summary: '今日趋势' })
  getDaily(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.trendingService.getDailyTrending(page ? parseInt(page) : 1, pageSize ? parseInt(pageSize) : 50);
  }

  @Get('weekly')
  @ApiOperation({ summary: '本周热门' })
  getWeekly(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.trendingService.getWeeklyTrending(page ? parseInt(page) : 1, pageSize ? parseInt(pageSize) : 50);
  }

  @Get('monthly')
  @ApiOperation({ summary: '本月精选' })
  getMonthly(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.trendingService.getMonthlyTrending(page ? parseInt(page) : 1, pageSize ? parseInt(pageSize) : 100);
  }

  @Get('all-time')
  @ApiOperation({ summary: '历史经典' })
  getAllTime(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.trendingService.getAllTimeTop(page ? parseInt(page) : 1, pageSize ? parseInt(pageSize) : 100);
  }

  @Get('rising')
  @ApiOperation({ summary: '新星项目' })
  getRising(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.trendingService.getRisingStars(page ? parseInt(page) : 1, pageSize ? parseInt(pageSize) : 50);
  }

  @Get('projects/:projectId/trend')
  @ApiOperation({ summary: '单项目趋势数据' })
  getProjectTrend(@Param('projectId') projectId: string) {
    return this.trendingService.getProjectTrend(projectId);
  }
}
