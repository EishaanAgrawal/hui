import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const getForecastOverview = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'FARMER') {
      return sendError(res, 'Unauthorized', 403);
    }

    const { period } = req.query;
    const forecastDays = parseInt(period as string) || 7; // Default 7 days

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!farmer) return sendError(res, 'Farmer profile not found', 404);

    const products = await prisma.product.findMany({
      where: { farmerId: farmer.id, isActive: true },
    });

    const orderItems = await prisma.orderItem.findMany({
      where: { farmerId: farmer.id, status: { in: ['CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED'] } },
      include: { order: { select: { createdAt: true } } },
    });

    if (orderItems.length === 0) {
      return sendSuccess(res, {
        totalPredictedDemand: 0,
        totalCurrentDemand: 0,
        overallTrend: 'Stable',
        topTrendingProduct: null,
        recommendation: 'Not enough historical order data is currently available to generate a reliable forecast. Continue collecting marketplace sales data to improve future predictions.',
        chartData: [],
        productForecasts: []
      });
    }

    const today = new Date();
    const chartDataMap: Record<string, number> = {};
    
    // Track data per product
    const productSalesMap: Record<string, { 
      recent: number; 
      old: number; 
      older: number;
      name: string; 
      unit: string; 
      currentDemand: number;
      inventory: number;
      totalOrders: number;
    }> = {};
    
    products.forEach(p => {
        productSalesMap[p.id] = { recent: 0, old: 0, older: 0, name: p.name, unit: p.unit, currentDemand: 0, inventory: p.availableQuantity, totalOrders: 0 };
    });

    // Time boundaries based on selected period
    const recentStart = new Date(today.getTime() - forecastDays * 24 * 60 * 60 * 1000);
    const oldStart = new Date(recentStart.getTime() - forecastDays * 24 * 60 * 60 * 1000);
    const olderStart = new Date(oldStart.getTime() - forecastDays * 24 * 60 * 60 * 1000);

    let totalCurrentDemand = 0;

    orderItems.forEach((item) => {
      const date = new Date(item.order.createdAt);
      const dateStr = date.toISOString().split('T')[0];
      
      chartDataMap[dateStr] = (chartDataMap[dateStr] || 0) + item.quantity;
      totalCurrentDemand += item.quantity;

      if (productSalesMap[item.productId]) {
        productSalesMap[item.productId].currentDemand += item.quantity;
        productSalesMap[item.productId].totalOrders += 1;
        
        if (date >= recentStart) {
            productSalesMap[item.productId].recent += item.quantity;
        } else if (date >= oldStart && date < recentStart) {
            productSalesMap[item.productId].old += item.quantity;
        } else if (date >= olderStart && date < oldStart) {
            productSalesMap[item.productId].older += item.quantity;
        }
      }
    });

    let overallTrendTemp = 'Stable';

    const productForecasts = Object.values(productSalesMap).map(p => {
        let trend = 'Stable';
        let confidence = 0;
        let predictedDemand = 0;
        let insight = '';
        let recommendation = '';
        let expectedChange = 0;

        // Ensure we have some data
        if (p.totalOrders === 0 || p.currentDemand === 0) {
            return {
                name: p.name,
                currentDemand: 0,
                predictedDemand: null,
                expectedChange: null,
                trend: 'Trend Unavailable',
                confidence: null,
                forecastStatus: 'INSUFFICIENT_DATA',
                inventory: p.inventory,
                recommendation: 'Forecast pending. Monitor inventory until sufficient demand history is collected.',
                insight: 'Forecast is pending while more historical order data is collected.',
                unit: p.unit
            };
        }

        // If there's no historical baseline (old and older are both zero) but we have recent orders
        if (p.old === 0 && p.older === 0) {
            return {
                name: p.name,
                currentDemand: p.recent,
                predictedDemand: p.recent, // Assume stable demand equal to recent without a baseline
                expectedChange: null as any,
                trend: 'Likely Stable',
                confidence: 30,
                forecastStatus: 'PRELIMINARY',
                inventory: p.inventory,
                recommendation: `Preliminary forecast suggests current inventory may be sufficient. Continue monitoring.`,
                insight: 'Forecast is based entirely on recent orders. More historical periods are required for trend analysis.',
                unit: p.unit
            };
        }

        // We have some historical data, calculate trends safely
        // Use a minimum baseline of 5 to prevent small denominators from causing +14000% spikes
        const smoothedOld = Math.max(p.old, 5); 
        const growthRecent = (p.recent - p.old) / smoothedOld;
        
        let growthOld = 0;
        if (p.older > 0) {
            const smoothedOlder = Math.max(p.older, 5);
            growthOld = (p.old - p.older) / smoothedOlder;
        }
        
        // 70% weight to recent trend, 30% to older trend
        const weightedGrowth = (growthRecent * 0.7) + (growthOld * 0.3);
        
        // Cap the extreme explosive growth multipliers to something realistic (+200% max, -100% min)
        const cappedGrowth = Math.max(-1.0, Math.min(2.0, weightedGrowth));
        expectedChange = Math.round(cappedGrowth * 100);

        // Determine Forecast Status
        let forecastStatus = 'VALID';
        if (p.totalOrders <= 4 || (p.old === 0 && p.older > 0)) {
            forecastStatus = 'PRELIMINARY';
        }

        if (forecastStatus === 'PRELIMINARY') {
            // Suppress exact % change if very small sample size
            expectedChange = null as any; 
            if (cappedGrowth > 0.15) {
                trend = 'Likely Increasing';
            } else if (cappedGrowth < -0.15) {
                trend = 'Likely Decreasing';
            } else {
                trend = 'Likely Stable';
            }
        } else {
            if (expectedChange > 15) {
                trend = 'Increasing';
            } else if (expectedChange < -15) {
                trend = 'Decreasing';
            } else {
                trend = 'Stable';
            }
        }

        // Calculate prediction
        predictedDemand = Math.max(0, Math.round(p.recent * (1 + cappedGrowth)));

        // Calculate confidence based on data quantity and consistency
        // Max base confidence of 75 based on number of orders (15 orders = 75%)
        let baseConfidence = Math.min(75, p.totalOrders * 5); 
        let variancePenalty = 0;
        
        if (p.old > 0 && p.recent > 0) {
           const variance = Math.abs(p.recent - p.old) / Math.max(p.recent, p.old, 5);
           // High variance = lower confidence.
           if (variance > 0.5) variancePenalty += 15;
           if (variance > 1.0) variancePenalty += 15;
        } else {
            variancePenalty = 20; // Missing data in one of the active periods
        }
        
        confidence = Math.max(25, Math.min(95, baseConfidence + (trend === 'Stable' || trend === 'Likely Stable' ? 15 : 0) - variancePenalty));

        // Generate dynamic insight
        if (forecastStatus === 'PRELIMINARY') {
            insight = `Recent order activity suggests a possible demand trend. This estimate is preliminary because the available historical data is limited.`;
        } else if (trend === 'Increasing') {
            insight = `Recent demand is moderately higher than the previous comparable periods.`;
        } else if (trend === 'Decreasing') {
            insight = `Recent demand has declined compared with earlier periods.`;
        } else {
            insight = `Demand has remained relatively stable across recent periods.`;
        }
        
        if (forecastStatus === 'VALID' && variancePenalty >= 15) {
            insight = `Demand has shown high variability, so the forecast has been smoothed to reduce the effect of temporary spikes.`;
        } else if (forecastStatus === 'VALID' && p.older > 0 && p.old > p.older && p.recent > p.old) {
            insight = `Strong trend: Demand has consistently increased across 3 consecutive periods.`;
        }

        // Generate inventory recommendation
        let neededStock = predictedDemand - p.inventory;
        if (forecastStatus === 'PRELIMINARY') {
            recommendation = `Preliminary forecast suggests current inventory may be sufficient. Continue monitoring as more data is collected.`;
        } else if (neededStock > 0) {
            recommendation = `Shortage risk: Prepare approximately ${neededStock} ${p.unit} additional stock to meet expected demand.`;
        } else if (trend === 'Decreasing' && p.inventory > predictedDemand * 2 && p.inventory > 10) {
            recommendation = `Warning: You hold significantly more stock than predicted demand. Consider promotional pricing.`;
        } else {
            recommendation = `Current inventory of ${p.inventory} ${p.unit} is sufficient for the predicted demand.`;
        }

        return {
            name: p.name,
            currentDemand: p.recent, // Show recent period demand as 'current'
            predictedDemand,
            expectedChange,
            trend,
            confidence,
            forecastStatus,
            inventory: p.inventory,
            recommendation,
            insight,
            unit: p.unit
        };
    }).sort((a: any, b: any) => (b.predictedDemand || 0) - (a.predictedDemand || 0));

    const totalPredictedDemand = productForecasts.reduce((sum, p: any) => sum + (p.predictedDemand || 0), 0);
    const totalRecentDemand = productForecasts.reduce((sum, p) => sum + p.currentDemand, 0);
    
    let overallExpectedChange = 0;
    if (totalRecentDemand > 0) {
        overallExpectedChange = Math.round(((totalPredictedDemand - totalRecentDemand) / totalRecentDemand) * 100);
    }

    const overallTrend = overallExpectedChange > 15 ? 'Increasing' : (overallExpectedChange < -15 ? 'Decreasing' : 'Stable');

    // Chart Data Generation
    const sortedDates = Object.keys(chartDataMap).sort();
    
    // We only output historical for past days. The frontend can display forecast for FUTURE dates.
    // Let's generate future chart points for the forecast period.
    const chartData = [];
    
    // Add last X historical days
    for (let i = forecastDays - 1; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        chartData.push({
            date: dateStr,
            historical: chartDataMap[dateStr] || 0,
            predicted: null // null for historical days
        });
    }

    // Add future predicted days based on average historical demand
    let totalRecent = 0;
    for (let i = forecastDays - 1; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        totalRecent += (chartDataMap[dateStr] || 0);
    }
    const avgDailyRecent = totalRecent / forecastDays;
    
    // Growth multiplier per day
    let trendMultiplier = 1.0;
    if (overallTrend === 'Increasing') trendMultiplier = 1.05;
    if (overallTrend === 'Decreasing') trendMultiplier = 0.95;

    for (let i = 1; i <= forecastDays; i++) {
        const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        // Add some noise and trend
        const dailyPrediction = Math.max(0, Math.round(avgDailyRecent * Math.pow(trendMultiplier, i) * (1 + (Math.random() * 0.2 - 0.1))));
        
        chartData.push({
            date: dateStr,
            historical: null, // null for future days
            predicted: dailyPrediction
        });
    }
    
    // Sort products logically: products with highest change first if increasing, or highest volume
    const topTrendingProduct = productForecasts.length > 0 ? [...productForecasts].sort((a,b) => b.expectedChange - a.expectedChange)[0] : null;

    let mainRecommendation = 'Monitor market trends.';
    if (overallTrend === 'Increasing') mainRecommendation = `Overall demand is projected to grow by ${overallExpectedChange}%. Prepare for upcoming fulfillments by securing inventory early.`;
    else if (overallTrend === 'Decreasing') mainRecommendation = `Overall demand shows a ${Math.abs(overallExpectedChange)}% dip. Consider promotional offers or adjusting pricing.`;

    const inventoryAlertsCount = productForecasts.filter((p: any) => (p.predictedDemand || 0) > p.inventory).length;

    return sendSuccess(res, {
        totalPredictedDemand,
        totalCurrentDemand: totalRecentDemand,
        overallExpectedChange,
        overallTrend,
        topTrendingProduct,
        inventoryAlertsCount,
        recommendation: mainRecommendation,
        chartData,
        productForecasts
    });

  } catch (error: any) {
    return sendError(res, error.message || 'Failed to generate forecast', 500);
  }
};
