import { Controller, Get, Put, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ReviewProjectDto } from './dto/review-project.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('管理后台')
@ApiBearerAuth()
@Roles('admin', 'super_admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('projects')
  @ApiOperation({ summary: '项目管理列表' })
  getProjects(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
    @Query('language') language?: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
  ) {
    return this.adminService.getProjects({ page: page ? parseInt(page) : 1, pageSize: pageSize ? parseInt(pageSize) : 20, keyword, language, status, source });
  }

  @Put('projects/:id')
  @ApiOperation({ summary: '编辑项目' })
  updateProject(@Param('id') id: string, @Body() body: UpdateProjectDto) {
    return this.adminService.updateProject(id, body);
  }

  @Delete('projects/:id')
  @ApiOperation({ summary: '删除项目' })
  deleteProject(@Param('id') id: string) {
    return this.adminService.deleteProject(id);
  }

  @Get('pending')
  @ApiOperation({ summary: '待审核项目' })
  getPendingProjects(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.adminService.getPendingProjects({ page: page ? parseInt(page) : 1, pageSize: pageSize ? parseInt(pageSize) : 20 });
  }

  @Put('pending/:id')
  @ApiOperation({ summary: '审核项目' })
  reviewProject(@Param('id') id: string, @Body() body: ReviewProjectDto) {
    return this.adminService.reviewProject(id, body.approved);
  }

  @Get('users')
  @ApiOperation({ summary: '用户列表' })
  getUsers(@Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('keyword') keyword?: string) {
    return this.adminService.getUsers({ page: page ? parseInt(page) : 1, pageSize: pageSize ? parseInt(pageSize) : 20, keyword });
  }

  @Put('users/:id')
  @ApiOperation({ summary: '修改用户角色' })
  updateUserRole(@Param('id') id: string, @Body() body: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Get('stats')
  @ApiOperation({ summary: '平台统计' })
  getStats() {
    return this.adminService.getStats();
  }

  @Public()
  @Get('tags')
  @ApiOperation({ summary: '标签列表' })
  getTags() {
    return this.adminService.getTags();
  }

  @Post('tags')
  @ApiOperation({ summary: '创建标签' })
  createTag(@Body() body: CreateTagDto) {
    return this.adminService.createTag(body);
  }

  @Put('tags/:id')
  @ApiOperation({ summary: '编辑标签' })
  updateTag(@Param('id') id: string, @Body() body: UpdateTagDto) {
    return this.adminService.updateTag(id, body);
  }

  @Delete('tags/:id')
  @ApiOperation({ summary: '删除标签' })
  deleteTag(@Param('id') id: string) {
    return this.adminService.deleteTag(id);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: '分类列表' })
  getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: '创建分类' })
  createCategory(@Body() body: CreateCategoryDto) {
    return this.adminService.createCategory(body);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: '编辑分类' })
  updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: '删除分类' })
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }
}
