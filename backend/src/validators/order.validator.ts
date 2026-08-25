import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    addressId: z.string().optional(),
    customAddress: z
      .object({
        name: z.string().min(2),
        phone: z.string().min(10),
        addressLine1: z.string().min(3),
        addressLine2: z.string().optional(),
        city: z.string().min(2),
        state: z.string().min(2),
        postalCode: z.string().min(4),
      })
      .optional(),
    notes: z.string().optional(),
    paymentProvider: z.enum(['RAZORPAY', 'CASH_ON_DELIVERY', 'UPI']).default('RAZORPAY'),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'PENDING',
      'CONFIRMED',
      'ACCEPTED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'PICKED_UP',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'REJECTED',
    ]),
  }),
});
