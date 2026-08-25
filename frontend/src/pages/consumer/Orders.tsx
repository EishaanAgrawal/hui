import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle2, Truck, ArrowRight } from 'lucide-react';
import { orderApi } from '../../services/api';
import { Order } from '../../types';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.getOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Loader fullPage message="Retrieving your harvest orders..." />;

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="No orders yet"
          description="You have not placed any orders on FarmDirect yet. Explore fresh harvests today!"
          actionText="Browse Marketplace"
          onAction={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Your Harvest Orders</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track fulfillment status, view invoices, and review delivered produce.
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
          >
            {/* Header */}
            <div className="bg-slate-50 p-5 sm:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <span className="text-slate-400 font-semibold block">Order Number</span>
                  <span className="font-bold text-slate-900 text-sm">#{order.orderNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Date Placed</span>
                  <span className="font-bold text-slate-700">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Total Amount</span>
                  <span className="font-black text-slate-900 text-sm">₹{order.total}</span>
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
                <Link
                  to={`/orders/${order.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-700 font-bold text-xs text-slate-700 transition flex items-center gap-1 shadow-sm"
                >
                  Track & Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Items snippet */}
            <div className="p-5 sm:p-6 divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.product?.image ||
                        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'
                      }
                      alt={item.productName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.productName}</h4>
                      <p className="text-xs text-slate-500">
                        {item.farmer?.farmName} • {item.quantity} {item.unit} × ₹{item.unitPrice}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">₹{item.subtotal}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
