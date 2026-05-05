import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrendingService {
  constructor(private readonly prisma: PrismaService) {}

  private selectFields = {
    id: true, name: true, fullName: true, description: true,
    primaryLanguage: true, stars: true, forks: true, pushedAt: true,
    htmlUrl: true, topics: true, license: true,
    category: { select: { name: true, slug: true } },
  };

  async getDailyTrending(page: number, pageSize: number) {
    const since = new Date();
    since.setDate(since.getDate() - 1);
    return this.getTrending(since, page, pageSize);
  }

  async getWeeklyTrending(page: number, pageSize: number) {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    return this.getTrending(since, page, pageSize);
  }

  async getMonthlyTrending(page: number, pageSize: number) {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    return this.getTrending(since, page, pageSize);
  }

  private async getTrending(since: Date, page: number, pageSize: number) {
    const where = {
      status: 'active' as const,
      pushedAt: { gte: since },
    };
    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        select: this.selectFields,
        orderBy: { stars: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.project.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getAllTimeTop(page: number, pageSize: number) {
    const where = { status: 'active' as const };
    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        select: this.selectFields,
        orderBy: { stars: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.project.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getRisingStars(page: number, pageSize: number) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const where = {
      status: 'active' as const,
      githubCreatedAt: { gte: sixMonthsAgo },
    };

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        select: this.selectFields,
        orderBy: { stars: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.project.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getProjectTrend(projectId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.projectSnapshot.findMany({
      where: {
        projectId,
        snapshotDate: { gte: thirtyDaysAgo },
      },
      orderBy: { snapshotDate: 'asc' },
      select: { stars: true, forks: true, openIssues: true, snapshotDate: true },
    });
  }
}
