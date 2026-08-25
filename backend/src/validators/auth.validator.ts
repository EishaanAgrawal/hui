import { z } from 'zod';

export const registerConsumerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
  }),
});

export const registerFarmerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    farmName: z.string().min(2, 'Farm name is required'),
    location: z.string().min(2, 'Location is required'),
    description: z.string().optional(),
    farmSize: z.string().optional(),
    farmingType: z.string().optional(),
    experienceYears: z.coerce.number().optional().default(5),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});
