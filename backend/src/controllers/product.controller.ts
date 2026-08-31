import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProducts = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      organic,
      farmerId,
      location,
      market,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isActive: true,
      AND: []
    };

    if (category) {
      where.category = {
        slug: category as string,
      };
    }

    if (farmerId) {
      where.farmerId = farmerId as string;
    }

    if (organic !== undefined && organic !== '') {
      where.organic = organic === 'true';
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (location) {
      where.farmer = {
        location: {
          contains: location as string,
        },
      };
    }

    if (search) {
      const searchStr = (search as string).trim();
      where.AND.push({
        OR: [
          { name: { contains: searchStr } },
          { description: { contains: searchStr } },
          { farmer: { farmName: { contains: searchStr } } },
          { category: { name: { contains: searchStr } } },
        ]
      });
    }

    if (market === 'bulk') {
      where.bulkPricingEnabled = true;
    } else if (market === 'fresh') {
      where.freshMarketEnabled = true;
    } else {
      where.AND.push({
        OR: [{ freshMarketEnabled: true }, { bulkPricingEnabled: true }]
      });
    }

    if (where.AND.length === 0) {
      delete where.AND;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: true,
          farmer: {
            include: {
              user: {
                select: { name: true, avatar: true },
              },
            },
          },
          reviews: {
            select: { rating: true },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
    ]);

    // Calculate average rating for each product
    const formattedProducts = products.map((p) => {
      const totalReviews = p.reviews.length;
      const avgRating =
        totalReviews > 0
          ? Number(
              (
                p.reviews.reduce((acc, curr) => acc + curr.rating, 0) /
                totalReviews
              ).toFixed(1)
            )
          : 5.0; // default initial score for fresh items

      const estimatedMarketPrice = p.estimatedMarketPrice || Math.round(p.price * 1.45);
      const farmerDirectPercentage = Math.round((p.price / estimatedMarketPrice) * 100);

      return {
        ...p,
        reviewsCount: totalReviews,
        avgRating,
        estimatedMarketPrice,
        farmerDirectPercentage,
      };
    });

    return sendSuccess(res, {
      products: formattedProducts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch products', 500);
  }
};

export const getProductById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        farmer: {
          include: {
            user: {
              select: { name: true, avatar: true, email: true, phone: true },
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: { name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return sendError(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    const totalReviews = product.reviews.length;
    const avgRating =
      totalReviews > 0
        ? Number(
            (
              product.reviews.reduce((acc, curr) => acc + curr.rating, 0) /
              totalReviews
            ).toFixed(1)
          )
        : 5.0;

    const estimatedMarketPrice =
      product.estimatedMarketPrice || Math.round(product.price * 1.45);
    const traditionalMiddlemanCost = Math.round(estimatedMarketPrice - product.price);
    const farmerSharePercentage = Math.round((product.price / estimatedMarketPrice) * 100);

    // Fetch related products in same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      include: {
        farmer: true,
        category: true,
      },
      take: 4,
    });

    return sendSuccess(res, {
      ...product,
      avgRating,
      totalReviews,
      estimatedMarketPrice,
      traditionalMiddlemanCost,
      farmerSharePercentage,
      relatedProducts,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to get product', 500);
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'FARMER') {
      return sendError(res, 'Only verified farmers can create products', 403, 'FORBIDDEN');
    }

    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!farmerProfile) {
      return sendError(res, 'Farmer profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    if (farmerProfile.verificationStatus === 'SUSPENDED' || farmerProfile.verificationStatus === 'REJECTED') {
      return sendError(res, `Cannot publish products. Your farm status is ${farmerProfile.verificationStatus}.`, 403, 'FARMER_NOT_APPROVED');
    }

    const {
      name,
      categoryId,
      description,
      price,
      estimatedMarketPrice,
      unit,
      availableQuantity,
      minimumOrderQuantity,
      organic,
      harvestDate,
      image,
      freshMarketEnabled,
      bulkPricingEnabled,
      bulkMinimumQuantity,
      bulkPrice,
    } = req.body;

    const isBulkEnabled = Boolean(bulkPricingEnabled);
    const isFreshEnabled = freshMarketEnabled !== undefined ? Boolean(freshMarketEnabled) : true;
    const parsedPrice = parseFloat(price);
    const parsedBulkPrice = bulkPrice ? parseFloat(bulkPrice) : null;
    const parsedBulkMinQty = bulkMinimumQuantity ? parseFloat(bulkMinimumQuantity) : null;
    const parsedMinOrderQty = minimumOrderQuantity ? parseFloat(minimumOrderQuantity) : 1;

    if (isBulkEnabled && isFreshEnabled) {
      if (parsedBulkPrice !== null && parsedBulkPrice >= parsedPrice) {
        return sendError(res, 'Bulk price should normally be lower than the Fresh Market price to provide a meaningful bulk benefit.', 400);
      }
      if (parsedBulkMinQty !== null && parsedBulkMinQty <= parsedMinOrderQty) {
        return sendError(res, 'Minimum bulk quantity should be greater than Fresh Market minimum order quantity.', 400);
      }
    }

    if (isBulkEnabled) {
      if (!parsedBulkPrice || parsedBulkPrice <= 0) return sendError(res, 'Bulk price must be greater than 0', 400);
      if (!parsedBulkMinQty || parsedBulkMinQty <= 0) return sendError(res, 'Minimum bulk quantity must be greater than 0', 400);
    }

    if (isFreshEnabled) {
      if (!parsedPrice || parsedPrice <= 0) return sendError(res, 'Fresh Market price must be greater than 0', 400);
      if (!parsedMinOrderQty || parsedMinOrderQty <= 0) return sendError(res, 'Minimum fresh market quantity must be greater than 0', 400);
    }

    if (!isBulkEnabled && !isFreshEnabled) {
      return sendError(res, 'At least one marketplace (Fresh Market or Bulk Deals) must be enabled.', 400);
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const product = await prisma.product.create({
      data: {
        farmerId: farmerProfile.id,
        categoryId,
        name,
        slug,
        description,
        price: parseFloat(price),
        estimatedMarketPrice: estimatedMarketPrice ? parseFloat(estimatedMarketPrice) : Math.round(parseFloat(price) * 1.45),
        unit: unit || 'KG',
        availableQuantity: parseFloat(availableQuantity),
        minimumOrderQuantity: minimumOrderQuantity ? parseFloat(minimumOrderQuantity) : 1,
        organic: Boolean(organic),
        harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
        image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
        isActive: true,
        freshMarketEnabled: isFreshEnabled,
        bulkPricingEnabled: isBulkEnabled,
        bulkMinimumQuantity: isBulkEnabled ? parsedBulkMinQty : null,
        bulkPrice: isBulkEnabled ? parsedBulkPrice : null,
      },
      include: {
        category: true,
        farmer: true,
      },
    });

    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create product', 500);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { farmer: true },
    });

    if (!existing) {
      return sendError(res, 'Product not found', 404);
    }

    if (
      req.user?.role !== 'ADMIN' &&
      existing.farmer.userId !== req.user?.userId
    ) {
      return sendError(res, 'Unauthorized to modify this product', 403);
    }

    const {
      freshMarketEnabled,
      bulkPricingEnabled,
      bulkMinimumQuantity,
      bulkPrice,
      price,
      minimumOrderQuantity
    } = req.body;

    const isBulkEnabled = bulkPricingEnabled !== undefined ? Boolean(bulkPricingEnabled) : existing.bulkPricingEnabled;
    const isFreshEnabled = freshMarketEnabled !== undefined ? Boolean(freshMarketEnabled) : existing.freshMarketEnabled;
    const parsedPrice = price !== undefined ? parseFloat(price) : existing.price;
    const parsedBulkPrice = bulkPrice !== undefined ? (bulkPrice ? parseFloat(bulkPrice) : null) : existing.bulkPrice;
    const parsedBulkMinQty = bulkMinimumQuantity !== undefined ? (bulkMinimumQuantity ? parseFloat(bulkMinimumQuantity) : null) : existing.bulkMinimumQuantity;
    const parsedMinOrderQty = minimumOrderQuantity !== undefined ? parseFloat(minimumOrderQuantity) : existing.minimumOrderQuantity;

    if (isBulkEnabled && isFreshEnabled) {
      if (parsedBulkPrice !== null && parsedBulkPrice >= parsedPrice) {
        return sendError(res, 'Bulk price should normally be lower than the Fresh Market price to provide a meaningful bulk benefit.', 400);
      }
      if (parsedBulkMinQty !== null && parsedBulkMinQty <= parsedMinOrderQty) {
        return sendError(res, 'Minimum bulk quantity should be greater than Fresh Market minimum order quantity.', 400);
      }
    }
    
    if (isBulkEnabled) {
      if (!parsedBulkPrice || parsedBulkPrice <= 0) return sendError(res, 'Bulk price must be greater than 0', 400);
      if (!parsedBulkMinQty || parsedBulkMinQty <= 0) return sendError(res, 'Minimum bulk quantity must be greater than 0', 400);
    }

    if (isFreshEnabled) {
      if (!parsedPrice || parsedPrice <= 0) return sendError(res, 'Fresh Market price must be greater than 0', 400);
      if (!parsedMinOrderQty || parsedMinOrderQty <= 0) return sendError(res, 'Minimum fresh market quantity must be greater than 0', 400);
    }

    if (!isBulkEnabled && !isFreshEnabled) {
      return sendError(res, 'At least one marketplace (Fresh Market or Bulk Deals) must be enabled.', 400);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...req.body,
        price: parsedPrice,
        estimatedMarketPrice: req.body.estimatedMarketPrice !== undefined ? parseFloat(req.body.estimatedMarketPrice) : undefined,
        availableQuantity: req.body.availableQuantity !== undefined ? parseFloat(req.body.availableQuantity) : undefined,
        minimumOrderQuantity: parsedMinOrderQty,
        organic: req.body.organic !== undefined ? Boolean(req.body.organic) : undefined,
        harvestDate: req.body.harvestDate ? new Date(req.body.harvestDate) : undefined,
        freshMarketEnabled: isFreshEnabled,
        bulkPricingEnabled: isBulkEnabled,
        bulkMinimumQuantity: isBulkEnabled ? parsedBulkMinQty : null,
        bulkPrice: isBulkEnabled ? parsedBulkPrice : null,
      },
      include: {
        category: true,
        farmer: true,
      },
    });

    return sendSuccess(res, updated, 'Product updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update product', 500);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { farmer: true },
    });

    if (!existing) {
      return sendError(res, 'Product not found', 404);
    }

    if (
      req.user?.role !== 'ADMIN' &&
      existing.farmer.userId !== req.user?.userId
    ) {
      return sendError(res, 'Unauthorized to delete this product', 403);
    }

    await prisma.product.delete({ where: { id } });

    return sendSuccess(res, { id }, 'Product removed successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete product', 500);
  }
};
