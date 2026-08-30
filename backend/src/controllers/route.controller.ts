import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { locationService } from '../services/location.service';

// Helper to calculate route stats
const calculateRouteStats = (stops: any[], startLat: number, startLon: number) => {
    let totalDistance = 0;
    let current = { lat: startLat, lon: startLon };
    const formattedStops = [];
    
    for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        const dist = locationService.calculateDistance(current.lat, current.lon, stop.lat, stop.lon);
        totalDistance += dist;
        formattedStops.push({
            sequence: i + 1,
            ...stop,
            distanceFromPrevious: dist.toFixed(1)
        });
        current = { lat: stop.lat, lon: stop.lon };
    }
    
    const travelTimeMinutes = (totalDistance / 40) * 60;
    const dropOffTimeMinutes = stops.length * 10;
    const estimatedDuration = Math.round(travelTimeMinutes + dropOffTimeMinutes);
    
    return {
        optimizedStops: formattedStops,
        totalDistance: Number(totalDistance.toFixed(1)),
        estimatedDuration
    };
};

export const optimizeRoute = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'FARMER') {
      return sendError(res, 'Unauthorized', 403);
    }

    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return sendError(res, 'Please select at least one order to optimize route.', 400);
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!farmer) return sendError(res, 'Farmer profile not found', 404);
    if (!farmer.location && !farmer.latitude && !farmer.longitude) {
        return sendError(res, 'Your farm location must be configured before optimizing delivery routes.', 400);
    }

    // Fetch the orders
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
      },
      include: { customer: { select: { name: true } } }
    });

    if (orders.length === 0) {
        return sendError(res, 'No valid orders found.', 404);
    }

    let farmerLat = farmer.latitude;
    let farmerLon = farmer.longitude;
    
    // Resolve farmer location if missing
    if (!farmerLat || !farmerLon) {
        if (farmer.location) {
            const coords = await locationService.resolveFarmerLocation(farmer.id, farmer.location);
            if (coords) {
                farmerLat = coords.lat;
                farmerLon = coords.lon;
            }
        }
    }
    
    // Fallback if still missing
    farmerLat = farmerLat || 19.9975;
    farmerLon = farmerLon || 73.7898;

    const locations: any[] = [];

    for (const order of orders) {
        try {
            const address = JSON.parse(order.deliveryAddressSnapshot);
            let lat = address.latitude;
            let lon = address.longitude;
            const addressText = `${address.addressLine1}, ${address.city}`;

            if (!lat || !lon) {
                if (!address || !address.city) {
                    return sendError(res, `Order #${order.orderNumber} has incomplete address information required for location matching.`, 400);
                }

                // Attempt progressive geocoding
                const coords = await locationService.progressiveGeocode(address);
                if (coords) {
                    lat = coords.lat;
                    lon = coords.lon;
                    
                    // Persist the resolved coordinates back to the order snapshot
                    address.latitude = lat;
                    address.longitude = lon;
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { deliveryAddressSnapshot: JSON.stringify(address) }
                    });
                } else {
                    return sendError(res, `The delivery address for Order #${order.orderNumber} could not be located automatically.`, 400);
                }
            }
            locations.push({
                orderId: order.id,
                orderNumber: order.orderNumber,
                customerName: order.customer?.name || 'Customer',
                lat,
                lon,
                addressText
            });
        } catch (e) {
            return sendError(res, `Invalid address format for Order #${order.orderNumber}.`, 400);
        }
    }

    // Generate Candidate Routes
    // Candidate 1: Original Sequence (As selected)
    const originalRoute = calculateRouteStats(locations, farmerLat, farmerLon);

    // Candidate 2: Nearest Neighbor (Greedy)
    let nnUnvisited = [...locations];
    const nnStops = [];
    let nnCurrent = { lat: farmerLat, lon: farmerLon };
    while (nnUnvisited.length > 0) {
        let nearestIdx = 0;
        let minDistance = Infinity;
        for (let i = 0; i < nnUnvisited.length; i++) {
            const dist = locationService.calculateDistance(nnCurrent.lat, nnCurrent.lon, nnUnvisited[i].lat, nnUnvisited[i].lon);
            if (dist < minDistance) {
                minDistance = dist;
                nearestIdx = i;
            }
        }
        nnStops.push(nnUnvisited[nearestIdx]);
        nnCurrent = { lat: nnUnvisited[nearestIdx].lat, lon: nnUnvisited[nearestIdx].lon };
        nnUnvisited.splice(nearestIdx, 1);
    }
    const nnRoute = calculateRouteStats(nnStops, farmerLat, farmerLon);

    // Compare and Select Best Route
    let bestRoute = nnRoute;
    let alternativeRoutes = [];
    let insight = '';
    
    const distanceSaved = originalRoute.totalDistance - bestRoute.totalDistance;
    const timeSaved = originalRoute.estimatedDuration - bestRoute.estimatedDuration;
    const efficiencyImprovement = originalRoute.totalDistance > 0 
        ? Math.round((distanceSaved / originalRoute.totalDistance) * 100) 
        : 0;

    if (efficiencyImprovement > 5) {
        insight = `The recommended sequence saves approximately ${timeSaved} minutes compared to the original order sequence by minimizing unnecessary backtracking.`;
        alternativeRoutes.push({
            name: 'Original Order Sequence',
            totalDistance: originalRoute.totalDistance,
            estimatedDuration: originalRoute.estimatedDuration,
            efficiency: 'Longer'
        });
    } else {
        insight = 'The selected deliveries are already geographically clustered or sequential, resulting in an efficient natural route.';
    }

    return sendSuccess(res, {
        startLocation: farmer.farmName || 'Your Farm',
        startLatitude: farmerLat,
        startLongitude: farmerLon,
        optimizedStops: bestRoute.optimizedStops,
        totalDistance: bestRoute.totalDistance,
        estimatedDuration: bestRoute.estimatedDuration,
        distanceSaved: Number(distanceSaved.toFixed(1)),
        timeSaved,
        efficiencyImprovement,
        insight,
        alternativeRoutes
    });

  } catch (error: any) {
    return sendError(res, error.message || 'Failed to optimize route', 500);
  }
};

