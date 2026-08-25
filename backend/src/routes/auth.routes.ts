import { Router } from 'express';
import { registerConsumer, registerFarmer, login, getMe } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  registerConsumerSchema,
  registerFarmerSchema,
  loginSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerConsumerSchema), registerConsumer);
router.post('/register/customer', validate(registerConsumerSchema), registerConsumer);
router.post('/register/farmer', validate(registerFarmerSchema), registerFarmer);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);

export default router;
