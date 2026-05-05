import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SharedService } from './shared.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('分享')
@Controller('shared')
@Public()
export class SharedController {
  constructor(private readonly sharedService: SharedService) {}

  @Get('collections/:id')
  @ApiOperation({ summary: '查看分享的收藏' })
  async getSharedCollection(@Param('id') id: string) {
    const data = await this.sharedService.getSharedCollection(id);
    if (!data) throw new NotFoundException('收藏不存在');
    return data;
  }
}
