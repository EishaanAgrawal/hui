import { Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAddresses = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const addresses = await prisma.address.findMany({
      where: { userId: req.user.userId },
      orderBy: { isDefault: 'desc' },
    });

    return sendSuccess(res, addresses);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch addresses', 500);
  }
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { 
      name, phone, addressLine1, addressLine2, flatHouse, 
      buildingApartment, localityArea, landmark, city, state, 
      postalCode, isDefault 
    } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.userId },
        data: { isDefault: false },
      });
    }

    // Mock Geocoding
    const baseLat = 19.0760; // Mumbai base
    const baseLng = 72.8777;
    const latitude = baseLat + (Math.random() - 0.5) * 0.2;
    const longitude = baseLng + (Math.random() - 0.5) * 0.2;
    const formattedAddress = `${flatHouse ? flatHouse + ', ' : ''}${addressLine1}, ${localityArea || city}, ${state} - ${postalCode}`;

    const address = await prisma.address.create({
      data: {
        userId: req.user.userId,
        name,
        phone,
        addressLine1,
        addressLine2,
        flatHouse,
        buildingApartment,
        localityArea,
        landmark,
        city,
        state,
        postalCode,
        latitude,
        longitude,
        formattedAddress,
        geocodingStatus: 'VERIFIED',
        isDefault: Boolean(isDefault),
      },
    });

    return sendSuccess(res, address, 'Address added successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to add address', 500);
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== req.user.userId) {
      return sendError(res, 'Address not found', 404);
    }

    await prisma.address.delete({ where: { id } });
    return sendSuccess(res, { id }, 'Address deleted');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete address', 500);
  }
};

export const getWishlist = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.userId },
      include: {
        product: {
          include: { farmer: true, category: true },
        },
      },
    });

    return sendSuccess(res, wishlist.map((w) => w.product));
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch wishlist', 500);
  }
};

export const toggleWishlist = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { productId } = req.body;

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.user.userId,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return sendSuccess(res, { inWishlist: false }, 'Removed from wishlist');
    } else {
      await prisma.wishlist.create({
        data: {
          userId: req.user.userId,
          productId,
        },
      });
      return sendSuccess(res, { inWishlist: true }, 'Added to wishlist');
    }
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to toggle wishlist', 500);
  }
};
