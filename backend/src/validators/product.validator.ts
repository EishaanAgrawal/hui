import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name is required'),
    categoryId: z.string().min(1, 'Category is required'),
    description: z.string().min(5, 'Description is required'),
    price: z.number().positive('Price must be greater than 0'),
    estimatedMarketPrice: z.number().positive().optional(),
    unit: z.enum(['KG', 'GRAM', 'LITRE', 'PIECE', 'DOZEN', 'QUINTAL']).default('KG'),
    availableQuantity: z.number().min(0, 'Available quantity cannot be negative'),
    minimumOrderQuantity: z.number().min(0.1, 'Minimum quantity must be at least 0.1').default(1),
    organic: z.boolean().default(false),
    harvestDate: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    categoryId: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    estimatedMarketPrice: z.number().positive().optional(),
    unit: z.enum(['KG', 'GRAM', 'LITRE', 'PIECE', 'DOZEN', 'QUINTAL']).optional(),
    availableQuantity: z.number().min(0).optional(),
    minimumOrderQuantity: z.number().min(0.1).optional(),
    organic: z.boolean().optional(),
    harvestDate: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
