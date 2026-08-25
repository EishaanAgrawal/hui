import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';

export const createReview = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { productId, orderId, rating, comment } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { farmer: true },
    });

    if (!product) return sendError(res, 'Product not found', 404);

    // Verify user purchased this product if orderId is provided
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order || order.customerId !== req.user.userId) {
        return sendError(res, 'Order not found or unauthorized', 403);
      }

      const hasItem = order.items.some((i) => i.productId === productId);
      if (!hasItem) {
        return sendError(res, 'This product was not part of the specified order', 400);
      }

      // Check for duplicate review on this order
      const existing = await prisma.review.findFirst({
        where: {
          userId: req.user.userId,
          productId,
          orderId,
        },
      });

      if (existing) {
        return sendError(res, 'You have already reviewed this product for this order', 400);
      }
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.userId,
        productId,
        farmerId: product.farmerId,
        orderId,
        rating: parseInt(rating, 10),
        comment,
      },
      include: {
        user: { select: { name: true, avatar: true } },
        product: { select: { name: true } },
      },
    });

    // Notify farmer about new review
    await notificationService.notify({
      userId: product.farmer.userId,
      title: 'New Customer Review! ⭐',
      message: `${req.user.name || 'A customer'} left a ${rating}-star review for ${product.name}.`,
      type: 'ACCOUNT',
      link: `/farmer/reviews`,
    });

    return sendSuccess(res, review, 'Review submitted successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to submit review', 500);
  }
};

export const getProductReviews = async (req: Request, res: Response): Promise<any> => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, reviews);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch reviews', 500);
  }
};
