import { Router } from 'express';
import {
  getAdminDashboardStats,
  getAdminFarmers,
  updateFarmerVerificationStatus,
  getAdminUsers,
  toggleUserActiveStatus,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateFarmerStatusSchema } from '../validators/farmer.validator';

const router = Router();

router.use(authenticate, authorize(['ADMIN']));

router.get('/dashboard', getAdminDashboardStats);
router.get('/farmers', getAdminFarmers);
router.put('/farmers/:id/status', validate(updateFarmerStatusSchema), updateFarmerVerificationStatus);
router.get('/users', getAdminUsers);
router.put('/users/:id/toggle-status', toggleUserActiveStatus);

export default router;
