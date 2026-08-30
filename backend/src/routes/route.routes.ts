import { Router } from 'express';
import { optimizeRoute, saveRoute, optimizeMultiFarmRoute } from '../controllers/route.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// Mode A: Farmer -> Multiple Customers
router.post('/optimize', authorize(['FARMER']), optimizeRoute);
router.post('/save', authorize(['FARMER']), saveRoute);

// Mode B: Multiple Farms -> One Customer
// Accessible by consumers or admins
router.post('/multi-farm', optimizeMultiFarmRoute);

export default router;
