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
      let activePrice = item.product.price;
      
      // Auto-upgrade to BULK_DEAL for display if it qualifies based on current product rules
      let displayPurchaseType = item.purchaseType;
      if (item.product.bulkPricingEnabled && item.product.bulkMinimumQuantity) {
        if (item.quantity >= item.product.bulkMinimumQuantity) {
          displayPurchaseType = 'BULK_DEAL';
        } else {
          displayPurchaseType = 'FRESH_MARKET';
        }
      }
      
      // Auto-apply bulk price if it's a bulk deal
      if (displayPurchaseType === 'BULK_DEAL' && item.product.bulkPricingEnabled && item.product.bulkPrice) {
        activePrice = item.product.bulkPrice;
      }

      const trueAvailable = item.product.availableQuantity - item.product.reservedQuantity;

      const isAvailable = item.product.isActive && trueAvailable >= item.quantity;
      const itemSubtotal = item.quantity * activePrice;
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
        purchaseType: displayPurchaseType,
        priceAtAddition: activePrice,
        isAvailable,
        itemSubtotal,
      });
      farmersMap[farmerId].subtotal += itemSubtotal;

      return {
        ...item,
        purchaseType: displayPurchaseType,
        priceAtAddition: activePrice,
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
    const { productId, quantity, purchaseType = 'FRESH_MARKET' } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return sendError(res, 'Product is no longer available', 404, 'PRODUCT_UNAVAILABLE');
    }

    const trueAvailable = product.availableQuantity - product.reservedQuantity;

    if (trueAvailable < quantity) {
      return sendError(
        res,
        `Only ${trueAvailable} ${product.unit} available in stock`,
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
        purchaseType,
      },
    });

    let activePrice = product.price;
    if (purchaseType === 'BULK_DEAL') {
      if (!product.bulkPricingEnabled) {
        return sendError(res, 'Bulk Deals are not available for this product', 400);
      }
      if (product.bulkPrice) {
        activePrice = product.bulkPrice;
      }
    } else if (purchaseType === 'FRESH_MARKET') {
      if (!product.freshMarketEnabled) {
        return sendError(res, 'Fresh Market is not available for this product', 400);
      }
    }

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      if (purchaseType === 'BULK_DEAL' && newQuantity < (product.bulkMinimumQuantity || 0)) {
         return sendError(res, `Bulk Deals are available from ${product.bulkMinimumQuantity} ${product.unit}. Add more to qualify.`, 400);
      }
      if (purchaseType === 'FRESH_MARKET' && newQuantity < (product.minimumOrderQuantity || 1)) {
         return sendError(res, `Fresh Market requires minimum ${product.minimumOrderQuantity} ${product.unit}.`, 400);
      }
      if (trueAvailable < newQuantity) {
        return sendError(
          res,
          `Cannot add more. Total in cart would exceed stock (${trueAvailable} ${product.unit})`,
          400,
          'INSUFFICIENT_STOCK'
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          priceAtAddition: activePrice,
        },
      });
    } else {
      if (purchaseType === 'BULK_DEAL' && quantity < (product.bulkMinimumQuantity || 0)) {
         return sendError(res, `Bulk Deals are available from ${product.bulkMinimumQuantity} ${product.unit}. Add more to qualify.`, 400);
      }
      if (purchaseType === 'FRESH_MARKET' && quantity < (product.minimumOrderQuantity || 1)) {
         return sendError(res, `Fresh Market requires minimum ${product.minimumOrderQuantity} ${product.unit}.`, 400);
      }

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          priceAtAddition: activePrice,
          purchaseType,
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

    const trueAvailable = cartItem.product.availableQuantity - cartItem.product.reservedQuantity;

    if (trueAvailable < quantity) {
      return sendError(
        res,
        `Only ${trueAvailable} ${cartItem.product.unit} available in stock`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    // Auto-convert purchase type based on quantity if bulk pricing is enabled
    let updatedPurchaseType = cartItem.purchaseType;
    if (cartItem.product.bulkPricingEnabled && cartItem.product.bulkMinimumQuantity) {
      if (quantity >= cartItem.product.bulkMinimumQuantity) {
        updatedPurchaseType = 'BULK_DEAL';
      } else {
        updatedPurchaseType = 'FRESH_MARKET';
      }
    }

    if (updatedPurchaseType === 'FRESH_MARKET' && quantity < (cartItem.product.minimumOrderQuantity || 1)) {
      return sendError(res, `Fresh Market requires minimum ${cartItem.product.minimumOrderQuantity} ${cartItem.product.unit}.`, 400);
    }

    let activePrice = cartItem.product.price;
    if (updatedPurchaseType === 'BULK_DEAL' && cartItem.product.bulkPricingEnabled && cartItem.product.bulkPrice) {
      activePrice = cartItem.product.bulkPrice;
    }

    await prisma.cartItem.update({
      where: { id },
      data: { 
        quantity, 
        priceAtAddition: activePrice,
        purchaseType: updatedPurchaseType
      },
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
