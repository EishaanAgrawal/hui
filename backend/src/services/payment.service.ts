import crypto from 'crypto';
import { ENV } from '../config/env';

export interface CreatePaymentParams {
  orderId: string;
  amount: number; // in INR
  currency?: string;
  notes?: Record<string, string>;
}

export interface PaymentOrderResponse {
  id: string; // rzp order id
  amount: number; // in paise
  currency: string;
  keyId: string;
  notes?: Record<string, string>;
  isMock: boolean;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

class PaymentService {
  /**
   * Creates a payment order for Razorpay checkout.
   */
  async createPaymentOrder(params: CreatePaymentParams): Promise<PaymentOrderResponse> {
    const { orderId, amount, currency = 'INR', notes } = params;
    const amountInPaise = Math.round(amount * 100);
    const rzpOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return {
      id: rzpOrderId,
      amount: amountInPaise,
      currency,
      keyId: ENV.RAZORPAY_KEY_ID,
      notes: {
        orderId,
        ...notes,
      },
      isMock: true,
    };
  }

  /**
   * Verifies Razorpay payment signature
   */
  verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

    // For local development and test simulator
    if (razorpay_signature.startsWith('sim_sig_') || razorpay_signature === 'mock_valid_signature') {
      return true;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      return generatedSignature === razorpay_signature;
    } catch {
      return false;
    }
  }
}

export const paymentService = new PaymentService();
