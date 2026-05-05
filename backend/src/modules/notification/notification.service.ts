import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId: string, page = 1, pageSize = 20) {
    const where = { userId };
    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { items, total, page, pageSize, unreadCount };
  }

  async markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(data: { userId: string; type: string; title: string; content?: string; link?: string }) {
    return this.prisma.notification.create({ data });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  // Subscription methods
  async getSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addSubscription(userId: string, type: string, value: string) {
    return this.prisma.subscription.upsert({
      where: { userId_type_value: { userId, type, value } },
      update: { enabled: true },
      create: { userId, type, value },
    });
  }

  async removeSubscription(userId: string, id: string) {
    return this.prisma.subscription.deleteMany({ where: { id, userId } });
  }

  async toggleSubscription(userId: string, id: string, enabled: boolean) {
    return this.prisma.subscription.updateMany({ where: { id, userId }, data: { enabled } });
  }

  // Find subscriptions matching a new project, then create notifications
  async notifyMatchingUsers(project: {
    id: string; fullName: string; primaryLanguage: string | null;
    description: string | null; stars: number;
    topics: string[]; categoryId?: string | null;
  }) {
    const subs = await this.prisma.subscription.findMany({
      where: { enabled: true },
    });

    const notifications: { userId: string; type: string; title: string; content: string; link: string }[] = [];
    const link = `/project/${project.id}`;

    for (const sub of subs) {
      let match = false;
      if (sub.type === 'language' && project.primaryLanguage &&
          project.primaryLanguage.toLowerCase() === sub.value.toLowerCase()) {
        match = true;
      } else if (sub.type === 'keyword' && project.fullName.toLowerCase().includes(sub.value.toLowerCase())) {
        match = true;
      } else if (sub.type === 'category' && project.categoryId === sub.value) {
        match = true;
      }

      if (match) {
        notifications.push({
          userId: sub.userId,
          type: 'new_project',
          title: `新项目匹配: ${project.fullName}`,
          content: `${project.fullName} — ⭐${project.stars} | ${project.description?.slice(0, 100) || ''}`,
          link,
        });
      }
    }

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({ data: notifications });
    }
  }

  async cleanupOldNotifications(daysOld = 90) {
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const result = await this.prisma.notification.deleteMany({
      where: { isRead: true, createdAt: { lt: cutoff } },
    });
    return result.count;
  }
}
