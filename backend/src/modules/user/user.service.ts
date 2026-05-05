import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, githubId: true, username: true, email: true,
        avatarUrl: true, bio: true, role: true, preferences: true,
        lastLoginAt: true, createdAt: true,
      },
    });
    if (!user) return null;
    const preferences = (user.preferences || {}) as Record<string, any>;
    return { ...user, githubUsername: preferences.githubUsername || null };
  }

  async updateProfile(userId: string, data: { username?: string; bio?: string; avatarUrl?: string; githubUsername?: string; preferences?: any }) {
    const { githubUsername, ...rest } = data;
    const updateData: any = { ...rest };

    if (githubUsername !== undefined) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } });
      const prefs = (user?.preferences || {}) as Record<string, any>;
      prefs.githubUsername = githubUsername;
      updateData.preferences = prefs;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true, githubId: true, username: true, email: true,
        avatarUrl: true, bio: true, role: true, preferences: true,
      },
    });
  }

  async getCollections(userId: string, params: { page?: number; pageSize?: number; groupName?: string }) {
    const { page = 1, pageSize = 20, groupName } = params;
    const where: any = { userId };
    if (groupName) where.groupName = groupName;

    const [items, total] = await Promise.all([
      this.prisma.collection.findMany({
        where,
        include: {
          project: {
            select: {
              id: true, name: true, fullName: true, description: true,
              stars: true, forks: true, primaryLanguage: true, license: true,
              avgRating: true, reviewCount: true, topics: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.collection.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async updateCollection(userId: string, collectionId: string, data: { groupName?: string; note?: string }) {
    const col = await this.prisma.collection.findFirst({ where: { id: collectionId, userId } });
    if (!col) return null;
    return this.prisma.collection.update({ where: { id: collectionId }, data, include: { project: true } });
  }

  async deleteCollection(userId: string, collectionId: string) {
    const col = await this.prisma.collection.findFirst({ where: { id: collectionId, userId } });
    if (!col) return null;
    return this.prisma.collection.delete({ where: { id: collectionId } });
  }

  async batchDeleteCollections(userId: string, ids: string[]) {
    return this.prisma.collection.deleteMany({ where: { id: { in: ids }, userId } });
  }

  async getReviews(userId: string, params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = params;
    const where = { userId };

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: { project: { select: { id: true, name: true, fullName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async recordView(userId: string, projectId: string) {
    const recent = await this.prisma.viewHistory.findFirst({
      where: { userId, projectId },
      orderBy: { createdAt: 'desc' },
    });
    if (recent && Date.now() - recent.createdAt.getTime() < 30 * 60 * 1000) {
      return;
    }
    await this.prisma.viewHistory.create({
      data: { userId, projectId },
    }).catch(err => this.logger.warn(`记录浏览历史失败: ${err.message}`));
    await this.prisma.project.update({
      where: { id: projectId },
      data: { viewCount: { increment: 1 } },
    }).catch(err => this.logger.warn(`更新浏览量失败: ${err.message}`));
  }

  async getHistory(userId: string) {
    const items = await this.prisma.viewHistory.findMany({
      where: { userId },
      include: { project: { select: { id: true, name: true, fullName: true, primaryLanguage: true, stars: true, description: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return items;
  }
}
