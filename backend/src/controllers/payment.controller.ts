import { Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { paymentService } from '../services/payment.service';

export const createPaymentOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { orderId, amount } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, 'Valid payment amount is required', 400);
    }

    const paymentOrder = await paymentService.createPaymentOrder({
      orderId: orderId || 'draft',
      amount,
      notes: {
        userId: req.user?.userId || 'anonymous',
      },
    });

    return sendSuccess(res, paymentOrder, 'Payment order generated');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to initiate payment', 500);
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const isValid = paymentService.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return sendError(res, 'Payment signature verification failed', 400, 'PAYMENT_VERIFICATION_FAILED');
    }

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'SUCCESS',
          payment: {
            upsert: {
              create: {
                transactionId: razorpay_payment_id,
                amount: 0,
                status: 'SUCCESS',
                provider: 'RAZORPAY',
              },
              update: {
                transactionId: razorpay_payment_id,
                status: 'SUCCESS',
              },
            },
          },
        },
      });
    }

    return sendSuccess(res, { verified: true, paymentId: razorpay_payment_id }, 'Payment verified successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Payment verification error', 500);
  }
};
