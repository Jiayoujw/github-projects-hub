import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjects(params: any) {
    const { page = 1, pageSize = 20, keyword, language, status, source } = params;
    const where: any = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (language) where.primaryLanguage = language;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: { select: { name: true } } },
      }),
      this.prisma.project.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async updateProject(id: string, data: any) {
    return this.prisma.project.update({ where: { id }, data });
  }

  async deleteProject(id: string) {
    return this.prisma.project.update({ where: { id }, data: { status: 'removed' } });
  }

  async getPendingProjects(params: any) {
    const { page = 1, pageSize = 20 } = params;
    const where = { status: 'pending' };
    const [items, total] = await Promise.all([
      this.prisma.project.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.project.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async reviewProject(id: string, approved: boolean) {
    return this.prisma.project.update({
      where: { id },
      data: { status: approved ? 'active' : 'removed' },
    });
  }

  async getUsers(params: any) {
    const { page = 1, pageSize = 20, keyword } = params;
    const where: any = {};
    if (keyword) {
      where.OR = [
        { username: { contains: keyword } },
        { email: { contains: keyword } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: { id: true, username: true, email: true, role: true, avatarUrl: true, createdAt: true, lastLoginAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async updateUserRole(id: string, role: string) {
    const roleRecord = await this.prisma.role.findUnique({ where: { name: role } });
    if (!roleRecord) throw new BadRequestException('角色不存在');
    return this.prisma.user.update({ where: { id }, data: { roleId: roleRecord.id } });
  }

  async getStats() {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const [
      projectCount, userCount, todayProjects, todayUsers,
      totalStars, totalForks, pendingCount, reviewCount,
      collectionCount, activeThisWeek, totalViews,
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.user.count(),
      this.prisma.project.count({ where: { createdAt: { gte: today } } }),
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      this.prisma.project.aggregate({ _sum: { stars: true }, where: { status: 'active' } }),
      this.prisma.project.aggregate({ _sum: { forks: true }, where: { status: 'active' } }),
      this.prisma.project.count({ where: { status: 'pending' } }),
      this.prisma.review.count(),
      this.prisma.collection.count(),
      this.prisma.project.count({ where: { pushedAt: { gte: new Date(Date.now() - 7 * 86400000) }, status: 'active' } }),
      this.prisma.project.aggregate({ _sum: { viewCount: true } }),
    ]);
    return {
      projectCount, userCount, todayProjects, todayUsers,
      totalStars: totalStars._sum.stars || 0,
      totalForks: totalForks._sum.forks || 0,
      pendingCount, reviewCount, collectionCount,
      activeThisWeek,
      totalViews: totalViews._sum.viewCount || 0,
    };
  }

  async getTags() {
    return this.prisma.tag.findMany({ orderBy: { usageCount: 'desc' } });
  }

  async createTag(data: { name: string; slug: string }) {
    return this.prisma.tag.create({ data });
  }

  async updateTag(id: string, data: any) {
    return this.prisma.tag.update({ where: { id }, data });
  }

  async deleteTag(id: string) {
    return this.prisma.tag.delete({ where: { id } });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createCategory(data: any) {
    return this.prisma.category.create({ data });
  }

  async updateCategory(id: string, data: any) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
