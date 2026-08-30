import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getReadyOrders, createDeliveryBatch, suggestClusters, getLogisticsInsights } from '../controllers/logistics.controller';

const router = Router();

// Get orders ready for delivery for the logged-in farmer
router.get('/ready', authenticate, getReadyOrders);

// AI suggestion for clustering
router.post('/clusters/suggest', authenticate, suggestClusters);

// Create a delivery batch (assign orders to a vehicle/cluster)
router.post('/batches', authenticate, createDeliveryBatch);

// Get dynamic logistics insights
router.get('/insights', authenticate, getLogisticsInsights);

export default router;
