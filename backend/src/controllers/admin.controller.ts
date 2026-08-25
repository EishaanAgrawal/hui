import { Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';

export const getAdminDashboardStats = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized', 403);
    }

    const [
      totalUsers,
      totalFarmers,
      totalConsumers,
      totalProducts,
      orders,
      pendingVerifications,
      categories,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.farmerProfile.count(),
      prisma.user.count({ where: { role: 'CONSUMER' } }),
      prisma.product.count(),
      prisma.order.findMany({
        include: {
          items: true,
          customer: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.farmerProfile.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.category.findMany({
        include: {
          _count: { select: { products: true } },
        },
      }),
    ]);

    const totalGMV = orders.reduce((acc, curr) => acc + curr.total, 0);
    const totalPlatformRevenue = orders.reduce((acc, curr) => acc + curr.platformFee, 0);
    const totalFarmerEarnings = totalGMV - totalPlatformRevenue;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today);
    const todayGMV = todayOrders.reduce((acc, curr) => acc + curr.total, 0);

    // Sales over last 7 days chart
    const salesTimeline: { date: string; gmv: number; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayOrders = orders.filter((o) => {
        const oDate = new Date(o.createdAt);
        return oDate >= dayStart && oDate <= dayEnd;
      });

      salesTimeline.push({
        date: dayStr,
        gmv: dayOrders.reduce((acc, curr) => acc + curr.total, 0),
        revenue: dayOrders.reduce((acc, curr) => acc + curr.platformFee, 0),
        orders: dayOrders.length,
      });
    }

    const categoryDistribution = categories.map((c) => ({
      name: c.name,
      count: c._count.products,
    }));

    return sendSuccess(res, {
      summary: {
        totalGMV,
        totalPlatformRevenue,
        totalFarmerEarnings,
        totalOrders: orders.length,
        todayGMV,
        todayOrdersCount: todayOrders.length,
        totalUsers,
        totalFarmers,
        totalConsumers,
        totalProducts,
        pendingVerifications,
      },
      salesTimeline,
      categoryDistribution,
      recentOrders: orders.slice(0, 8),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch admin stats', 500);
  }
};

export const getAdminFarmers = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') return sendError(res, 'Unauthorized', 403);
    const { status } = req.query;

    const where: any = {};
    if (status) {
      where.verificationStatus = status as string;
    }

    const farmers = await prisma.farmerProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
        _count: { select: { products: true, payouts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, farmers);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch farmers list', 500);
  }
};

export const updateFarmerVerificationStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') return sendError(res, 'Unauthorized', 403);
    const { id } = req.params;
    const { status } = req.body;

    const farmer = await prisma.farmerProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!farmer) return sendError(res, 'Farmer profile not found', 404);

    const updated = await prisma.farmerProfile.update({
      where: { id },
      data: { verificationStatus: status },
      include: { user: true },
    });

    await notificationService.notify({
      userId: farmer.userId,
      title: `Farm Verification Status: ${status}`,
      message: `Your farm verification status has been updated to "${status}".`,
      type: 'ACCOUNT',
      link: '/farmer/dashboard',
    });

    return sendSuccess(res, updated, `Farmer status updated to ${status}`);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update farmer status', 500);
  }
};

export const getAdminUsers = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') return sendError(res, 'Unauthorized', 403);
    const { role, search } = req.query;

    const where: any = {};
    if (role) {
      where.role = role as string;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        farmerProfile: {
          select: { id: true, farmName: true, verificationStatus: true },
        },
        _count: {
          select: { orders: true, reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, users);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch users', 500);
  }
};

export const toggleUserActiveStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') return sendError(res, 'Unauthorized', 403);
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError(res, 'User not found', 404);

    if (user.role === 'ADMIN') {
      return sendError(res, 'Cannot toggle super admin status', 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return sendSuccess(res, updated, `User account ${updated.isActive ? 'activated' : 'deactivated'}`);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update user', 500);
  }
};
