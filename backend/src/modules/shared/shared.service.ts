import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SharedService {
  constructor(private readonly prisma: PrismaService) {}

  async getSharedCollection(collectionId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        project: {
          select: {
            id: true, name: true, fullName: true, description: true,
            stars: true, forks: true, primaryLanguage: true, license: true,
            avgRating: true, reviewCount: true, topics: true, htmlUrl: true,
          },
        },
        user: { select: { username: true, avatarUrl: true } },
      },
    });
    if (!collection) return null;

    return {
      id: collection.id,
      groupName: collection.groupName,
      note: collection.note,
      createdAt: collection.createdAt,
      sharedBy: collection.user,
      project: collection.project,
    };
  }
}
