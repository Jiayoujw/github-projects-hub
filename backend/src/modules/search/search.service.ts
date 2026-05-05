import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: {
    keyword?: string;
    language?: string;
    category?: string;
    starMin?: number;
    starMax?: number;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { keyword, language, category, starMin, starMax, sortBy = 'stars', page = 1, pageSize = 20 } = params;

    if (!keyword) {
      return { items: [], total: 0, page, pageSize };
    }

    const baseWhere: Prisma.ProjectWhereInput = { status: 'active' };
    if (language) baseWhere.primaryLanguage = language;
    if (category) baseWhere.category = { slug: category };
    if (starMin !== undefined || starMax !== undefined) {
      baseWhere.stars = {};
      if (starMin !== undefined) (baseWhere.stars as any).gte = starMin;
      if (starMax !== undefined) (baseWhere.stars as any).lte = starMax;
    }

    const searchWhere: Prisma.ProjectWhereInput = {
      ...baseWhere,
      OR: [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
        { fullName: { contains: keyword } },
      ],
    };

    let orderBy: Prisma.ProjectOrderByWithRelationInput = { stars: 'desc' };
    if (sortBy === 'updated_at') orderBy = { pushedAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where: searchWhere,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: { select: { name: true, slug: true } } },
      }),
      this.prisma.project.count({ where: searchWhere }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async suggest(keyword: string, limit = 10) {
    if (!keyword || keyword.length < 1) return [];
    return this.prisma.project.findMany({
      where: {
        status: 'active',
        OR: [
          { name: { contains: keyword } },
          { fullName: { contains: keyword } },
        ],
      },
      select: { id: true, name: true, fullName: true, primaryLanguage: true, stars: true },
      orderBy: { stars: 'desc' },
      take: limit,
    });
  }

  async getHotKeywords(limit = 20) {
    // Return top language + project name combinations as "hot topics"
    const projects = await this.prisma.project.findMany({
      where: { status: 'active' },
      orderBy: { stars: 'desc' },
      select: { name: true, primaryLanguage: true },
      take: limit * 2,
    });
    // Return the most starred project names as hot keywords
    return projects.slice(0, limit).map((p) => p.name);
  }
}
