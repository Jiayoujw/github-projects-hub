import { Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('搜索')
@Controller('search')
@Public()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @ApiOperation({ summary: '全文搜索' })
  search(
    @Query('keyword') keyword?: string,
    @Query('language') language?: string,
    @Query('category') category?: string,
    @Query('starMin') starMin?: string,
    @Query('starMax') starMax?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.searchService.search({
      keyword,
      language,
      category,
      starMin: starMin ? parseInt(starMin) : undefined,
      starMax: starMax ? parseInt(starMax) : undefined,
      sortBy,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
  }

  @Get('suggest')
  @ApiOperation({ summary: '搜索建议' })
  suggest(@Query('keyword') keyword?: string) {
    return this.searchService.suggest(keyword || '');
  }

  @Get('hot')
  @ApiOperation({ summary: '热门搜索词' })
  getHotKeywords() {
    return this.searchService.getHotKeywords();
  }
}
