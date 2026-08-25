import { z } from 'zod';

export const updateFarmerProfileSchema = z.object({
  body: z.object({
    farmName: z.string().min(2).optional(),
    description: z.string().optional(),
    farmSize: z.string().optional(),
    farmingType: z.string().optional(),
    experienceYears: z.number().optional(),
    location: z.string().min(2).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const updateFarmerStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED']),
  }),
});