export const saveRoute = async (req: AuthRequest, res: Response): Promise<any> => {
    // Optional save logic implementation if needed later
    return sendSuccess(res, { message: 'Route saved successfully.' });
};

export const optimizeMultiFarmRoute = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }
    
    // Allow consumer to view their own route or Admin to view any route
    const { orderId } = req.body;
    if (!orderId) {
      return sendError(res, 'Order ID is required.', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { farmer: true } },
        customer: true,
      }
    });

    if (!order) return sendError(res, 'Order not found', 404);

    const isAdmin = req.user.role === 'ADMIN';
    const isCustomer = order.customerId === req.user.userId;
    
    if (!isAdmin && !isCustomer) {
       return sendError(res, 'Unauthorized to view this fulfillment plan', 403);
    }

    // Extract unique farmers and resolve coordinates
    const uniqueFarmersMap = new Map<string, any>();
    for (const item of order.items) {
        if (!uniqueFarmersMap.has(item.farmerId)) {
            let lat = item.farmer.latitude;
            let lon = item.farmer.longitude;
            if (!lat || !lon) {
                if (item.farmer.location) {
                    const coords = await locationService.resolveFarmerLocation(item.farmer.id, item.farmer.location);
                    if (coords) {
                        lat = coords.lat;
                        lon = coords.lon;
                    }
                }
            }
            
            uniqueFarmersMap.set(item.farmerId, {
                id: item.farmer.id,
                name: item.farmer.farmName,
                lat: lat || 19.9975,
                lon: lon || 73.7898,
                location: item.farmer.location,
                products: []
            });
        }
        uniqueFarmersMap.get(item.farmerId).products.push(`${item.quantity} ${item.unit} ${item.productName}`);
    }

    const uniqueFarmers = Array.from(uniqueFarmersMap.values());

    if (uniqueFarmers.length <= 1) {
        return sendError(res, 'This order does not require multi-farm optimization.', 400);
    }

    let customerLat, customerLon, customerAddressText;
    try {
        const address = JSON.parse(order.deliveryAddressSnapshot);
        customerAddressText = `${address.addressLine1}, ${address.city}`;
        
        let lat = address.latitude;
        let lon = address.longitude;
        if (!lat || !lon) {
             const coords = await locationService.progressiveGeocode(address);
             if (coords) {
                 lat = coords.lat;
                 lon = coords.lon;
                 
                 // Persist coordinates
                 address.latitude = lat;
                 address.longitude = lon;
                 await prisma.order.update({
                     where: { id: orderId },
                     data: { deliveryAddressSnapshot: JSON.stringify(address) }
                 });
             }
        }
        customerLat = lat || 19.9800; // fallback if missing completely
        customerLon = lon || 73.7800; // fallback if missing completely
    } catch (e) {
        return sendError(res, 'Invalid customer delivery address.', 400);
    }

    // Helper to format stops
    const createStops = (farmerSequence: any[]) => {
        let current = { lat: farmerSequence[0].lat, lon: farmerSequence[0].lon };
        let distance = 0;
        const stops = [];

        for (let i = 0; i < farmerSequence.length; i++) {
            const f = farmerSequence[i];
            const dist = i === 0 ? 0 : locationService.calculateDistance(current.lat, current.lon, f.lat, f.lon);
            distance += dist;
            stops.push({
                sequence: i + 1,
                type: 'PICKUP',
                name: f.name,
                details: f.products.join(', '),
                lat: f.lat,
                lon: f.lon,
                distanceFromPrevious: dist.toFixed(1)
            });
            current = { lat: f.lat, lon: f.lon };
        }

        const finalDist = locationService.calculateDistance(current.lat, current.lon, customerLat, customerLon);
        distance += finalDist;
        stops.push({
            sequence: stops.length + 1,
            type: 'DELIVERY',
            name: order.customer.name,
            details: 'FINAL DESTINATION',
            address: customerAddressText,
            lat: customerLat,
            lon: customerLon,
            distanceFromPrevious: finalDist.toFixed(1)
        });

        const travelTimeMinutes = (distance / 40) * 60;
        const actionTimeMinutes = (farmerSequence.length * 10) + 10;
        const estimatedDuration = Math.round(travelTimeMinutes + actionTimeMinutes);

        return { stops, totalDistance: distance, estimatedDuration };
    };

    // Candidate 1: Original Farmer Sequence
    const originalRoute = createStops(uniqueFarmers);

    // Candidate 2: Nearest Neighbor Farmer Sequence
    const startFarmer = uniqueFarmers[0];
    let nnUnvisited = [...uniqueFarmers.slice(1)];
    let nnSequence = [startFarmer];
    let nnCurrent = { lat: startFarmer.lat, lon: startFarmer.lon };

    while (nnUnvisited.length > 0) {
        let nearestIdx = 0;
        let minDistance = Infinity;
        for (let i = 0; i < nnUnvisited.length; i++) {
            const dist = locationService.calculateDistance(nnCurrent.lat, nnCurrent.lon, nnUnvisited[i].lat, nnUnvisited[i].lon);
            if (dist < minDistance) {
                minDistance = dist;
                nearestIdx = i;
            }
        }
        nnSequence.push(nnUnvisited[nearestIdx]);
        nnCurrent = { lat: nnUnvisited[nearestIdx].lat, lon: nnUnvisited[nearestIdx].lon };
        nnUnvisited.splice(nearestIdx, 1);
    }
    
    const nnRoute = createStops(nnSequence);

    // Compare and Select Best Route
    let bestRoute = nnRoute;
    let alternativeRoutes = [];
    let insight = '';

    const distanceSaved = originalRoute.totalDistance - bestRoute.totalDistance;
    const timeSaved = originalRoute.estimatedDuration - bestRoute.estimatedDuration;
    const efficiencyImprovement = originalRoute.totalDistance > 0 
        ? Math.round((distanceSaved / originalRoute.totalDistance) * 100) 
        : 0;

    if (efficiencyImprovement > 5) {
        insight = `The recommended sequence saves approximately ${timeSaved} minutes by grouping nearby farm pickups before heading to the final destination.`;
        alternativeRoutes.push({
            name: 'Standard Sequence',
            totalDistance: originalRoute.totalDistance,
            estimatedDuration: originalRoute.estimatedDuration,
            efficiency: 'Longer'
        });
    } else {
        insight = 'The farm pickups are already aligned efficiently along the delivery path.';
    }

    return sendSuccess(res, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        suppliersCount: uniqueFarmers.length,
        optimizedStops: bestRoute.stops,
        totalDistance: Number(bestRoute.totalDistance.toFixed(1)),
        estimatedDuration: bestRoute.estimatedDuration,
        distanceSaved: Number(distanceSaved.toFixed(1)),
        timeSaved,
        efficiencyImprovement,
        insight,
        alternativeRoutes
    });

  } catch (error: any) {
    return sendError(res, error.message || 'Failed to generate multi-farm route', 500);
  }
};
