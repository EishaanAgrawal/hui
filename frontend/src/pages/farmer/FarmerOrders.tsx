import React, { useEffect, useState } from 'react';
import { orderApi } from '../../services/api';
import { Order } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { CheckCircle2, Clock, Package, Truck, CheckCheck, Map, X } from 'lucide-react';
import { routeApi } from '../../services/api';
import { RouteMap } from '../../components/common/RouteMap';
import { Lightbulb, Info } from 'lucide-react';

const formatDuration = (mins: number) => {
    if (!mins) return '0 min';
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h > 0) return `${h} hr ${m} min`;
    return `${m} min`;
};

export const FarmerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Route Optimization State
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [optimizing, setOptimizing] = useState(false);
  const [routeResult, setRouteResult] = useState<any>(null);

  const fetchOrders = async () => {
    try {
      const data = await orderApi.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      await orderApi.updateOrderStatus(orderId, nextStatus);
      await fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleOrderSelection = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(oId => oId !== id) : [...prev, id]
    );
  };

  const handleOptimizeRoute = async () => {
    if (selectedOrders.length === 0) return;
    setOptimizing(true);
    try {
      const res = await routeApi.optimize(selectedOrders);
      setRouteResult(res);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to optimize route');
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) return <Loader fullPage message="Retrieving orders fulfillment pipeline..." />;

  return (
    <DashboardLayout
      portalType="FARMER"
      title="Incoming Orders & Fulfillment"
      subtitle="Accept incoming consumer orders, mark produce as prepared/harvested, and hand off to dispatch."
    >
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-sm">No incoming orders right now.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
                <div className="text-sm font-bold text-slate-700">
                    {selectedOrders.length} Order(s) Selected
                </div>
                <Button 
                    variant="primary" 
                    icon={<Map className="w-4 h-4" />} 
                    disabled={selectedOrders.length === 0}
                    loading={optimizing}
                    onClick={handleOptimizeRoute}
                >
                    Optimize Delivery Route
                </Button>
            </div>

            {orders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition ${selectedOrders.includes(order.id) ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'}`}
              >
                {/* Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-4">
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            disabled={order.orderStatus === 'DELIVERED' || order.orderStatus === 'CANCELLED'}
                        />
                        <div>
                          <span className="text-slate-400 font-semibold block">Order Identifier</span>
                          <span className="font-bold text-slate-900 text-sm">#{order.orderNumber}</span>
                        </div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Customer Details</span>
                      <span className="font-bold text-slate-800">
                        {order.customer?.name} ({order.customer?.phone || 'Phone verified'})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Order Date</span>
                      <span className="font-bold text-slate-700">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        order.orderStatus === 'DELIVERED'
                          ? 'emerald'
                          : order.orderStatus === 'CANCELLED'
                          ? 'red'
                          : 'blue'
                      }
                      size="md"
                    >
                      {order.orderStatus.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Items & Controls */}
                <div className="p-6 space-y-6">
                  <div className="divide-y divide-slate-100">
                    {(order.items || []).map((item) => (
                      <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.product?.image ||
                              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'
                            }
                            alt={item.productName}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.productName}</p>
                            <p className="text-slate-500">
                              Qty: {item.quantity} {item.unit} @ ₹{item.unitPrice}/{item.unit}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 text-sm">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status Pipeline Advance Controls */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="text-xs text-slate-500">
                      Payment: {order.payment?.provider === 'CASH_ON_DELIVERY' ? (
                        <span className="font-bold text-amber-600">COD • Pending Collection</span>
                      ) : (
                        <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
                      )} • Tracking: <code className="font-mono text-slate-700">{order.delivery?.trackingNumber}</code>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {order.orderStatus === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          loading={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
                          icon={<CheckCircle2 className="w-4 h-4" />}
                        >
                          Accept & Queue Harvest
                        </Button>
                      )}

                      {order.orderStatus === 'ACCEPTED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          loading={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          icon={<Package className="w-4 h-4" />}
                        >
                          Mark Harvested & Packed
                        </Button>
                      )}

                      {order.orderStatus === 'PREPARING' && (
                        <Button
                          size="sm"
                          variant="primary"
                          loading={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'IN_TRANSIT')}
                          icon={<Truck className="w-4 h-4" />}
                        >
                          Handover to Express Dispatch
                        </Button>
                      )}

                      {order.orderStatus === 'IN_TRANSIT' && (
                        <Button
                          size="sm"
                          variant="success"
                          loading={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          icon={<CheckCheck className="w-4 h-4" />}
                        >
                          Confirm Delivery Complete
                        </Button>
                      )}

                      {order.orderStatus === 'DELIVERED' && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <CheckCheck className="w-4 h-4" /> Delivered & Settled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Route Result Modal */}
      {routeResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-brand-900 text-white">
              <div className="flex items-center gap-3">
                <Map className="w-6 h-6 text-brand-300" />
                <h3 className="text-lg font-black font-display">AI Optimized Route</h3>
              </div>
              <button 
                onClick={() => setRouteResult(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              
              {/* Dynamic AI Insight Banner */}
              {routeResult.insight && (
                <div className="bg-brand-50 border border-brand-200 p-4 rounded-2xl flex gap-3 items-start">
                    <div className="bg-white p-2 rounded-xl text-brand-600 shadow-sm shrink-0">
                        <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-brand-900 text-sm">AI Route Insights</h4>
                        <p className="text-brand-800 text-xs mt-1 leading-relaxed">{routeResult.insight}</p>
                    </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Est. Duration</span>
                    <span className="block text-xl font-black text-slate-900 mt-1">{formatDuration(routeResult.estimatedDuration)}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Distance</span>
                    <span className="block text-xl font-black text-slate-900 mt-1">{routeResult.totalDistance} km</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm text-center">
                    <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Time Saved</span>
                    <span className="block text-xl font-black text-emerald-700 mt-1">{routeResult.timeSaved > 0 ? formatDuration(routeResult.timeSaved) : '--'}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm text-center">
                    <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Distance Saved</span>
                    <span className="block text-xl font-black text-emerald-700 mt-1">{routeResult.distanceSaved > 0 ? `${routeResult.distanceSaved} km` : '--'}</span>
                </div>
              </div>

              {/* Comparison Table */}
              {routeResult.alternativeRoutes && routeResult.alternativeRoutes.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-400" />
                        Candidate Routes Evaluated
                    </h4>
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                                <tr>
                                    <th className="px-4 py-3">Route Variant</th>
                                    <th className="px-4 py-3">Distance</th>
                                    <th className="px-4 py-3">Est. Time</th>
                                    <th className="px-4 py-3">Efficiency</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="bg-brand-50/50">
                                    <td className="px-4 py-3 font-bold text-brand-900 flex items-center gap-2">
                                        ⭐ AI Recommended
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{routeResult.totalDistance} km</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{formatDuration(routeResult.estimatedDuration)}</td>
                                    <td className="px-4 py-3"><span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded-lg">Optimal</span></td>
                                </tr>
                                {routeResult.alternativeRoutes.map((alt: any, i: number) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3 font-medium text-slate-700">{alt.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{alt.totalDistance} km</td>
                                        <td className="px-4 py-3 text-slate-600">{formatDuration(alt.estimatedDuration)}</td>
                                        <td className="px-4 py-3"><span className="text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-lg">{alt.efficiency}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
              )}

              {/* Interactive Map */}
              <RouteMap 
                  startLocation={{
                      lat: routeResult.startLatitude,
                      lon: routeResult.startLongitude,
                      name: routeResult.startLocation
                  }}
                  stops={routeResult.optimizedStops}
              />

              <div className="relative">
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-200"></div>
                
                {/* Start Point */}
                <div className="flex gap-4 items-start relative z-10 mb-8">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm">
                        Start
                    </div>
                    <div className="pt-2">
                        <p className="font-bold text-slate-900">{routeResult.startLocation}</p>
                    </div>
                </div>

                {/* Stops */}
                {routeResult.optimizedStops.map((stop: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-start relative z-10 mb-8 last:mb-0">
                        <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm">
                            {stop.sequence}
                        </div>
                        <div className="pt-1">
                            <p className="font-bold text-slate-900">Order #{stop.orderNumber} - {stop.customerName}</p>
                            <p className="text-xs text-slate-500 mt-1">{stop.addressText}</p>
                            <p className="text-[11px] font-bold text-brand-600 mt-1">
                                {stop.distanceFromPrevious} km from previous stop
                            </p>
                        </div>
                    </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
                <Button variant="primary" className="w-full" onClick={() => setRouteResult(null)}>
                    Got it, close route
                </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
