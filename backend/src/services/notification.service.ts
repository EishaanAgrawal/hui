import { prisma } from '../config/database';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'ORDER' | 'PAYMENT' | 'ACCOUNT' | 'SYSTEM' | 'PAYOUT';
  link?: string;
}

class NotificationService {
  async notify(params: CreateNotificationParams) {
    try {
      return await prisma.notification.create({
        data: {
          userId: params.userId,
          title: params.title,
          message: params.message,
          type: params.type || 'ORDER',
          link: params.link,
        },
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  }

  async notifyAdmin(title: string, message: string, link?: string) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      for (const admin of admins) {
        await this.notify({
          userId: admin.id,
          title,
          message,
          type: 'SYSTEM',
          link,
        });
      }
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }
}

export const notificationService = new NotificationService();
