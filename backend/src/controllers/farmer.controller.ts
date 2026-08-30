import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { locationService } from '../services/location.service';

export const getFarmers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { search, location } = req.query;

    const where: any = {
      verificationStatus: 'VERIFIED',
    };

    if (search) {
      where.OR = [
        { farmName: { contains: search as string } },
        { location: { contains: search as string } },
        { user: { name: { contains: search as string } } },
      ];
    }

    if (location) {
      where.location = { contains: location as string };
    }

    const farmers = await prisma.farmerProfile.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true, avatar: true },
        },
        products: {
          where: { isActive: true },
          select: { id: true, name: true, price: true, unit: true, image: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = farmers.map((f) => {
      const totalReviews = f.reviews.length;
      const avgRating =
        totalReviews > 0
          ? Number(
              (
                f.reviews.reduce((acc, curr) => acc + curr.rating, 0) /
                totalReviews
              ).toFixed(1)
            )
          : 4.9;

      return {
        id: f.id,
        farmName: f.farmName,
        farmerName: f.user.name,
        email: f.user.email,
        avatar: f.user.avatar,
        location: f.location,
        description: f.description,
        farmSize: f.farmSize,
        farmingType: f.farmingType,
        experienceYears: f.experienceYears,
        productsCount: f.products.length,
        featuredProducts: f.products.slice(0, 3),
        avgRating,
        totalReviews,
      };
    });

    return sendSuccess(res, formatted);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch farmers', 500);
  }
};

export const getFarmerById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const farmer = await prisma.farmerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true, phone: true, avatar: true },
        },
        products: {
          where: { isActive: true },
          include: { category: true, reviews: { select: { rating: true } } },
        },
        reviews: {
          include: {
            user: { select: { name: true, avatar: true } },
            product: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!farmer) return sendError(res, 'Farmer profile not found', 404);

    const totalReviews = farmer.reviews.length;
    const avgRating =
      totalReviews > 0
        ? Number(
            (
              farmer.reviews.reduce((acc, curr) => acc + curr.rating, 0) /
              totalReviews
            ).toFixed(1)
          )
        : 4.9;

    return sendSuccess(res, {
      ...farmer,
      avgRating,
      totalReviews,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to get farmer profile', 500);
  }
};

export const updateFarmerProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'FARMER') {
      return sendError(res, 'Unauthorized', 403);
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!farmer) return sendError(res, 'Farmer profile not found', 404);

    let dataToUpdate = { ...req.body };
    
    const { addressLine1, addressLine2, villageLocality, city, district, state, pincode, location } = dataToUpdate;
    const hasLocationFields = addressLine1 || city || state || pincode || villageLocality || district;

    if (hasLocationFields) {
        // Automatically compile a legacy location string if missing
        const fullAddress = [villageLocality, city, state, pincode].filter(Boolean).join(', ');
        dataToUpdate.location = location || fullAddress;

        // Automatically resolve coordinates based on new structured fields
        const coords = await locationService.progressiveGeocode({
            addressLine1: addressLine1,
            addressLine2: addressLine2,
            city: city || district,
            state: state,
            postalCode: pincode
        });

        if (coords) {
            dataToUpdate.latitude = coords.lat;
            dataToUpdate.longitude = coords.lon;
            dataToUpdate.locationAccuracy = 'VERIFIED';
        } else {
            dataToUpdate.locationAccuracy = 'NEEDS_ATTENTION';
        }
    }

    const updated = await prisma.farmerProfile.update({
      where: { id: farmer.id },
      data: dataToUpdate,
    });

    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update farmer profile', 500);
  }
};

export const getFarmerDashboardStats = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'FARMER') {
      return sendError(res, 'Unauthorized', 403);
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!farmer) return sendError(res, 'Farmer profile not found', 404);

    // Fetch products
    const products = await prisma.product.findMany({
      where: { farmerId: farmer.id },
      include: {
        _count: { select: { orderItems: true } },
      },
    });

    // Fetch farmer payouts / earnings
    const payouts = await prisma.farmerPayout.findMany({
      where: { farmerId: farmer.id },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalGrossSales = payouts.reduce((acc, curr) => acc + curr.amount, 0);
    const totalPlatformFee = payouts.reduce((acc, curr) => acc + curr.platformFee, 0);
    const totalNetEarnings = payouts.reduce((acc, curr) => acc + curr.netAmount, 0);

    // Calculate today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = payouts
      .filter((p) => new Date(p.createdAt) >= today)
      .reduce((acc, curr) => acc + curr.netAmount, 0);

    // Orders containing this farmer's products
    const orderItems = await prisma.orderItem.findMany({
      where: { farmerId: farmer.id },
      include: {
        order: {
          include: {
            customer: { select: { name: true, phone: true } },
            delivery: true,
          },
        },
        product: true,
      },
      orderBy: { id: 'desc' },
      take: 10,
    });

    const pendingOrdersCount = orderItems.filter(
      (item) => item.order.orderStatus === 'CONFIRMED' || item.order.orderStatus === 'ACCEPTED'
    ).length;

    // Daily sales breakdown for chart (last 7 days)
    const last7Days: { date: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayPayouts = payouts.filter((p) => {
        const pDate = new Date(p.createdAt);
        return pDate >= dayStart && pDate <= dayEnd;
      });

      last7Days.push({
        date: dayStr,
        sales: dayPayouts.reduce((acc, curr) => acc + curr.netAmount, 0),
        orders: dayPayouts.length,
      });
    }

    // Top selling products
    const topProducts = products
      .sort((a, b) => b._count.orderItems - a._count.orderItems)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        unit: p.unit,
        availableQuantity: p.availableQuantity,
        totalSold: p._count.orderItems,
        image: p.image,
      }));

    // Reviews count & rating
    const reviews = await prisma.review.findMany({
      where: { farmerId: farmer.id },
    });
    const avgRating =
      reviews.length > 0
        ? Number(
            (
              reviews.reduce((acc, curr) => acc + curr.rating, 0) /
              reviews.length
            ).toFixed(1)
          )
        : 4.9;

    return sendSuccess(res, {
      farmer,
      stats: {
        todaySales,
        totalGrossSales,
        totalPlatformFee,
        totalNetEarnings,
        totalProducts: products.length,
        pendingOrdersCount,
        totalOrdersCount: payouts.length,
        avgRating,
        reviewsCount: reviews.length,
      },
      chartData: last7Days,
      topProducts,
      recentOrders: orderItems,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch farmer dashboard', 500);
  }
};

export const getFarmerEarnings = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'FARMER') {
      return sendError(res, 'Unauthorized', 403);
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!farmer) return sendError(res, 'Farmer profile not found', 404);

    const payouts = await prisma.farmerPayout.findMany({
      where: { farmerId: farmer.id },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            orderStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const grossAmount = payouts.reduce((acc, curr) => acc + curr.amount, 0);
    const platformFee = payouts.reduce((acc, curr) => acc + curr.platformFee, 0);
    const netAmount = payouts.reduce((acc, curr) => acc + curr.netAmount, 0);

    return sendSuccess(res, {
      summary: {
        grossAmount,
        platformFee,
        netAmount,
        payoutCount: payouts.length,
      },
      payouts,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch farmer earnings', 500);
  }
};

export const getFarmerProducts = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'FARMER') {
      return sendError(res, 'Unauthorized', 403);
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!farmer) return sendError(res, 'Farmer profile not found', 404);

    const products = await prisma.product.findMany({
      where: { farmerId: farmer.id },
      include: {
        category: true,
        farmer: true,
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, products);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch farmer products', 500);
  }
};

