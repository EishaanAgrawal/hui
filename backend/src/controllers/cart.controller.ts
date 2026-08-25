import { Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  DEFAULT_DELIVERY_FEE,
  DEFAULT_PLATFORM_FEE_PERCENT,
  FREE_DELIVERY_THRESHOLD,
} from '../config/constants';

export const getCart = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                farmer: true,
                category: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  farmer: true,
                  category: true,
                },
              },
            },
          },
        },
      });
    }

    // Group items by farmer for clarity and multi-farmer transparency
    const farmersMap: Record<string, any> = {};
    let subtotal = 0;

    const validatedItems = cart.items.map((item) => {
      const isAvailable = item.product.isActive && item.product.availableQuantity >= item.quantity;
      const itemSubtotal = item.quantity * item.product.price;
      subtotal += itemSubtotal;

      const farmerId = item.product.farmerId;
      if (!farmersMap[farmerId]) {
        farmersMap[farmerId] = {
          farmerId,
          farmName: item.product.farmer.farmName,
          location: item.product.farmer.location,
          items: [],
          subtotal: 0,
        };
      }

      farmersMap[farmerId].items.push({
        ...item,
        isAvailable,
        itemSubtotal,
      });
      farmersMap[farmerId].subtotal += itemSubtotal;

      return {
        ...item,
        isAvailable,
        itemSubtotal,
      };
    });

    const platformFee = Math.round((subtotal * DEFAULT_PLATFORM_FEE_PERCENT) / 100);
    const deliveryFee = subtotal > 0 ? (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE) : 0;
    const total = subtotal + platformFee + deliveryFee;

    return sendSuccess(res, {
      cartId: cart.id,
      items: validatedItems,
      groupedByFarmer: Object.values(farmersMap),
      itemCount: cart.items.reduce((acc, curr) => acc + curr.quantity, 0),
      subtotal,
      platformFee,
      deliveryFee,
      total,
      freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to get cart', 500);
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { productId, quantity } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return sendError(res, 'Product is no longer available', 404, 'PRODUCT_UNAVAILABLE');
    }

    if (product.availableQuantity < quantity) {
      return sendError(
        res,
        `Only ${product.availableQuantity} ${product.unit} available in stock`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.userId },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.availableQuantity < newQuantity) {
        return sendError(
          res,
          `Cannot add more. Total in cart would exceed stock (${product.availableQuantity} ${product.unit})`,
          400,
          'INSUFFICIENT_STOCK'
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          priceAtAddition: product.price,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          priceAtAddition: product.price,
        },
      });
    }

    return getCart(req, res);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to add item to cart', 500);
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true, cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== req.user.userId) {
      return sendError(res, 'Cart item not found', 404);
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id } });
      return getCart(req, res);
    }

    if (cartItem.product.availableQuantity < quantity) {
      return sendError(
        res,
        `Only ${cartItem.product.availableQuantity} ${cartItem.product.unit} available in stock`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return getCart(req, res);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update cart item', 500);
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== req.user.userId) {
      return sendError(res, 'Cart item not found', 404);
    }

    await prisma.cartItem.delete({ where: { id } });
    return getCart(req, res);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to remove cart item', 500);
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return sendSuccess(res, { message: 'Cart cleared' });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to clear cart', 500);
  }
};
