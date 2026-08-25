import React, { useEffect, useState } from 'react';
import { orderApi } from '../../services/api';
import { Order } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { CheckCircle2, Clock, Package, Truck, CheckCheck } from 'lucide-react';

export const FarmerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <span className="text-slate-400 font-semibold block">Order Identifier</span>
                      <span className="font-bold text-slate-900 text-sm">#{order.orderNumber}</span>
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
                      Payment Status: <span className="font-bold text-emerald-700">{order.paymentStatus}</span> • Tracking: <code className="font-mono text-slate-700">{order.delivery?.trackingNumber}</code>
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
    </DashboardLayout>
  );
};
