import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@ApiTags('评价')
@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Public()
  @Get('projects/:projectId/reviews')
  @ApiOperation({ summary: '获取项目评价列表' })
  findByProject(
    @Param('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.reviewService.findByProject(projectId, {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
  }

  @Post('projects/:projectId/reviews')
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布评价' })
  create(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: CreateReviewDto,
  ) {
    return this.reviewService.create(userId, projectId, body);
  }

  @Put('reviews/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新评价' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: UpdateReviewDto,
  ) {
    return this.reviewService.update(userId, id, body);
  }

  @Delete('reviews/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评价' })
  delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.reviewService.delete(userId, id);
  }
}
