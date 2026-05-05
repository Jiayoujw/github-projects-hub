import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { fetchTrendingRepositories, fetchRepository, fetchReadme, fetchLanguages } from './github-api.util';

const CONCURRENCY = 5;

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async syncTrending() {
    this.logger.log('开始同步 Trending 项目...');
    const repos = await fetchTrendingRepositories(1, 100);
    let created = 0;
    let updated = 0;

    // Process in concurrent chunks to respect GitHub rate limits
    for (let i = 0; i < repos.length; i += CONCURRENCY) {
      const chunk = repos.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        chunk.map((repo) => this.syncOneRepo(repo)),
      );
      for (const r of results) {
        if (r.status === 'fulfilled') {
          if (r.value === 'created') created++;
          else if (r.value === 'updated') updated++;
        }
      }
    }

    this.logger.log(`同步完成：新增 ${created}，更新 ${updated}`);
    return { created, updated, total: repos.length };
  }

  private async syncOneRepo(repo: any): Promise<'created' | 'updated'> {
    const [owner, name] = repo.full_name.split('/');
    const [readme, languageStats] = await Promise.all([
      fetchReadme(owner, name),
      fetchLanguages(owner, name),
    ]);

    const data = {
      githubId: BigInt(repo.id),
      fullName: repo.full_name,
      name: repo.name,
      description: repo.description || '',
      homepageUrl: repo.homepage || '',
      htmlUrl: repo.html_url,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      watchers: repo.watchers_count || 0,
      openIssues: repo.open_issues_count || 0,
      primaryLanguage: repo.language || null,
      languageStats: languageStats || {},
      license: repo.license?.spdx_id || null,
      topics: repo.topics || [],
      readmeContent: readme || '',
      contributorCount: 0,
      githubCreatedAt: repo.created_at ? new Date(repo.created_at) : null,
      githubUpdatedAt: repo.updated_at ? new Date(repo.updated_at) : null,
      pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
      isArchived: repo.archived || false,
      isFork: repo.fork || false,
    };

    const existing = await this.prisma.project.findUnique({
      where: { githubId: BigInt(repo.id) },
    });

    if (existing) {
      await this.prisma.project.update({ where: { id: existing.id }, data });
      return 'updated';
    }

    const project = await this.prisma.project.create({ data });
    this.notificationService.notifyMatchingUsers({
      id: project.id,
      fullName: project.fullName,
      primaryLanguage: project.primaryLanguage,
      description: project.description,
      stars: project.stars,
      topics: project.topics as string[],
      categoryId: project.categoryId,
    }).catch(err => this.logger.warn(`通知发送失败: ${err.message}`));
    return 'created';
  }

  async updateExistingProjects() {
    this.logger.log('开始增量更新项目...');
    const projects = await this.prisma.project.findMany({
      where: { status: 'active' },
      select: { id: true, fullName: true, stars: true },
      take: 500,
    });

    let updatedCount = 0;
    for (let i = 0; i < projects.length; i += CONCURRENCY) {
      const chunk = projects.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        chunk.map(async (project) => {
          const [owner, name] = project.fullName.split('/');
          const repo = await fetchRepository(owner, name);
          await this.prisma.project.update({
            where: { id: project.id },
            data: {
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              watchers: repo.watchers_count,
              openIssues: repo.open_issues_count,
              githubUpdatedAt: new Date(repo.updated_at),
              pushedAt: new Date(repo.pushed_at),
            },
          });
        }),
      );
      updatedCount += results.filter((r) => r.status === 'fulfilled').length;
    }

    this.logger.log(`增量更新完成：${updatedCount} 个项目`);
    return { updated: updatedCount };
  }
}
