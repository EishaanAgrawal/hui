import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitRfq = async (req: Request, res: Response) => {
  try {
    const { productId, requiredQuantity, deliveryAddress, preferredDate, notes } = req.body;
    const buyerId = (req as any).user.id;

    // Fetch product to get farmerId
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const rfq = await prisma.rfq.create({
      data: {
        buyerId,
        productId,
        farmerId: product.farmerId,
        requiredQuantity: Number(requiredQuantity),
        deliveryAddress,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        notes,
      },
      include: {
        product: true,
        farmer: true,
      }
    });

    res.status(201).json(rfq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit RFQ' });
  }
};

export const getMyRfqs = async (req: Request, res: Response) => {
  try {
    const buyerId = (req as any).user.id;
    const rfqs = await prisma.rfq.findMany({
      where: { buyerId },
      include: {
        product: true,
        farmer: true,
        quotation: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(rfqs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
};

export const getFarmerRfqs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) return res.status(404).json({ error: 'Farmer profile not found' });

    const rfqs = await prisma.rfq.findMany({
      where: { farmerId: farmer.id },
      include: {
        product: true,
        buyer: { select: { name: true, companyName: true, email: true } },
        quotation: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(rfqs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
};

export const submitQuotation = async (req: Request, res: Response) => {
  try {
    const rfqId = req.params.id;
    const { quotedPrice, availableQuantity, deliveryCost, validUntil, notes } = req.body;
    const userId = (req as any).user.id;
    
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) return res.status(404).json({ error: 'Farmer profile not found' });

    const rfq = await prisma.rfq.findUnique({ where: { id: rfqId } });
    if (!rfq || rfq.farmerId !== farmer.id) return res.status(403).json({ error: 'Unauthorized or RFQ not found' });

    const quotation = await prisma.quotation.create({
      data: {
        rfqId,
        quotedPrice: Number(quotedPrice),
        availableQuantity: Number(availableQuantity),
        deliveryCost: Number(deliveryCost || 0),
        validUntil: validUntil ? new Date(validUntil) : null,
        notes,
      }
    });

    await prisma.rfq.update({
      where: { id: rfqId },
      data: { status: 'QUOTED' }
    });

    res.status(201).json(quotation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit quotation' });
  }
};

export const acceptQuotation = async (req: Request, res: Response) => {
  try {
    const quotationId = req.params.id;
    const buyerId = (req as any).user.id;

    const quotation = await prisma.quotation.findUnique({ 
      where: { id: quotationId },
      include: { rfq: true } 
    });

    if (!quotation || quotation.rfq.buyerId !== buyerId) {
      return res.status(403).json({ error: 'Unauthorized or Quotation not found' });
    }

    // Mark as accepted
    await prisma.quotation.update({
      where: { id: quotationId },
      data: { status: 'ACCEPTED' }
    });
    await prisma.rfq.update({
      where: { id: quotation.rfqId },
      data: { status: 'ACCEPTED' }
    });

    // Create an Order based on this quotation
    const orderNumber = `B2B-${Date.now().toString().slice(-6)}`;
    const subtotal = quotation.quotedPrice * quotation.availableQuantity;
    const total = subtotal + quotation.deliveryCost;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: buyerId,
        subtotal,
        deliveryFee: quotation.deliveryCost,
        total,
        paymentStatus: 'PENDING',
        orderStatus: 'CONFIRMED',
        deliveryAddressSnapshot: quotation.rfq.deliveryAddress,
        notes: `Bulk B2B Order. RFQ ID: ${quotation.rfq.id}`,
        items: {
          create: [{
            productId: quotation.rfq.productId,
            farmerId: quotation.rfq.farmerId,
            productName: "Bulk B2B Product", // Ideally fetch actual name
            unitPrice: quotation.quotedPrice,
            quantity: quotation.availableQuantity,
            unit: 'KG', // Or product.unit
            subtotal: subtotal
          }]
        }
      }
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept quotation' });
  }
};
