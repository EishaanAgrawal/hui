import { Router } from 'express';
import {
  getFarmers,
  getFarmerById,
  updateFarmerProfile,
  getFarmerDashboardStats,
  getFarmerEarnings,
  getFarmerProducts,
} from '../controllers/farmer.controller';

import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateFarmerProfileSchema } from '../validators/farmer.validator';

const router = Router();

router.get('/', getFarmers);

// Authenticated Farmer endpoints
router.get('/products', authenticate, authorize(['FARMER']), getFarmerProducts);
router.get('/dashboard/stats', authenticate, authorize(['FARMER']), getFarmerDashboardStats);
router.get('/dashboard/earnings', authenticate, authorize(['FARMER']), getFarmerEarnings);
router.put('/profile', authenticate, authorize(['FARMER']), validate(updateFarmerProfileSchema), updateFarmerProfile);

// Public parametric profile lookup
router.get('/:id', getFarmerById);

export default router;

