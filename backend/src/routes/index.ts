import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import farmerRoutes from './farmer.routes';
import adminRoutes from './admin.routes';
import reviewRoutes from './review.routes';
import notificationRoutes from './notification.routes';
import userRoutes from './user.routes';

import forecastRoutes from './forecast.routes';
import routeRoutes from './route.routes';

import b2bRoutes from './b2b.routes';
import logisticsRoutes from './logistics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/farmers', farmerRoutes);
router.use('/admin', adminRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/user', userRoutes);
router.use('/forecast', forecastRoutes);
router.use('/routes', routeRoutes);
router.use('/b2b', b2bRoutes);
router.use('/logistics', logisticsRoutes);

export default router;
