import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../validators/order.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrderSchema), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
