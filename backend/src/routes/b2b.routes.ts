import { Router } from 'express';
import { submitRfq, getMyRfqs, getFarmerRfqs, submitQuotation, acceptQuotation } from '../controllers/b2b.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Buyer submits an RFQ
router.post('/rfq', authenticate, submitRfq);

// Buyer views their submitted RFQs
router.get('/rfq/buyer', authenticate, getMyRfqs);

// Farmer views incoming RFQs
router.get('/rfq/farmer', authenticate, getFarmerRfqs);

// Farmer submits a Quotation
router.post('/rfq/:id/quotation', authenticate, submitQuotation);

// Buyer accepts a Quotation
router.post('/quotation/:id/accept', authenticate, acceptQuotation);

export default router;
