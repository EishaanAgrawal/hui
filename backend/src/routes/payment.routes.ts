import { Router } from 'express';
import { createPaymentOrder, verifyPayment } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/create', authenticate, createPaymentOrder);
router.post('/verify', authenticate, verifyPayment);

export default router;
