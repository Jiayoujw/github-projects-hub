import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('评论')
@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Public()
  @Get('projects/:projectId/comments')
  @ApiOperation({ summary: '获取项目评论列表' })
  findByProject(
    @Param('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.commentService.findByProject(projectId, {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
  }

  @Post('projects/:projectId/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布评论' })
  create(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: CreateCommentDto,
  ) {
    return this.commentService.create(userId, projectId, body.content, body.parentId);
  }

  @Delete('comments/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论' })
  delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.commentService.delete(userId, id);
  }
}
