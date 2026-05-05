import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SubmitProjectDto } from './dto/submit-project.dto';

@ApiTags('项目')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取项目列表' })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('language') language?: string,
    @Query('category') category?: string,
    @Query('sort') sort?: string,
    @Query('keyword') keyword?: string,
    @Query('starMin') starMin?: string,
    @Query('starMax') starMax?: string,
    @Query('license') license?: string,
  ) {
    return this.projectService.findAll({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      language,
      category,
      sort,
      keyword,
      starMin: starMin ? parseInt(starMin) : undefined,
      starMax: starMax ? parseInt(starMax) : undefined,
      license,
    });
  }

  @Public()
  @Get('languages')
  @ApiOperation({ summary: '获取语言列表' })
  getLanguages() {
    return this.projectService.getLanguages();
  }

  @Public()
  @Get('analytics')
  @ApiOperation({ summary: '获取平台数据分析' })
  getAnalytics() {
    return this.projectService.getAnalytics();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取项目详情' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId?: string) {
    return this.projectService.findOne(id, userId);
  }

  @Public()
  @Get(':id/readme')
  @ApiOperation({ summary: '获取项目 README' })
  getReadme(@Param('id') id: string) {
    return this.projectService.getReadme(id);
  }

  @Public()
  @Get(':id/related')
  @ApiOperation({ summary: '获取相关项目' })
  getRelated(@Param('id') id: string) {
    return this.projectService.getRelated(id);
  }

  @Post('submit')
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交项目收录' })
  submitProject(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitProjectDto,
  ) {
    return this.projectService.submitProject(userId, dto);
  }

  @Post(':id/collect')
  @ApiBearerAuth()
  @ApiOperation({ summary: '收藏/取消收藏' })
  toggleCollect(@Param('id') projectId: string, @CurrentUser('id') userId: string) {
    return this.projectService.toggleCollect(userId, projectId);
  }
}
