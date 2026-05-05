import { Controller, Get, Put, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { BatchDeleteCollectionsDto } from './dto/batch-delete-collections.dto';
import { RecordViewDto } from './dto/record-view.dto';

@ApiTags('用户')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Put('me')
  @ApiOperation({ summary: '更新个人资料' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() body: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, body);
  }

  @Get('me/collections')
  @ApiOperation({ summary: '我的收藏列表' })
  getCollections(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('groupName') groupName?: string,
  ) {
    return this.userService.getCollections(userId, {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      groupName,
    });
  }

  @Put('me/collections/:id')
  @ApiOperation({ summary: '更新收藏分组或备注' })
  updateCollection(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: UpdateCollectionDto,
  ) {
    return this.userService.updateCollection(userId, id, body);
  }

  @Delete('me/collections/:id')
  @ApiOperation({ summary: '删除收藏' })
  deleteCollection(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.userService.deleteCollection(userId, id);
  }

  @Post('me/collections/batch-delete')
  @ApiOperation({ summary: '批量删除收藏' })
  batchDeleteCollections(
    @CurrentUser('id') userId: string,
    @Body() body: BatchDeleteCollectionsDto,
  ) {
    return this.userService.batchDeleteCollections(userId, body.ids);
  }

  @Get('me/reviews')
  @ApiOperation({ summary: '我的评价列表' })
  getReviews(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.userService.getReviews(userId, {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
  }

  @Post('me/history')
  @ApiOperation({ summary: '记录浏览历史' })
  recordView(
    @CurrentUser('id') userId: string,
    @Body() body: RecordViewDto,
  ) {
    return this.userService.recordView(userId, body.projectId);
  }

  @Get('me/history')
  @ApiOperation({ summary: '浏览历史' })
  getHistory(@CurrentUser('id') userId: string) {
    return this.userService.getHistory(userId);
  }
}
