import { Router } from 'express';
import { getForecastOverview } from '../controllers/forecast.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['FARMER']));

router.get('/farmer/overview', getForecastOverview);

export default router;
