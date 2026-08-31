import { Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { logisticsService } from '../services/logistics.service';

export const getLogisticsJobs = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Only admins or specific roles should access this ideally, but for now we check auth
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    let whereClause = {};

    if (req.user.role === 'DRIVER') {
      const driver = await prisma.driver.findUnique({ where: { userId: req.user.userId } });
      if (!driver) return sendError(res, 'Driver profile not found', 404);
      whereClause = { driverId: driver.id };
    }

    const jobs = await prisma.logisticsJob.findMany({
      where: whereClause,
      include: {
        order: {
          include: { items: { include: { product: true } }, customer: true }
        },
        vehicle: true,
        driver: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, jobs);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch logistics jobs', 500);
  }
};

export const getVehicles = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    
    const vehicles = await prisma.vehicle.findMany({
      include: {
        drivers: { include: { user: true } }
      }
    });
    
    return sendSuccess(res, vehicles);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const getDrivers = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        vehicle: true
      }
    });
    return sendSuccess(res, drivers);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const verifyDriver = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const driver = await prisma.driver.update({
      where: { id },
      data: { isVerified: true },
      include: {
        user: { select: { name: true, email: true, phone: true } }
      }
    });
    return sendSuccess(res, driver, 'Driver verified successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const assignLogisticsJob = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;
    const { vehicleId, driverId } = req.body;

    if (!vehicleId || !driverId) {
      return sendError(res, 'Vehicle and Driver IDs are required.', 400);
    }

    const job = await logisticsService.assignVehicle(id, vehicleId, driverId);
    
    return sendSuccess(res, job, 'Logistics Job assigned successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const verifyPickup = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;
    const { quantity } = req.body;
    
    // Ideally verify driver, for now just update
    const job = await prisma.logisticsJob.update({
      where: { id },
      data: { status: 'IN_TRANSIT' }
    });

    await prisma.order.update({
      where: { id: job.orderId },
      data: { orderStatus: 'IN_TRANSIT' }
    });

    return sendSuccess(res, job, 'Pickup verified successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const completeDelivery = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;
    const { otp } = req.body;

    // In a real app we check the OTP against a stored value in the order
    if (otp !== '1234' && otp !== '0000') {
      return sendError(res, 'Invalid OTP. Delivery confirmation failed.', 400);
    }
    
    const job = await prisma.logisticsJob.update({
      where: { id },
      data: { status: 'DELIVERED', actualDeliveryTime: new Date() }
    });

    await prisma.order.update({
      where: { id: job.orderId },
      data: { orderStatus: 'DELIVERED' }
    });

    return sendSuccess(res, job, 'Delivery completed successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
