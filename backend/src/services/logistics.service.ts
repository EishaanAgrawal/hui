import { prisma } from '../config/database';
import { notificationService } from './notification.service';

export const logisticsService = {
  /**
   * Creates a logistics job for a newly confirmed order.
   * This runs asynchronously without blocking the checkout process.
   */
  triggerLogisticsForOrder: async (orderId: string) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          customer: true,
        },
      });

      if (!order) {
        console.error(`[Logistics] Order ${orderId} not found.`);
        return;
      }

      // Check if job already exists
      const existingJob = await prisma.logisticsJob.findUnique({
        where: { orderId: order.id },
      });

      if (existingJob) {
        console.warn(`[Logistics] Job already exists for order ${orderId}`);
        return;
      }

      // For simplicity in Phase 1, we assume single farmer pickup per order 
      // (or we take the first item's farmer location as the primary pickup)
      // In a real multi-farmer scenario, the items might need separate pickup stops on a route.
      const primaryFarmerId = order.items[0]?.farmerId;
      let pickupLocation = 'Farm Location';
      
      if (primaryFarmerId) {
        const farmer = await prisma.farmerProfile.findUnique({ where: { id: primaryFarmerId } });
        if (farmer) {
          pickupLocation = farmer.location;
        }
      }

      // Parse delivery address snapshot
      let deliveryAddress = 'Customer Address';
      try {
        const addr = JSON.parse(order.deliveryAddressSnapshot);
        deliveryAddress = `${addr.addressLine1}, ${addr.city}, ${addr.state}`;
      } catch (e) {}

      // Create the job
      const job = await prisma.logisticsJob.create({
        data: {
          orderId: order.id,
          status: 'AWAITING_LOGISTICS',
          pickupLocation,
          deliveryLocation: deliveryAddress,
        },
      });

      console.log(`[Logistics] Job ${job.id} created for order ${order.orderNumber}`);

    } catch (error) {
      console.error('[Logistics Error] Failed to create logistics job:', error);
    }
  },

  /**
   * Evaluates available vehicles and drivers for a job.
   */
  assignVehicle: async (jobId: string, vehicleId: string, driverId: string) => {
    try {
      const job = await prisma.logisticsJob.update({
        where: { id: jobId },
        data: {
          vehicleId,
          driverId,
          status: 'PICKUP_SCHEDULED',
        },
      });

      // Notify Driver
      if (driverId) {
        const driver = await prisma.driver.findUnique({ where: { id: driverId } });
        if (driver) {
          await notificationService.notify({
            userId: driver.userId,
            title: 'New Pickup Assigned',
            message: `You have been assigned to order pickup in ${job.pickupLocation}`,
            type: 'SYSTEM',
            link: '/driver/dashboard',
          });
        }
      }

      return job;
    } catch (error) {
      console.error('[Logistics Error] Failed to assign vehicle:', error);
      throw error;
    }
  }
};
