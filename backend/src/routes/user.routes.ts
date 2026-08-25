import { Router } from 'express';
import {
  getAddresses,
  addAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.delete('/addresses/:id', deleteAddress);

router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle', toggleWishlist);

export default router;
