import { Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  DEFAULT_DELIVERY_FEE,
  DEFAULT_PLATFORM_FEE_PERCENT,
  FREE_DELIVERY_THRESHOLD,
  ORDER_STATUS,
} from '../config/constants';
import { notificationService } from '../services/notification.service';

export const createOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { addressId, customAddress, notes, paymentProvider = 'RAZORPAY' } = req.body;

    // Fetch user cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
      include: {
        items: {
          include: {
            product: {
              include: { farmer: true },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return sendError(res, 'Your cart is empty', 400, 'CART_EMPTY');
    }

    // Resolve delivery address snapshot
    let deliveryAddressSnapshot: string;
    if (addressId) {
      const address = await prisma.address.findUnique({
        where: { id: addressId },
      });
      if (!address || address.userId !== req.user.userId) {
        return sendError(res, 'Selected delivery address not found', 404);
      }
      deliveryAddressSnapshot = JSON.stringify(address);
    } else if (customAddress) {
      deliveryAddressSnapshot = JSON.stringify(customAddress);
    } else {
      return sendError(res, 'A delivery address is required for checkout', 400, 'ADDRESS_REQUIRED');
    }

    // Use a transactional execution for stock validation and order placement
    const newOrder = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const farmerItemsMap: Record<string, { farmerId: string; amount: number }> = {};

      // 1. Verify stock availability and compute subtotal
      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new Error(`Product "${item.product.name}" is no longer available.`);
        }

        if (product.availableQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${product.availableQuantity} ${product.unit}, in cart: ${item.quantity}`
          );
        }

        const itemSubtotal = item.quantity * product.price;
        subtotal += itemSubtotal;

        // Group farmer sales
        if (!farmerItemsMap[product.farmerId]) {
          farmerItemsMap[product.farmerId] = {
            farmerId: product.farmerId,
            amount: 0,
          };
        }
        farmerItemsMap[product.farmerId].amount += itemSubtotal;

        // Deduct inventory
        await tx.product.update({
          where: { id: product.id },
          data: {
            availableQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      const platformFee = Math.round((subtotal * DEFAULT_PLATFORM_FEE_PERCENT) / 100);
      const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;
      const total = subtotal + platformFee + deliveryFee;

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `FD-${dateStr}-${randomSuffix}`;

      // 2. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: req.user!.userId,
          subtotal,
          deliveryFee,
          platformFee,
          total,
          paymentStatus: 'SUCCESS', // default success for test/live simulation
          orderStatus: 'CONFIRMED',
          deliveryAddressSnapshot,
          notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              farmerId: item.product.farmerId,
              productName: item.product.name,
              unitPrice: item.product.price,
              quantity: item.quantity,
              unit: item.product.unit,
              subtotal: item.quantity * item.product.price,
              status: 'CONFIRMED',
            })),
          },
          payment: {
            create: {
              provider: paymentProvider,
              transactionId: `tx_${Date.now()}_${randomSuffix}`,
              amount: total,
              currency: 'INR',
              status: 'SUCCESS',
            },
          },
          delivery: {
            create: {
              deliveryPartner: 'FarmDirect Express Logistics',
              trackingNumber: `FDTK${dateStr}${randomSuffix}`,
              status: 'ASSIGNED',
              estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000 * 2), // 2 days
            },
          },
        },
        include: {
          items: true,
          payment: true,
          delivery: true,
        },
      });

      // 3. Create Farmer Payout records
      for (const fId of Object.keys(farmerItemsMap)) {
        const farmerGross = farmerItemsMap[fId].amount;
        const farmerPlatformCut = Math.round((farmerGross * DEFAULT_PLATFORM_FEE_PERCENT) / 100);
        const farmerNet = farmerGross - farmerPlatformCut;

        await tx.farmerPayout.create({
          data: {
            farmerId: fId,
            orderId: order.id,
            amount: farmerGross,
            platformFee: farmerPlatformCut,
            netAmount: farmerNet,
            status: 'PAID',
          },
        });
      }

      // 4. Clear Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    // Send notifications
    await notificationService.notify({
      userId: req.user.userId,
      title: 'Order Confirmed!',
      message: `Your order #${newOrder.orderNumber} for ₹${newOrder.total} has been confirmed.`,
      type: 'ORDER',
      link: `/orders/${newOrder.id}`,
    });

    // Notify farmers about the new order
    const farmerUserIds = await prisma.farmerProfile.findMany({
      where: {
        id: { in: newOrder.items.map((i) => i.farmerId) },
      },
      select: { userId: true, farmName: true },
    });

    for (const f of farmerUserIds) {
      await notificationService.notify({
        userId: f.userId,
        title: 'New Order Received! 🌾',
        message: `You received an order in #${newOrder.orderNumber}. Please prepare the produce.`,
        type: 'ORDER',
        link: `/farmer/orders/${newOrder.id}`,
      });
    }

    return sendSuccess(res, newOrder, 'Order placed successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create order', 400);
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { status, role } = req.query;

    const userRole = req.user.role;
    let where: any = {};

    if (userRole === 'CONSUMER') {
      where.customerId = req.user.userId;
    } else if (userRole === 'FARMER') {
      const farmerProfile = await prisma.farmerProfile.findUnique({
        where: { userId: req.user.userId },
      });
      if (!farmerProfile) return sendError(res, 'Farmer profile not found', 404);
      where.items = {
        some: { farmerId: farmerProfile.id },
      };
    } else if (userRole === 'ADMIN') {
      // Admin sees all
    }

    if (status) {
      where.orderStatus = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: { name: true, email: true, phone: true },
        },
        items: {
          include: {
            product: {
              select: { image: true, name: true, unit: true },
            },
            farmer: {
              select: { farmName: true, location: true },
            },
          },
        },
        payment: true,
        delivery: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, orders);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch orders', 500);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, image: true, unit: true, price: true },
            },
            farmer: {
              select: { id: true, farmName: true, location: true, userId: true },
            },
          },
        },
        payment: true,
        delivery: true,
        reviews: true,
      },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // Permission check
    const isCustomer = order.customerId === req.user.userId;
    const isAdmin = req.user.role === 'ADMIN';
    const isFarmerOfOrder =
      req.user.role === 'FARMER' &&
      order.items.some((item) => item.farmer.userId === req.user?.userId);

    if (!isCustomer && !isAdmin && !isFarmerOfOrder) {
      return sendError(res, 'Unauthorized to view this order', 403);
    }

    let parsedAddress = null;
    try {
      parsedAddress = JSON.parse(order.deliveryAddressSnapshot);
    } catch {
      parsedAddress = order.deliveryAddressSnapshot;
    }

    return sendSuccess(res, {
      ...order,
      deliveryAddress: parsedAddress,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to get order', 500);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { farmer: true },
        },
        delivery: true,
      },
    });

    if (!order) return sendError(res, 'Order not found', 404);

    const isAdmin = req.user.role === 'ADMIN';
    const isFarmer =
      req.user.role === 'FARMER' &&
      order.items.some((i) => i.farmer.userId === req.user?.userId);

    if (!isAdmin && !isFarmer) {
      return sendError(res, 'Unauthorized to update order status', 403);
    }

    // Map order status to delivery status if relevant
    let deliveryStatus = order.delivery?.status;
    if (status === 'IN_TRANSIT') deliveryStatus = 'IN_TRANSIT';
    if (status === 'OUT_FOR_DELIVERY') deliveryStatus = 'OUT_FOR_DELIVERY';
    if (status === 'DELIVERED') deliveryStatus = 'DELIVERED';

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: status,
        delivery: deliveryStatus
          ? {
              update: {
                status: deliveryStatus,
                deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
              },
            }
          : undefined,
      },
      include: {
        items: true,
        delivery: true,
        payment: true,
      },
    });

    // Notify customer
    await notificationService.notify({
      userId: order.customerId,
      title: `Order Status: ${status.replace(/_/g, ' ')}`,
      message: `Your order #${order.orderNumber} is now marked as ${status.replace(/_/g, ' ')}.`,
      type: 'ORDER',
      link: `/orders/${order.id}`,
    });

    return sendSuccess(res, updatedOrder, 'Order status updated');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update order status', 500);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return sendError(res, 'Order not found', 404);

    const isCustomer = order.customerId === req.user.userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isCustomer && !isAdmin) {
      return sendError(res, 'Unauthorized to cancel this order', 403);
    }

    if (
      order.orderStatus === 'DELIVERED' ||
      order.orderStatus === 'IN_TRANSIT' ||
      order.orderStatus === 'CANCELLED'
    ) {
      return sendError(
        res,
        `Cannot cancel order with current status: ${order.orderStatus}`,
        400
      );
    }

    // Transaction to mark cancelled and restore inventory
    const cancelled = await prisma.$transaction(async (tx) => {
      // Restore inventory
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            availableQuantity: {
              increment: item.quantity,
            },
          },
        });
      }

      return tx.order.update({
        where: { id },
        data: {
          orderStatus: 'CANCELLED',
          paymentStatus: 'REFUNDED',
          delivery: {
            update: {
              status: 'FAILED',
            },
          },
        },
        include: {
          items: true,
          payment: true,
          delivery: true,
        },
      });
    });

    await notificationService.notify({
      userId: order.customerId,
      title: 'Order Cancelled',
      message: `Your order #${order.orderNumber} has been cancelled and refunded.`,
      type: 'ORDER',
      link: `/orders/${order.id}`,
    });

    return sendSuccess(res, cancelled, 'Order successfully cancelled');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to cancel order', 500);
  }
};
