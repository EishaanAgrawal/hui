import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { 
  getLogisticsJobs, 
  getVehicles, 
  getDrivers, 
  verifyDriver,
  assignLogisticsJob,
  verifyPickup,
  completeDelivery
} from '../controllers/logistics.controller';

const router = express.Router();

router.use(authenticate);

router.get('/jobs', getLogisticsJobs);
router.put('/jobs/:id/assign', assignLogisticsJob);
router.post('/jobs/:id/verify-pickup', verifyPickup);
router.post('/jobs/:id/complete-delivery', completeDelivery);

router.get('/vehicles', getVehicles);
router.get('/drivers', getDrivers);
router.put('/drivers/:id/verify', verifyDriver);

export default router;
