import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().positive('Quantity must be greater than 0'),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().positive('Quantity must be greater than 0'),
  }),
});
