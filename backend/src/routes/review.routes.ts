import { Router } from 'express';
import { createReview, getProductReviews } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createReviewSchema } from '../validators/review.validator';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', authenticate, validate(createReviewSchema), createReview);

export default router;
