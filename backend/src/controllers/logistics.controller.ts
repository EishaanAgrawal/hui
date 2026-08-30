import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getReadyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });

    // Fetch orders that contain items from this farmer and are READY_FOR_PICKUP or PREPARING
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: { farmerId: farmer.id }
        },
        orderStatus: { in: ['PREPARING', 'READY_FOR_PICKUP'] },
        batchId: null // Not yet batched
      },
      include: {
        customer: { select: { name: true, phone: true } },
        items: true
      }
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ready orders' });
  }
};

export const suggestClusters = async (req: Request, res: Response) => {
  try {
    const { orderIds } = req.body;
    
    // In a real AI implementation, we would pass these to a Python service or use DBSCAN.
    // For this demonstration, we'll mock a simple clustering based on string matching 
    // of the deliveryAddressSnapshot (e.g., matching cities or localities).
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } }
    });

    const clusters: Record<string, any[]> = {};
    
    orders.forEach(order => {
      let addressStr = '';
      try {
        const addr = JSON.parse(order.deliveryAddressSnapshot);
        addressStr = addr.city || addr.localityArea || 'Unknown';
      } catch (e) {
        addressStr = 'General';
      }
      
      const clusterName = `Cluster ${addressStr}`;
      if (!clusters[clusterName]) {
        clusters[clusterName] = [];
      }
      clusters[clusterName].push(order);
    });

    const result = Object.keys(clusters).map(key => ({
      name: key,
      orders: clusters[key],
      totalOrders: clusters[key].length
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to suggest clusters' });
  }
};

export const createDeliveryBatch = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { vehicleId, orderIds, clusterName, totalLoadKg } = req.body;

    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });

    const batch = await prisma.deliveryBatch.create({
      data: {
        farmerId: farmer.id,
        vehicleId,
        clusterName,
        totalLoadKg: Number(totalLoadKg || 0),
        status: 'CREATED',
        orders: {
          connect: orderIds.map((id: string) => ({ id }))
        }
      }
    });

    // Update order status
    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { orderStatus: 'DELIVERY_BATCH_CREATED' }
    });

    res.status(201).json(batch);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create batch' });
  }
};

export const getLogisticsInsights = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });

    const unbatchedOrdersCount = await prisma.order.count({
      where: {
        items: { some: { farmerId: farmer.id } },
        orderStatus: { in: ['PREPARING', 'READY_FOR_PICKUP'] },
        batchId: null
      }
    });

    const vehiclesCount = await prisma.vehicle.count({ where: { farmerId: farmer.id } });

    const insights = [];
    if (unbatchedOrdersCount > 0) {
      insights.push(`${unbatchedOrdersCount} orders are ready and waiting to be clustered into delivery batches.`);
    } else {
      insights.push(`All ready orders have been successfully batched.`);
    }

    if (vehiclesCount === 0) {
      insights.push(`Consider adding a Vehicle to calculate capacity limits when batching.`);
    } else {
      insights.push(`Combining geographically close orders into your ${vehiclesCount} vehicles reduces overall travel time.`);
    }

    res.json({ insights });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate insights' });
  }
};
