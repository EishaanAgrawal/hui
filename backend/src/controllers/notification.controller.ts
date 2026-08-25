import { Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.userId, isRead: false },
    });

    return sendSuccess(res, { notifications, unreadCount });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch notifications', 500);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;

    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== req.user.userId) {
      return sendError(res, 'Notification not found', 404);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return sendSuccess(res, updated, 'Notification marked as read');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update notification', 500);
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    await prisma.notification.updateMany({
      where: { userId: req.user.userId, isRead: false },
      data: { isRead: true },
    });

    return sendSuccess(res, { success: true }, 'All notifications marked as read');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update notifications', 500);
  }
};
