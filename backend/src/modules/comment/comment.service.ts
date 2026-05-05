import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(userId: string, projectId: string, content: string, parentId?: string) {
    const comment = await this.prisma.comment.create({
      data: { userId, projectId, content, parentId },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        project: { select: { id: true, fullName: true } },
      },
    });

    // Notify parent comment author on reply
    if (parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: parentId },
        select: { userId: true },
      });
      if (parent && parent.userId !== userId) {
        this.notificationService.create({
          userId: parent.userId,
          type: 'comment_reply',
          title: `${comment.user.username} 回复了你的评论`,
          content: content.slice(0, 200),
          link: `/project/${projectId}`,
        }).catch(err => this.logger.warn(`通知发送失败: ${err.message}`));
      }
    }

    return comment;
  }

  async findByProject(projectId: string, params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = params;

    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { projectId, parentId: null },
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
          replies: {
            include: {
              user: { select: { id: true, username: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.comment.count({ where: { projectId, parentId: null } }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async delete(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.userId !== userId) throw new ForbiddenException('无权删除此评论');
    return this.prisma.comment.delete({ where: { id: commentId } });
  }
}
