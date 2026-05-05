import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { fetchRepository } from '../crawler/github-api.util';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    pageSize?: number;
    language?: string;
    category?: string;
    sort?: string;
    keyword?: string;
    starMin?: number;
    starMax?: number;
    license?: string;
  }) {
    const { page = 1, pageSize = 20, language, category, sort = 'stars', keyword, starMin, starMax, license } = params;

    const where: Prisma.ProjectWhereInput = {
      status: 'active',
      ...(language && { primaryLanguage: language }),
      ...(category && { category: { slug: category } }),
      ...(license && { license }),
      ...(starMin !== undefined && { stars: { ...(starMin !== undefined && { gte: starMin }), ...(starMax !== undefined && { lte: starMax }) } }),
      ...(starMin !== undefined && starMax === undefined && { stars: { gte: starMin } }),
      ...(starMax !== undefined && starMin === undefined && { stars: { lte: starMax } }),
      ...(keyword && {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
          { fullName: { contains: keyword } },
        ],
      }),
    };

    let orderBy: Prisma.ProjectOrderByWithRelationInput;
    switch (sort) {
      case 'updated_at':
        orderBy = { pushedAt: 'desc' };
        break;
      case 'trending':
        orderBy = { stars: 'desc' };
        break;
      default:
        orderBy = { stars: 'desc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: { select: { name: true, slug: true } } },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string, userId?: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: true } },
      },
    });
    if (!project) return null;

    // Increment view count (async, don't await)
    this.prisma.project.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(err => this.logger.warn(`更新浏览量失败: ${err.message}`));

    let isCollected = false;
    if (userId) {
      const collection = await this.prisma.collection.findUnique({
        where: { userId_projectId: { userId, projectId: id } },
      });
      isCollected = !!collection;
    }

    return { ...project, isCollected };
  }

  async getReadme(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { readmeContent: true, readmeHtml: true },
    });
    return project;
  }

  async getRelated(id: string, limit = 10) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { primaryLanguage: true, categoryId: true },
    });
    if (!project) return [];

    return this.prisma.project.findMany({
      where: {
        id: { not: id },
        status: 'active',
        OR: [
          { primaryLanguage: project.primaryLanguage || undefined },
          { categoryId: project.categoryId },
        ].filter(Boolean),
      },
      orderBy: { stars: 'desc' },
      take: limit,
    });
  }

  async getAnalytics() {
    const [
      total,
      langStats,
      starDist,
      licenseDist,
      monthlyNew,
      topStars,
      topForks,
    ] = await Promise.all([
      // Overall stats
      this.prisma.$queryRawUnsafe<Array<{ totalProjects: bigint; totalStars: bigint; totalForks: bigint; totalLanguages: bigint }>>(
        `SELECT COUNT(*) as totalProjects, COALESCE(SUM(stars),0) as totalStars, COALESCE(SUM(forks),0) as totalForks, COUNT(DISTINCT primary_language) as totalLanguages FROM projects WHERE status='active'`
      ),
      // Language distribution
      this.prisma.project.groupBy({
        by: ['primaryLanguage'],
        where: { primaryLanguage: { not: null }, status: 'active' },
        _count: true,
        _sum: { stars: true },
        orderBy: { _sum: { stars: 'desc' } },
        take: 15,
      }),
      // Star distribution
      this.prisma.$queryRawUnsafe<Array<{ bucket: string; count: bigint }>>(
        `SELECT CASE WHEN stars < 100 THEN '0-100' WHEN stars < 1000 THEN '100-1K' WHEN stars < 10000 THEN '1K-10K' WHEN stars < 50000 THEN '10K-50K' ELSE '50K+' END as bucket, COUNT(*) as count FROM projects WHERE status='active' GROUP BY bucket ORDER BY MIN(stars)`
      ),
      // License distribution
      this.prisma.project.groupBy({
        by: ['license'],
        where: { license: { not: null }, status: 'active' },
        _count: true,
        orderBy: { _count: { license: 'desc' } },
        take: 10,
      }),
      // Monthly new projects (last 12 months)
      this.prisma.$queryRawUnsafe<Array<{ month: string; count: bigint }>>(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count FROM projects WHERE status='active' AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY month ORDER BY month`
      ),
      // Top starred
      this.prisma.project.findMany({
        where: { status: 'active' },
        select: { id: true, fullName: true, name: true, stars: true, primaryLanguage: true },
        orderBy: { stars: 'desc' },
        take: 20,
      }),
      // Top forked
      this.prisma.project.findMany({
        where: { status: 'active' },
        select: { id: true, fullName: true, name: true, forks: true, primaryLanguage: true },
        orderBy: { forks: 'desc' },
        take: 10,
      }),
    ]);

    const stats = total[0];
    return {
      overview: {
        totalProjects: Number(stats?.totalProjects || 0),
        totalStars: Number(stats?.totalStars || 0),
        totalForks: Number(stats?.totalForks || 0),
        totalLanguages: Number(stats?.totalLanguages || 0),
      },
      languageDistribution: langStats.map(l => ({
        name: l.primaryLanguage,
        projectCount: l._count,
        totalStars: l._sum?.stars || 0,
      })),
      starDistribution: starDist.map(s => ({
        bucket: s.bucket,
        count: Number(s.count),
      })),
      licenseDistribution: licenseDist.map(l => ({
        license: l.license,
        count: l._count,
      })),
      monthlyTrend: monthlyNew.map(m => ({
        month: m.month,
        count: Number(m.count),
      })),
      topByStars: topStars,
      topByForks: topForks,
    };
  }

  async getLanguages() {
    const result = await this.prisma.project.findMany({
      where: { primaryLanguage: { not: null }, status: 'active' },
      select: { primaryLanguage: true },
      distinct: ['primaryLanguage'],
    });
    return result.map((r) => r.primaryLanguage).filter(Boolean).sort();
  }

  async toggleCollect(userId: string, projectId: string) {
    const existing = await this.prisma.collection.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (existing) {
      await this.prisma.collection.delete({ where: { id: existing.id } });
      return { collected: false };
    }
    await this.prisma.collection.create({ data: { userId, projectId } });
    return { collected: true };
  }

  async submitProject(userId: string, dto: { githubUrl: string; note?: string }) {
    const urlMatch = dto.githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!urlMatch) throw new BadRequestException('无效的 GitHub 项目链接');

    const [owner, repoName] = [urlMatch[1], urlMatch[2].replace('.git', '')];
    const repoData = await fetchRepository(owner, repoName);

    return this.prisma.project.create({
      data: {
        githubId: BigInt(repoData.id),
        fullName: repoData.full_name,
        name: repoData.name,
        description: repoData.description || '',
        htmlUrl: repoData.html_url,
        homepageUrl: repoData.homepage || '',
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        watchers: repoData.watchers_count,
        openIssues: repoData.open_issues_count,
        primaryLanguage: repoData.language,
        license: repoData.license?.spdx_id,
        topics: repoData.topics || [],
        source: 'user_submit',
        status: 'pending',
        githubCreatedAt: new Date(repoData.created_at),
        githubUpdatedAt: new Date(repoData.updated_at),
        pushedAt: new Date(repoData.pushed_at),
        isArchived: repoData.archived,
        isFork: repoData.fork,
      },
    });
  }
}
