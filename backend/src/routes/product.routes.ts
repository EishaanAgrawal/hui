import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createProductSchema,
  updateProductSchema,
} from '../validators/product.validator';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post(
  '/',
  authenticate,
  authorize(['FARMER', 'ADMIN']),
  validate(createProductSchema),
  createProduct
);
router.put(
  '/:id',
  authenticate,
  authorize(['FARMER', 'ADMIN']),
  validate(updateProductSchema),
  updateProduct
);
router.delete(
  '/:id',
  authenticate,
  authorize(['FARMER', 'ADMIN']),
  deleteProduct
);

export default router;
