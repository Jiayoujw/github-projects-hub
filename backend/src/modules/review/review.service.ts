import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, projectId: string, dto: {
    rating: number;
    title?: string;
    content?: string;
    usageScenario?: string;
  }) {
    const existing = await this.prisma.review.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (existing) throw new ConflictException('您已经评价过此项目');

    const review = await this.prisma.review.create({
      data: { userId, projectId, ...dto },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } },
    });

    await this.updateProjectRating(projectId);
    return review;
  }

  async update(userId: string, reviewId: string, dto: {
    rating?: number;
    title?: string;
    content?: string;
    usageScenario?: string;
  }) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review || review.userId !== userId) throw new ForbiddenException('无权修改此评价');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: dto,
    });

    await this.updateProjectRating(review.projectId);
    return updated;
  }

  async delete(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review || review.userId !== userId) throw new ForbiddenException('无权删除此评价');

    await this.prisma.review.delete({ where: { id: reviewId } });
    await this.updateProjectRating(review.projectId);
    return { deleted: true };
  }

  async findByProject(projectId: string, params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = params;
    const where = { projectId };

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  private async updateProjectRating(projectId: string) {
    const result = await this.prisma.review.aggregate({
      where: { projectId },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        avgRating: result._avg.rating || 0,
        reviewCount: result._count,
      },
    });
  }
}
